import { z } from 'zod';

export const createShopSchema = z.object({
  name: z.string().trim().min(2, 'Shop name must be at least 2 characters').max(60, 'Shop name cannot exceed 60 characters'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(60, 'Slug cannot exceed 60 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().nullable().or(z.literal('')),
  location: z.string().trim().min(2, 'Location is required').default('Enugu'),
  logo_url: z.string().optional().nullable().or(z.literal('')),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;

