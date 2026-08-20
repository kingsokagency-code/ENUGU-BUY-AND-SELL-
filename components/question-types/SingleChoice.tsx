'use client';

import OptionCard from '@/components/ui/OptionCard';
import type { Question, Answers } from '@/types/survey';

interface SingleChoiceProps {
  question: Question;
  answers: Answers;
  onChange: (id: string, value: string) => void;
}

export default function SingleChoice({ question, answers, onChange }: SingleChoiceProps) {
  const selected = answers[question.id];

  return (
    <div className="space-y-2.5">
      {(question.options ?? []).map((opt, i) => (
        <OptionCard
          key={opt}
          label={opt}
          index={i}
          isSelected={selected === opt}
          onClick={() => onChange(question.id, opt)}
        />
      ))}
    </div>
  );
}
