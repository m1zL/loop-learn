'use client';

import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

// mermaid.initialize() はアプリ内で1回だけ呼び出す（Mermaid v11 best practice）
let mermaidInitialized = false;

function ensureMermaidInitialized() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    suppressErrorRendering: true,
    securityLevel: 'strict',
  });
  mermaidInitialized = true;
}

interface MermaidRendererProps {
  code: string;
}

/**
 * Mermaidダイアグラムをクライアントサイドでレンダリングするコンポーネント。
 * `mermaid.render()` で SVG を生成し `dangerouslySetInnerHTML` で挿入する。
 * エラー時は赤文字のメッセージを表示し、ローディング中はグレーのプレースホルダーを表示する。
 */
export default function MermaidRenderer({ code }: MermaidRendererProps) {
  const rawId = useId();
  // useId() returns strings like ":r0:" — colons are invalid in HTML IDs
  const id = `mermaid-${rawId.replace(/:/g, '')}`;
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureMermaidInitialized();
    // code 変更時に旧 SVG・エラーを即座にクリアして UI 状態を同期する
    setSvgContent('');
    setError(null);

    let cancelled = false;

    mermaid
      .render(id, code)
      .then(({ svg }) => {
        if (!cancelled) {
          setSvgContent(svg);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('ダイアグラムの構文に誤りがあります');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, id]);

  if (error) {
    return <p className="text-xs text-red-500 p-2 border border-red-200 rounded">{error}</p>;
  }

  if (!svgContent) {
    return <p className="text-xs text-gray-400 p-2">ダイアグラムを読み込み中...</p>;
  }

  return (
    <div
      className="overflow-auto my-2"
      // mermaid が生成する SVG のみを挿入する（任意の HTML は挿入しない）
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
