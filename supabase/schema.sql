-- ====================================================================
-- SkillSync AI — Supabase Database Migration & Schema
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/<your-project-id>/sql/new
-- ====================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "pgcrypto";

-- 1. Create Analyses Table
create table if not exists public.analyses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    session_id text not null,
    role_title text not null,
    company_name text not null,
    resume_name text,
    resume_text text,
    job_description text not null,
    match_score integer not null check (match_score >= 0 and match_score <= 100),
    match_tier text not null default 'TIER_2_CONTENDER',
    category_scores jsonb not null default '{
        "hard_skills": 70,
        "core_cs": 70,
        "frameworks": 70,
        "experience_relevance": 70
    }'::jsonb,
    matching_skills jsonb not null default '[]'::jsonb,
    missing_skills jsonb not null default '[]'::jsonb,
    strengths jsonb not null default '[]'::jsonb,
    improvements jsonb not null default '[]'::jsonb,
    roadmap jsonb not null default '[]'::jsonb,
    interview_questions jsonb not null default '[]'::jsonb,
    is_demo_mode boolean not null default false,
    created_at timestamptz not null default now()
);

-- 2. Indexes for High-Velocity Telemetry Queries
create index if not exists idx_analyses_user_id on public.analyses(user_id);
create index if not exists idx_analyses_session_id on public.analyses(session_id);
create index if not exists idx_analyses_created_at on public.analyses(created_at desc);

-- 3. Row-Level Security (RLS) Configuration
alter table public.analyses enable row level security;

-- Policy: Select analyses by authenticated owner OR guest session ID
create policy "Read analyses policy"
    on public.analyses
    for select
    using (
        (auth.uid() is not null and auth.uid() = user_id)
        or
        (user_id is null and session_id is not null)
    );

-- Policy: Insert analyses by authenticated user OR guest session
create policy "Insert analyses policy"
    on public.analyses
    for insert
    with check (
        (auth.uid() is not null and auth.uid() = user_id)
        or
        (user_id is null and session_id is not null)
    );

-- Policy: Delete own analyses
create policy "Delete own analyses policy"
    on public.analyses
    for delete
    using (
        (auth.uid() is not null and auth.uid() = user_id)
        or
        (user_id is null and session_id is not null)
    );

