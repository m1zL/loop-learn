import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function ReviewSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ reviewed?: string; avgRating?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { reviewed, avgRating } = await searchParams;
  const parsedReviewed = Number(reviewed);
  const parsedAvg = Number(avgRating);
  // 不正なURL直入力(NaN・負数)への安全対策
  const reviewedCount = Number.isFinite(parsedReviewed) ? Math.max(0, Math.trunc(parsedReviewed)) : 0;
  const avgRatingValue = Number.isFinite(parsedAvg) ? Math.min(4, Math.max(0, parsedAvg)) : 0;

  return (
    <div className="text-center py-12">
      <p className="text-5xl mb-4">✅</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">セッション完了！</h1>
      <p className="text-gray-500 mb-8">お疲れ様でした。今日もよく頑張りました。</p>

      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-10">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-3xl font-bold text-blue-600">{reviewedCount}</p>
          <p className="text-sm text-gray-500 mt-1">復習した枚数</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-3xl font-bold text-green-600">{avgRatingValue.toFixed(1)}</p>
          <p className="text-sm text-gray-500 mt-1">平均評価</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 items-center">
        <Link
          href="/dashboard"
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          ダッシュボードへ
        </Link>
        <Link
          href="/decks"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          デッキ一覧へ
        </Link>
      </div>
    </div>
  );
}
