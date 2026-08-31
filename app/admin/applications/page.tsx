'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Users, Search, Filter, ArrowUpRight, CheckCircle2,
  AlertCircle, MessageCircle, ExternalLink, Award, Sparkles,
  Check, X, RefreshCw, Star, ShieldCheck, ChevronRight,
  TrendingUp, SlidersHorizontal, FileText, Phone, Mail,
} from 'lucide-react';
import {
  TEAM_AREAS,
  TEAM_AREA_LABELS,
  APPLICATION_STATUSES,
  EVIDENCE_LEVELS,
  EVIDENCE_LEVEL_DESCRIPTIONS,
  type TeamArea,
  type ApplicationStatus,
  type EvidenceLevel,
  calculateApplicationClassification,
  calculateFinalClassification,
} from '@/lib/validations/recruitment';
import type { TeamApplicationRecord } from '@/lib/recruitment';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<TeamApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'application_score' | 'final_score'>('created_at');

  // Modal / Drawer state
  const [selectedCandidate, setSelectedCandidate] = useState<TeamApplicationRecord | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'profile' | 'stage1' | 'stage2'>('profile');
  const [savingEvaluation, setSavingEvaluation] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Stage 1 form state
  const [s1Exp, setS1Exp] = useState(0);
  const [s1Acc, setS1Acc] = useState(0);
  const [s1Init, setS1Init] = useState(0);
  const [s1Com, setS1Com] = useState(0);
  const [s1Vis, setS1Vis] = useState(0);
  const [s1Clar, setS1Clar] = useState(0);
  const [s1EvExp, setS1EvExp] = useState<EvidenceLevel>('E0');
  const [s1EvAcc, setS1EvAcc] = useState<EvidenceLevel>('E0');
  const [s1Notes, setS1Notes] = useState('');
  const [s1Status, setS1Status] = useState<ApplicationStatus>('new');

  // Stage 2 form state
  const [s2Comp, setS2Comp] = useState(0);
  const [s2Prob, setS2Prob] = useState(0);
  const [s2Own, setS2Own] = useState(0);
  const [s2Comm, setS2Comm] = useState(0);
  const [s2Ebs, setS2Ebs] = useState(0);
  const [s2Team, setS2Team] = useState(0);
  const [s2Validation, setS2Validation] = useState<'unvalidated' | 'validated' | 'partially_validated' | 'not_validated'>('unvalidated');
  const [s2Notes, setS2Notes] = useState('');
  const [s2Rec, setS2Rec] = useState('');
  const [s2Status, setS2Status] = useState<ApplicationStatus>('interview');
  // Auth State
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedArea !== 'all') params.set('team_area', selectedArea);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('sort_by', sortBy);

      const res = await fetch(`/api/admin/applications?${params.toString()}`);
      if (res.status === 401) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load applications');
      }

      setNeedsAuth(false);
      setApplications(data.applications || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading applications';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedArea, selectedStatus, searchQuery, sortBy]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: authPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Invalid admin credentials');
        return;
      }
      setNeedsAuth(false);
      loadApplications();
    } catch {
      setAuthError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleOpenEvaluation = (candidate: TeamApplicationRecord) => {
    setSelectedCandidate(candidate);
    setActiveModalTab('profile');
    setActionSuccess(null);

    // Populate Stage 1 state
    setS1Exp(candidate.score_experience || 0);
    setS1Acc(candidate.score_accomplishment || 0);
    setS1Init(candidate.score_initiative || 0);
    setS1Com(candidate.score_commitment || 0);
    setS1Vis(candidate.score_vision || 0);
    setS1Clar(candidate.score_communication || 0);
    setS1EvExp((candidate.evidence_levels?.experience as EvidenceLevel) || 'E0');
    setS1EvAcc((candidate.evidence_levels?.accomplishment as EvidenceLevel) || 'E0');
    setS1Notes(candidate.reviewer_notes || '');
    setS1Status(candidate.application_status || 'new');

    // Populate Stage 2 state
    setS2Comp(candidate.interview_competence || 0);
    setS2Prob(candidate.interview_problem_solving || 0);
    setS2Own(candidate.interview_ownership || 0);
    setS2Comm(candidate.interview_communication || 0);
    setS2Ebs(candidate.interview_ebs_understanding || 0);
    setS2Team(candidate.interview_teamwork || 0);
    setS2Validation((candidate.claim_validation as any) || 'unvalidated');
    setS2Notes(candidate.interview_notes || '');
    setS2Rec(candidate.final_recommendation || '');
    setS2Status(candidate.application_status || 'interview');
  };

  const handleSaveStage1 = async () => {
    if (!selectedCandidate) return;
    setSavingEvaluation(true);
    setActionSuccess(null);

    try {
      const payload = {
        action: 'stage1_score',
        stage1: {
          score_experience: s1Exp,
          score_accomplishment: s1Acc,
          score_initiative: s1Init,
          score_commitment: s1Com,
          score_vision: s1Vis,
          score_communication: s1Clar,
          evidence_level_experience: s1EvExp,
          evidence_level_accomplishment: s1EvAcc,
          reviewer_notes: s1Notes,
          application_status: s1Status,
        },
      };

      const res = await fetch(`/api/admin/applications/${selectedCandidate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save Stage 1 evaluation');

      setSelectedCandidate(data.application);
      setActionSuccess('Stage 1 Application Evaluation Saved!');
      loadApplications();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving Stage 1');
    } finally {
      setSavingEvaluation(false);
    }
  };

  const handleSaveStage2 = async () => {
    if (!selectedCandidate) return;
    setSavingEvaluation(true);
    setActionSuccess(null);

    try {
      const payload = {
        action: 'stage2_interview',
        stage2: {
          interview_competence: s2Comp,
          interview_problem_solving: s2Prob,
          interview_ownership: s2Own,
          interview_communication: s2Comm,
          interview_ebs_understanding: s2Ebs,
          interview_teamwork: s2Team,
          claim_validation: s2Validation,
          interview_notes: s2Notes,
          final_recommendation: s2Rec,
          application_status: s2Status,
        },
      };

      const res = await fetch(`/api/admin/applications/${selectedCandidate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save Stage 2 interview evaluation');

      setSelectedCandidate(data.application);
      setActionSuccess('Stage 2 Interview Evaluation & Final Score Saved!');
      loadApplications();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving Stage 2');
    } finally {
      setSavingEvaluation(false);
    }
  };

  // Live calculated scores
  const calculatedAppScore = s1Exp + s1Acc + s1Init + s1Com + s1Vis + s1Clar;
  const calculatedAppClass = calculateApplicationClassification(calculatedAppScore);

  const calculatedInterviewScore = s2Comp + s2Prob + s2Own + s2Comm + s2Ebs + s2Team;
  const currentOrNewAppScore = selectedCandidate?.application_score || calculatedAppScore;
  const calculatedFinalScore = Number(((currentOrNewAppScore * 0.4) + (calculatedInterviewScore * 0.6)).toFixed(1));
  const calculatedFinalClass = calculateFinalClassification(calculatedFinalScore);

  // Metrics
  const totalCount = applications.length;
  const newCount = applications.filter((a) => a.application_status === 'new').length;
  const shortlistedCount = applications.filter((a) => a.application_status === 'shortlisted').length;
  const interviewCount = applications.filter((a) => a.application_status === 'interview').length;
  const acceptedCount = applications.filter((a) => a.application_status === 'accepted').length;

  if (needsAuth) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto my-12 bg-[#111D17] border border-[#1D2B22] rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
              SECURITY VERIFICATION
            </span>
            <h2 className="text-xl font-black text-white pt-1">Recruitment Admin Access</h2>
            <p className="text-xs text-[#6B9980]">
              Enter your EBS administrator passkey to view candidate applications and evaluation records.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Admin Passkey
              </label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#0A1410] border border-[#1D2B22] focus:border-amber-500 rounded-xl text-white text-sm outline-none font-mono text-center"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-400 font-bold text-center">{authError}</p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {authLoading ? 'Verifying...' : 'Unlock Candidate Applications'}
            </button>
          </form>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1D2B22]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">Volunteer Team Recruitment</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full">
                Evidence Engine Active
              </span>
            </div>
            <p className="text-xs text-[#6B9980] mt-0.5">
              Evidence-based candidate evaluation, claim validation &amp; interview scoring
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/join-team"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
            >
              <span>View Public /join-team Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#6B9980]" />
            </Link>
          </div>
        </div>

        {/* 5 Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl p-4">
            <p className="text-[10px] text-[#6B9980] font-bold uppercase tracking-wider">Total Applied</p>
            <p className="text-xl font-black text-white mt-1">{totalCount}</p>
          </div>
          <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl p-4">
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">New</p>
            <p className="text-xl font-black text-amber-400 mt-1">{newCount}</p>
          </div>
          <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl p-4">
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Shortlisted</p>
            <p className="text-xl font-black text-blue-400 mt-1">{shortlistedCount}</p>
          </div>
          <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl p-4">
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Interview</p>
            <p className="text-xl font-black text-purple-400 mt-1">{interviewCount}</p>
          </div>
          <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl p-4">
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Accepted</p>
            <p className="text-xl font-black text-emerald-400 mt-1">{acceptedCount}</p>
          </div>
        </div>

        {/* Team-Composition Intelligence Bar */}
        <div className="bg-[#0D1812] border border-[#1D2B22] rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Team-Composition Balance &amp; Distribution</span>
            </span>
            <span className="text-[10px] text-[#6B9980] font-medium">
              Target: Balanced 6-Area Founding Team
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {TEAM_AREAS.map((areaKey) => {
              const count = applications.filter((a) => a.team_area === areaKey).length;
              const isFiltered = selectedArea === areaKey;
              return (
                <button
                  key={areaKey}
                  onClick={() => setSelectedArea(selectedArea === areaKey ? 'all' : areaKey)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isFiltered
                      ? 'bg-[#087443] border-[#0A8A50] text-white shadow-xs'
                      : 'bg-[#111D17] border-[#1D2B22] hover:border-[#2E4536] text-slate-300'
                  }`}
                >
                  <p className="text-[10px] font-bold truncate leading-tight">
                    {TEAM_AREA_LABELS[areaKey].title.split(' & ')[0]}
                  </p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-sm font-black text-white">{count}</span>
                    <span className="text-[9px] text-[#6B9980] font-mono">
                      {totalCount > 0 ? `${Math.round((count / totalCount) * 100)}%` : '0%'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6B9980] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name, skills, accomplishment, school..."
              className="w-full pl-9 pr-3 py-2 bg-[#1A2820] border border-[#243320] rounded-xl text-white text-xs placeholder-[#6B9980] outline-none focus:border-[#0A8A50]"
            />
          </div>

          {/* Area Filter */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-3 py-2 bg-[#1A2820] border border-[#243320] rounded-xl text-white text-xs outline-none focus:border-[#0A8A50]"
          >
            <option value="all">All 6 Team Areas</option>
            {TEAM_AREAS.map((a) => (
              <option key={a} value={a}>
                {TEAM_AREA_LABELS[a].title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-[#1A2820] border border-[#243320] rounded-xl text-white text-xs outline-none focus:border-[#0A8A50]"
          >
            <option value="all">All Statuses</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-[#1A2820] border border-[#243320] rounded-xl text-white text-xs outline-none focus:border-[#0A8A50]"
          >
            <option value="created_at">Sort: Newest First</option>
            <option value="application_score">Sort: Highest App Score</option>
            <option value="final_score">Sort: Highest Final Score</option>
          </select>
        </div>

        {/* Candidates Table */}
        <div className="bg-[#111D17] border border-[#1D2B22] rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#0A8A50] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#6B9980]">Loading candidate records...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Users className="w-8 h-8 text-[#4E6B5A] mx-auto" />
              <p className="text-sm font-bold text-white">No Applications Found</p>
              <p className="text-xs text-[#6B9980]">
                {searchQuery || selectedArea !== 'all' || selectedStatus !== 'all'
                  ? 'No applications match your active filters.'
                  : 'New volunteer applications will appear here as candidates apply.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#1D2B22] overflow-x-auto">
              {applications.map((app) => {
                const areaInfo = TEAM_AREA_LABELS[app.team_area] || { title: app.team_area };
                const formattedPhone = app.whatsapp_number.replace(/\D/g, '');

                return (
                  <div
                    key={app.id}
                    className="p-4 sm:p-5 hover:bg-[#15231B] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Left Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-white">{app.full_name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1A2820] text-emerald-300 border border-[#243320]">
                          {areaInfo.title}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            app.application_status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : app.application_status === 'shortlisted'
                              ? 'bg-blue-500/20 text-blue-300'
                              : app.application_status === 'interview'
                              ? 'bg-purple-500/20 text-purple-300'
                              : app.application_status === 'rejected'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {app.application_status}
                        </span>
                      </div>

                      <p className="text-xs text-[#6B9980]">
                        {app.school_institution} • {app.location} • {app.weekly_hours_commitment}
                      </p>

                      {/* Practical Accomplishment Snippet */}
                      <div className="bg-[#0A1410] border border-[#1D2B22] p-2.5 rounded-xl text-xs text-slate-300 font-medium line-clamp-2">
                        <strong className="text-amber-400 font-bold">Practical Evidence:</strong>{' '}
                        {app.practical_accomplishment}
                      </div>
                    </div>

                    {/* Scores & Actions */}
                    <div className="flex items-center gap-4 shrink-0 flex-wrap sm:flex-nowrap">
                      {/* Stage 1 App Score */}
                      <div className="text-center px-3 py-1.5 rounded-xl bg-[#1A2820] border border-[#243320]">
                        <p className="text-[9px] text-[#6B9980] font-bold uppercase">App Score</p>
                        <p className="text-sm font-black text-emerald-400">
                          {app.application_score > 0 ? `${app.application_score}/100` : 'Unscored'}
                        </p>
                      </div>

                      {/* Final Weighted Score */}
                      <div className="text-center px-3 py-1.5 rounded-xl bg-[#1A2820] border border-[#243320]">
                        <p className="text-[9px] text-amber-400 font-bold uppercase">Final Score</p>
                        <p className="text-sm font-black text-amber-400">
                          {app.final_score > 0 ? `${app.final_score}/100` : '—'}
                        </p>
                      </div>

                      {/* WhatsApp Button */}
                      <a
                        href={`https://wa.me/${formattedPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] transition-colors"
                        title="Chat candidate on WhatsApp"
                      >
                        <Phone className="w-4 h-4" />
                      </a>

                      {/* Evaluate Button */}
                      <button
                        onClick={() => handleOpenEvaluation(app)}
                        className="px-4 py-2.5 rounded-xl bg-[#087443] hover:bg-[#0A8A50] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Evaluate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── CANDIDATE EVALUATION MODAL / DRAWER ── */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#111D17] border border-[#1D2B22] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col text-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1D2B22] flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">{selectedCandidate.full_name}</h2>
                  <span className="text-[10px] bg-[#1A2820] text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-[#243320]">
                    {TEAM_AREA_LABELS[selectedCandidate.team_area]?.title || selectedCandidate.team_area}
                  </span>
                </div>
                <p className="text-xs text-[#6B9980] mt-0.5">
                  {selectedCandidate.email} • {selectedCandidate.whatsapp_number} • {selectedCandidate.school_institution}
                </p>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#1D2B22] bg-[#0A1410] text-xs font-bold">
              <button
                onClick={() => setActiveModalTab('profile')}
                className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                  activeModalTab === 'profile'
                    ? 'text-white border-b-2 border-emerald-400 bg-[#111D17]'
                    : 'text-[#6B9980] hover:text-white'
                }`}
              >
                1. Candidate Profile &amp; Answers
              </button>
              <button
                onClick={() => setActiveModalTab('stage1')}
                className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                  activeModalTab === 'stage1'
                    ? 'text-white border-b-2 border-emerald-400 bg-[#111D17]'
                    : 'text-[#6B9980] hover:text-white'
                }`}
              >
                2. Stage 1 Evidence Score ({selectedCandidate.application_score}/100)
              </button>
              <button
                onClick={() => setActiveModalTab('stage2')}
                className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                  activeModalTab === 'stage2'
                    ? 'text-white border-b-2 border-emerald-400 bg-[#111D17]'
                    : 'text-[#6B9980] hover:text-white'
                }`}
              >
                3. Stage 2 Interview Validation
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {actionSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* ── TAB 1: CANDIDATE ANSWERS ── */}
              {activeModalTab === 'profile' && (
                <div className="space-y-4">
                  {/* Practical Accomplishment Highlight */}
                  <div className="bg-[#1A2820] border-2 border-amber-500/40 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Practical Accomplishment / Evidence</span>
                    </div>
                    <p className="text-sm text-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
                      {selectedCandidate.practical_accomplishment}
                    </p>
                    {selectedCandidate.portfolio_link && (
                      <div className="pt-2">
                        <a
                          href={selectedCandidate.portfolio_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline"
                        >
                          <span>View Portfolio / Project Link</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Skills & Background */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#0A1410] border border-[#1D2B22] p-3.5 rounded-xl space-y-1">
                      <p className="text-[10px] text-[#6B9980] font-bold uppercase">Demonstrated Skills</p>
                      <p className="text-xs text-white font-medium">{selectedCandidate.skills}</p>
                    </div>
                    <div className="bg-[#0A1410] border border-[#1D2B22] p-3.5 rounded-xl space-y-1">
                      <p className="text-[10px] text-[#6B9980] font-bold uppercase">Weekly Availability</p>
                      <p className="text-xs text-emerald-400 font-bold">{selectedCandidate.weekly_hours_commitment}</p>
                    </div>
                  </div>

                  {/* Previous Experience */}
                  <div className="bg-[#0A1410] border border-[#1D2B22] p-3.5 rounded-xl space-y-1">
                    <p className="text-[10px] text-[#6B9980] font-bold uppercase">Previous Experience &amp; Background</p>
                    <p className="text-xs text-slate-300 font-medium whitespace-pre-wrap">{selectedCandidate.previous_experience}</p>
                  </div>

                  {/* Motivation */}
                  <div className="bg-[#0A1410] border border-[#1D2B22] p-3.5 rounded-xl space-y-1">
                    <p className="text-[10px] text-[#6B9980] font-bold uppercase">Why Join EBS?</p>
                    <p className="text-xs text-slate-300 font-medium whitespace-pre-wrap">{selectedCandidate.why_join_ebs}</p>
                  </div>

                  {/* Contribution */}
                  <div className="bg-[#0A1410] border border-[#1D2B22] p-3.5 rounded-xl space-y-1">
                    <p className="text-[10px] text-[#6B9980] font-bold uppercase">What They Can Contribute</p>
                    <p className="text-xs text-slate-300 font-medium whitespace-pre-wrap">{selectedCandidate.what_can_you_contribute}</p>
                  </div>

                  {selectedCandidate.anything_else && (
                    <div className="bg-[#0A1410] border border-[#1D2B22] p-3.5 rounded-xl space-y-1">
                      <p className="text-[10px] text-[#6B9980] font-bold uppercase">Additional Notes</p>
                      <p className="text-xs text-slate-300 font-medium whitespace-pre-wrap">{selectedCandidate.anything_else}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 2: STAGE 1 APPLICATION EVALUATION ── */}
              {activeModalTab === 'stage1' && (
                <div className="space-y-5">
                  {/* Score Live Summary */}
                  <div className="p-4 rounded-2xl bg-[#1A2820] border border-[#243320] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#6B9980] font-bold uppercase">Calculated Application Score</p>
                      <p className="text-2xl font-black text-emerald-400">{calculatedAppScore} / 100</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#6B9980] font-bold uppercase">Classification</p>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                        {calculatedAppClass}
                      </span>
                    </div>
                  </div>

                  {/* 6 Category Score Inputs */}
                  <div className="space-y-4">
                    {/* 1. Relevant Experience (25) */}
                    <div className="space-y-1 bg-[#0A1410] p-3.5 rounded-xl border border-[#1D2B22]">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white">1. Relevant Demonstrated Experience (0–25)</label>
                        <span className="font-mono text-emerald-400 font-bold">{s1Exp} pts</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={25}
                        value={s1Exp}
                        onChange={(e) => setS1Exp(Number(e.target.value))}
                        className="w-full accent-[#087443]"
                      />
                      <div className="flex items-center justify-between text-[10px] text-[#6B9980]">
                        <span>0: No claim</span>
                        <span>15: Practical work</span>
                        <span>25: Strong proven outcomes</span>
                      </div>
                    </div>

                    {/* 2. Practical Accomplishment (25) */}
                    <div className="space-y-1 bg-[#0A1410] p-3.5 rounded-xl border border-[#1D2B22]">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white">2. Practical Accomplishment / Evidence (0–25)</label>
                        <span className="font-mono text-emerald-400 font-bold">{s1Acc} pts</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={25}
                        value={s1Acc}
                        onChange={(e) => setS1Acc(Number(e.target.value))}
                        className="w-full accent-[#087443]"
                      />
                      <div className="flex items-center justify-between text-[10px] text-[#6B9980]">
                        <span>0: Vague</span>
                        <span>15: Clear ownership</span>
                        <span>25: Measurable exceptional result</span>
                      </div>
                    </div>

                    {/* 3. Initiative & Problem Solving (15) */}
                    <div className="space-y-1 bg-[#0A1410] p-3.5 rounded-xl border border-[#1D2B22]">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white">3. Initiative &amp; Problem Solving (0–15)</label>
                        <span className="font-mono text-emerald-400 font-bold">{s1Init} pts</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={15}
                        value={s1Init}
                        onChange={(e) => setS1Init(Number(e.target.value))}
                        className="w-full accent-[#087443]"
                      />
                    </div>

                    {/* 4. Commitment & Availability (15) */}
                    <div className="space-y-1 bg-[#0A1410] p-3.5 rounded-xl border border-[#1D2B22]">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white">4. Commitment &amp; Availability (0–15)</label>
                        <span className="font-mono text-emerald-400 font-bold">{s1Com} pts</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={15}
                        value={s1Com}
                        onChange={(e) => setS1Com(Number(e.target.value))}
                        className="w-full accent-[#087443]"
                      />
                    </div>

                    {/* 5. Vision Alignment (10) */}
                    <div className="space-y-1 bg-[#0A1410] p-3.5 rounded-xl border border-[#1D2B22]">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white">5. EBS Vision Alignment (0–10)</label>
                        <span className="font-mono text-emerald-400 font-bold">{s1Vis} pts</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={s1Vis}
                        onChange={(e) => setS1Vis(Number(e.target.value))}
                        className="w-full accent-[#087443]"
                      />
                    </div>

                    {/* 6. Communication & Clarity (10) */}
                    <div className="space-y-1 bg-[#0A1410] p-3.5 rounded-xl border border-[#1D2B22]">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white">6. Communication &amp; Clarity (0–10)</label>
                        <span className="font-mono text-emerald-400 font-bold">{s1Clar} pts</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={s1Clar}
                        onChange={(e) => setS1Clar(Number(e.target.value))}
                        className="w-full accent-[#087443]"
                      />
                    </div>
                  </div>

                  {/* Evidence Level Classification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Experience Evidence Level</label>
                      <select
                        value={s1EvExp}
                        onChange={(e) => setS1EvExp(e.target.value as EvidenceLevel)}
                        className="w-full p-2.5 rounded-xl bg-[#1A2820] border border-[#243320] text-white text-xs font-bold outline-none"
                      >
                        {EVIDENCE_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl} — {EVIDENCE_LEVEL_DESCRIPTIONS[lvl]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Accomplishment Evidence Level</label>
                      <select
                        value={s1EvAcc}
                        onChange={(e) => setS1EvAcc(e.target.value as EvidenceLevel)}
                        className="w-full p-2.5 rounded-xl bg-[#1A2820] border border-[#243320] text-white text-xs font-bold outline-none"
                      >
                        {EVIDENCE_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl} — {EVIDENCE_LEVEL_DESCRIPTIONS[lvl]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Reviewer Notes & Status */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Reviewer Assessment Notes</label>
                      <textarea
                        rows={3}
                        value={s1Notes}
                        onChange={(e) => setS1Notes(e.target.value)}
                        placeholder="Key strengths, flags, or notes on demonstrated evidence..."
                        className="w-full p-2.5 rounded-xl bg-[#0A1410] border border-[#1D2B22] text-white text-xs resize-none outline-none focus:border-[#0A8A50]"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label className="font-bold text-slate-300">Status:</label>
                        <select
                          value={s1Status}
                          onChange={(e) => setS1Status(e.target.value as ApplicationStatus)}
                          className="p-2 rounded-xl bg-[#1A2820] border border-[#243320] text-white text-xs font-bold outline-none"
                        >
                          {APPLICATION_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={handleSaveStage1}
                        disabled={savingEvaluation}
                        className="px-6 py-2.5 rounded-xl bg-[#087443] hover:bg-[#0A8A50] text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {savingEvaluation ? 'Saving Stage 1...' : 'Save Stage 1 Evaluation'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: STAGE 2 INTERVIEW VALIDATION ── */}
              {activeModalTab === 'stage2' && (
                <div className="space-y-5">
                  {/* Weighted Final Score Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1A2820] to-[#0A1410] border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-[10px] text-amber-400 font-bold uppercase">Final Weighted Score (40% App + 60% Interview)</p>
                      <p className="text-3xl font-black text-amber-400">{calculatedFinalScore} / 100</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#6B9980] font-bold uppercase">Final Classification</p>
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-300">
                        {calculatedFinalClass}
                      </span>
                    </div>
                  </div>

                  {/* Claim to Proof Validation Selector */}
                  <div className="p-4 rounded-2xl bg-[#0A1410] border border-[#1D2B22] space-y-2">
                    <label className="font-bold text-white">Claim $\rightarrow$ Proof Validation Outcome</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'validated', label: 'Validated', color: 'bg-emerald-500/20 border-emerald-500 text-emerald-300' },
                        { id: 'partially_validated', label: 'Partially Validated', color: 'bg-amber-500/20 border-amber-500 text-amber-300' },
                        { id: 'not_validated', label: 'Not Validated', color: 'bg-red-500/20 border-red-500 text-red-400' },
                        { id: 'unvalidated', label: 'Pending Interview', color: 'bg-slate-800 border-slate-700 text-slate-400' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setS2Validation(item.id as any)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            s2Validation === item.id ? item.color : 'bg-[#1A2820] border-[#243320] text-slate-400'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 6 Interview Criteria */}
                  <div className="space-y-4">
                    {/* Practical Competence (30) */}
                    <div className="space-y-1 bg-[#0A1410] p-3.5 rounded-xl border border-[#1D2B22]">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white">1. Practical Competence (0–30)</label>
                        <span className="font-mono text-amber-400 font-bold">{s2Comp} pts</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={s2Comp}
                        onChange={(e) => setS2Comp(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    {/* Problem Solving (20) */}
                    <div className="space-y-1 bg-[#0A1410] p-3.5 rounded-xl border border-[#1D2B22]">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white">2. Problem Solving (0–20)</label>
                        <span className="font-mono text-amber-400 font-bold">{s2Prob} pts</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        value={s2Prob}
                        onChange={(e) => setS2Prob(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    {/* Ownership (15) */}
                    <div className="space-y-1 bg-[#0A1410] p-3.5 rounded-xl border border-[#1D2B22]">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white">3. Ownership / Initiative (0–15)</label>
                        <span className="font-mono text-amber-400 font-bold">{s2Own} pts</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={15}
                        value={s2Own}
                        onChange={(e) => setS2Own(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    {/* Communication (15) */}
                    <div className="space-y-1 bg-[#0A1410] p-3.5 rounded-xl border border-[#1D2B22]">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white">4. Communication (0–15)</label>
                        <span className="font-mono text-amber-400 font-bold">{s2Comm} pts</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={15}
                        value={s2Comm}
                        onChange={(e) => setS2Comm(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    {/* EBS Understanding (10) */}
                    <div className="space-y-1 bg-[#0A1410] p-3.5 rounded-xl border border-[#1D2B22]">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white">5. EBS Understanding (0–10)</label>
                        <span className="font-mono text-amber-400 font-bold">{s2Ebs} pts</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={s2Ebs}
                        onChange={(e) => setS2Ebs(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    {/* Teamwork (10) */}
                    <div className="space-y-1 bg-[#0A1410] p-3.5 rounded-xl border border-[#1D2B22]">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-white">6. Teamwork / Reliability (0–10)</label>
                        <span className="font-mono text-amber-400 font-bold">{s2Team} pts</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={s2Team}
                        onChange={(e) => setS2Team(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* Interview Notes & Recommendation */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Interview Discussion Notes</label>
                      <textarea
                        rows={3}
                        value={s2Notes}
                        onChange={(e) => setS2Notes(e.target.value)}
                        placeholder="Observations from short discussion, claim validation details..."
                        className="w-full p-2.5 rounded-xl bg-[#0A1410] border border-[#1D2B22] text-white text-xs resize-none outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Final Leadership Recommendation</label>
                      <input
                        type="text"
                        value={s2Rec}
                        onChange={(e) => setS2Rec(e.target.value)}
                        placeholder="e.g. Recommended for Tech Core (Next.js lead) / Reserve for Buyer Ops..."
                        className="w-full p-2.5 rounded-xl bg-[#0A1410] border border-[#1D2B22] text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                      <div className="flex items-center gap-2">
                        <label className="font-bold text-slate-300">Final Status:</label>
                        <select
                          value={s2Status}
                          onChange={(e) => setS2Status(e.target.value as ApplicationStatus)}
                          className="p-2 rounded-xl bg-[#1A2820] border border-[#243320] text-white text-xs font-bold outline-none"
                        >
                          {APPLICATION_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={handleSaveStage2}
                        disabled={savingEvaluation}
                        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {savingEvaluation ? 'Saving Interview...' : 'Save Interview Evaluation'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
