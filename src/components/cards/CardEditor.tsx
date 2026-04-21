'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CardPreview from './CardPreview';
import TagInput from '@/components/ui/TagInput';
import type { CardType } from '@/types/card';
import type { Deck } from '@/types/deck';
import type { CreateCardInput, UpdateCardInput } from '@/lib/validations/card.schema';

const CARD_TYPE_LABELS: Record<CardType, string> = {
  qa: 'Q&A形式',
  cloze: '穴埋め形式',
  code: 'コードスニペット',
  freewrite: '自由記述',
};

const CARD_TYPE_HINTS: Record<CardType, { front: string; back: string }> = {
  qa: {
    front: '例: TypeScriptのジェネリクスとは何ですか？',
    back: '例: 型をパラメータとして受け取る機能。再利用可能な型安全なコードを記述できる。',
  },
  cloze: {
    front: '例: {{TypeScript}} は {{JavaScript}} のスーパーセットです。',
    back: '穴埋め部分を含む完全なテキストを入力してください。',
  },
  code: {
    front: '例: \n```typescript\nfunction greet(name: string): ____ {\n  return `Hello, ${name}!`;\n}\n```\n戻り値の型を答えてください。',
    back: '例: \n```typescript\nstring\n```',
  },
  freewrite: {
    front: '例: Reactのusе Effectフックの役割と使いどころを説明してください。',
    back: '（自由記述形式のため、答え面は省略できます）',
  },
};

interface CardEditorProps {
  decks: Deck[];
  defaultDeckId?: string;
  mode?: 'create' | 'edit';
  cardId?: string;
  defaultValues?: Partial<CreateCardInput>;
}

export default function CardEditor({ decks, defaultDeckId, mode = 'create', cardId, defaultValues }: CardEditorProps) {
  const router = useRouter();
  const [cardType, setCardType] = useState<CardType>(defaultValues?.cardType ?? 'qa');
  const [front, setFront] = useState(defaultValues?.front ?? '');
  const [back, setBack] = useState(defaultValues?.back ?? '');
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const [deckId, setDeckId] = useState(defaultValues?.deckId ?? defaultDeckId ?? decks[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (newType: CardType) => {
    if ((front || back) && newType !== cardType) {
      if (!window.confirm('カードタイプを変更すると入力内容がリセットされます。続けますか？')) {
        return;
      }
    }
    setCardType(newType);
    setFront('');
    setBack('');
  };

  const isBackRequired = cardType !== 'freewrite';
  const isValid = front.trim().length > 0 && (!isBackRequired || back.trim().length > 0) && deckId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let res: Response;
      if (mode === 'edit' && cardId) {
        const payload: UpdateCardInput = { cardType, front, back, tags };
        res = await fetch(`/api/cards/${cardId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        const payload: CreateCardInput = { deckId, cardType, front, back, tags };
        res = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = (await res.json()) as { error?: string | { message?: string } };
        const message =
          typeof data.error === 'string'
            ? data.error
            : (data.error?.message ?? 'カードの保存に失敗しました');
        throw new Error(message);
      }

      router.push(`/decks/${deckId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'カードの保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hints = CARD_TYPE_HINTS[cardType];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* カードタイプ選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">カードタイプ</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CARD_TYPE_LABELS) as CardType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                cardType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {CARD_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        {cardType === 'cloze' && (
          <p className="mt-1 text-xs text-gray-500">
            {'{{隠したい単語}}'}
            {'の形式で穴埋め部分を指定してください。プレビューで[___]として表示されます。'}
          </p>
        )}
      </div>

      {/* デッキ選択 */}
      <div>
        <label htmlFor="deckId" className="block text-sm font-medium text-gray-700 mb-1">
          デッキ <span className="text-red-500">*</span>
        </label>
        {decks.length === 0 ? (
          <p className="text-sm text-gray-500">デッキがありません。先にデッキを作成してください。</p>
        ) : (
          <select
            id="deckId"
            value={deckId}
            onChange={(e) => setDeckId(e.target.value)}
            disabled={mode === 'edit'}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {decks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.icon} {deck.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* エディタ / プレビュータブ切り替え */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'edit'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            編集
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'preview'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            プレビュー
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 問題面 */}
          <div>
            <label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-1">
              問題面 <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-2">({front.length}/2000)</span>
            </label>
            {activeTab === 'edit' ? (
              <textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder={hints.front}
                rows={5}
                maxLength={2000}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            ) : (
              <div className="border border-gray-200 rounded-md min-h-[120px]">
                <CardPreview content={front} cardType={cardType} isFront />
              </div>
            )}
          </div>

          {/* 答え面 */}
          {(cardType !== 'freewrite' || back) && (
            <div>
              <label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-1">
                答え面
                {isBackRequired && <span className="text-red-500"> *</span>}
                <span className="text-gray-400 font-normal ml-2">({back.length}/2000)</span>
              </label>
              {activeTab === 'edit' ? (
                <textarea
                  id="back"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder={hints.back}
                  rows={5}
                  maxLength={2000}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              ) : (
                <div className="border border-gray-200 rounded-md min-h-[120px]">
                  <CardPreview content={back} cardType={cardType} isFront={false} />
                </div>
              )}
            </div>
          )}

          {/* freewriteのとき「答え面を追加」ボタン */}
          {cardType === 'freewrite' && !back && (
            <button
              type="button"
              onClick={() => setBack(' ')}
              className="text-sm text-blue-600 hover:underline"
            >
              + 答え面を追加（任意）
            </button>
          )}
        </div>
      </div>

      {/* タグ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          タグ <span className="text-gray-400 font-normal">（最大10個）</span>
        </label>
        <TagInput value={tags} onChange={setTags} maxTags={10} />
      </div>

      {/* エラー表示 */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* 送信ボタン */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '保存中...' : mode === 'edit' ? 'カードを保存' : 'カードを作成'}
        </button>
      </div>
    </form>
  );
}
