import { z } from 'zod';
import { normalizeNigerianPhone } from './phone';

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
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(50),
  location: z.string().min(2, 'Location required').max(50),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

export type PhoneAuthInput = z.infer<typeof phoneAuthSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