-- 4. Sample Seed Data (For Demonstration & Initial Preview)
insert into public.analyses (
    session_id,
    role_title,
    company_name,
    resume_name,
    match_score,
    match_tier,
    category_scores,
    matching_skills,
    missing_skills,
    strengths,
    improvements,
    roadmap,
    interview_questions,
    is_demo_mode
) values (
    'demo-default-session',
    'Software Engineer Intern — Infrastructure',
    'Cloudflare',
    'Alex_Chen_CS_Resume_2025.pdf',
    82,
    'TIER_1_CONTENDER',
    '{
        "hard_skills": 85,
        "core_cs": 92,
        "frameworks": 74,
        "experience_relevance": 70
    }'::jsonb,
    '["Go / Golang", "Docker basics", "Linux Systems", "Git Workflow", "REST APIs", "Python", "Data Structures & Algorithms"]'::jsonb,
    '[
        {"name": "Kubernetes (k8s)", "urgency": "HIGH", "category": "Container Orchestration", "reason": "Explicitly required for microservice deployment manifests and cluster management."},
        {"name": "Prometheus & Grafana", "urgency": "HIGH", "category": "Telemetry & Observability", "reason": "Target team heavily focuses on edge metrics instrumentation."},
        {"name": "eBPF Tracing", "urgency": "MEDIUM", "category": "Kernel Systems", "reason": "Mentioned in qualifications for kernel network stack observability."}
    ]'::jsonb,
    '[
        "Strong systems background in concurrent programming with Go channels and goroutines.",
        "Demonstrated understanding of low-latency networking primitives and Unix sockets.",
        "High algorithmic foundation with verified competitive programming and clean code."
    ]'::jsonb,
    '[
        "Quantify project bullets: add throughput metrics (e.g., Requests Per Second, P99 latency percentiles).",
        "Highlight your distributed cache implementation in the projects section instead of burying it under course list.",
        "Ensure Docker manifests and CI/CD pipelines are explicitly cited with tools like GitHub Actions."
    ]'::jsonb,
    '[
        {
            "week": 1,
            "title": "Containerization & Docker Deep Dive",
            "description": "Solidify core isolated deployment concepts, multi-layer caching, and local microservice composition.",
            "completed": true,
            "hours": 9,
            "tasks": [
                {"id": "w1-1", "title": "Multi-stage Dockerfiles Optimization", "completed": true},
                {"id": "w1-2", "title": "Docker Compose Multi-Container Orchestration", "completed": true},
                {"id": "w1-3", "title": "Container Networking & Port Binding Architecture", "completed": true}
            ]
        },
        {
            "week": 2,
            "title": "Kubernetes Cluster Architecture & Manifests",
            "description": "Deploy distributed pods, configure ingress controllers, and manage secrets across minikube.",
            "completed": false,
            "hours": 12,
            "tasks": [
                {"id": "w2-1", "title": "Deployments, Services & Ingress Spec creation", "completed": false},
                {"id": "w2-2", "title": "ConfigMaps and Secret Management in k8s", "completed": false},
                {"id": "w2-3", "title": "Automated Rolling Updates and Health Probes", "completed": false}
            ]
        },
        {
            "week": 3,
            "title": "Observability: Prometheus, OpenTelemetry & Grafana",
            "description": "Instrument RED (Rate, Errors, Duration) metrics in a Go HTTP service.",
            "completed": false,
            "hours": 10,
            "tasks": [
                {"id": "w3-1", "title": "Expose /metrics endpoint using Prometheus client_golang", "completed": false},
                {"id": "w3-2", "title": "Build Grafana Dashboards for Latency & Error Budgets", "completed": false},
                {"id": "w3-3", "title": "Trace distributed requests across microservices", "completed": false}
            ]
        },
        {
            "week": 4,
            "title": "Capstone: Resilient High-Throughput Edge Reverse Proxy",
            "description": "Assemble all competencies into a portfolio repository with automated CI/CD and metrics.",
            "completed": false,
            "hours": 15,
            "tasks": [
                {"id": "w4-1", "title": "Build HTTP/TCP reverse proxy with consistent hashing in Go", "completed": false},
                {"id": "w4-2", "title": "Add rate-limiting token bucket and health-check circuit breaker", "completed": false},
                {"id": "w4-3", "title": "Benchmark with hey/wrk and publish GitHub repository with README", "completed": false}
            ]
        }
    ]'::jsonb,
    '[
        {
            "id": "q1",
            "type": "TECHNICAL",
            "difficulty": "INTERMEDIATE",
            "question": "How would you handle graceful shutdown in a Go HTTP service to avoid dropping inflight requests in Kubernetes?",
            "suggested_answer": "In Go, listen for os.Interrupt and syscall.SIGTERM signals using signal.NotifyContext. When received, call server.Shutdown(ctx) with a timeout deadline (e.g., 10-30s). In Kubernetes, ensure the preStop hook has a brief sleep so ingress stops routing new packets before shutdown starts.",
            "rubric": "Evaluates knowledge of Unix signals, context cancellation, goroutine cleanup, and Kubernetes pod lifecycle."
        },
        {
            "id": "q2",
            "type": "SYSTEMS",
            "difficulty": "SENIOR_INTERN",
            "question": "Explain the difference between TCP and UDP at the socket layer. When would an edge reverse proxy prefer UDP/QUIC?",
            "suggested_answer": "TCP guarantees in-order reliable delivery via sequence numbers and 3-way handshakes, suffering from head-of-line blocking on packet loss. UDP is connectionless. HTTP/3 uses QUIC over UDP, enabling 0-RTT handshakes, independent multiplexed streams without head-of-line blocking, and connection migration across network changes.",
            "rubric": "Tests network stack comprehension, socket programming, transport layer tradeoffs, and modern HTTP/3 protocols."
        },
        {
            "id": "q3",
            "type": "BEHAVIORAL",
            "difficulty": "FOUNDATIONAL",
            "question": "Tell me about a time you had to diagnose an unexpected bug in a distributed system or network service under time pressure.",
            "suggested_answer": "Use STAR format: Describe the Situation (service dropping packets), Task (pinpoint root cause), Action (checked logs, analyzed Prometheus metrics and tcpdump packet captures, discovered connection pool exhaustion), and Result (increased pool limits, added backoff, reduced latency by 35%).",
            "rubric": "Looks for methodical debugging approach, telemetry utilization, and calm collaboration under pressure."
        }
    ]'::jsonb,
    true
) on conflict do nothing;
