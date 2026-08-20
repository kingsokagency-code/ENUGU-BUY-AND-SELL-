'use client';

import { AnimatePresence, motion } from 'framer-motion';
import ProgressDots from '@/components/ui/ProgressDots';
import Button from '@/components/ui/Button';
import SingleChoice from '@/components/question-types/SingleChoice';
import YesNoFollowUp from '@/components/question-types/YesNoFollowUp';
import OpenText from '@/components/question-types/OpenText';
import type { Question, Answers } from '@/types/survey';

interface QuestionScreenProps {
  question: Question;
  questionIndex: number;
  direction: 1 | -1;
  answers: Answers;
  onAnswer: (id: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
  isLastQuestion: boolean;
  canAdvance: boolean;
}

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 44 : -44, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -44 : 44, opacity: 0 }),
};

export default function QuestionScreen({
  question,
  questionIndex,
  direction,
  answers,
  onAnswer,
  onNext,
  onBack,
  canGoBack,
  isLastQuestion,
  canAdvance,
}: QuestionScreenProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky progress header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm px-5 pt-6 pb-4 border-b border-gray-50">
        <div className="max-w-lg mx-auto">
          <ProgressDots currentIndex={questionIndex} />
        </div>
      </div>

      {/* Scrollable question area */}
      <div className="flex-1 px-5 py-6 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={question.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-col gap-5"
            >
              {/* Category badge */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08 }}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-orange"
              >
                {question.category}
              </motion.span>

              {/* Question */}
              <div>
                <motion.h2
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
                  className="text-[22px] sm:text-2xl font-bold text-gray-900 leading-[1.3] tracking-tight"
                >
                  {question.question}
                </motion.h2>
                {question.subtitle && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.16 }}
                    className="mt-2 text-[14px] text-gray-400 leading-relaxed"
                  >
                    {question.subtitle}
                  </motion.p>
                )}
              </div>

              {/* Answer input */}
              <div className="mt-1">
                {question.type === 'single-choice' && (
                  <SingleChoice question={question} answers={answers} onChange={onAnswer} />
                )}
                {question.type === 'yes-no-followup' && (
                  <YesNoFollowUp question={question} answers={answers} onChange={onAnswer} />
                )}
                {question.type === 'open-text' && (
                  <OpenText question={question} answers={answers} onChange={onAnswer} />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky nav footer */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-50 px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={onBack}
            disabled={!canGoBack}
          >
            <span aria-hidden="true">←</span>
            <span>Back</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onNext}
            disabled={!canAdvance}
            className="min-w-[140px]"
          >
            <span>{isLastQuestion ? 'Submit' : 'Continue'}</span>
            <span aria-hidden="true">{isLastQuestion ? '✓' : '→'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
