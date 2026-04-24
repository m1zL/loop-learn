import { auth } from '@/lib/auth';
import { getTodayReviewCards } from '@/lib/services/card';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const deckId = searchParams.get('deckId') ?? undefined;

  try {
    const cards = await getTodayReviewCards(session.user.id, deckId);
    return Response.json(cards);
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
