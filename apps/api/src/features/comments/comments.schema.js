import { z } from 'zod';

export const postCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

export const reactSchema = z.object({
  reactionType: z.enum(['like', 'dislike']).default('like'),
});
