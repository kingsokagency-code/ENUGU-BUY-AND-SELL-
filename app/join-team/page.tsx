'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import {
  Code, Briefcase, Megaphone, Users, Palette, ShieldCheck,
  CheckCircle2, ArrowRight, ArrowLeft, Star, Sparkles, Heart,
  Award, Globe, Target, Clock, Send, HelpCircle, AlertCircle,
  ExternalLink, ChevronRight, Lock, Check,
} from 'lucide-react';
import {
  TEAM_AREAS,
  TEAM_AREA_LABELS,
  type TeamArea,
  type TeamApplicationInput,
} from '@/lib/validations/recruitment';
import { trackEvent } from '@/lib/telemetry';

const PILLARS = [
  {
    icon: Globe,
    title: 'Real Impact',
    desc: 'Touch thousands of students, youth, and campus businesses across Enugu.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-[#087443]',
  },
  {
    icon: Target,
    title: 'Grow With Us',
    desc: 'Build practical startup skills, gain hands-on experience & expand your high-value network.',
    color: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-[#d97706]',
  },
  {
    icon: Sparkles,
    title: 'Innovate',
    desc: 'Work on real campus commerce challenges and create high-impact local solutions.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-[#087443]',
  },
  {
    icon: Award,
    title: 'Be Recognized',
    desc: 'Outstanding volunteers receive certificates, leadership credentials & priority opportunities.',
    color: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-[#d97706]',
  },
];

const ROLE_ICONS: Record<TeamArea, React.ComponentType<{ className?: string }>> = {
  technology_development: Code,
  business_strategy: Briefcase,
  sales_seller_community: Megaphone,
  buyer_community_experience: Users,
  marketing_publicity: Palette,
  operations_field_support: ShieldCheck,
};

export default function JoinTeamPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedArea, setSelectedArea] = useState<TeamArea>('technology_development');

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [schoolInstitution, setSchoolInstitution] = useState('');
  const [location, setLocation] = useState('UNEC Campus, Enugu');
  const [skills, setSkills] = useState('');
  const [previousExperience, setPreviousExperience] = useState('');
  const [practicalAccomplishment, setPracticalAccomplishment] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [whyJoinEbs, setWhyJoinEbs] = useState('');
  const [whatCanYouContribute, setWhatCanYouContribute] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('5-10 hours weekly');
  const [comfortableWithTeam, setComfortableWithTeam] = useState(true);
  const [anythingElse, setAnythingElse] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedApplicationId, setSubmittedApplicationId] = useState<string | null>(null);

  const handleSelectRoleAndScroll = (area: TeamArea) => {
    setSelectedArea(area);
    const formElement = document.getElementById('application-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setErrorMessage('Please provide your full name.');
        return false;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please provide a valid email address.');
        return false;
      }
      if (!whatsappNumber.trim() || whatsappNumber.replace(/\D/g, '').length < 10) {
        setErrorMessage('Please enter a valid WhatsApp phone number (at least 10 digits).');
        return false;
      }
      if (!schoolInstitution.trim()) {
        setErrorMessage('Please enter your school or institution affiliation.');
        return false;
      }
      if (!location.trim()) {
        setErrorMessage('Please enter your current town or campus location.');
        return false;
      }
    }

    if (step === 2) {
      if (!skills.trim() || skills.trim().length < 3) {
        setErrorMessage('Please summarize your primary skills.');
        return false;
      }
      if (!previousExperience.trim() || previousExperience.trim().length < 10) {
        setErrorMessage('Please briefly describe your relevant background or learning.');
        return false;
      }
    }

    if (step === 3) {
      if (!practicalAccomplishment.trim() || practicalAccomplishment.trim().length < 20) {
        setErrorMessage('Please describe something you have actually built, sold, organized, managed or accomplished in at least 2-3 sentences.');
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4) as 1 | 2 | 3 | 4);
      trackEvent('recruitment_step_advanced', { step: currentStep + 1 });
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3 | 4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    if (!whyJoinEbs.trim() || whyJoinEbs.trim().length < 10) {
      setErrorMessage('Please share why you want to build with EBS.');
      return;
    }
    if (!whatCanYouContribute.trim() || whatCanYouContribute.trim().length < 10) {
      setErrorMessage('Please share what you can specifically contribute.');
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      const payload: TeamApplicationInput = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        whatsapp_number: whatsappNumber.trim(),
        school_institution: schoolInstitution.trim(),
        location: location.trim(),
        team_area: selectedArea,
        skills: skills.trim(),
        previous_experience: previousExperience.trim(),
        practical_accomplishment: practicalAccomplishment.trim(),
        portfolio_link: portfolioLink.trim() || null,
        why_join_ebs: whyJoinEbs.trim(),
        what_can_you_contribute: whatCanYouContribute.trim(),
        weekly_hours_commitment: weeklyHours,
        comfortable_with_team: comfortableWithTeam,
        anything_else: anythingElse.trim() || null,
      };

      const res = await fetch('/api/recruitment/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to submit application. Please review your answers and try again.');
        setSubmitting(false);
        return;
      }

      setSubmittedApplicationId(data.id);
      setIsSuccess(true);
      trackEvent('recruitment_application_submitted', {
        area: selectedArea,
        institution: schoolInstitution,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorMessage('Network connection error. Please check your internet connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col text-[#111111]">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* ── 1. HERO SECTION ── */}
        <section className="relative bg-gradient-to-b from-[#053D24] via-[#084D2F] to-[#0A1410] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#087443]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto space-y-6 relative z-10 text-center sm:text-left">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>JOIN THE EBS VOLUNTEER TEAM • ENUGU 2026</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                WE WANT <span className="text-amber-400">YOU!</span>
              </h1>
              <p className="text-base sm:text-xl font-bold text-emerald-100 max-w-2xl leading-snug">
                We&apos;re building the future of campus commerce in Enugu — and we&apos;re looking for passionate people who want to build it with us.
              </p>
              <p className="text-xs sm:text-sm text-emerald-200/80 max-w-xl font-medium">
                Enugu Buy &amp; Sell (EBS) is more than a marketplace — it&apos;s a startup movement. If you&apos;re skilled, teachable, and ready to make impact, come build with us.
              </p>
            </div>

            {/* Quick Stats / Highlights */}
            <div className="pt-3 flex flex-wrap gap-3 justify-center sm:justify-start">
              <a
                href="#roles-section"
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer"
              >
                <span>Explore 6 Team Roles</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#application-form-section"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all border border-white/15 cursor-pointer"
              >
                Apply Directly Below
              </a>
            </div>
          </div>
        </section>

        {/* ── 2. FOUR PILLARS ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E5EDE9] shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className={`w-10 h-10 rounded-2xl bg-[#E8F8EF] ${p.iconColor} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-[#0D1F17]">{p.title}</h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 3. SIX EBS TEAM ROLES ── */}
        <section id="roles-section" className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-3xl font-black text-[#053D24]">
              We Need Passionate People In These Roles
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Select the area that best matches your strengths. We value practical initiative and teachability over perfection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEAM_AREAS.map((areaKey) => {
              const meta = TEAM_AREA_LABELS[areaKey];
              const Icon = ROLE_ICONS[areaKey];
              const isSelected = selectedArea === areaKey;

              return (
                <div
                  key={areaKey}
                  onClick={() => handleSelectRoleAndScroll(areaKey)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-[#053D24] text-white border-[#053D24] shadow-md shadow-[#053D24]/20 scale-[1.02]'
                      : 'bg-white text-slate-800 border-[#E5EDE9] hover:border-[#087443]/40 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          isSelected ? 'bg-amber-400 text-slate-950 font-black' : 'bg-[#E8F8EF] text-[#087443]'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className={`text-base font-black ${isSelected ? 'text-white' : 'text-[#0D1F17]'}`}>
                        {meta.title}
                      </h3>
                      <p className={`text-xs mt-1.5 leading-relaxed ${isSelected ? 'text-emerald-100/90' : 'text-slate-500'}`}>
                        {meta.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100/15 flex items-center justify-between text-xs font-bold">
                    <span className={isSelected ? 'text-amber-400' : 'text-[#087443]'}>
                      Apply for this role
                    </span>
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-[#087443]'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. WHO WE WANT & WHAT YOU GET ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Who We Want */}
            <div className="bg-white rounded-3xl p-6 border border-[#E5EDE9] shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Users className="w-5 h-5 text-[#087443]" />
                <h3 className="text-base font-black text-[#0D1F17]">Who We Are Looking For</h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                {[
                  'Passionate about solving real problems for students and campus merchants.',
                  'Takes ownership and delivers on tasks consistently.',
                  'Strong team player who is easy and respectful to work with.',
                  'Teachable, curious, and open to personal & professional growth.',
                  'Can realistically commit at least 5–10 hours weekly.',
                  'Believes in the vision of a connected, thriving Enugu commerce ecosystem.',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#087443] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What You Get */}
            <div className="bg-[#053D24] text-white rounded-3xl p-6 border border-[#053D24] shadow-md shadow-[#053D24]/15 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">What You Gain With EBS</h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-emerald-100 font-medium">
                {[
                  'Hands-on startup experience & direct portfolio-worthy accomplishments.',
                  'Official Certificate of Contribution & letters of recommendation.',
                  'Access to training, mentorship & executive leadership guidance.',
                  'High-value networking with visionary students & young builders.',
                  'Priority opportunity for future leadership and paid team roles.',
                  'The satisfaction of building something truly transformative from day one.',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── 5. APPLICATION FORM SECTION ── */}
        <section id="application-form-section" className="max-w-3xl mx-auto px-4 sm:px-6 pt-12">
          {isSuccess ? (
            /* SUCCESS CONFIRMATION */
            <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-10 shadow-lg text-center space-y-6 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#087443] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-black tracking-widest text-[#087443] uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                  APPLICATION RECEIVED
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0D1F17]">
                  Thank You for Stepping Forward!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your application to join the <strong>{TEAM_AREA_LABELS[selectedArea].title}</strong> team has been safely registered in our review database.
                </p>
                {submittedApplicationId && (
                  <p className="text-[11px] text-slate-400 font-mono">
                    Ref ID: {submittedApplicationId.slice(0, 8)}
                  </p>
                )}
              </div>

              {/* What Happens Next */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-left space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  What Happens Next:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <p className="font-black text-[#087443]">1. Submitted</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Application logged in review queue.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <p className="font-black text-[#087443]">2. Review</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Practical evidence evaluation.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <p className="font-black text-[#087443]">3. Shortlist</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Invitation for a short interview.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <p className="font-black text-[#087443]">4. Onboard</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Welcome to EBS Core Team!</p>
                  </div>
                </div>
              </div>

              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#053D24] hover:bg-[#032817] text-white font-bold text-xs sm:text-sm transition-all shadow-md"
                >
                  <span>Back to EBS Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* APPLICATION MULTI-STEP CARD */
            <div className="bg-white rounded-3xl border border-[#E5EDE9] p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-black text-[#0D1F17]">
                    Volunteer Application Form
                  </h3>
                  <span className="text-xs font-bold text-[#087443] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                    Step {currentStep} of 4
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Target Role: <strong className="text-[#087443]">{TEAM_AREA_LABELS[selectedArea].title}</strong>
                </p>
              </div>

              {/* Step Progress Bar */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      s <= currentStep ? 'bg-[#087443]' : 'bg-slate-100'
                    }`}
                  />
                ))}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-bold flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
                {/* ── STEP 1: PERSONAL & CONTACT INFO ── */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-800">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Chinedu Eze"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs sm:text-sm font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-800">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="chinedu@example.com"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs sm:text-sm font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold text-slate-800">
                          WhatsApp Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="08012345678"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs sm:text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-800">
                          School / Institution <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={schoolInstitution}
                          onChange={(e) => setSchoolInstitution(e.target.value)}
                          placeholder="e.g. UNEC, UNN, ESUT, IMT, etc."
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs sm:text-sm font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold text-slate-800">
                          Location in Enugu <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. UNEC Campus, Ogui Road, Nsukka"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs sm:text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: ROLE SELECTION & SKILLS ── */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-800">
                        Preferred Team Area <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value as TeamArea)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs sm:text-sm font-bold"
                      >
                        {TEAM_AREAS.map((a) => (
                          <option key={a} value={a}>
                            {TEAM_AREA_LABELS[a].title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-800">
                        Relevant Skills &amp; Tools <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. Next.js, TypeScript, Figma, Sales negotiation, Social media content..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs sm:text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-800">
                        Previous Experience &amp; Background <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={previousExperience}
                        onChange={(e) => setPreviousExperience(e.target.value)}
                        placeholder="Briefly describe what you have worked on, studied, or practiced in this area..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs sm:text-sm font-medium resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* ── STEP 3: PRACTICAL ACCOMPLISHMENT (CORE QUESTION) ── */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs sm:text-sm">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Crucial Practical Question</span>
                      </div>
                      <p className="text-xs text-amber-800">
                        We value <strong>demonstrated action over claims</strong>. Tell us about something concrete you have actually built, sold, organized, managed, or accomplished.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-800">
                        What have you actually accomplished? <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Tip: Explain what you did, your specific role, the problem you solved, and the measurable result.
                      </p>
                      <textarea
                        required
                        rows={5}
                        value={practicalAccomplishment}
                        onChange={(e) => setPracticalAccomplishment(e.target.value)}
                        placeholder="e.g. Built an inventory tracking web tool used by 5 campus shops; OR Onboarded 15 new student vendors for a campus trade fair; OR Created social media content that grew a student brand by 2,000 followers..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs sm:text-sm font-medium resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-800">
                        Portfolio / Social / Project Link (Optional)
                      </label>
                      <input
                        type="url"
                        value={portfolioLink}
                        onChange={(e) => setPortfolioLink(e.target.value)}
                        placeholder="https://github.com/..., https://linkedin.com/in/..., https://behance.net/..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs sm:text-sm font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* ── STEP 4: MOTIVATION & COMMITMENT ── */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-800">
                        Why do you want to join the EBS team? <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={whyJoinEbs}
                        onChange={(e) => setWhyJoinEbs(e.target.value)}
                        placeholder="What excites you about building this marketplace movement in Enugu?"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs sm:text-sm font-medium resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-800">
                        What can you specifically contribute? <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={whatCanYouContribute}
                        onChange={(e) => setWhatCanYouContribute(e.target.value)}
                        placeholder="How will your presence move EBS forward?"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs sm:text-sm font-medium resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-800">
                          Realistic Weekly Commitment <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={weeklyHours}
                          onChange={(e) => setWeeklyHours(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs sm:text-sm font-bold"
                        >
                          <option value="5-10 hours weekly">5–10 hours weekly</option>
                          <option value="10-15 hours weekly">10–15 hours weekly</option>
                          <option value="15-20 hours weekly">15–20 hours weekly</option>
                          <option value="20+ hours weekly">20+ hours weekly (Deep Focus)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold text-slate-800">
                          Collaborative Team Comfort
                        </label>
                        <div className="pt-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="team-comfort"
                            checked={comfortableWithTeam}
                            onChange={(e) => setComfortableWithTeam(e.target.checked)}
                            className="w-4 h-4 accent-[#087443] rounded"
                          />
                          <label htmlFor="team-comfort" className="text-xs text-slate-700 font-semibold cursor-pointer">
                            Yes, I am comfortable collaborating with others.
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-800">
                        Anything else you want us to know? (Optional)
                      </label>
                      <input
                        type="text"
                        value={anythingElse}
                        onChange={(e) => setAnythingElse(e.target.value)}
                        placeholder="Any additional thoughts or links..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#087443] rounded-xl text-slate-900 outline-none text-xs sm:text-sm font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2.5 rounded-xl bg-[#087443] hover:bg-[#065f35] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-amber-500/25 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Submitting Application...' : 'Submit Application'}</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
