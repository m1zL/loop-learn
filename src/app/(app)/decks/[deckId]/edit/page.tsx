import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDeckById } from '@/lib/services/deck';
import DeckForm from '@/components/decks/DeckForm';

export default async function EditDeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const deck = await getDeckById(deckId, session.user.id);
  if (!deck) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">デッキを編集</h1>
      <DeckForm
        mode="edit"
        deckId={deck.id}
        defaultValues={{
          name: deck.name,
          description: deck.description ?? undefined,
          icon: deck.icon,
        }}
      />
    </div>
  );
}
