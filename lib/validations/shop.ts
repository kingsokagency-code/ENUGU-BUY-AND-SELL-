import { z } from 'zod';

export const createShopSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters').max(60),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  location: z.string().min(2, 'Location is required').default('Enugu'),
  logo_url: z.string().url().optional().or(z.literal('')).or(z.null()),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
