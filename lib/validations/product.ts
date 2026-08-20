import { z } from 'zod';

export const createProductSchema = z.object({
  shop_id: z.string().uuid('Invalid shop ID'),
  name: z.string().min(2, 'Product name required').max(100),
  description: z.string().max(1000).optional(),
  price: z.number().positive('Price must be greater than 0'),
  category_id: z.string().uuid().optional(),
  condition: z.enum(['New', 'Used', 'Refurbished']).default('Used'),
  location: z.string().min(2).default('Enugu'),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed').default([]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
