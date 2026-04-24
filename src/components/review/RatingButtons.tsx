'use client';

import type { Rating } from '@/types/card';

interface RatingButtonsProps {
  onRate: (rating: Rating) => void;
  isSubmitting: boolean;
}

const RATINGS: { value: Rating; label: string; color: string }[] = [
  { value: 1, label: '全然わからない', color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' },
  { value: 2, label: 'うっすら', color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200' },
  { value: 3, label: 'わかった', color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' },
  { value: 4, label: '完璧', color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' },
];

/**
 * 復習カードの4段階自己評価ボタン。
 * 送信中は全ボタンをdisabledにして二重送信を防止する。
 */
export default function RatingButtons({ onRate, isSubmitting }: RatingButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {RATINGS.map(({ value, label, color }) => (
        <button
          key={value}
          type="button"
          onClick={() => onRate(value)}
          disabled={isSubmitting}
          className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
        >
          <span className="block text-xs text-gray-500 mb-0.5">{value}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
