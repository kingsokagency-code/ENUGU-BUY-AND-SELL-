/**
 * lib/recruitment.ts
 * Recruitment Service & Candidate Evaluation Engine for Enugu Buy & Sell (EBS)
 */

import { supabase, serviceClient } from './supabase';
import {
  teamApplicationSchema,
  stage1ScoringSchema,
  stage2ScoringSchema,
  calculateApplicationClassification,
  calculateFinalClassification,
  type TeamApplicationInput,
  type Stage1ScoringInput,
  type Stage2ScoringInput,
  type ApplicationStatus,
  type TeamArea,
} from './validations/recruitment';
import { sanitizeErrorMessage } from './error-utils';

export interface TeamApplicationRecord {
  id: string;
  full_name: string;
  email: string;
  whatsapp_number: string;
  school_institution: string;
  location: string;
  team_area: TeamArea;
  skills: string;
  previous_experience: string;
  practical_accomplishment: string;
  portfolio_link?: string | null;
  why_join_ebs: string;
  what_can_you_contribute: string;
  weekly_hours_commitment: string;
  comfortable_with_team: boolean;
  anything_else?: string | null;

  // Stage 1
  application_status: ApplicationStatus;
  score_experience: number;
  score_accomplishment: number;
  score_initiative: number;
  score_commitment: number;
  score_vision: number;
  score_communication: number;
  application_score: number;
  evidence_levels?: Record<string, string>;
  application_classification?: string;
  application_score_breakdown?: Record<string, unknown>;
  reviewer_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;

  // Stage 2
  interview_date?: string | null;
  interview_competence: number;
  interview_problem_solving: number;
  interview_ownership: number;
  interview_communication: number;
  interview_ebs_understanding: number;
  interview_teamwork: number;
  interview_score: number;
  interview_score_breakdown?: Record<string, unknown>;
  claim_validation?: string;
  interview_notes?: string | null;

  // Final
  final_score: number;
  final_classification?: string;
  final_recommendation?: string | null;

  created_at: string;
  updated_at: string;
}

import { evaluateCandidateWithAI } from './ai-evaluation';

/**
 * Submit an application to the EBS Volunteer Team
 * Enforces rate limiting, email uniqueness check, and data validation
 * Automatically runs AI Candidate Evidence Evaluation for instant pre-scoring.
 */
