import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getCardById } from '@/lib/services/card';
import { getDecksByUser } from '@/lib/services/deck';
import CardEditor from '@/components/cards/CardEditor';
import type { Deck } from '@/types/deck';

export default async function EditCardPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const [card, decksWithStats] = await Promise.all([
    getCardById(session.user.id, cardId),
    getDecksByUser(session.user.id),
  ]);

  if (!card) notFound();

  const decks: Deck[] = decksWithStats.map(({ totalCards: _t, dueCards: _d, ...deck }) => deck);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">カードを編集</h1>
      <CardEditor
        decks={decks}
        mode="edit"
        cardId={card.id}
        defaultValues={{
          deckId: card.deckId,
          cardType: card.cardType,
          front: card.front,
          back: card.back,
          tags: card.tags,
        }}
      />
    </div>
  );
}
