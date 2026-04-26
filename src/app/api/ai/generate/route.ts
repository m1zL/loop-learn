import { auth } from '@/lib/auth';
import { generateCardsSchema } from '@/lib/validations/ai.schema';
import { generateCards } from '@/lib/services/ai';
import { getDeckById } from '@/lib/services/deck';

// Vercel Serverless: AI生成は最大60秒を許可
export const maxDuration = 60;

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

  const parsed = generateCardsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { text, domain, deckId } = parsed.data;

  // デッキの存在確認とアクセス権チェック
  const deck = await getDeckById(deckId, session.user.id);
  if (!deck) {
    return Response.json({ error: 'Deck not found or access denied' }, { status: 404 });
  }

  try {
    const cards = await generateCards(text, domain);
    return Response.json({ cards });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[ai/generate] error:', err);
    // GEMINI_API_KEY 未設定など設定エラーは503で返す
    if (message.includes('not configured')) {
      return Response.json({ error: 'AI service is not configured' }, { status: 503 });
    }
    // レート制限・クォータ超過は429で返す
    if (message.includes('429') || message.includes('quota') || message.includes('Too Many Requests') || message.includes('credits')) {
      return Response.json(
        { error: 'AIサービスのリクエスト制限に達しました。しばらく待ってから再度お試しください。' },
        { status: 429 },
      );
    }
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
