import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScoreGauge } from './components/ScoreGauge';
import { SkillBadge } from './components/SkillBadge';
import { RoadmapList } from './components/RoadmapList';
import { PdfUploader } from './components/PdfUploader';
import { SAMPLE_RESUME_ALEX_CHEN, JOB_PRESETS } from './lib/pdfParser';
import type { AnalyzeResponse } from '../api/analyze';

export function App() {
  const [roleTitle, setRoleTitle] = useState('Software Engineer Intern, Systems & Cloud');
  const [companyName, setCompanyName] = useState('Cloudflare');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState(JOB_PRESETS[0].jd);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const resultsTopRef = useRef<HTMLDivElement>(null);

  const applyPreset = (preset: typeof JOB_PRESETS[0]) => {
    setRoleTitle(preset.role);
    setCompanyName(preset.company);
    setJobDescription(preset.jd);
    setError(null);
  };

  const handleLoadSampleResume = () => {
    setResumeText(SAMPLE_RESUME_ALEX_CHEN);
    setError(null);
  };

  const handleClearResume = () => { setResumeText(''); setError(null); };
  const handleClearJobSpec = () => { setJobDescription(''); setError(null); };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setLoading(false);
    setLoadingStep('');
    setError('Analysis was cancelled.');
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanResume = resumeText.trim();
    const cleanJd = jobDescription.trim();

    if (!cleanResume) {
      setError('Resume is empty — paste text or click "Load Sample Resume".');
      return;
    }
    if (cleanResume.length < 20) {
      setError('Resume content is too short (minimum 20 characters).');
      return;
    }
    if (!cleanJd) {
      setError('Job description is empty — paste a job spec or choose a preset.');
      return;
    }
    if (cleanJd.length < 20) {
      setError('Job description is too short (minimum 20 characters).');
      return;
    }

    setLoading(true);
    setLoadingStep('Ingesting resume & requisition…');

    const t1 = setTimeout(() => setLoadingStep('Dispatching to Gemma 4…'), 700);
    const t2 = setTimeout(() => setLoadingStep('Synthesizing roadmap & skill gaps…'), 1800);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: cleanResume,
          jobDescription: cleanJd,
          roleTitle: roleTitle.trim() || 'Software Engineer',
          companyName: companyName.trim() || 'Target Company',
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errMsg = `Server error (${response.status})`;
        try { const d = await response.json(); if (d.error) errMsg = d.error; } catch { /* skip */ }
        throw new Error(errMsg);
      }

      const data: AnalyzeResponse = await response.json();
      setResult(data);
      setTimeout(() => resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: any) {
      if (err.name === 'AbortError') setError('Analysis cancelled.');
      else setError(err.message || 'Unable to reach analysis endpoint.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setLoading(false);
      setLoadingStep('');
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--dark)', color: 'var(--cream)' }}>
      <Header isDemoMode={result?.is_demo_mode} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-5 py-10 space-y-8">

        {/* ─── Hero Section ─── */}
        <section className="relative overflow-hidden py-14 px-8" style={{ borderBottom: '1px solid var(--border)' }}>
          {/* Grid overlay */}
          <div className="absolute inset-0 grid-overlay pointer-events-none" />
          {/* Glow */}
          <div className="absolute inset-0 hero-glow pointer-events-none" />

          <div className="relative space-y-4 animate-entry">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="label-tag"
                style={{ background: 'rgba(0,0,242,0.15)', border: '1px solid rgba(0,0,242,0.4)', color: 'var(--cyan)' }}
              >
                ATS_CALIBRATOR
              </span>
              <span
                className="label-tag flex items-center gap-1.5"
                style={{ background: 'rgba(0,212,106,0.08)', border: '1px solid rgba(0,212,106,0.25)', color: 'var(--green)' }}
              >
                <div className="status-dot" style={{ width: 5, height: 5 }} />
                GEMMA_4 ONLINE
              </span>
            </div>

            <h1
              className="font-bold leading-none tracking-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', letterSpacing: '-0.03em' }}
            >
              Resume × Job<br />
              <span style={{ color: 'var(--blue)', textShadow: '0 0 40px rgba(0,0,242,0.5)' }}>
                Alignment Engine
              </span>
            </h1>
            <p className="text-sm max-w-xl leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Ingest your resume and a target job description. Gemma 4 evaluates ATS vector distance,
              surfaces critical skill gaps, and synthesizes a structured 30-day closure plan.
            </p>
          </div>
        </section>

        {/* ─── Demo Mode Notice ─── */}
        {result?.is_demo_mode && (
          <div
            className="flex items-start gap-3 px-4 py-3 text-sm animate-entry"
            style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.3)' }}
          >
            <span style={{ color: 'var(--amber)' }}>⚠</span>
            <div className="space-y-0.5">
              <div className="font-semibold font-mono-ui text-xs tracking-widest uppercase" style={{ color: 'var(--amber)' }}>
                DEMO MODE — Deterministic Engine
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--cream)', opacity: 0.8 }}>
                {result.demo_notice || 'GEMINI_API_KEY is not set. Running deterministic demo so all features remain testable.'}
              </p>
            </div>
          </div>
        )}

        {/* ─── Error ─── */}
        {error && (
          <div
            className="flex items-start justify-between gap-3 px-4 py-3 text-sm animate-entry"
            style={{ background: 'rgba(255,69,69,0.07)', border: '1px solid rgba(255,69,69,0.3)' }}
          >
            <div className="flex items-start gap-3">
              <span style={{ color: 'var(--red)' }}>✕</span>
              <div>
                <div className="font-mono-ui text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--red)' }}>
                  VALIDATION ALERT
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--cream)', opacity: 0.9 }}>{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="flex-shrink-0 text-xs opacity-50 hover:opacity-100 transition-opacity px-1"
              style={{ color: 'var(--cream)' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ═════════════════════ RESULTS VIEW ═════════════════════ */}
        {result ? (
          <div className="space-y-6" ref={resultsTopRef}>
            {/* Action bar */}
            <div
              className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 animate-entry"
              style={{ background: 'var(--dark-2)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 font-mono-ui text-xs">
                <span style={{ color: 'var(--green)' }}>●</span>
                <span className="font-semibold text-white">{result.role_title}</span>
                <span style={{ color: 'var(--text-dim)' }}>@</span>
                <span style={{ color: 'var(--cyan)' }}>{result.company_name}</span>
              </div>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="btn-ghost flex items-center gap-1.5"
              >
                <span>↺</span>
                <span>New Analysis</span>
              </button>
            </div>

            {/* Score Gauge */}
            <ScoreGauge score={result.match_score} tier={result.match_tier} />

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-entry animate-entry-2">
              {/* Matching */}
              <div
                className="bracket p-5 space-y-4"
                style={{ background: 'var(--dark-2)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="status-dot" />
                    <h3 className="text-sm font-semibold text-white">Matching Skills</h3>
                  </div>
                  <span
                    className="label-tag font-bold"
                    style={{ background: 'rgba(0,212,106,0.1)', border: '1px solid rgba(0,212,106,0.28)', color: 'var(--green)' }}
                  >
                    {result.matching_skills.length} FOUND
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.matching_skills.map((skill, i) => (
                    <SkillBadge key={i} name={skill} type="matching" />
                  ))}
                </div>
                <div className="font-mono-ui text-[10px] pt-2 tracking-wide" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                  Confirmed qualifications matching the target requisition.
                </div>
              </div>

              {/* Missing */}
              <div
                className="bracket p-5 space-y-4"
                style={{ background: 'var(--dark-2)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 6px var(--red)' }} />
                    <h3 className="text-sm font-semibold text-white">Critical Gaps</h3>
                  </div>
                  <span
                    className="label-tag font-bold"
                    style={{ background: 'rgba(255,69,69,0.1)', border: '1px solid rgba(255,69,69,0.28)', color: 'var(--red)' }}
                  >
                    {result.missing_skills.length} GAPS
                  </span>
                </div>
                <div className="space-y-2">
                  {result.missing_skills.map((skill, i) => (
                    <SkillBadge key={i} name={skill.name} type="missing" urgency={skill.urgency} reason={skill.reason} />
                  ))}
                </div>
                <div className="font-mono-ui text-[10px] pt-2 tracking-wide" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                  Prioritize these to minimize ATS rejection.
                </div>
              </div>
            </div>

            {/* Resume Tips */}
            <div
              className="p-5 space-y-4 animate-entry animate-entry-3"
              style={{ background: 'var(--dark-2)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--cyan)', fontSize: '1rem' }}>💡</span>
                <h3 className="text-sm font-semibold text-white tracking-tight uppercase" style={{ letterSpacing: '0.04em' }}>
                  Resume Optimizations
                </h3>
              </div>
              <ul className="space-y-3">
                {result.resume_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs leading-relaxed">
                    <span
                      className="flex-shrink-0 font-mono-ui font-bold mt-0.5"
                      style={{ color: 'var(--cyan)' }}
                    >
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    <span style={{ color: 'var(--cream)', opacity: 0.9 }}>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Roadmap */}
            {result.roadmap_weeks && result.roadmap_weeks.length > 0 && (
              <div
                className="p-5 animate-entry animate-entry-4"
                style={{ background: 'var(--dark-2)', border: '1px solid var(--border)' }}
              >
                <RoadmapList weeks={result.roadmap_weeks} />
              </div>
            )}
          </div>

        ) : (
          /* ═════════════════════ INPUT WORKSPACE ═════════════════════ */
          <form onSubmit={handleAnalyze} className="space-y-6">

            {/* Presets Bar */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 animate-entry"
              style={{ background: 'var(--dark-2)', border: '1px solid var(--border)' }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono-ui text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>
                  JOB PRESETS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {JOB_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-3 py-1 font-mono-ui text-[10px] tracking-wide uppercase transition-all"
                      style={{
                        background: companyName === preset.company ? 'var(--blue)' : 'var(--dark-3)',
                        border: companyName === preset.company ? '1px solid rgba(0,0,242,0.6)' : '1px solid var(--border)',
                        color: companyName === preset.company ? 'white' : 'var(--text-muted)',
                        boxShadow: companyName === preset.company ? '0 0 10px rgba(0,0,242,0.35)' : 'none',
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLoadSampleResume}
                className="btn-ghost"
              >
                <span>↓</span>
                <span>Load Sample Resume</span>
              </button>
            </div>

            {/* Role + Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-entry animate-entry-1">
              <div className="space-y-1.5">
                <label className="font-mono-ui text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }} htmlFor="role-title">
                  Target Role <span style={{ color: 'var(--blue)' }}>*</span>
                </label>
                <input
                  id="role-title"
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Software Engineer Intern"
                  className="field"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono-ui text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }} htmlFor="company-name">
                  Organization <span style={{ color: 'var(--blue)' }}>*</span>
                </label>
                <input
                  id="company-name"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Cloudflare, Stripe"
                  className="field"
                />
              </div>
            </div>

            {/* Dual Column Text Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-entry animate-entry-2">
              {/* Resume column */}
              <div className="space-y-3">
                <PdfUploader
                  onTextExtracted={(text) => { setResumeText(text); setError(null); }}
                  onClear={() => { setResumeText(''); setError(null); }}
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-mono-ui text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }} htmlFor="resume-text">
                      Resume Text <span style={{ color: 'var(--blue)' }}>*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {resumeText && (
                        <button type="button" onClick={handleClearResume} className="font-mono-ui text-[10px] opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--red)' }}>
                          clear
                        </button>
                      )}
                      <span
                        className="font-mono-ui text-[10px]"
                        style={{ color: resumeText.length > 0 && resumeText.length < 20 ? 'var(--red)' : 'var(--text-dim)' }}
                      >
                        {resumeText ? `${resumeText.length} chars` : 'min 20'}
                      </span>
                    </div>
                  </div>
                  <div
                    className="bracket"
                    style={{
                      border: '1px solid var(--border)',
                      background: 'var(--dark)',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <textarea
                      id="resume-text"
                      required
                      rows={13}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste resume text, or upload PDF above…"
                      className="w-full bg-transparent border-0 focus:ring-0 font-mono-ui text-xs leading-relaxed resize-none p-3 focus:outline-none"
                      style={{ color: 'var(--cream)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Job Description column */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono-ui text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }} htmlFor="job-description">
                    Job Specification <span style={{ color: 'var(--blue)' }}>*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {jobDescription && (
                      <button type="button" onClick={handleClearJobSpec} className="font-mono-ui text-[10px] opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--red)' }}>
                        clear
                      </button>
                    )}
                    <span
                      className="font-mono-ui text-[10px]"
                      style={{ color: jobDescription.length > 0 && jobDescription.length < 20 ? 'var(--red)' : 'var(--text-dim)' }}
                    >
                      {jobDescription ? `${jobDescription.length} chars` : 'min 20'}
                    </span>
                  </div>
                </div>
                <div
                  className="bracket"
                  style={{ border: '1px solid var(--border)', background: 'var(--dark)' }}
                >
                  <textarea
                    id="job-description"
                    required
                    rows={18}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description…"
                    className="w-full bg-transparent border-0 focus:ring-0 font-mono-ui text-xs leading-relaxed resize-none p-3 focus:outline-none"
                    style={{ color: 'var(--cream)' }}
                  />
                </div>
              </div>
            </div>

            {/* Submit + Loading Footer */}
            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 animate-entry animate-entry-3"
              style={{ background: 'var(--dark-2)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 font-mono-ui text-[10px] tracking-wider" style={{ color: 'var(--text-muted)' }}>
                <div className="status-dot" />
                Zero client data egress · Evaluated via Gemma 4
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {loading && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-ghost"
                    style={{ color: 'var(--red)', borderColor: 'rgba(255,69,69,0.35)' }}
                  >
                    Abort
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 sm:flex-initial"
                  style={{ minWidth: 200 }}
                >
                  {loading ? (
                    <>
                      <div
                        className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: 'white', borderTopColor: 'transparent' }}
                      />
                      <span>CALIBRATING…</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>EXECUTE ANALYSIS</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Loading Progress */}
            {loading && (
              <div
                className="space-y-3 px-4 py-3 animate-entry"
                style={{ background: 'var(--dark-3)', border: '1px solid rgba(0,0,242,0.3)' }}
              >
                <div className="flex items-center justify-between font-mono-ui text-[10px] tracking-widest">
                  <span style={{ color: 'var(--cyan)' }}>&gt; {loadingStep}</span>
                  <span style={{ color: 'var(--green)' }}>PROCESSING</span>
                </div>
                <div className="w-full h-1 overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full loading-bar-anim"
                    style={{
                      background: 'linear-gradient(90deg, var(--blue), var(--cyan), var(--green))',
                      boxShadow: '0 0 8px var(--blue)',
                    }}
                  />
                </div>
              </div>
            )}
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
