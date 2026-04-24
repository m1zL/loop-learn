'use client';

import CardPreview from '@/components/cards/CardPreview';
import type { Card } from '@/types/card';

interface ReviewCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
}

/**
 * 問題面→答え面のフリップアニメーション付きカードコンポーネント。
 * CSS transform (rotateY) のみでアニメーションを実装し、16ms以内の描画を保証する。
 */
export default function ReviewCard({ card, isFlipped, onFlip }: ReviewCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onFlip();
          return;
        }
        if (e.key === ' ') {
          e.preventDefault();
          onFlip();
        }
      }}
      className="relative cursor-pointer select-none"
      style={{ perspective: '1000px', minHeight: '200px' }}
      aria-label={isFlipped ? '問題面に戻る' : '答えを見る'}
    >
      <div
        className="relative w-full"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.35s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '200px',
        }}
      >
        {/* 問題面 */}
        <div
          className="absolute inset-0 bg-white rounded-xl border border-gray-200 p-5 overflow-auto"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">問題</p>
          <CardPreview content={card.front} cardType={card.cardType} isFront={true} />
          {!isFlipped && (
            <p className="text-center text-sm text-gray-400 mt-4">タップして答えを見る</p>
          )}
        </div>

        {/* 答え面 */}
        <div
          className="absolute inset-0 bg-white rounded-xl border border-blue-200 p-5 overflow-auto"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <p className="text-xs text-blue-500 mb-3 font-medium uppercase tracking-wide">答え</p>
          <CardPreview content={card.back} cardType={card.cardType} isFront={false} />
        </div>
      </div>
    </div>
  );
}
