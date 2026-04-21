import DeckForm from '@/components/decks/DeckForm';

export default function NewDeckPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新しいデッキを作成</h1>
      <DeckForm mode="create" />
    </div>
  );
}
