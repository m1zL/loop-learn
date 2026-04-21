import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    deck: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { createDeck, getDecksByUser, getDeckById, updateDeck, deleteDeck } from '@/lib/services/deck';
import { prisma } from '@/lib/prisma';

const DECK_ID = 'cm0000000000000000000000';
const USER_ID = 'cm1111111111111111111111';

const baseDeck = {
  id: DECK_ID,
  userId: USER_ID,
  name: 'TypeScript基礎',
  description: null,
  icon: '📘',
  createdAt: new Date('2026-04-01'),
  updatedAt: new Date('2026-04-01'),
};

describe('createDeck', () => {
  beforeEach(() => vi.clearAllMocks());

  it('デッキを作成して返す', async () => {
    vi.mocked(prisma.deck.create).mockResolvedValue(baseDeck);

    const result = await createDeck(USER_ID, { name: 'TypeScript基礎', icon: '📘' });

    expect(prisma.deck.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: USER_ID, name: 'TypeScript基礎' }),
      }),
    );
    expect(result.id).toBe(DECK_ID);
  });
});

describe('getDecksByUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('DeckWithStats（totalCards・dueCards付き）を返す', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    vi.mocked(prisma.deck.findMany).mockResolvedValue([
      {
        ...baseDeck,
        _count: { cards: 3 },
        cards: [
          { nextReviewDate: yesterday },
          { nextReviewDate: today },
          { nextReviewDate: tomorrow },
        ],
      } as ReturnType<typeof prisma.deck.findMany> extends Promise<(infer T)[]> ? T : never,
    ]);

    const result = await getDecksByUser(USER_ID);

    expect(result).toHaveLength(1);
    expect(result[0].totalCards).toBe(3);
    // yesterday と today が期限切れ (nextReviewDate <= today)
    expect(result[0].dueCards).toBe(2);
  });

  it('デッキがないとき空配列を返す', async () => {
    vi.mocked(prisma.deck.findMany).mockResolvedValue([]);

    const result = await getDecksByUser(USER_ID);

    expect(result).toEqual([]);
  });
});

describe('getDeckById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('masteryDistribution付きでデッキを返す', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue({
      ...baseDeck,
      cards: [
        { nextReviewDate: new Date(), repetitions: 0, interval: 1 },  // unlearned
        { nextReviewDate: new Date(), repetitions: 2, interval: 6 },  // learning
        { nextReviewDate: new Date(), repetitions: 5, interval: 30 }, // mastered
      ],
    } as ReturnType<typeof prisma.deck.findFirst> extends Promise<infer T> ? T : never);

    const result = await getDeckById(DECK_ID, USER_ID);

    expect(result).not.toBeNull();
    expect(result!.totalCards).toBe(3);
    expect(result!.masteryDistribution).toEqual({ unlearned: 1, learning: 1, mastered: 1 });
  });

  it('デッキが存在しない（または別ユーザー）のとき null を返す', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue(null);

    const result = await getDeckById(DECK_ID, USER_ID);

    expect(result).toBeNull();
  });
});

describe('updateDeck', () => {
  beforeEach(() => vi.clearAllMocks());

  it('デッキを更新して返す', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue(baseDeck);
    const updated = { ...baseDeck, name: 'TypeScript応用', updatedAt: new Date() };
    vi.mocked(prisma.deck.update).mockResolvedValue(updated);

    const result = await updateDeck(DECK_ID, USER_ID, { name: 'TypeScript応用' });

    expect(prisma.deck.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: DECK_ID } }),
    );
    expect(result!.name).toBe('TypeScript応用');
  });

  it('デッキが存在しないとき null を返す', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue(null);

    const result = await updateDeck(DECK_ID, USER_ID, { name: '更新後' });

    expect(result).toBeNull();
    expect(prisma.deck.update).not.toHaveBeenCalled();
  });
});

describe('deleteDeck', () => {
  beforeEach(() => vi.clearAllMocks());

  it('デッキを削除して true を返す', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue(baseDeck);
    vi.mocked(prisma.deck.delete).mockResolvedValue(baseDeck);

    const result = await deleteDeck(DECK_ID, USER_ID);

    expect(prisma.deck.delete).toHaveBeenCalledWith({ where: { id: DECK_ID } });
    expect(result).toBe(true);
  });

  it('デッキが存在しないとき false を返す', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue(null);

    const result = await deleteDeck(DECK_ID, USER_ID);

    expect(result).toBe(false);
    expect(prisma.deck.delete).not.toHaveBeenCalled();
  });
});
