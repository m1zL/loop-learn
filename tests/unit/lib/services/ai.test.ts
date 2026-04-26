import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// vi.hoisted でモック関数を先行生成し、vi.mock ファクトリから参照できるようにする
const mockGenerateContent = vi.hoisted(() => vi.fn());

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: mockGenerateContent,
    })),
  })),
  SchemaType: {
    ARRAY: 'array',
    OBJECT: 'object',
    STRING: 'string',
  },
}));

import { generateCards } from '@/lib/services/ai';

describe('generateCards', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-api-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('正常系: Gemini が Q&A カードを返すとき GeneratedCard[] を返す', async () => {
    const mockCards = [
      { front: 'Reactとは何ですか？', back: 'UIを構築するためのJavaScriptライブラリ。' },
      { front: 'Hookとは何ですか？', back: '関数コンポーネントでstateや副作用を扱う仕組み。' },
    ];
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(mockCards) },
    });

    const result = await generateCards('Reactの基本について説明します。', 'frontend');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      front: 'Reactとは何ですか？',
      back: 'UIを構築するためのJavaScriptライブラリ。',
    });
    expect(result[1]).toEqual({
      front: 'Hookとは何ですか？',
      back: '関数コンポーネントでstateや副作用を扱う仕組み。',
    });
  });

  it('front/back が文字列でないエントリはフィルタリングされる', async () => {
    const mockCards = [
      { front: 'valid question', back: 'valid answer' },
      { front: null, back: 'answer' },         // front が null → 除外
      { front: 'question', back: undefined },   // back が undefined → 除外
    ];
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(mockCards) },
    });

    const result = await generateCards('テキスト', 'general');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ front: 'valid question', back: 'valid answer' });
  });

  it('GEMINI_API_KEY 未設定のとき Error をスローする', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(generateCards('テキスト', 'general')).rejects.toThrow(
      'GEMINI_API_KEY is not configured',
    );
  });
});
