'use client';

import { motion } from 'framer-motion';
import { TOTAL_QUESTIONS } from '@/config/questions';

interface ProgressDotsProps {
  currentIndex: number;
}

export default function ProgressDots({ currentIndex }: ProgressDotsProps) {
  const progress = Math.round(((currentIndex + 1) / TOTAL_QUESTIONS) * 100);

  return (
    <div className="w-full space-y-2">
      {/* Segmented track */}
      <div className="flex gap-1">
        {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden"
          >
            {i <= currentIndex && (
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #16a34a, #f97316)',
                }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400 font-medium">
          {currentIndex + 1} of {TOTAL_QUESTIONS}
        </span>
        <motion.span
          key={progress}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs font-semibold text-brand-green"
        >
          {progress}% complete
        </motion.span>
      </div>
    </div>
  );
}
