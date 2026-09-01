/**
 * lib/ai-evaluation.ts
 * Intelligent AI-Powered Candidate Evaluation Engine for Enugu Buy & Sell (EBS)
 * Uses Google Gemini Generative AI with strict evidence-based scoring & claim validation.
 */

import {
  type EvidenceLevel,
  calculateApplicationClassification,
} from './validations/recruitment';

export interface AIEvaluationResult {
  score_experience: number;        // 0-25
  score_accomplishment: number;    // 0-25
  score_initiative: number;        // 0-15
  score_commitment: number;        // 0-15
  score_vision: number;            // 0-10
  score_communication: number;     // 0-10
  total_score: number;             // 0-100
  classification: string;
  evidence_level_experience: EvidenceLevel;
  evidence_level_accomplishment: EvidenceLevel;
  strengths: string[];
  flags: string[];
  extracted_claims: string[];
  suggested_interview_questions: string[];
  ai_summary: string;
  evaluated_at: string;
  model_used: string;
}

export interface CandidateApplicationContext {
  full_name: string;
  email: string;
  school_institution: string;
  location: string;
  team_area: string;
  skills: string;
  previous_experience: string;
  practical_accomplishment: string;
  portfolio_link?: string | null;
  why_join_ebs: string;
  what_can_you_contribute: string;
  weekly_hours_commitment: string;
  comfortable_with_team: boolean;
}

/**
 * Main AI Candidate Evaluator
 */
