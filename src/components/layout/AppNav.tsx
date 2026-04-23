import Image from 'next/image';
import Link from 'next/link';
import { signOut } from '@/lib/auth';
import type { Session } from 'next-auth';

interface AppNavProps {
  session: Session;
}

export default function AppNav({ session }: AppNavProps) {
  const user = session.user;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
          loop-learn
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ダッシュボード
          </Link>
          <Link
            href="/decks"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            デッキ
          </Link>
          <Link
            href="/cards/new"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            カード作成
          </Link>

          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? 'ユーザー'}
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                {user.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
            )}
            <span className="text-sm text-gray-700 hidden sm:block">
              {user.name}
            </span>

            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
            >
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ログアウト
              </button>
            </form>
          </div>
        </nav>
      </div>
    </header>
  );
}
