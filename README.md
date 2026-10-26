# SkillSync AI — Autonomous AI Career Copilot

> **Built for the "Best Use of Gemma 4" Hackathon Prize**  
> Precision ATS alignment calibration, skill gap diagnostics, and automated 30-day learning roadmaps powered by **Gemma 4**.

---

## ⚡ Overview

**SkillSync AI** is a technical, fast-track career copilot engineered for software developers and engineering candidates. Styled with the retro-futuristic **Hermes Cyber-Terminal** design system, SkillSync AI compares candidate resume telemetry against target job requisitions to calculate ATS vector distance, detect critical skill gaps, provide high-impact phrasing optimizations, and synthesize a structured 4-week gap-closure roadmap.

---

## 🏗️ Architecture Note: Best Use of Gemma 4

SkillSync AI uses a serverless, zero-overhead architecture designed for maximum performance, data privacy, and sub-second cold starts.

```
┌─────────────────────────────────┐
│     Client (React + Vite SPA)   │
│  - Hermes Cyber-Terminal Theme  │
│  - Client-Side PDF (pdfjs-dist) │
└───────────────┬─────────────────┘
                │ POST /api/analyze
                ▼
┌─────────────────────────────────┐
│    Vercel Serverless Function   │
│         (/api/analyze.ts)       │
│  - maxDuration: 30s             │
│  - JSON Extraction & Repair     │
│  - Server-Side Secret Isolation │
└───────────────┬─────────────────┘
                │ Google GenAI SDK
                ▼
┌─────────────────────────────────┐
│       Gemma 4 (Gemini API)      │
│     Model: gemma-4-31b-it       │
│  - Zero client data egress      │
│  - Strict JSON ATS calibration  │
└─────────────────────────────────┘
```

### Key Technical Decisions:
1. **Model Integration (`gemma-4-31b-it`):**
   - Direct cloud inference using Google's flagship dense instruction-tuned Gemma 4 model via the Google GenAI SDK.
   - Temperature calibrated to `0.2` for deterministic, reliable ATS scoring.
2. **Server-Side Security:**
   - The `GEMINI_API_KEY` is read strictly on the server in the Vercel function. Secrets are never bundled into client JavaScript.
3. **Resilient JSON Parser & Repair:**
   - Handles LLM conversational markdown wrappers (` ```json `), extracts outermost JSON structures, and cleans trailing commas to prevent runtime parse failures.
4. **Client-Side PDF Extraction:**
   - PDF resumes are parsed in-browser using `pdfjs-dist` without sending raw binary files to third-party servers.
5. **Zero-Database Simplicity:**
   - Eliminates database latency, connection pooling overhead, and user data exposure risks.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **npm**: v9+

### 2. Installation
```bash
git clone <repo-url>
cd skill-sync
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your variables in `.env`:
```env
# Google AI Studio API Key (Get at https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Gemma 4 Model ID (default: gemma-4-31b-it)
AI_MODEL=gemma-4-31b-it
```

### 4. Run the Application
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## 🛡️ Demo Mode (Deterministic Fallback)

SkillSync AI includes a built-in **Demo Mode** enabled automatically when `GEMINI_API_KEY` is not provided:
- Rather than crashing with an unhandled exception or fabricating deceptive responses, the system displays a clear **`DEMO MODE ACTIVE`** badge in the header and banner.
- It runs a local deterministic calibration engine based on the candidate's actual text and job requisition so judges and reviewers can immediately test the entire user journey.
- Adding a valid `GEMINI_API_KEY` instantly activates live Gemma 4 inference.

---

## 🚢 Vercel Deployment Guide

SkillSync AI is pre-configured for 1-click deployment on Vercel:

### Option A: Using Vercel CLI
```bash
npx vercel
```
1. Follow the interactive prompts.
2. Add your environment variable in Vercel:
   ```bash
   npx vercel env add GEMINI_API_KEY
   ```
3. Deploy to production:
   ```bash
   npx vercel --prod
   ```

### Option B: Deploy via Vercel Dashboard (Git)
1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: `<Your Google AI Studio API key>`
   - `AI_MODEL`: `gemma-4-31b-it`
4. Click **Deploy**. Vercel will automatically build the Vite SPA and deploy the `/api/analyze` serverless function with `maxDuration: 30`.

---

## 📋 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Starts local dev server with hot reload and built-in serverless `/api/analyze` runner |
| `npm run build` | `tsc -b && vite build` | Typechecks and compiles production client bundle |
| `npm run preview` | `vite preview` | Previews the production bundle locally |

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
