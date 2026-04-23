'use client';

import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import type { CardType } from '@/types/card';

// Mermaid はバンドルサイズが大きいため next/dynamic で遅延ロード（SSR無効化）
const MermaidRenderer = dynamic(() => import('./MermaidRenderer'), {
  ssr: false,
  loading: () => <p className="text-xs text-gray-400 p-2">ダイアグラムを読み込み中...</p>,
});

interface CardPreviewProps {
  content: string;
  cardType: CardType;
  /** 問題面(front)を表示しているかどうか。clozeタイプの穴埋め変換に使用 */
  isFront?: boolean;
}

/**
 * Markdownコンテンツをレンダリングするプレビューコンポーネント。
 * clozeタイプの問題面では {{word}} を [___] に変換する。
 */
export default function CardPreview({ content, cardType, isFront = false }: CardPreviewProps) {
  // clozeタイプの問題面では穴埋め表示に変換
  const displayContent =
    cardType === 'cloze' && isFront
      ? content.replace(/\{\{(.+?)\}\}/g, '[___]')
      : content;

  if (!displayContent) {
    return (
      <div className="text-gray-400 text-sm italic p-3">
        プレビューがここに表示されます
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none p-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className ?? '');
            if (match?.[1] === 'mermaid') {
              return <MermaidRenderer code={String(children).trim()} />;
            }
            return <code className={className}>{children}</code>;
          },
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
}
