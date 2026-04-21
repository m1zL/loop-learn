'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateDeckInput } from '@/lib/validations/deck.schema';

interface DeckFormProps {
  mode: 'create' | 'edit';
  deckId?: string;
  defaultValues?: Partial<CreateDeckInput>;
}

const ICON_OPTIONS = ['📘', '📗', '📙', '📕', '📓', '📒', '📚', '🗂️', '💡', '🧠'];

export default function DeckForm({ mode, deckId, defaultValues }: DeckFormProps) {
  const router = useRouter();
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');
  const [icon, setIcon] = useState(defaultValues?.icon ?? '📘');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('デッキ名を入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = mode === 'create' ? '/api/decks' : `/api/decks/${deckId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, icon }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.formErrors?.[0] ?? 'エラーが発生しました');
        return;
      }

      const deck = await res.json();
      router.push(`/decks/${mode === 'create' ? deck.id : deckId}`);
      router.refresh();
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div>
        <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
          アイコン
        </label>
        <div className="flex gap-2 flex-wrap">
          {ICON_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                icon === emoji
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          デッキ名 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          placeholder="例: TypeScript基礎"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          説明（任意）
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="デッキの内容や学習目的を入力してください"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '保存中...' : mode === 'create' ? '作成する' : '保存する'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
