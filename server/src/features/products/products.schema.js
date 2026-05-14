import { z } from 'zod';

export const createProductSchema = z.object({
  name:            z.string().min(1).max(255),
  description:     z.string().max(2000).optional(),
  imageUrl:        z.string().url().max(1000).optional(),
  itemColorString: z.string().max(50).optional(),
  categoryIds:     z.array(z.number().int().positive()).max(10).default([]),
});

export const updateProductSchema = createProductSchema.partial();
