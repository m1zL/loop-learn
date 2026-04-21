import { z } from 'zod';

export const createDeckSchema = z.object({
  name: z.string().min(1, 'デッキ名を入力してください').max(100, 'デッキ名は100文字以内にしてください'),
  description: z.string().max(500, '説明は500文字以内にしてください').optional(),
  icon: z.string().default('📘'),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;

// description は null を許容: 編集時に空にして既存説明を消す操作を可能にする
export const updateDeckSchema = createDeckSchema.partial().extend({
  description: z.string().max(500, '説明は500文字以内にしてください').nullish(),
});
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
