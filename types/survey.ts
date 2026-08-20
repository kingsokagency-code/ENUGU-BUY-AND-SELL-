/* ----------------------------------------------------------------
   survey.ts — All TypeScript types for the Discovery Engine
---------------------------------------------------------------- */

export type QuestionType =
  | 'single-choice'
  | 'yes-no-followup'
  | 'open-text';

export interface FollowUpConfig {
  trigger: 'yes' | 'no';
  placeholder: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  category: string;
  question: string;
  subtitle?: string;
  options?: string[];
  followUp?: FollowUpConfig;
  placeholder?: string;
}

export type Answers = Record<string, string | undefined>;

export interface SurveyState {
  questionIndex: number;
  direction: 1 | -1;
  answers: Answers;
}

export interface SurveyResponse {
  answers: Answers;
  completed_at: string;
  duration_seconds: number;
  institution?: string;
}
