'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GeneratedCardWithId } from '@/app/(app)/ai/generate/GeneratePageClient';
import GeneratedCardItem from './GeneratedCardItem';

interface GeneratedCardListProps {
  cards: GeneratedCardWithId[];
  deckId: string;
  onCardsChange: (cards: GeneratedCardWithId[]) => void;
}

export default function GeneratedCardList({ cards, deckId, onCardsChange }: GeneratedCardListProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (tempId: string, updated: GeneratedCardWithId) => {
    onCardsChange(cards.map((c) => (c.tempId === tempId ? updated : c)));
  };

  const handleDelete = (tempId: string) => {
    onCardsChange(cards.filter((c) => c.tempId !== tempId));
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const results = await Promise.allSettled(
        cards.map((card) =>
          fetch('/api/cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deckId,
              cardType: 'qa',
              front: card.front,
              back: card.back,
              tags: [],
            }),
          }),
        ),
      );

      const failedCards = cards.filter(
        (_, i) => results[i].status === 'rejected' || (results[i].status === 'fulfilled' && !(results[i] as PromiseFulfilledResult<Response>).value.ok),
      );
      if (failedCards.length > 0) {
        onCardsChange(failedCards);
        setError(`${failedCards.length}枚のカードの保存に失敗しました。再度お試しください。`);
        return;
      }

      router.push(`/decks/${deckId}`);
    } catch {
      setError('通信エラーが発生しました。再度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-800">
        生成されたカード ({cards.length}枚)
      </h2>

      <div className="space-y-3">
        {cards.map((card) => (
          <GeneratedCardItem
            key={card.tempId}
            card={card}
            onChange={(updated) => handleChange(card.tempId, { ...updated, tempId: card.tempId })}
            onDelete={() => handleDelete(card.tempId)}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || cards.length === 0}
        className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            保存中...
          </>
        ) : (
          `保存 (${cards.length}枚)`
        )}
      </button>
    </div>
  );
}
