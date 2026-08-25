import { z } from 'zod';
import { normalizeNigerianPhone } from './phone';

export const emailSignupSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(60),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const emailLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const phoneAuthSchema = z.object({
  phone: z
    .string()
    .transform((val) => {
      const result = normalizeNigerianPhone(val);
      if (!result.isValid || !result.canonicalPhone) {
        throw new Error('Please enter a valid Nigerian phone number.');
      }
      return result.canonicalPhone;
    }),
});

export const otpVerifySchema = z.object({
  phone: z
    .string()
    .transform((val) => {
      const result = normalizeNigerianPhone(val);
      if (!result.isValid || !result.canonicalPhone) {
        throw new Error('Please enter a valid Nigerian phone number.');
      }
      return result.canonicalPhone;
    }),
  token: z.string().length(6, 'Verification code must be 6 digits'),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(60),
  location: z.string().min(2, 'Location required').max(60),
  phone: z.string().optional().or(z.literal('')),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

export const profileCompletionSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(60),
  location: z.string().min(2, 'Location required').max(60),
  phone: z.string().optional().or(z.literal('')),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

export type EmailSignupInput = z.infer<typeof emailSignupSchema>;
export type EmailLoginInput = z.infer<typeof emailLoginSchema>;
export type PhoneAuthInput = z.infer<typeof phoneAuthSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ProfileCompletionInput = z.infer<typeof profileCompletionSchema>;

