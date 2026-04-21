import { auth } from '@/lib/auth';
import { updateDeckSchema } from '@/lib/validations/deck.schema';
import { getDeckById, updateDeck, deleteDeck } from '@/lib/services/deck';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ deckId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { deckId } = await params;

  try {
    const deck = await getDeckById(deckId, session.user.id);
    if (!deck) {
      return Response.json({ error: 'Deck not found' }, { status: 404 });
    }
    return Response.json(deck);
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ deckId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = updateDeckSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { deckId } = await params;

  try {
    const deck = await updateDeck(deckId, session.user.id, parsed.data);
    if (!deck) {
      return Response.json({ error: 'Deck not found' }, { status: 404 });
    }
    return Response.json(deck);
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ deckId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { deckId } = await params;

  try {
    const deleted = await deleteDeck(deckId, session.user.id);
    if (!deleted) {
      return Response.json({ error: 'Deck not found' }, { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
