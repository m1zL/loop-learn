'use client';

import { useState } from 'react';
import type { GeneratedCard } from '@/lib/services/ai';
import { domainValues, domainLabels } from '@/lib/validations/ai.schema';
import type { Deck } from '@/types/deck';

interface GenerateFormProps {
  decks: Deck[];
  onGenerated: (cards: GeneratedCard[], deckId: string) => void;
}

const TEXT_MAX = 5000;

export default function GenerateForm({ decks, onGenerated }: GenerateFormProps) {
  const [text, setText] = useState('');
  const [domain, setDomain] = useState<string>('general');
  const [deckId, setDeckId] = useState(decks[0]?.id ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckId) {
      setError('デッキを選択してください');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, domain, deckId }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        if (res.status === 429) {
          setError('リクエスト制限に達しました。しばらく待ってから再度お試しください。');
        } else if (res.status === 503) {
          setError('AIサービスが設定されていません。管理者にお問い合わせください。');
        } else {
          setError(data.error ?? '生成に失敗しました');
        }
        return;
      }

      const data = (await res.json()) as { cards: GeneratedCard[] };
      onGenerated(data.cards, deckId);
    } catch {
      setError('通信エラーが発生しました。再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* テキスト入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          学習テキスト
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="書籍や技術ドキュメントの一節を貼り付けてください..."
          rows={8}
          maxLength={TEXT_MAX}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {text.length} / {TEXT_MAX}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ドメイン選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            技術ドメイン
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {domainValues.map((d) => (
              <option key={d} value={d}>
                {domainLabels[d]}
              </option>
            ))}
          </select>
        </div>

        {/* デッキ選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            保存先デッキ
            <span className="text-red-500 ml-1">*</span>
          </label>
          {decks.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">デッキがありません。先にデッキを作成してください。</p>
          ) : (
            <select
              value={deckId}
              onChange={(e) => setDeckId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.icon} {deck.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || decks.length === 0 || text.length < 10}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            生成中...
          </>
        ) : (
          '✨ カードを生成する'
        )}
      </button>
    </form>
  );
}
