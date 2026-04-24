import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTodayReviewCards } from '@/lib/services/card';
import ReviewSession from '@/components/review/ReviewSession';

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ deckId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { deckId } = await searchParams;
  const cards = await getTodayReviewCards(session.user.id, deckId);

  if (cards.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🎉</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">今日の復習はありません</h1>
        <p className="text-gray-500 mb-8">お疲れ様です。また明日復習しましょう。</p>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          ダッシュボードへ
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">復習セッション</h1>
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          中断する
        </Link>
      </div>
      <ReviewSession cards={cards} />
    </div>
  );
}
