'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Question, Answers } from '@/types/survey';

interface OpenTextProps {
  question: Question;
  answers: Answers;
  onChange: (id: string, value: string) => void;
}

export default function OpenText({ question, answers, onChange }: OpenTextProps) {
  const value = answers[question.id] ?? '';
  const [focused, setFocused] = useState(false);
  const MAX = 600;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div
        className={[
          'rounded-2xl border-2 transition-all duration-200',
          focused
            ? 'border-brand-green shadow-[0_0_0_4px_rgba(22,163,74,0.1)]'
            : 'border-gray-100',
        ].join(' ')}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(question.id, e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={question.placeholder ?? 'Share your thoughts here...'}
          maxLength={MAX}
          rows={6}
          className={[
            'w-full resize-none rounded-2xl bg-white',
            'px-5 py-4 text-[16px] leading-relaxed text-gray-700',
            'placeholder:text-gray-300 outline-none',
          ].join(' ')}
        />
      </div>

      <div className="flex justify-between items-center mt-2 px-1">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: value.length > 0 ? 1 : 0 }}
          className="text-xs text-brand-green font-medium"
        >
          {value.length > 0 ? '✦ Your response was noted' : ''}
        </motion.span>
        <span
          className={[
            'text-xs font-medium transition-colors duration-150',
            value.length > MAX * 0.85 ? 'text-brand-orange' : 'text-gray-300',
          ].join(' ')}
        >
          {value.length}/{MAX}
        </span>
      </div>
    </motion.div>
  );
}