export async function evaluateCandidateWithAI(
  app: CandidateApplicationContext
): Promise<AIEvaluationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[AI Evaluation] No GEMINI_API_KEY found, using heuristic evaluation engine.');
    return evaluateCandidateHeuristically(app);
  }

  const prompt = `You are the Lead Talent & Executive Evaluator for Enugu Buy & Sell (EBS), a premier campus commerce startup in Enugu, Nigeria.

EVALUATION PHILOSOPHY:
- EVIDENCE OVER CLAIMS.
- ACTION OVER WORDS.
- OWNERSHIP OVER TITLES.
- RESULTS OVER PROMISES.
- ANTI-GAMING: Penalize vague buzzwords ("I am very passionate", "I am a synergy leader"). Reward SPECIFICITY, REAL EXPERIENCE, MEASURABLE RESULTS, and PROVABLE ACTION.

CANDIDATE APPLICATION DATA:
- Name: ${app.full_name}
- Target Team Area: ${app.team_area}
- School/Institution: ${app.school_institution}
- Location: ${app.location}
- Stated Skills: ${app.skills}
- Previous Background: ${app.previous_experience}
- Crucial Practical Accomplishment: "${app.practical_accomplishment}"
- Portfolio/Proof Link: ${app.portfolio_link || 'None provided'}
- Motivation (Why EBS): ${app.why_join_ebs}
- Proposed Contribution: ${app.what_can_you_contribute}
- Stated Availability: ${app.weekly_hours_commitment}

SCORING RUBRIC (Strict max bands):
1. Relevant Demonstrated Experience (0–25 points):
   - 0–5: No relevant experience or unsupported claim.
   - 6–10: Has learning/exposure but little practical application.
   - 11–15: Meaningful practical work completed.
   - 16–20: Repeated application in real situations.
   - 21–25: Strong demonstrable experience with meaningful outcomes.

2. Practical Accomplishment / Evidence (0–25 points):
   - 0–5: No concrete accomplishment.
   - 6–10: Accomplishment described but contribution/evidence is vague.
   - 11–15: Concrete accomplishment with clear personal contribution.
   - 16–20: Significant accomplishment with measurable result.
   - 21–25: Exceptional accomplishment with clear ownership, measurable metrics, and supporting links/proof.

3. Initiative & Problem Solving (0–15 points):
   - 0–3: Dependent on directions.
   - 4–7: Basic participation.
   - 8–11: Independently solves problems.
   - 12–15: Strong ownership, resourcefulness, initiative.

4. Commitment & Availability (0–15 points):
   - Evaluate specificity of schedule, hours, and realistic dedication.

5. EBS Vision Alignment (0–10 points):
   - Understanding of Enugu campus marketplace, student merchants, and buyers.

6. Communication & Clarity (0–10 points):
   - Clarity, structure, and ability to articulate ideas (do NOT score based on expensive vocabulary).

EVIDENCE LEVELS:
- E0 = Unsupported claim
- E1 = General explanation
- E2 = Concrete example
- E3 = Specific evidence / measurable results
- E4 = Documented proof / verifiable portfolio

JSON SCHEMA RESPONSE REQUIRED:
Return ONLY valid JSON matching this exact structure:
{
  "score_experience": <integer 0-25>,
  "score_accomplishment": <integer 0-25>,
  "score_initiative": <integer 0-15>,
  "score_commitment": <integer 0-15>,
  "score_vision": <integer 0-10>,
  "score_communication": <integer 0-10>,
  "evidence_level_experience": "E0"|"E1"|"E2"|"E3"|"E4",
  "evidence_level_accomplishment": "E0"|"E1"|"E2"|"E3"|"E4",
  "strengths": ["<key strength 1>", "<key strength 2>"],
  "flags": ["<potential concern or unsupported claim 1>"],
  "extracted_claims": ["<specific claim to verify>"],
  "suggested_interview_questions": ["<question 1 to probe claim>", "<question 2>"],
  "ai_summary": "<2-3 sentence executive assessment summary>"
}`;

  const modelEndpoints = [
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-2.5-flash',
  ];

  for (const model of modelEndpoints) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2, // Low temperature for consistent, objective rubric evaluation
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (rawText) {
          const parsed = JSON.parse(rawText);

          // Normalize and clamp scores
          const sExp = Math.min(Math.max(Number(parsed.score_experience) || 0, 0), 25);
          const sAcc = Math.min(Math.max(Number(parsed.score_accomplishment) || 0, 0), 25);
          const sInit = Math.min(Math.max(Number(parsed.score_initiative) || 0, 0), 15);
          const sCom = Math.min(Math.max(Number(parsed.score_commitment) || 0, 0), 15);
          const sVis = Math.min(Math.max(Number(parsed.score_vision) || 0, 0), 10);
          const sClar = Math.min(Math.max(Number(parsed.score_communication) || 0, 0), 10);

          const total = sExp + sAcc + sInit + sCom + sVis + sClar;

          return {
            score_experience: sExp,
            score_accomplishment: sAcc,
            score_initiative: sInit,
            score_commitment: sCom,
            score_vision: sVis,
            score_communication: sClar,
            total_score: total,
            classification: calculateApplicationClassification(total),
            evidence_level_experience: (parsed.evidence_level_experience as EvidenceLevel) || 'E1',
            evidence_level_accomplishment: (parsed.evidence_level_accomplishment as EvidenceLevel) || 'E1',
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
            flags: Array.isArray(parsed.flags) ? parsed.flags : [],
            extracted_claims: Array.isArray(parsed.extracted_claims) ? parsed.extracted_claims : [],
            suggested_interview_questions: Array.isArray(parsed.suggested_interview_questions) ? parsed.suggested_interview_questions : [],
            ai_summary: parsed.ai_summary || 'Evaluation completed based on candidate submission evidence.',
            evaluated_at: new Date().toISOString(),
            model_used: `Gemini AI (${model})`,
          };
        }
      }
    } catch {
      // Try next model candidate
    }
  }

  // If Gemini API fails or times out, seamlessly use Heuristic Evidence Engine
  return evaluateCandidateHeuristically(app);
}

/**
 * Intelligent Heuristic Evaluation Engine (Fallback when offline or API key absent)
 */