export async function submitTeamApplication(
  input: TeamApplicationInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const validated = teamApplicationSchema.parse(input);
    const admin = serviceClient() || supabase;

    // Check for duplicate application from identical email
    const { data: existing } = await admin
      .from('team_applications')
      .select('id, email')
      .eq('email', validated.email)
      .limit(1);

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: 'We already have an active application registered with this email address. Our team is currently reviewing submissions.',
      };
    }

    // Also check fallback storage for duplicate email
    const { data: fallbackExisting } = await admin
      .from('survey_responses')
      .select('id')
      .like('living_situation', 'RECRUITMENT:%')
      .eq('first_search', validated.email)
      .limit(1);

    if (fallbackExisting && fallbackExisting.length > 0) {
      return {
        success: false,
        error: 'We already have an active application registered with this email address. Our team is currently reviewing submissions.',
      };
    }

    // Run Intelligent AI Evidence Evaluation
    const aiResult = await evaluateCandidateWithAI({
      full_name: validated.full_name,
      email: validated.email,
      school_institution: validated.school_institution,
      location: validated.location,
      team_area: validated.team_area,
      skills: validated.skills,
      previous_experience: validated.previous_experience,
      practical_accomplishment: validated.practical_accomplishment,
      portfolio_link: validated.portfolio_link || null,
      why_join_ebs: validated.why_join_ebs,
      what_can_you_contribute: validated.what_can_you_contribute,
      weekly_hours_commitment: validated.weekly_hours_commitment,
      comfortable_with_team: validated.comfortable_with_team,
    });

    const aiNotes = `[AI Evaluation — ${aiResult.model_used}]\n${aiResult.ai_summary}\n\nStrengths:\n• ${aiResult.strengths.join('\n• ')}\n\nFlags:\n• ${aiResult.flags.length ? aiResult.flags.join('\n• ') : 'None'}`;

    const payload = {
      full_name: validated.full_name,
      email: validated.email,
      whatsapp_number: validated.whatsapp_number,
      school_institution: validated.school_institution,
      location: validated.location,
      team_area: validated.team_area,
      skills: validated.skills,
      previous_experience: validated.previous_experience,
      practical_accomplishment: validated.practical_accomplishment,
      portfolio_link: validated.portfolio_link || null,
      why_join_ebs: validated.why_join_ebs,
      what_can_you_contribute: validated.what_can_you_contribute,
      weekly_hours_commitment: validated.weekly_hours_commitment,
      comfortable_with_team: validated.comfortable_with_team,
      anything_else: validated.anything_else || null,
      application_status: 'new',
      application_score: aiResult.total_score,
      score_experience: aiResult.score_experience,
      score_accomplishment: aiResult.score_accomplishment,
      score_initiative: aiResult.score_initiative,
      score_commitment: aiResult.score_commitment,
      score_vision: aiResult.score_vision,
      score_communication: aiResult.score_communication,
      evidence_levels: {
        experience: aiResult.evidence_level_experience,
        accomplishment: aiResult.evidence_level_accomplishment,
      },
      application_classification: aiResult.classification,
      application_score_breakdown: aiResult,
      reviewer_notes: aiNotes,
    };

    const { data, error } = await admin
      .from('team_applications')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      // If table migration is pending in schema cache, fallback to safe audit logging
      if (error.message.includes('team_applications')) {
        const { data: fallback, error: fErr } = await admin
          .from('survey_responses')
          .insert({
            whatsapp_number: validated.whatsapp_number,
            institution: validated.school_institution,
            living_situation: `RECRUITMENT:${validated.team_area}`,
            hardest_item: validated.full_name,
            first_search: validated.email,
            found_item: validated.location,
            biggest_challenge: validated.skills.slice(0, 500),
            trust_vs_price: validated.practical_accomplishment.slice(0, 500),
            cancelled_purchase: validated.why_join_ebs.slice(0, 500),
            platform_preference: validated.what_can_you_contribute.slice(0, 500),
            whatsapp_daily: validated.weekly_hours_commitment,
            one_improvement: JSON.stringify(payload),
          })
          .select('id')
          .single();

        if (fErr) {
          return { success: false, error: sanitizeErrorMessage(fErr.message, 'Unable to submit application.') };
        }
        return { success: true, id: fallback.id };
      }

      return { success: false, error: sanitizeErrorMessage(error.message, 'Failed to record application.') };
    }

    return { success: true, id: data.id };
  } catch (err: unknown) {
    return { success: false, error: sanitizeErrorMessage(err, 'Application submission failed. Please check your answers.') };
  }
}

/**
 * Fetch all team applications (Admin only)
 */
