'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReviewCard from './ReviewCard';
import RatingButtons from './RatingButtons';
import SessionProgress from './SessionProgress';
import type { Card, Rating } from '@/types/card';

interface ReviewSessionProps {
  cards: Card[];
}

/**
 * 復習セッション全体を管理するクライアントコンポーネント。
 * カードの表示・フリップ・評価送信・次カードへの遷移を制御する。
 */
export default function ReviewSession({ cards }: ReviewSessionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedRatings, setCompletedRatings] = useState<Rating[]>([]);

  const currentCard = cards[currentIndex];

  async function handleRate(rating: Rating) {
    if (!currentCard || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cards/${currentCard.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) {
        console.error('評価送信に失敗しました:', res.status);
        return;
      }

      const newRatings = [...completedRatings, rating];
      setCompletedRatings(newRatings);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= cards.length) {
        // セッション完了 → サマリーページへ
        const avgRating = (newRatings.reduce((sum, r) => sum + r, 0) / newRatings.length).toFixed(1);
        router.push(`/review/summary?reviewed=${newRatings.length}&avgRating=${avgRating}`);
        return;
      }

      setCurrentIndex(nextIndex);
      setIsFlipped(false);
    } catch (error) {
      console.error('評価送信中に通信エラーが発生しました:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!currentCard) return null;

  return (
    <div>
      <SessionProgress completed={completedRatings.length} total={cards.length} />

      <ReviewCard
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={() => {
          if (!isFlipped) setIsFlipped(true);
        }}
      />

      {isFlipped && (
        <RatingButtons onRate={handleRate} isSubmitting={isSubmitting} />
      )}
    </div>
  );
}
