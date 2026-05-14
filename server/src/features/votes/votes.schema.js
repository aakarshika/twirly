import { z } from 'zod';

export const castVoteSchema = z.object({
  setId: z.number().int().positive(),
  itemId: z.number().int().positive(),
});

export const updateVoteSchema = z.object({
  itemId: z.number().int().positive(),
});
