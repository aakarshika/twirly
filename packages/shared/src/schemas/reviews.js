import { z } from 'zod';

export const postReviewSchema = z.object({
  text: z.string().min(1).max(5000),
});
