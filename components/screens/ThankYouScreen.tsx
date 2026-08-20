'use client';

import { motion, type Variants } from 'framer-motion';
import Button from '@/components/ui/Button';

const container: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.35 },
  },
};

const row: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38 } },
};

interface ThankYouScreenProps {
  onRestart: () => void;
}

export default function ThankYouScreen({ onRestart }: ThankYouScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-14 bg-white">
      <motion.div
        className="w-full max-w-[360px] flex flex-col items-center text-center gap-7"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Celebration icon */}
        <div className="relative flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
            className="w-[80px] h-[80px] rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              boxShadow: '0 20px 50px rgba(22, 163, 74, 0.3)',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <path d="M9 18l7 7L28 11" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>

          {/* Sparkle ring */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <motion.span
              key={deg}
              className="absolute text-[11px] select-none pointer-events-none"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.3, 1.1, 0],
                x: Math.cos((deg * Math.PI) / 180) * 52,
                y: Math.sin((deg * Math.PI) / 180) * 52,
              }}
              transition={{
                duration: 1,
                delay: 0.3 + i * 0.07,
              }}
            >
              {i % 2 === 0 ? '✦' : '·'}
            </motion.span>
          ))}
        </div>

        {/* Content */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5 w-full">
          <motion.div variants={row}>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-orange mb-2">
              Thank you!
            </p>
            <h2 className="text-[28px] font-extrabold text-gray-900 leading-[1.2] tracking-tight">
              You just helped build something that matters.
            </h2>
          </motion.div>

          <motion.p variants={row} className="text-[15px] text-gray-400 leading-[1.7]">
            Your responses are now part of something thousands of students in Enugu
            will benefit from. You didn&apos;t just answer questions —{' '}
            <span className="text-gray-600 font-medium">you helped shape a product.</span>
          </motion.p>

          {/* Impact card */}
          <motion.div
            variants={row}
            className="rounded-2xl border border-brand-green/10 bg-brand-green-50/60 p-5 text-left space-y-3"
          >
            <p className="text-[13px] font-semibold text-brand-green">What happens next?</p>
            <ul className="space-y-2.5">
              {[
                'Your insights go directly to our product team',
                'We analyse trends across hundreds of student responses',
                'We build features that solve the most common problems',
                'You helped us get this right from day one',
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-gray-500">
                  <span className="text-brand-green mt-0.5 flex-shrink-0 font-bold">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={row} className="pt-1">
            <Button variant="ghost" size="sm" onClick={onRestart}>
              Submit another response
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
