import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Vercel Serverless Function timeout configuration
export const maxDuration = 30;

export interface AnalyzeResponse {
  match_score: number;
  match_tier: string;
  matching_skills: string[];
  missing_skills: Array<{ name: string; urgency: string; reason: string }>;
  resume_tips: string[];
  roadmap_weeks: Array<{ week: number; title: string; tasks: string[] }>;
  is_demo_mode: boolean;
  demo_notice?: string;
  model_used: string;
  role_title?: string;
  company_name?: string;
}

// Robust JSON extraction and repair function
function safeParseAndRepairJson(raw: string): any {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Empty model response string');
  }

  // 1. Strip markdown fences if present
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // 2. Direct parse attempt
  try {
    return JSON.parse(text);
  } catch {
    // Proceed to repair
  }

  // 3. Extract outermost { ... }
  const startIdx = text.indexOf('{');
  const endIdx = text.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    let candidate = text.substring(startIdx, endIdx + 1);

    try {
      return JSON.parse(candidate);
    } catch {
      // 4. Clean trailing commas before closing braces/brackets
      candidate = candidate.replace(/,\s*([}\]])/g, '$1');
      try {
        return JSON.parse(candidate);
      } catch {
        // 5. Try escaping unescaped control chars
        candidate = candidate.replace(/[\u0000-\u001F]+/g, ' ');
        return JSON.parse(candidate);
      }
    }
  }

  throw new Error('No valid JSON object structure found in response');
}

// Fallback deterministic calibration engine when API key is missing or unreachable
function getDeterministicAnalysis(
  resumeText: string,
  jobDescription: string,
  roleTitle: string,
  companyName: string
): AnalyzeResponse {
  const jdLower = jobDescription.toLowerCase();
  const resumeLower = resumeText.toLowerCase();

  const skillCatalog = [
    { name: 'Go / Golang', keys: ['go', 'golang'] },
    { name: 'Python', keys: ['python'] },
    { name: 'TypeScript', keys: ['typescript', 'ts'] },
    { name: 'React', keys: ['react'] },
    { name: 'Docker', keys: ['docker', 'container'] },
    { name: 'Kubernetes', keys: ['kubernetes', 'k8s'] },
    { name: 'Linux Systems', keys: ['linux', 'unix'] },
    { name: 'CI/CD & GitHub Actions', keys: ['ci/cd', 'github actions', 'pipeline'] },
    { name: 'Prometheus & Grafana', keys: ['prometheus', 'grafana', 'telemetry', 'observability'] },
    { name: 'REST APIs', keys: ['rest', 'api', 'http'] },
    { name: 'SQL & Relational DBs', keys: ['sql', 'postgres', 'postgresql'] },
    { name: 'Distributed Systems', keys: ['distributed', 'concurrency', 'microservices'] },
    { name: 'eBPF Tracing', keys: ['ebpf', 'kernel'] },
    { name: 'Rust', keys: ['rust'] },
    { name: 'Data Structures & Algorithms', keys: ['data structures', 'algorithms', 'dsa'] }
  ];

  const matching: string[] = [];
  const missing: Array<{ name: string; urgency: string; reason: string }> = [];

  for (const s of skillCatalog) {
    const inJd = s.keys.some(k => jdLower.includes(k));
    const inResume = s.keys.some(k => resumeLower.includes(k));

    if (inJd && inResume) {
      matching.push(s.name);
    } else if (inJd && !inResume) {
      missing.push({
        name: s.name,
        urgency: missing.length < 2 ? 'HIGH' : 'MEDIUM',
        reason: `Explicitly required for ${roleTitle} at ${companyName || 'the target company'}.`
      });
    } else if (inResume && matching.length < 5) {
      matching.push(s.name);
    }
  }

  if (matching.length === 0) {
    matching.push('Data Structures & Algorithms', 'Git Workflow', 'REST APIs', 'Software Architecture');
  }
  if (missing.length === 0) {
    missing.push(
      {
        name: 'Production Observability & Metrics',
        urgency: 'HIGH',
        reason: 'Critical for monitoring high-availability production workloads.'
      },
      {
        name: 'Container Orchestration & Deployment',
        urgency: 'MEDIUM',
        reason: 'Needed for managing multi-service deployments.'
      }
    );
  }

  const score = Math.min(94, Math.max(60, 58 + matching.length * 5 - missing.length * 3));
  const tier = score >= 85 ? 'TIER_1_CONTENDER' : score >= 70 ? 'TIER_2_CONTENDER' : 'QUALIFIED_APPLICANT';

  return {
    match_score: score,
    match_tier: tier,
    matching_skills: matching,
    missing_skills: missing,
    resume_tips: [
      'Quantify project outcomes: Add measurable throughput metrics, latency reductions, or scale numbers to bullet points.',
      `Target top missing skills (${missing.slice(0, 2).map(m => m.name).join(' and ')}) with concrete projects or portfolio repositories.`,
      `Align terminology: Standardize resume keywords to directly reflect the phrasing in ${companyName || 'the job specification'}.`,
      'Highlight system-level and architectural accomplishments near the top of your experience section.'
    ],
    roadmap_weeks: [
      {
        week: 1,
        title: `Core Gap Remediation: ${missing[0]?.name || 'Target Fundamentals'}`,
        tasks: [
          `Build hands-on prototype utilizing ${missing[0]?.name || 'key technology'}`,
          'Write deterministic unit tests and containerize with multi-stage Dockerfiles'
        ]
      },
      {
        week: 2,
        title: 'Production Telemetry & Observability',
        tasks: [
          'Instrument latency (P99), error rates, and request metrics',
          'Deploy Grafana/Prometheus dashboard monitoring service health'
        ]
      },
      {
        week: 3,
        title: 'Distributed Systems & Scalability Tuning',
        tasks: [
          'Incorporate caching, rate limiting, and graceful degradation',
          'Run load tests to identify and eliminate CPU/memory bottlenecks'
        ]
      },
      {
        week: 4,
        title: 'Capstone Showcase & Interview Defense',
        tasks: [
          `Package portfolio project demonstrating ${roleTitle} competencies`,
          'Document architecture tradeoffs in README and rehearse technical defense'
        ]
      }
    ],
    is_demo_mode: true,
    demo_notice: 'DEMO MODE: GEMINI_API_KEY environment variable is not configured. Displaying calibrated deterministic telemetry.',
    model_used: 'Demo Engine (Gemma 4 Modeled)',
    role_title: roleTitle,
    company_name: companyName
  };
}

