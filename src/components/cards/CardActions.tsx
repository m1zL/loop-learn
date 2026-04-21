'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CardActionsProps {
  cardId: string;
}

export default function CardActions({ cardId }: CardActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm('このカードを削除しますか？この操作は取り消せません。')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Link
        href={`/cards/${cardId}/edit`}
        className="px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
      >
        編集
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? '削除中...' : '削除'}
      </button>
    </div>
  );
}
