import { z } from 'zod';

export const phoneAuthSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format. Include country code e.g. +2348012345678'),
});

export const otpVerifySchema = z.object({
  phone: z.string().min(10),
  token: z.string().length(6, 'Verification code must be 6 digits'),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(50),
  location: z.string().min(2, 'Location required').max(50),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

export type PhoneAuthInput = z.infer<typeof phoneAuthSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
