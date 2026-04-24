'use client';

interface SessionProgressProps {
  completed: number;
  total: number;
}

/**
 * 復習セッションの進捗バーと枚数テキストを表示するコンポーネント。
 */
export default function SessionProgress({ completed, total }: SessionProgressProps) {
  const remaining = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>{completed} / {total} 枚完了</span>
        <span>残り {remaining} 枚</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
