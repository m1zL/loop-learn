'use client';

import type { GeneratedCard } from '@/lib/services/ai';

interface GeneratedCardItemProps {
  card: GeneratedCard;
  onChange: (card: GeneratedCard) => void;
  onDelete: () => void;
}

export default function GeneratedCardItem({ card, onChange, onDelete }: GeneratedCardItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">表面</span>
        <button
          type="button"
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 transition-colors text-sm leading-none p-1"
          aria-label="カードを削除"
        >
          ✕
        </button>
      </div>
      <textarea
        value={card.front}
        onChange={(e) => onChange({ ...card, front: e.target.value })}
        rows={2}
        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
      />

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">裏面</p>
      <textarea
        value={card.back}
        onChange={(e) => onChange({ ...card, back: e.target.value })}
        rows={3}
        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
      />
    </div>
  );
}
