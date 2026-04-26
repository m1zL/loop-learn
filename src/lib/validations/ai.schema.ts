import { z } from 'zod';

export const domainValues = [
  'frontend',
  'backend',
  'infra',
  'algorithm',
  'os',
  'network',
  'database',
  'security',
  'general',
] as const;

export type Domain = (typeof domainValues)[number];

export const domainLabels: Record<Domain, string> = {
  frontend: 'フロントエンド',
  backend: 'バックエンド',
  infra: 'インフラ',
  algorithm: 'アルゴリズム',
  os: 'OS',
  network: 'ネットワーク',
  database: 'データベース',
  security: 'セキュリティ',
  general: '一般',
};

export const generateCardsSchema = z.object({
  text: z
    .string()
    .min(10, 'テキストは10文字以上入力してください')
    .max(5000, 'テキストは5000文字以内にしてください'),
  domain: z.enum(domainValues),
  deckId: z.string().cuid('デッキIDが不正です'),
});

export type GenerateCardsInput = z.infer<typeof generateCardsSchema>;
