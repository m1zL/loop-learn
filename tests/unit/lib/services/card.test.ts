import { describe, it, expect, vi, beforeEach } from 'vitest';

// Prismaをモック化
vi.mock('@/lib/prisma', () => ({
  prisma: {
    deck: {
      findFirst: vi.fn(),
    },
    card: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { createCard, updateCard, deleteCard, getTodayReviewCards } from '@/lib/services/card';
import { prisma } from '@/lib/prisma';
import type { CreateCardInput } from '@/lib/validations/card.schema';

const VALID_DECK_ID = 'cm0000000000000000000000';
const VALID_USER_ID = 'cm1111111111111111111111';

const mockCardInput: CreateCardInput = {
  deckId: VALID_DECK_ID,
  cardType: 'qa',
  front: 'TypeScriptのジェネリクスとは？',
  back: '型をパラメータとして受け取る機能',
  tags: ['typescript'],
};

describe('createCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SM-2の初期値を正しく設定してカードを作成する', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue({
      id: VALID_DECK_ID,
      userId: VALID_USER_ID,
      name: 'Test Deck',
      description: null,
      icon: '📘',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mockCreatedCard = {
      id: 'cm9999999999999999999999',
      userId: VALID_USER_ID,
      deckId: VALID_DECK_ID,
      cardType: 'qa' as const,
      front: mockCardInput.front,
      back: mockCardInput.back,
      tags: mockCardInput.tags,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.card.create).mockResolvedValue(mockCreatedCard);

    const result = await createCard(VALID_USER_ID, mockCardInput);

    expect(prisma.card.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: VALID_USER_ID,
          deckId: VALID_DECK_ID,
          cardType: 'qa',
          front: mockCardInput.front,
          back: mockCardInput.back,
          tags: mockCardInput.tags,
          // SM-2初期値
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
        }),
      })
    );

    expect(result).toEqual(mockCreatedCard);
  });

  it('nextReviewDate が今日の日付 (00:00:00) で設定される', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue({
      id: VALID_DECK_ID,
      userId: VALID_USER_ID,
      name: 'Test Deck',
      description: null,
      icon: '📘',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mockCreatedCard = {
      id: 'cm9999999999999999999999',
      userId: VALID_USER_ID,
      deckId: VALID_DECK_ID,
      cardType: 'qa' as const,
      front: mockCardInput.front,
      back: mockCardInput.back,
      tags: [] as string[],
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: today,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.card.create).mockResolvedValue(mockCreatedCard);

    await createCard(VALID_USER_ID, mockCardInput);

    const createCall = vi.mocked(prisma.card.create).mock.calls[0][0];
    const nextReviewDate = createCall.data.nextReviewDate as Date;

    expect(nextReviewDate.getHours()).toBe(0);
    expect(nextReviewDate.getMinutes()).toBe(0);
    expect(nextReviewDate.getSeconds()).toBe(0);
    expect(nextReviewDate.getMilliseconds()).toBe(0);
  });

  it('freewrite タイプで back が空文字でも作成できる', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue({
      id: VALID_DECK_ID,
      userId: VALID_USER_ID,
      name: 'Test Deck',
      description: null,
      icon: '📘',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const freewriteInput: CreateCardInput = {
      ...mockCardInput,
      cardType: 'freewrite',
      back: '',
    };

    const mockCreatedCard = {
      id: 'cm9999999999999999999999',
      userId: VALID_USER_ID,
      deckId: VALID_DECK_ID,
      cardType: 'freewrite' as const,
      front: freewriteInput.front,
      back: '',
      tags: [] as string[],
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.card.create).mockResolvedValue(mockCreatedCard);

    const result = await createCard(VALID_USER_ID, freewriteInput);

    expect(result).not.toBeNull();
    expect(result!.back).toBe('');
  });

  it('deckIdが別ユーザーのもののとき null を返す', async () => {
    // deck が見つからない（別ユーザーのdeck）
    vi.mocked(prisma.deck.findFirst).mockResolvedValue(null);

    const result = await createCard(VALID_USER_ID, mockCardInput);

    expect(result).toBeNull();
    expect(prisma.card.create).not.toHaveBeenCalled();
  });

  it('Prismaがエラーをスローしたとき、そのまま伝播する', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue({
      id: VALID_DECK_ID,
      userId: VALID_USER_ID,
      name: 'Test Deck',
      description: null,
      icon: '📘',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(prisma.card.create).mockRejectedValue(new Error('DB connection failed'));

    await expect(createCard(VALID_USER_ID, mockCardInput)).rejects.toThrow('DB connection failed');
  });
});

const CARD_ID = 'cm2222222222222222222222';

const baseCard = {
  id: CARD_ID,
  userId: VALID_USER_ID,
  deckId: VALID_DECK_ID,
  cardType: 'qa' as const,
  front: 'TypeScriptのジェネリクスとは？',
  back: '型をパラメータとして受け取る機能',
  tags: ['typescript'],
  easeFactor: 2.5,
  interval: 1,
  repetitions: 0,
  nextReviewDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('updateCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('カードを更新して返す', async () => {
    const updated = { ...baseCard, front: '更新後の問題', updatedAt: new Date() };
    vi.mocked(prisma.card.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.card.findFirst).mockResolvedValue(updated);

    const result = await updateCard(VALID_USER_ID, CARD_ID, { front: '更新後の問題' });

    expect(prisma.card.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: CARD_ID, userId: VALID_USER_ID } }),
    );
    expect(result!.front).toBe('更新後の問題');
  });

  it('カードが存在しないとき null を返す', async () => {
    vi.mocked(prisma.card.updateMany).mockResolvedValue({ count: 0 });

    const result = await updateCard(VALID_USER_ID, CARD_ID, { front: '更新後の問題' });

    expect(result).toBeNull();
    expect(prisma.card.findFirst).not.toHaveBeenCalled();
  });
});