export async function getTeamApplications(filters?: {
  team_area?: string;
  status?: string;
  search?: string;
  sort_by?: 'created_at' | 'application_score' | 'final_score';
}): Promise<{ success: boolean; applications: TeamApplicationRecord[]; error?: string }> {
  try {
    const admin = serviceClient() || supabase;
    let query = admin.from('team_applications').select('*');

    if (filters?.team_area && filters.team_area !== 'all') {
      query = query.eq('team_area', filters.team_area);
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('application_status', filters.status);
    }

    const sortField = filters?.sort_by || 'created_at';
    query = query.order(sortField, { ascending: false });

    const { data, error } = await query;

    if (error) {
      if (error.message.includes('team_applications')) {
        // Fallback from survey_responses
        const { data: rawFallback } = await admin
          .from('survey_responses')
          .select('*')
          .like('living_situation', 'RECRUITMENT:%')
          .order('submitted_at', { ascending: false });

        const mapped: TeamApplicationRecord[] = (rawFallback || []).map((row) => {
          let parsed: any = {};
          try {
            parsed = JSON.parse(row.one_improvement || '{}');
          } catch {}
          return {
            id: row.id,
            full_name: parsed.full_name || row.hardest_item || 'Applicant',
            email: parsed.email || row.first_search || '',
            whatsapp_number: parsed.whatsapp_number || row.whatsapp_number || '',
            school_institution: parsed.school_institution || row.institution || '',
            location: parsed.location || row.found_item || 'Enugu',
            team_area: parsed.team_area || 'technology_development',
            skills: parsed.skills || row.biggest_challenge || '',
            previous_experience: parsed.previous_experience || '',
            practical_accomplishment: parsed.practical_accomplishment || row.trust_vs_price || '',
            portfolio_link: parsed.portfolio_link || null,
            why_join_ebs: parsed.why_join_ebs || row.cancelled_purchase || '',
            what_can_you_contribute: parsed.what_can_you_contribute || row.platform_preference || '',
            weekly_hours_commitment: parsed.weekly_hours_commitment || row.whatsapp_daily || '5-10 hours',
            comfortable_with_team: parsed.comfortable_with_team ?? true,
            anything_else: parsed.anything_else || null,
            application_status: parsed.application_status || 'new',
            score_experience: parsed.score_experience || 0,
            score_accomplishment: parsed.score_accomplishment || 0,
            score_initiative: parsed.score_initiative || 0,
            score_commitment: parsed.score_commitment || 0,
            score_vision: parsed.score_vision || 0,
            score_communication: parsed.score_communication || 0,
            application_score: parsed.application_score || 0,
            evidence_levels: parsed.evidence_levels,
            application_classification: parsed.application_classification,
            reviewer_notes: parsed.reviewer_notes || null,
            reviewed_by: parsed.reviewed_by || null,
            reviewed_at: parsed.reviewed_at || null,
            interview_date: parsed.interview_date || null,
            interview_competence: parsed.interview_competence || 0,
            interview_problem_solving: parsed.interview_problem_solving || 0,
            interview_ownership: parsed.interview_ownership || 0,
            interview_communication: parsed.interview_communication || 0,
            interview_ebs_understanding: parsed.interview_ebs_understanding || 0,
            interview_teamwork: parsed.interview_teamwork || 0,
            interview_score: parsed.interview_score || 0,
            claim_validation: parsed.claim_validation || 'unvalidated',
            interview_notes: parsed.interview_notes || null,
            final_score: parsed.final_score || 0,
            final_classification: parsed.final_classification,
            final_recommendation: parsed.final_recommendation || null,
            created_at: parsed.created_at || row.submitted_at || new Date().toISOString(),
            updated_at: parsed.updated_at || row.submitted_at || new Date().toISOString(),
          };
        });

        return { success: true, applications: mapped };
      }
      return { success: false, applications: [], error: error.message };
    }

    let results = data as TeamApplicationRecord[];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (a) =>
          a.full_name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.skills.toLowerCase().includes(q) ||
          a.practical_accomplishment.toLowerCase().includes(q) ||
          a.school_institution.toLowerCase().includes(q)
      );
    }

    return { success: true, applications: results };
  } catch (err: unknown) {
    return { success: false, applications: [], error: sanitizeErrorMessage(err) };
  }
}

/**
 * Fetch a single team application by ID
 */
