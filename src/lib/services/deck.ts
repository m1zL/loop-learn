import { prisma } from '@/lib/prisma';
import type { CreateDeckInput, UpdateDeckInput } from '@/lib/validations/deck.schema';
import type { Deck, DeckWithStats } from '@/types/deck';

export async function createDeck(userId: string, data: CreateDeckInput): Promise<Deck> {
  const deck = await prisma.deck.create({
    data: {
      userId,
      name: data.name,
      description: data.description ?? null,
      icon: data.icon,
    },
  });
  return deck as Deck;
}

export async function getDecksByUser(userId: string): Promise<DeckWithStats[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const decks = await prisma.deck.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { cards: true },
      },
      cards: {
        select: { nextReviewDate: true },
      },
    },
  });

  return decks.map((deck) => ({
    id: deck.id,
    userId: deck.userId,
    name: deck.name,
    description: deck.description,
    icon: deck.icon,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
    totalCards: deck._count.cards,
    dueCards: deck.cards.filter((c) => c.nextReviewDate <= today).length,
  }));
}

export async function getDeckById(
  deckId: string,
  userId: string,
): Promise<(DeckWithStats & { masteryDistribution: { unlearned: number; learning: number; mastered: number } }) | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId },
    include: {
      cards: {
        select: {
          nextReviewDate: true,
          repetitions: true,
          interval: true,
        },
      },
    },
  });

  if (!deck) return null;

  const unlearned = deck.cards.filter((c) => c.repetitions === 0).length;
  const learning = deck.cards.filter((c) => c.repetitions > 0 && c.interval < 21).length;
  const mastered = deck.cards.filter((c) => c.interval >= 21).length;
  const dueCards = deck.cards.filter((c) => c.nextReviewDate <= today).length;

  return {
    id: deck.id,
    userId: deck.userId,
    name: deck.name,
    description: deck.description,
    icon: deck.icon,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
    totalCards: deck.cards.length,
    dueCards,
    masteryDistribution: { unlearned, learning, mastered },
  };
}

export async function updateDeck(
  deckId: string,
  userId: string,
  data: UpdateDeckInput,
): Promise<Deck | null> {
  const existing = await prisma.deck.findFirst({
    where: { id: deckId, userId },
  });
  if (!existing) return null;

  const deck = await prisma.deck.update({
    where: { id: deckId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.icon !== undefined && { icon: data.icon }),
    },
  });
  return deck as Deck;
}

export async function deleteDeck(deckId: string, userId: string): Promise<boolean> {
  const existing = await prisma.deck.findFirst({
    where: { id: deckId, userId },
  });
  if (!existing) return false;

  await prisma.deck.delete({ where: { id: deckId } });
  return true;
}
