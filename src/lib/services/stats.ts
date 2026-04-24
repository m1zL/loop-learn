import { prisma } from '@/lib/prisma';

export interface UserStats {
  totalCards: number;
  totalReviews: number;
  streak: number;
  masteryDistribution: {
    unlearned: number;
    learning: number;
    mastered: number;
  };
}

export interface HeatmapEntry {
  date: string;  // 'YYYY-MM-DD'
  count: number;
}

/**
 * ユーザーの学習統計を集計する。
 *
 * @param userId - 統計を取得するユーザーID
 * @returns 総カード数・総復習回数・連続学習日数・習熟度分布
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const [totalCards, totalReviews, cards, reviewLogs] = await Promise.all([
    prisma.card.count({ where: { userId } }),
    prisma.reviewLog.count({ where: { userId } }),
    prisma.card.findMany({
      where: { userId },
      select: { repetitions: true, interval: true },
    }),
    prisma.reviewLog.findMany({
      where: { userId },
      select: { reviewedAt: true },
      orderBy: { reviewedAt: 'desc' },
    }),
  ]);

  const masteryDistribution = {
    unlearned: cards.filter((c) => c.repetitions === 0).length,
    learning: cards.filter((c) => c.repetitions > 0 && c.interval < 21).length,
    mastered: cards.filter((c) => c.interval >= 21).length,
  };

  // ストリーク計算: 今日または昨日を起点に連続してレビューがある日数を数える
  const reviewDates = new Set(
    reviewLogs.map((log) => toDateString(log.reviewedAt)),
  );
  const streak = calculateStreak(reviewDates);

  return { totalCards, totalReviews, streak, masteryDistribution };
}

/**
 * 直近 days 日間の日別復習回数を返す。
 * レビューがない日も count: 0 のエントリーとして含める。
 *
 * @param userId - ユーザーID
 * @param days - 遡る日数（今日を含む）
 * @returns 日付昇順の HeatmapEntry 配列
 */
export async function getHeatmapData(userId: string, days: number): Promise<HeatmapEntry[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const since = new Date(today);
  since.setDate(since.getDate() - (days - 1));

  const reviewLogs = await prisma.reviewLog.findMany({
    where: {
      userId,
      reviewedAt: { gte: since },
    },
    select: { reviewedAt: true },
  });

  // 日付ごとにカウントを集計
  const countByDate = new Map<string, number>();
  for (const log of reviewLogs) {
    const dateStr = toDateString(log.reviewedAt);
    countByDate.set(dateStr, (countByDate.get(dateStr) ?? 0) + 1);
  }

  // days 日分のスロットを生成（count: 0 で初期化）
  const result: HeatmapEntry[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = toDateString(date);
    result.push({ date: dateStr, count: countByDate.get(dateStr) ?? 0 });
  }

  return result;
}

/** Date を 'YYYY-MM-DD' 文字列に変換する（ローカル日付） */
function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * レビューがあった日付セットから連続学習日数を計算する。
 * 今日または昨日（まだ今日レビューしていない場合）を起点とする。
 */
function calculateStreak(reviewDates: Set<string>): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStr = toDateString(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);

  // 今日レビューがある → 今日から遡る
  // 今日はなく昨日はある → 昨日から遡る（当日未レビューの救済）
  // どちらもない → streak = 0
  let startOffset = 0;
  if (reviewDates.has(todayStr)) {
    startOffset = 0;
  } else if (reviewDates.has(yesterdayStr)) {
    startOffset = 1;
  } else {
    return 0;
  }

  let streak = 0;
  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() - startOffset);

  while (reviewDates.has(toDateString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
