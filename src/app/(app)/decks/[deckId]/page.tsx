import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDeckById } from '@/lib/services/deck';
import { getCardsByDeck } from '@/lib/services/card';

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const deck = await getDeckById(deckId, session.user.id);
  if (!deck) notFound();

  const cards = await getCardsByDeck(session.user.id, deckId);

  const { unlearned, learning, mastered } = deck.masteryDistribution;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <span className="text-4xl leading-none">{deck.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{deck.name}</h1>
            {deck.description && (
              <p className="text-gray-500 mt-1">{deck.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/decks/${deck.id}/edit`}
            className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            編集
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-100 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-400">{unlearned}</p>
          <p className="text-xs text-gray-500 mt-1">未学習</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-orange-500">{learning}</p>
          <p className="text-xs text-gray-500 mt-1">学習中</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{mastered}</p>
          <p className="text-xs text-gray-500 mt-1">習得済み</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        {deck.dueCards > 0 && (
          <Link
            href={`/review?deckId=${deck.id}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            今日の復習 ({deck.dueCards} 枚)
          </Link>
        )}
        <Link
          href={`/cards/new?deckId=${deck.id}`}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ＋ カードを追加
        </Link>
      </div>

      {/* Card list */}
      <h2 className="text-lg font-semibold mb-3">カード一覧 ({cards.length} 枚)</h2>
      {cards.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="mb-3">カードがまだありません</p>
          <Link
            href={`/cards/new?deckId=${deck.id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            最初のカードを追加する
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {cards.map((card) => (
            <li
              key={card.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <p className="text-sm font-medium text-gray-800 line-clamp-2">{card.front}</p>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{card.back}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