export async function getTeamApplicationById(
  id: string
): Promise<{ success: boolean; application?: TeamApplicationRecord | null; error?: string }> {
  try {
    const admin = serviceClient() || supabase;
    const { data, error } = await admin
      .from('team_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, application: data as TeamApplicationRecord };
  } catch (err: unknown) {
    return { success: false, error: sanitizeErrorMessage(err) };
  }
}

/**
 * Save Stage 1 Application Evidence Scoring (Max 100)
 */
export async function evaluateStage1Application(
  id: string,
  input: Stage1ScoringInput,
  reviewerId?: string
): Promise<{ success: boolean; application?: TeamApplicationRecord; error?: string }> {
  try {
    const validated = stage1ScoringSchema.parse(input);
    const admin = serviceClient() || supabase;

    const totalAppScore =
      validated.score_experience +
      validated.score_accomplishment +
      validated.score_initiative +
      validated.score_commitment +
      validated.score_vision +
      validated.score_communication;

    const classification = calculateApplicationClassification(totalAppScore);

    const updatePayload: Record<string, unknown> = {
      score_experience: validated.score_experience,
      score_accomplishment: validated.score_accomplishment,
      score_initiative: validated.score_initiative,
      score_commitment: validated.score_commitment,
      score_vision: validated.score_vision,
      score_communication: validated.score_communication,
      application_score: totalAppScore,
      application_classification: classification,
      evidence_levels: {
        experience: validated.evidence_level_experience,
        accomplishment: validated.evidence_level_accomplishment,
      },
      reviewer_notes: validated.reviewer_notes || null,
      reviewed_by: reviewerId || null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (validated.application_status) {
      updatePayload.application_status = validated.application_status;
    }

    const { data, error } = await admin
      .from('team_applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.message.includes('team_applications')) {
        // Fallback update in survey_responses
        const { data: rawRow } = await admin
          .from('survey_responses')
          .select('*')
          .eq('id', id)
          .single();

        if (rawRow) {
          let parsed: any = {};
          try {
            parsed = JSON.parse(rawRow.one_improvement || '{}');
          } catch {}

          const merged = { ...parsed, ...updatePayload };
          await admin
            .from('survey_responses')
            .update({
              one_improvement: JSON.stringify(merged),
            })
            .eq('id', id);

          const fallbackResult: TeamApplicationRecord = {
            id: rawRow.id,
            full_name: merged.full_name || rawRow.hardest_item || 'Applicant',
            email: merged.email || rawRow.first_search || '',
            whatsapp_number: merged.whatsapp_number || rawRow.whatsapp_number || '',
            school_institution: merged.school_institution || rawRow.institution || '',
            location: merged.location || rawRow.found_item || 'Enugu',
            team_area: merged.team_area || 'technology_development',
            skills: merged.skills || rawRow.biggest_challenge || '',
            previous_experience: merged.previous_experience || '',
            practical_accomplishment: merged.practical_accomplishment || rawRow.trust_vs_price || '',
            portfolio_link: merged.portfolio_link || null,
            why_join_ebs: merged.why_join_ebs || rawRow.cancelled_purchase || '',
            what_can_you_contribute: merged.what_can_you_contribute || rawRow.platform_preference || '',
            weekly_hours_commitment: merged.weekly_hours_commitment || rawRow.whatsapp_daily || '5-10 hours',
            comfortable_with_team: true,
            application_status: merged.application_status || 'new',
            score_experience: merged.score_experience || 0,
            score_accomplishment: merged.score_accomplishment || 0,
            score_initiative: merged.score_initiative || 0,
            score_commitment: merged.score_commitment || 0,
            score_vision: merged.score_vision || 0,
            score_communication: merged.score_communication || 0,
            application_score: totalAppScore,
            application_classification: classification,
            evidence_levels: merged.evidence_levels,
            reviewer_notes: merged.reviewer_notes,
            interview_competence: merged.interview_competence || 0,
            interview_problem_solving: merged.interview_problem_solving || 0,
            interview_ownership: merged.interview_ownership || 0,
            interview_communication: merged.interview_communication || 0,
            interview_ebs_understanding: merged.interview_ebs_understanding || 0,
            interview_teamwork: merged.interview_teamwork || 0,
            interview_score: merged.interview_score || 0,
            final_score: merged.final_score || 0,
            created_at: rawRow.submitted_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          return { success: true, application: fallbackResult };
        }
      }
      return { success: false, error: error.message };
    }

    return { success: true, application: data as TeamApplicationRecord };
  } catch (err: unknown) {
    return { success: false, error: sanitizeErrorMessage(err) };
  }
}

/**
 * Save Stage 2 Interview Validation Scoring (Max 100) & Final Score Calculation
 */
export async function evaluateStage2Interview(
  id: string,
  input: Stage2ScoringInput
): Promise<{ success: boolean; application?: TeamApplicationRecord; error?: string }> {
  try {
    const validated = stage2ScoringSchema.parse(input);
    const admin = serviceClient() || supabase;

    let appScore = 0;
    let existingRecord: any = null;

    // Get current record to fetch application_score for weighted calculation
    const { data: current, error: getErr } = await admin
      .from('team_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (!getErr && current) {
      appScore = current.application_score || 0;
      existingRecord = current;
    } else {
      // Check fallback table
      const { data: rawRow } = await admin
        .from('survey_responses')
        .select('*')
        .eq('id', id)
        .single();

      if (rawRow) {
        try {
          existingRecord = JSON.parse(rawRow.one_improvement || '{}');
          appScore = existingRecord.application_score || 0;
        } catch {}
      }
    }

    const totalInterviewScore =
      validated.interview_competence +
      validated.interview_problem_solving +
      validated.interview_ownership +
      validated.interview_communication +
      validated.interview_ebs_understanding +
      validated.interview_teamwork;

    // Final Weighted Score = (App Score * 40%) + (Interview Score * 60%)
    const finalScore = Number(((appScore * 0.4) + (totalInterviewScore * 0.6)).toFixed(1));
    const finalClassification = calculateFinalClassification(finalScore);

    const updatePayload: Record<string, unknown> = {
      interview_competence: validated.interview_competence,
      interview_problem_solving: validated.interview_problem_solving,
      interview_ownership: validated.interview_ownership,
      interview_communication: validated.interview_communication,
      interview_ebs_understanding: validated.interview_ebs_understanding,
      interview_teamwork: validated.interview_teamwork,
      interview_score: totalInterviewScore,
      claim_validation: validated.claim_validation,
      interview_notes: validated.interview_notes || null,
      interview_date: new Date().toISOString(),
      final_score: finalScore,
      final_classification: finalClassification,
      final_recommendation: validated.final_recommendation || null,
      updated_at: new Date().toISOString(),
    };

    if (validated.application_status) {
      updatePayload.application_status = validated.application_status;
    }

    const { data, error } = await admin
      .from('team_applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.message.includes('team_applications')) {
        // Fallback update in survey_responses
        const { data: rawRow } = await admin
          .from('survey_responses')
          .select('*')
          .eq('id', id)
          .single();

        if (rawRow) {
          let parsed: any = {};
          try {
            parsed = JSON.parse(rawRow.one_improvement || '{}');
          } catch {}

          const merged = { ...parsed, ...updatePayload };
          await admin
            .from('survey_responses')
            .update({
              one_improvement: JSON.stringify(merged),
            })
            .eq('id', id);

          const fallbackResult: TeamApplicationRecord = {
            id: rawRow.id,
            full_name: merged.full_name || rawRow.hardest_item || 'Applicant',
            email: merged.email || rawRow.first_search || '',
            whatsapp_number: merged.whatsapp_number || rawRow.whatsapp_number || '',
            school_institution: merged.school_institution || rawRow.institution || '',
            location: merged.location || rawRow.found_item || 'Enugu',
            team_area: merged.team_area || 'technology_development',
            skills: merged.skills || rawRow.biggest_challenge || '',
            previous_experience: merged.previous_experience || '',
            practical_accomplishment: merged.practical_accomplishment || rawRow.trust_vs_price || '',
            portfolio_link: merged.portfolio_link || null,
            why_join_ebs: merged.why_join_ebs || rawRow.cancelled_purchase || '',
            what_can_you_contribute: merged.what_can_you_contribute || rawRow.platform_preference || '',
            weekly_hours_commitment: merged.weekly_hours_commitment || rawRow.whatsapp_daily || '5-10 hours',
            comfortable_with_team: true,
            application_status: merged.application_status || 'new',
            score_experience: merged.score_experience || 0,
            score_accomplishment: merged.score_accomplishment || 0,
            score_initiative: merged.score_initiative || 0,
            score_commitment: merged.score_commitment || 0,
            score_vision: merged.score_vision || 0,
            score_communication: merged.score_communication || 0,
            application_score: appScore,
            application_classification: merged.application_classification || 'Low priority',
            interview_competence: validated.interview_competence,
            interview_problem_solving: validated.interview_problem_solving,
            interview_ownership: validated.interview_ownership,
            interview_communication: validated.interview_communication,
            interview_ebs_understanding: validated.interview_ebs_understanding,
            interview_teamwork: validated.interview_teamwork,
            interview_score: totalInterviewScore,
            claim_validation: validated.claim_validation,
            interview_notes: validated.interview_notes,
            final_score: finalScore,
            final_classification: finalClassification,
            final_recommendation: validated.final_recommendation,
            created_at: rawRow.submitted_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          return { success: true, application: fallbackResult };
        }
      }
      return { success: false, error: error.message };
    }

    return { success: true, application: data as TeamApplicationRecord };
  } catch (err: unknown) {
    return { success: false, error: sanitizeErrorMessage(err) };
  }
}
