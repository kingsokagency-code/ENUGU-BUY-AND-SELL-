'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion }           from 'framer-motion';
import { QUESTIONS }                         from '@/config/questions';
import WelcomeScreen                         from '@/components/screens/WelcomeScreen';
import QuestionScreen                        from '@/components/screens/QuestionScreen';
import ThankYouScreen                        from '@/components/screens/ThankYouScreen';
import type { Answers }                      from '@/types/survey';

type Stage = 'welcome' | 'questions' | 'thankyou';

const STORAGE_KEY = 'ebs_discovery_v1';

// ── Local persistence ─────────────────────────────────────────
function loadSaved(): { index: number; answers: Answers; whatsapp?: string } | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function persist(index: number, answers: Answers, whatsapp: string) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ index, answers, whatsapp })); } catch { /* noop */ }
}
function clear() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}
function isAnswered(id: string, answers: Answers): boolean {
  const v = answers[id];
  return typeof v === 'string' && v.trim().length > 0;
}

const fade = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } };

export default function SurveyEngine() {
  // Lazy state initialization to prevent React effect setState warnings
  const [initialData] = useState(() => loadSaved());

  const [stage, setStage] = useState<Stage>(
    initialData && Object.keys(initialData.answers).length > 0 ? 'questions' : 'welcome'
  );
  const [questionIndex, setQuestionIndex] = useState(initialData?.index ?? 0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<Answers>(initialData?.answers ?? {});
  const [startTime, setStartTime] = useState(0);
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-save progress
  useEffect(() => {
    if (stage === 'questions') persist(questionIndex, answers, whatsapp);
  }, [questionIndex, answers, stage, whatsapp]);

  const handleStart = useCallback((wa: string) => {
    setWhatsapp(wa);
    setStartTime(Date.now());
    setDirection(1);
    setStage('questions');
  }, []);

  const handleAnswer = useCallback((id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    setSubmitError(null);
  }, []);

  const currentQ = QUESTIONS[questionIndex];
  const isLast   = questionIndex === QUESTIONS.length - 1;
  const canAdvance = currentQ ? isAnswered(currentQ.id, answers) : false;

  const handleNext = useCallback(async () => {
    if (!canAdvance || submitting) return;

    if (isLast) {
      setSubmitting(true);
      setSubmitError(null);

      const duration = Math.round((Date.now() - startTime) / 1000);

      try {
        const res = await fetch('/api/submit', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            answers:          { ...answers, whatsapp_number: whatsapp },
            duration_seconds: duration,
            completed_at:     new Date().toISOString(),
          }),
        });

        const json = await res.json();

        if (!res.ok) {
          setSubmitError(json.error ?? 'Something went wrong. Please try again.');
          setSubmitting(false);
          return;
        }

        clear();
        setDirection(1);
        setStage('thankyou');
      } catch {
        setSubmitError('No connection. Please check your internet and try again.');
        setSubmitting(false);
      }

    } else {
      setDirection(1);
      setQuestionIndex(i => i + 1);
    }
  }, [canAdvance, submitting, isLast, startTime, answers, whatsapp]);

  const handleBack = useCallback(() => {
    setSubmitError(null);
    if (questionIndex === 0) {
      setDirection(-1);
      setStage('welcome');
    } else {
      setDirection(-1);
      setQuestionIndex(i => i - 1);
    }
  }, [questionIndex]);

  const handleRestart = useCallback(() => {
    clear();
    setAnswers({});
    setWhatsapp('');
    setQuestionIndex(0);
    setDirection(-1);
    setSubmitError(null);
    setStage('welcome');
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {stage === 'welcome' && (
          <motion.div key="welcome" variants={fade} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            <WelcomeScreen onStart={handleStart} />
          </motion.div>
        )}

        {stage === 'questions' && currentQ && (
          <motion.div key={`q-${questionIndex}`} variants={fade} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
            <QuestionScreen
              question={currentQ}
              questionIndex={questionIndex}
              direction={direction}
              answers={answers}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onBack={handleBack}
              canGoBack={true}
              isLastQuestion={isLast}
              canAdvance={canAdvance && !submitting}
            />

            {isLast && submitError && (
              <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50">
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-3">
                  <span className="text-red-500 text-lg flex-shrink-0">⚠</span>
                  <div className="flex-1">
                    <p className="text-red-700 text-sm font-medium">{submitError}</p>
                    <button
                      onClick={handleNext}
                      className="mt-1.5 text-red-600 text-xs font-semibold underline underline-offset-2"
                    >
                      Tap to try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {submitting && (
              <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
                <p className="text-sm text-gray-600 font-medium">Saving your response…</p>
              </div>
            )}
          </motion.div>
        )}

        {stage === 'thankyou' && (
          <motion.div key="thankyou" variants={fade} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            <ThankYouScreen onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
