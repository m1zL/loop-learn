import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDecksByUser } from '@/lib/services/deck';
import GeneratePageClient from './GeneratePageClient';

export default async function AIGeneratePage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const decks = await getDecksByUser(session.user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">AIカード生成</h1>
      <GeneratePageClient decks={decks} />
    </div>
  );
}
