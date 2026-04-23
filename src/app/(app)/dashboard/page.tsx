import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDecksByUser } from '@/lib/services/deck';

/**
 * ダッシュボードページ。
 * 今日の復習予定カード総数を表示し、M3で実装する復習セッションへの導線を提供する。
 */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const decks = await getDecksByUser(session.user.id);

  const totalDueCards = decks.reduce((sum, deck) => sum + deck.dueCards, 0);
  const totalCards = decks.reduce((sum, deck) => sum + deck.totalCards, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      {/* 今日の復習カード */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <p className="text-sm text-gray-500 mb-1">今日の復習予定</p>
        <p className="text-5xl font-bold text-blue-600 mb-1">
          {totalDueCards}
          <span className="text-lg font-normal text-gray-500 ml-2">枚</span>
        </p>
        <p className="text-sm text-gray-400">総カード数: {totalCards}枚</p>

        <button
          type="button"
          disabled
          title="復習セッションはまもなく実装予定です"
          className="mt-4 w-full py-3 bg-blue-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          復習を始める（準備中）
        </button>
      </div>

      {/* クイックリンク */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/decks"
          className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <p className="text-2xl mb-2">📚</p>
          <p className="font-medium text-gray-900">デッキ一覧</p>
          <p className="text-sm text-gray-500">{decks.length}個のデッキ</p>
        </Link>

        <Link
          href="/cards/new"
          className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <p className="text-2xl mb-2">✏️</p>
          <p className="font-medium text-gray-900">カード作成</p>
          <p className="text-sm text-gray-500">新しいカードを追加</p>
        </Link>
      </div>
    </div>
  );
}
