import { z } from 'zod';

export const createDeckSchema = z.object({
  name: z.string().min(1, 'デッキ名を入力してください').max(100, 'デッキ名は100文字以内にしてください'),
  description: z.string().max(500, '説明は500文字以内にしてください').optional(),
  icon: z.string().default('📘'),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;

export const updateDeckSchema = createDeckSchema.partial();
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