// Sanitization helper ensuring schema integrity
function sanitizeResponse(parsed: any, roleTitle: string, companyName: string, modelUsed: string): AnalyzeResponse {
  const rawScore = Number(parsed.match_score);
  const matchScore = Number.isFinite(rawScore) ? Math.min(100, Math.max(0, Math.round(rawScore))) : 75;

  let matchTier = parsed.match_tier || '';
  if (!matchTier || typeof matchTier !== 'string') {
    matchTier = matchScore >= 85 ? 'TIER_1_CONTENDER' : matchScore >= 70 ? 'TIER_2_CONTENDER' : 'QUALIFIED_APPLICANT';
  }

  const matchingSkills = Array.isArray(parsed.matching_skills)
    ? parsed.matching_skills.filter((s: any) => typeof s === 'string' && s.trim().length > 0)
    : ['Data Structures & Algorithms', 'Git Workflow'];

  const missingSkills = Array.isArray(parsed.missing_skills)
    ? parsed.missing_skills.map((m: any) => ({
        name: String(m.name || 'Key Technical Gap'),
        urgency: String(m.urgency || 'HIGH').toUpperCase(),
        reason: String(m.reason || `Required for ${roleTitle} requirements.`)
      }))
    : [{ name: 'Production Systems Instrumentation', urgency: 'HIGH', reason: 'Critical for production reliability.' }];

  let resumeTips = Array.isArray(parsed.resume_tips)
    ? parsed.resume_tips.filter((t: any) => typeof t === 'string' && t.trim().length > 0)
    : [];

  if (resumeTips.length < 3) {
    resumeTips.push(
      'Quantify results: Replace generic responsibilities with numerical impact (e.g. latency, RPS, efficiency gains).',
      `Align keyword density with ${companyName}'s job description to pass automated ATS filters.`,
      'Prominently display systems design and production tooling experience.'
    );
  }

  const roadmapWeeks = Array.isArray(parsed.roadmap_weeks) && parsed.roadmap_weeks.length > 0
    ? parsed.roadmap_weeks.map((w: any, idx: number) => ({
        week: Number(w.week) || idx + 1,
        title: String(w.title || `Week ${idx + 1}: Technical Gap Acceleration`),
        tasks: Array.isArray(w.tasks) ? w.tasks.map(String) : ['Complete hands-on implementation', 'Write integration tests']
      }))
    : [
        { week: 1, title: 'Core Gap Remediation', tasks: ['Setup dev environment', 'Build minimal benchmark'] },
        { week: 2, title: 'Observability & Metrics', tasks: ['Instrument telemetry', 'Deploy health dashboard'] },
        { week: 3, title: 'Scalability & Performance', tasks: ['Profile bottlenecks', 'Implement caching'] },
        { week: 4, title: 'Capstone & Interview Defense', tasks: ['Package showcase repo', 'Rehearse technical defense'] }
      ];

  return {
    match_score: matchScore,
    match_tier: matchTier,
    matching_skills: matchingSkills,
    missing_skills: missingSkills,
    resume_tips: resumeTips.slice(0, 5),
    roadmap_weeks: roadmapWeeks.slice(0, 4),
    is_demo_mode: false,
    model_used: modelUsed,
    role_title: roleTitle,
    company_name: companyName
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { resumeText, jobDescription, roleTitle = 'Software Engineer', companyName = 'Target Company' } = req.body || {};

    // Robust empty input and length validation
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
      return res.status(400).json({
        error: 'Invalid input: Candidate resume text is too short. Please provide at least 20 characters of resume content.'
      });
    }

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 20) {
      return res.status(400).json({
        error: 'Invalid input: Job description is too short. Please provide at least 20 characters of job specifications.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const aiModel = process.env.AI_MODEL || 'gemma-4-31b-it';

    // Demo Mode if API key is not configured
    if (!apiKey) {
      const demoResult = getDeterministicAnalysis(resumeText, jobDescription, roleTitle, companyName);
      return res.status(200).json(demoResult);
    }

    // Call Gemma 4 via Google GenAI SDK
    const aiClient = new GoogleGenAI({ apiKey });

    const prompt = `
You are the SkillSync AI career engine powered by Gemma 4.
Perform an ATS match analysis comparing the candidate resume against the job description.

ROLE: ${roleTitle}
COMPANY: ${companyName}

RESUME:
${resumeText.slice(0, 6000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 5000)}

Return ONLY valid JSON matching this schema exactly with no extra commentary:
{
  "match_score": <number 0-100>,
  "match_tier": "<TIER_1_CONTENDER | TIER_2_CONTENDER | QUALIFIED_APPLICANT>",
  "matching_skills": ["<skill1>", "<skill2>", "<skill3>"],
  "missing_skills": [
    {"name": "<skill>", "urgency": "<HIGH | MEDIUM>", "reason": "<short reason>"}
  ],
  "resume_tips": [
    "<actionable tip 1>",
    "<actionable tip 2>",
    "<actionable tip 3>"
  ],
  "roadmap_weeks": [
    {"week": 1, "title": "<Week 1 Title>", "tasks": ["<task 1>", "<task 2>"]},
    {"week": 2, "title": "<Week 2 Title>", "tasks": ["<task 1>", "<task 2>"]},
    {"week": 3, "title": "<Week 3 Title>", "tasks": ["<task 1>", "<task 2>"]},
    {"week": 4, "title": "<Week 4 Title>", "tasks": ["<task 1>", "<task 2>"]}
  ]
}
`;

    try {
      let response;
      try {
        response = await aiClient.models.generateContent({
          model: aiModel,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          }
        });
      } catch (firstErr: any) {
        // Retry once on transient high-demand (503/429)
        console.warn('Initial model request encountered error, retrying in 1.2s:', firstErr.message);
        await new Promise(r => setTimeout(r, 1200));
        response = await aiClient.models.generateContent({
          model: aiModel,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          }
        });
      }

      const responseText = response.text || '';
      const parsed = safeParseAndRepairJson(responseText);
      const validated = sanitizeResponse(parsed, roleTitle, companyName, aiModel);

      return res.status(200).json(validated);
    } catch (modelError: any) {
      console.warn('Gemma 4 model call failed or returned malformed content. Falling back cleanly to deterministic telemetry:', modelError.message);
      const fallbackResult = getDeterministicAnalysis(resumeText, jobDescription, roleTitle, companyName);
      fallbackResult.demo_notice = `API Notice: Gemma 4 request returned an error (${modelError.message}). Switched to calibrated fallback engine.`;
      return res.status(200).json(fallbackResult);
    }
  } catch (err: any) {
    console.error('Serverless function error:', err);
    return res.status(500).json({ error: 'Internal analysis error', details: err.message });
  }
}
