'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OptionCard from '@/components/ui/OptionCard';
import type { Question, Answers } from '@/types/survey';

interface YesNoFollowUpProps {
  question: Question;
  answers: Answers;
  onChange: (id: string, value: string) => void;
}

export default function YesNoFollowUp({ question, answers, onChange }: YesNoFollowUpProps) {
  const mainValue = answers[question.id];
  const followUpId = `${question.id}_followup`;
  const followUpValue = answers[followUpId] ?? '';
  const [charCount, setCharCount] = useState(followUpValue.length);

  const shouldShowFollowUp =
    question.followUp &&
    mainValue !== undefined &&
    mainValue.toLowerCase().startsWith(question.followUp.trigger);

  return (
    <div className="space-y-2.5">
      {(question.options ?? []).map((opt, i) => (
        <OptionCard
          key={opt}
          label={opt}
          index={i}
          isSelected={mainValue === opt}
          onClick={() => onChange(question.id, opt)}
        />
      ))}

      <AnimatePresence>
        {shouldShowFollowUp && question.followUp && (
          <motion.div
            key="followup"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-1 p-4 rounded-2xl border-2 border-brand-orange/20 bg-brand-orange-50/40">
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                {question.followUp.label}
              </label>
              <textarea
                value={followUpValue}
                onChange={(e) => {
                  onChange(followUpId, e.target.value);
                  setCharCount(e.target.value.length);
                }}
                placeholder={question.followUp.placeholder}
                maxLength={400}
                rows={3}
                className={[
                  'w-full resize-none rounded-xl border-2 border-gray-100 bg-white',
                  'px-4 py-3 text-[15px] text-gray-700 placeholder:text-gray-300',
                  'transition-all duration-150 outline-none',
                  'focus:border-brand-orange focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)]',
                ].join(' ')}
              />
              <p className="text-right text-xs text-gray-300 mt-1">
                {charCount}/400
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