export function evaluateCandidateHeuristically(
  app: CandidateApplicationContext
): AIEvaluationResult {
  let sExp = 12;
  let sAcc = 10;
  let sInit = 8;
  let sCom = 8;
  let sVis = 5;
  let sClar = 6;

  let evExp: EvidenceLevel = 'E1';
  let evAcc: EvidenceLevel = 'E1';
  const strengths: string[] = [];
  const flags: string[] = [];

  const accText = (app.practical_accomplishment || '').toLowerCase();
  const expText = (app.previous_experience || '').toLowerCase();
  const skillsText = (app.skills || '').toLowerCase();
  const whyText = (app.why_join_ebs || '').toLowerCase();
  const contrText = (app.what_can_you_contribute || '').toLowerCase();

  // Metrics & Evidence Detection
  const hasNumbers = /\d+/.test(accText);
  const hasLink = Boolean(app.portfolio_link && app.portfolio_link.trim().startsWith('http'));

  if (hasLink) {
    evAcc = 'E4';
    sAcc += 10;
    sExp += 4;
    strengths.push('Provided direct portfolio / project verification URL');
  } else if (hasNumbers) {
    evAcc = 'E3';
    sAcc += 8;
    sInit += 3;
    strengths.push('Cited measurable numerical outcomes in accomplishment');
  }

  if (accText.length > 180) {
    sAcc += 4;
    sClar += 2;
    strengths.push('Detailed narrative with clear role and outcome context');
  } else if (accText.length < 80 && !hasNumbers && !hasLink) {
    sAcc -= 6;
    evAcc = 'E0';
    flags.push('Brief practical description with unsupported claims');
  }

  // Previous background & relevant skills
  if (expText.length > 150) {
    sExp += 5;
    evExp = hasLink ? 'E4' : hasNumbers ? 'E3' : 'E2';
    strengths.push('Substantive previous domain experience');
  } else if (expText.length < 60) {
    sExp -= 4;
    flags.push('Limited details on prior domain background');
  }

  if (skillsText.split(',').length >= 3 || skillsText.length > 30) {
    sExp += 3;
    sInit += 2;
  }

  // Vision & Contribution
  if (whyText.length > 80 && (whyText.includes('enugu') || whyText.includes('student') || whyText.includes('campus') || whyText.includes('marketplace'))) {
    sVis += 4;
    strengths.push('Demonstrated understanding of Enugu campus marketplace mission');
  }

  if (contrText.length > 80) {
    sInit += 2;
    sClar += 2;
  }

  // Commitment & Hours
  const hours = (app.weekly_hours_commitment || '').toLowerCase();
  if (hours.includes('15') || hours.includes('20') || hours.includes('deep focus')) {
    sCom += 6;
    strengths.push(`Strong availability commitment: ${app.weekly_hours_commitment}`);
  } else if (hours.includes('10')) {
    sCom += 4;
  }

  // Anti-Gaming Buzzword Check
  const buzzwords = ['synergy', 'growth hacking', 'to the moon', 'massive leader', 'natural born leader'];
  const hasBuzzwords = buzzwords.some((b) => accText.includes(b) || expText.includes(b) || contrText.includes(b));
  if (hasBuzzwords && !hasNumbers && !hasLink) {
    sAcc -= 4;
    sInit -= 3;
    flags.push('Contains promotional buzzwords without concrete proof metrics');
  }

  // Clamping to strict category maximums
  sExp = Math.min(Math.max(sExp, 0), 25);
  sAcc = Math.min(Math.max(sAcc, 0), 25);
  sInit = Math.min(Math.max(sInit, 0), 15);
  sCom = Math.min(Math.max(sCom, 0), 15);
  sVis = Math.min(Math.max(sVis, 0), 10);
  sClar = Math.min(Math.max(sClar, 0), 10);

  const total = sExp + sAcc + sInit + sCom + sVis + sClar;

  return {
    score_experience: sExp,
    score_accomplishment: sAcc,
    score_initiative: sInit,
    score_commitment: sCom,
    score_vision: sVis,
    score_communication: sClar,
    total_score: total,
    classification: calculateApplicationClassification(total),
    evidence_level_experience: evExp,
    evidence_level_accomplishment: evAcc,
    strengths,
    flags,
    extracted_claims: [
      `Accomplishment: "${app.practical_accomplishment.slice(0, 120)}..."`,
      `Stated Skills: ${app.skills.slice(0, 80)}`,
    ],
    suggested_interview_questions: [
      `Ask the candidate to detail their exact individual responsibility for: "${app.practical_accomplishment.slice(0, 60)}..."`,
      'Ask them to walk through the biggest operational or technical bottleneck they solved.',
      `Verify their availability to fulfill ${app.weekly_hours_commitment} alongside academic or personal schedules.`,
    ],
    ai_summary: `Candidate evaluated with ${total}/100 score (${calculateApplicationClassification(total)}). Demonstrated ${evAcc} accomplishment evidence in ${app.team_area}.`,
    evaluated_at: new Date().toISOString(),
    model_used: 'EBS Evidence Heuristic Engine',
  };
}