describe('deleteCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('カードを削除して true を返す', async () => {
    vi.mocked(prisma.card.deleteMany).mockResolvedValue({ count: 1 });

    const result = await deleteCard(VALID_USER_ID, CARD_ID);

    expect(prisma.card.deleteMany).toHaveBeenCalledWith({
      where: { id: CARD_ID, userId: VALID_USER_ID },
    });
    expect(result).toBe(true);
  });

  it('カードが存在しないとき false を返す', async () => {
    vi.mocked(prisma.card.deleteMany).mockResolvedValue({ count: 0 });

    const result = await deleteCard(VALID_USER_ID, CARD_ID);

    expect(result).toBe(false);
  });
});

describe('getTodayReviewCards', () => {
  beforeEach(() => vi.clearAllMocks());

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const overdueCard = { ...baseCard, id: 'overdue-1', nextReviewDate: yesterday };
  const dueCard = { ...baseCard, id: 'due-today', nextReviewDate: today };

  it('今日以前の nextReviewDate を持つカードを返す', async () => {
    vi.mocked(prisma.card.findMany).mockResolvedValue([overdueCard, dueCard]);

    const result = await getTodayReviewCards(VALID_USER_ID);

    expect(prisma.card.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: VALID_USER_ID,
          nextReviewDate: { lte: expect.any(Date) },
        }),
        orderBy: { nextReviewDate: 'asc' },
      }),
    );
    expect(result).toHaveLength(2);
  });

  it('deckId 指定時はそのデッキのカードのみ取得する', async () => {
    vi.mocked(prisma.card.findMany).mockResolvedValue([dueCard]);

    await getTodayReviewCards(VALID_USER_ID, VALID_DECK_ID);

    expect(prisma.card.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: VALID_USER_ID,
          deckId: VALID_DECK_ID,
        }),
      }),
    );
  });

  it('deckId 未指定時は where に deckId が含まれない', async () => {
    vi.mocked(prisma.card.findMany).mockResolvedValue([]);

    await getTodayReviewCards(VALID_USER_ID);

    const callArgs = vi.mocked(prisma.card.findMany).mock.calls[0]?.[0];
    expect(callArgs?.where).not.toHaveProperty('deckId');
  });

  it('カードが0件のとき空配列を返す', async () => {
    vi.mocked(prisma.card.findMany).mockResolvedValue([]);

    const result = await getTodayReviewCards(VALID_USER_ID);

    expect(result).toEqual([]);
  });
});
