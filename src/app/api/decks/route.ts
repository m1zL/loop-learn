import { auth } from '@/lib/auth';
import { createDeckSchema } from '@/lib/validations/deck.schema';
import { createDeck, getDecksByUser } from '@/lib/services/deck';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decks = await getDecksByUser(session.user.id);
    return Response.json(decks);
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

  const parsed = createDeckSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const deck = await createDeck(session.user.id, parsed.data);
    return Response.json(deck, { status: 201 });
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
