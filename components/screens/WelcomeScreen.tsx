'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

interface WelcomeScreenProps {
  onStart: (whatsapp: string) => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [whatsapp, setWhatsapp] = useState('');
  const [touched, setTouched] = useState(false);

  const digits = whatsapp.replace(/\D/g, '');
  const isValid = digits.length >= 10;
  const showError = touched && !isValid && whatsapp.length > 0;

  const handleStart = () => {
    setTouched(true);
    if (!isValid) return;
    onStart(whatsapp.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-14 bg-white">
      <motion.div
        className="w-full max-w-[360px] flex flex-col items-center text-center gap-6"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={item} className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.05 }}
            className="relative w-[148px] h-[148px]"
            style={{ filter: 'drop-shadow(0 12px 28px rgba(22,163,74,0.18)) drop-shadow(0 3px 8px rgba(0,0,0,0.06))' }}
          >
            <Image
              src="/logo.svg"
              alt="Enugu Buy & Sell"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
          <p className="text-[10px] text-gray-300 tracking-[0.2em] uppercase mt-1">
            Discovery Engine
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div variants={item} className="w-10 h-px bg-gray-100" />

        {/* Headline */}
        <motion.div variants={item} className="space-y-3">
          <h1 className="text-[28px] sm:text-[30px] font-extrabold text-gray-900 leading-[1.22] tracking-tight">
            Help Shape the Future of Student{' '}
            <span className="text-brand-green">Buying &amp; Selling</span> in Enugu
          </h1>
          <p className="text-[14px] text-gray-400 leading-[1.7]">
            We&apos;re building around <em>your</em> real experience — not assumptions.
            Your answers directly shape what we build first.
          </p>
        </motion.div>

        {/* Time pill */}
        <motion.div variants={item}>
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-4 py-2 text-[13px] text-gray-400 font-medium">
            <span>⏱</span>
            <span>~5 minutes</span>
            <span className="text-gray-200 select-none">·</span>
            <span>12 questions</span>
          </div>
        </motion.div>

        {/* WhatsApp field */}
        <motion.div variants={item} className="w-full text-left space-y-1.5">
          <label
            htmlFor="whatsapp-input"
            className="block text-[13px] font-semibold text-gray-700"
          >
            Your WhatsApp Number
            <span className="text-brand-orange ml-1">*</span>
          </label>
          <p className="text-[11px] text-gray-400 mb-2">
            We may reach out to share updates about what we&apos;re building. No spam — ever.
          </p>

          <div className="relative">
            {/* WhatsApp icon prefix */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                aria-hidden="true"
              >
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                  fill="#25D366"
                />
                <path
                  d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.306A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                  stroke="#25D366"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>

            <input
              id="whatsapp-input"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g. 08012345678"
              autoComplete="tel"
              inputMode="tel"
              className={[
                'w-full pl-12 pr-4 py-4 rounded-2xl border-2 text-[15px]',
                'text-gray-700 placeholder:text-gray-300 outline-none',
                'transition-all duration-200',
                showError
                  ? 'border-red-300 bg-red-50/30 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]'
                  : isValid && whatsapp.length > 0
                  ? 'border-brand-green bg-brand-green-50/40 focus:border-brand-green focus:shadow-[0_0_0_4px_rgba(22,163,74,0.1)]'
                  : 'border-gray-100 bg-white focus:border-brand-green focus:shadow-[0_0_0_4px_rgba(22,163,74,0.1)]',
              ].join(' ')}
            />

            {/* Validation tick */}
            <AnimatePresence>
              {isValid && whatsapp.length > 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-green text-lg"
                >
                  ✓
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[12px] text-red-400 font-medium pl-1"
              >
                Please enter a valid phone number (at least 10 digits)
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <motion.div variants={item} className="w-full space-y-3">
          <Button
            onClick={handleStart}
            disabled={touched && !isValid && whatsapp.length > 0}
            className="w-full !text-[16px] !py-[18px]"
          >
            <span>Start the Survey</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', repeatDelay: 0.6 }}
              aria-hidden="true"
            >
              →
            </motion.span>
          </Button>
          <p className="text-[11px] text-gray-300 text-center leading-relaxed">
            🔒 Your number is confidential. We will never share or sell it.
          </p>
        </motion.div>

        {/* Social proof */}
        <motion.div
          variants={item}
          className="flex items-center gap-2.5 text-[11px] text-gray-300"
        >
          <div className="flex -space-x-1.5">
            {['🎓', '🎒', '📚', '💻'].map((emoji, i) => (
              <span
                key={i}
                className="w-7 h-7 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[13px]"
              >
                {emoji}
              </span>
            ))}
          </div>
          <span>Students from UNEC, ESUT &amp; IMT are building this with us</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
