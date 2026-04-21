import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getDecksByUser } from '@/lib/services/deck';
import DeckCard from '@/components/decks/DeckCard';

export default async function DecksPage() {
  const session = await auth();
  const decks = session?.user?.id ? await getDecksByUser(session.user.id) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">デッキ一覧</h1>
        <Link
          href="/decks/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          ＋ 新しいデッキ
        </Link>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">📚</p>
          <p className="text-lg font-medium mb-2">デッキがまだありません</p>
          <p className="text-sm mb-6">デッキを作成してカードを追加しましょう</p>
          <Link
            href="/decks/new"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            最初のデッキを作成
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  );
}
