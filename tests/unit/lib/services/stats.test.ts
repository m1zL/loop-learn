import { describe, it, expect, vi, beforeEach } from 'vitest';

// Prismaをモック化
vi.mock('@/lib/prisma', () => ({
  prisma: {
    card: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    reviewLog: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { getUserStats, getHeatmapData } from '@/lib/services/stats';
import { prisma } from '@/lib/prisma';

const USER_ID = 'cm1111111111111111111111';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0); // 正午で固定（日付ブレ防止）
  d.setDate(d.getDate() - n);
  return d;
}

describe('getUserStats', () => {
  beforeEach(() => vi.clearAllMocks());

  it('totalCards と totalReviews を正しく返す', async () => {
    vi.mocked(prisma.card.count).mockResolvedValue(10);
    vi.mocked(prisma.reviewLog.count).mockResolvedValue(42);
    vi.mocked(prisma.card.findMany).mockResolvedValue([]);
    vi.mocked(prisma.reviewLog.findMany).mockResolvedValue([]);

    const result = await getUserStats(USER_ID);

    expect(result.totalCards).toBe(10);
    expect(result.totalReviews).toBe(42);
  });

  it('masteryDistribution を正しく分類する', async () => {
    vi.mocked(prisma.card.count).mockResolvedValue(5);
    vi.mocked(prisma.reviewLog.count).mockResolvedValue(0);
    vi.mocked(prisma.card.findMany).mockResolvedValue([
      { repetitions: 0, interval: 1 },   // unlearned
      { repetitions: 0, interval: 1 },   // unlearned
      { repetitions: 2, interval: 6 },   // learning
      { repetitions: 5, interval: 30 },  // mastered
      { repetitions: 3, interval: 21 },  // mastered (境界値: 21以上)
    ] as never);
    vi.mocked(prisma.reviewLog.findMany).mockResolvedValue([]);

    const result = await getUserStats(USER_ID);

    expect(result.masteryDistribution).toEqual({
      unlearned: 2,
      learning: 1,
      mastered: 2,
    });
  });

  it('今日レビューがある場合、連続日数を正しくカウントする', async () => {
    vi.mocked(prisma.card.count).mockResolvedValue(0);
    vi.mocked(prisma.reviewLog.count).mockResolvedValue(3);
    vi.mocked(prisma.card.findMany).mockResolvedValue([]);
    // 今日・昨日・一昨日にレビューあり
    vi.mocked(prisma.reviewLog.findMany).mockResolvedValue([
      { reviewedAt: daysAgo(0) },
      { reviewedAt: daysAgo(1) },
      { reviewedAt: daysAgo(2) },
    ] as never);

    const result = await getUserStats(USER_ID);

    expect(result.streak).toBe(3);
  });

  it('今日レビューがなく昨日からある場合、昨日から遡る', async () => {
    vi.mocked(prisma.card.count).mockResolvedValue(0);
    vi.mocked(prisma.reviewLog.count).mockResolvedValue(2);
    vi.mocked(prisma.card.findMany).mockResolvedValue([]);
    // 昨日・一昨日にレビューあり（今日はなし）
    vi.mocked(prisma.reviewLog.findMany).mockResolvedValue([
      { reviewedAt: daysAgo(1) },
      { reviewedAt: daysAgo(2) },
    ] as never);

    const result = await getUserStats(USER_ID);

    expect(result.streak).toBe(2);
  });

  it('今日も昨日もレビューがない場合、streak は 0', async () => {
    vi.mocked(prisma.card.count).mockResolvedValue(0);
    vi.mocked(prisma.reviewLog.count).mockResolvedValue(1);
    vi.mocked(prisma.card.findMany).mockResolvedValue([]);
    // 3日前にしかレビューなし
    vi.mocked(prisma.reviewLog.findMany).mockResolvedValue([
      { reviewedAt: daysAgo(3) },
    ] as never);

    const result = await getUserStats(USER_ID);

    expect(result.streak).toBe(0);
  });
});

describe('getHeatmapData', () => {
  beforeEach(() => vi.clearAllMocks());

  it('指定した days 数の配列を返す', async () => {
    vi.mocked(prisma.reviewLog.findMany).mockResolvedValue([]);

    const result = await getHeatmapData(USER_ID, 30);

    expect(result).toHaveLength(30);
  });

  it('レビューがない日は count: 0', async () => {
    vi.mocked(prisma.reviewLog.findMany).mockResolvedValue([]);

    const result = await getHeatmapData(USER_ID, 7);

    expect(result.every((e) => e.count === 0)).toBe(true);
  });

  it('今日のレビューが count に反映される', async () => {
    const todayDate = new Date();
    todayDate.setHours(10, 0, 0, 0);
    vi.mocked(prisma.reviewLog.findMany).mockResolvedValue([
      { reviewedAt: todayDate },
      { reviewedAt: todayDate },
    ] as never);

    const result = await getHeatmapData(USER_ID, 7);
    const todayEntry = result[result.length - 1]; // 最後が今日

    expect(todayEntry?.count).toBe(2);
  });

  it('配列は日付昇順（古い順）で返る', async () => {
    vi.mocked(prisma.reviewLog.findMany).mockResolvedValue([]);

    const result = await getHeatmapData(USER_ID, 5);

    for (let i = 1; i < result.length; i++) {
      expect(result[i]!.date > result[i - 1]!.date).toBe(true);
    }
  });
});
