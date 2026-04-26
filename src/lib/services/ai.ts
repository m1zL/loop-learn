import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { Domain } from '@/lib/validations/ai.schema';
import { domainLabels } from '@/lib/validations/ai.schema';

export interface GeneratedCard {
  front: string;
  back: string;
}

/**
 * テキストと技術ドメインを受け取り、Gemini API でQ&Aカードを生成する。
 *
 * @param text - 問題生成の元となるテキスト (10〜5000文字)
 * @param domain - 技術ドメイン (問題の難易度・観点を調整するために使用)
 * @returns 生成された Q&A カードの配列 (5〜10問)
 */
export async function generateCards(text: string, domain: Domain): Promise<GeneratedCard[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const domainLabel = domainLabels[domain];
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    // systemInstruction はユーザー入力と分離し、プロンプトインジェクションを防止
    systemInstruction: [
      'あなたはフラッシュカード生成の専門家です。',
      '与えられたテキストから技術学習用のQ&Aカードを生成してください。',
      `技術ドメイン: ${domainLabel}`,
      'ルール:',
      '- 5〜10問のQ&Aカードを生成する',
      '- front: 簡潔で具体的な問題文（1〜2文）',
      '- back: 答え（100字以内、要点を押さえた簡潔な説明）',
      '- 日本語で出力する',
      '- テキストに含まれる重要概念・用語・仕組みを問う問題を優先する',
      '- 似たような問題を重複して作らない',
    ].join('\n'),
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            front: { type: SchemaType.STRING, description: '問題文' },
            back: { type: SchemaType.STRING, description: '答え' },
          },
          required: ['front', 'back'],
        },
      },
    },
  });

  const result = await model.generateContent(text);
  const responseText = result.response.text();
  const cards = JSON.parse(responseText) as GeneratedCard[];

  return cards.filter(
    (card) => typeof card.front === 'string' && typeof card.back === 'string',
  );
}
