'use client';

import { useState } from 'react';
import type { GeneratedCard } from '@/lib/services/ai';
import type { Deck } from '@/types/deck';
import GenerateForm from '@/components/ai/GenerateForm';
import GeneratedCardList from '@/components/ai/GeneratedCardList';

export type GeneratedCardWithId = GeneratedCard & { tempId: string };

interface GeneratePageClientProps {
  decks: Deck[];
}

export default function GeneratePageClient({ decks }: GeneratePageClientProps) {
  const [generatedCards, setGeneratedCards] = useState<GeneratedCardWithId[]>([]);
  const [activeDeckId, setActiveDeckId] = useState('');

  const handleGenerated = (cards: GeneratedCard[], deckId: string) => {
    const withIds: GeneratedCardWithId[] = cards.map((card, i) => ({
      ...card,
      tempId: `${Date.now()}-${i}`,
    }));
    setGeneratedCards(withIds);
    setActiveDeckId(deckId);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <GenerateForm decks={decks} onGenerated={handleGenerated} />
      </div>

      {generatedCards.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <GeneratedCardList
            cards={generatedCards}
            deckId={activeDeckId}
            onCardsChange={setGeneratedCards}
          />
        </div>
      )}
    </div>
  );
}
