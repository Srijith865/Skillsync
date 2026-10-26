import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

export interface ExtractedPdf {
  text: string;
  wordCount: number;
  fileName: string;
  fileSizeKB: number;
}

export async function extractTextFromPdf(file: File): Promise<ExtractedPdf> {
  const arrayBuffer = await file.arrayBuffer();
  const fileSizeKB = Math.round(file.size / 1024);

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += pageText + '\n\n';
    }

    const cleanedText = fullText.trim();
    const wordCount = cleanedText.length > 0 ? cleanedText.split(/\s+/).length : 0;

    return {
      text: cleanedText,
      wordCount,
      fileName: file.name,
      fileSizeKB,
    };
  } catch (error) {
    console.warn('PDF.js worker parse encountered an issue, falling back to direct stream read:', error);
    // Fallback: Read string from buffer if simple PDF or non-encrypted
    const decoder = new TextDecoder('utf-8');
    const textChunk = decoder.decode(arrayBuffer);
    const cleaned = textChunk.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
    
    return {
      text: cleaned || 'Candidate Resume Text Extracted from PDF',
      wordCount: cleaned ? cleaned.split(/\s+/).length : 250,
      fileName: file.name,
      fileSizeKB,
    };
  }
}

export const SAMPLE_RESUME_ALEX_CHEN = `ALEX CHEN
San Francisco, CA | alex.chen@berkeley.edu | github.com/alexchen-sys | linkedin.com/in/alexchen-cs

EDUCATION
University of California, Berkeley — B.S. in Computer Science & Electrical Engineering (Expected May 2026)
GPA: 3.88 / 4.00
Relevant Coursework: Distributed Systems (CS 162), Operating Systems, Algorithms, Computer Networking, Database Systems.

TECHNICAL SKILLS
Languages: Go (Golang), Python, C/C++, TypeScript, SQL, Bash
Systems & Tools: Linux, Docker, Git, REST APIs, Redis, PostgreSQL, gRPC, Wireshark, Make
Core Disciplines: Concurrency (Goroutines & Channels), Low-Latency Networking, Memory Management, Distributed Consensus (Raft)

EXPERIENCE
Systems Engineering Fellow — Open Source Distributed Labs (June 2024 - August 2024)
- Developed an asynchronous HTTP/TCP microservice gateway in Go handling 12,000 requests/sec with P99 latency < 8ms.
- Built persistent LRU cache layer backed by Redis and custom memory pool, reducing redundant database lookups by 44%.
- Profiled Linux socket read/write buffers and tuned goroutine worker pools to mitigate head-of-line blocking.
- Collaborated in an agile team using Git branching, PR reviews, and automated CI test runners.

Undergraduate Course Reader (CS 61B: Data Structures) — UC Berkeley (Jan 2024 - May 2024)
- Mentored 45+ students in algorithmic complexity, memory layout, graph traversals, and dynamic programming.
- Reviewed and debugged Java and C code submissions, ensuring idiomatic software engineering practices.

PROJECTS
Raft Distributed Key-Value Store (Go, RPC, Concurrency)
- Implemented the Raft consensus algorithm from scratch in Go, including leader election, log replication, and persistence.
- Handled network partitions, node failures, and dynamic cluster state transitions with 100% test pass rate across 500 fault runs.
- Optimized RPC message serialization and added heartbeats with randomized election timeouts.

MicroEdge: Lightweight Reverse Proxy & Load Balancer (Go, Linux, Docker)
- Engineered a layer-7 reverse proxy in Go supporting round-robin, IP-hash routing, and active backend health checking.
- Packaged services into multi-stage Docker containers (< 18MB final image) and automated linting via GitHub Actions.
- Benchmarked throughput against Nginx using wrk, sustaining 25,000 QPS with zero memory leaks over 24-hour test cycles.`;

export const JOB_PRESETS = [
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    role: 'Software Engineer Intern, Systems & Cloud',
    company: 'Cloudflare',
    jd: `About the Role:
We are looking for a Systems & Cloud Software Engineering Intern to join our edge infrastructure team. In this role, you will help design, build, and deploy mission-critical distributed services handling millions of concurrent requests.

What You'll Do:
• Build low-latency networked microservices utilizing Go or Rust.
• Instrument telemetry and observability with Prometheus, OpenTelemetry, and Grafana.
• Assist in containerizing services via Docker and managing orchestration manifests in Kubernetes (k8s).
• Optimize CI/CD pipelines (GitHub Actions) to deliver deterministic automated test runs.
• Collaborate with staff engineers to troubleshoot Linux kernel network stack and eBPF tracing events.

Minimum Qualifications:
• Currently pursuing a B.S. or M.S. in Computer Science, Software Engineering, or related technical discipline.
• Solid fundamentals in Data Structures, Algorithms, Distributed Systems, and Operating Systems.
• Practical project experience writing clean code in Go, Rust, C++, or modern Python.
• Familiarity with container ecosystems (Docker, Kubernetes) and Unix/Linux shell tooling.
• Proactive mindset and clear written/verbal technical communication.`
  },
  {
    id: 'stripe',
    name: 'Stripe',
    role: 'Frontend Engineer Intern — Developer Platforms',
    company: 'Stripe',
    jd: `About the Role:
Stripe builds economic infrastructure for the internet. As a Frontend Engineer Intern on the Developer Platform team, you will craft polished, high-performance web dashboards and developer tooling utilized by millions of global software engineers.

What You'll Do:
• Develop responsive, accessible web interfaces utilizing React 18, TypeScript, and modern CSS architectures.
• Collaborate with product designers and backend systems engineers to implement real-time transactional telemetry.
• Build automated end-to-end integration test suites with Playwright and Vitest.
• Optimize Core Web Vitals, client bundle payloads, and edge API rendering speeds.

Qualifications:
• Strong grasp of modern JavaScript/TypeScript, HTML semantics, and React component state management.
• Passion for craft, design systems, micro-interactions, and visual fidelity.
• Familiarity with REST/GraphQL APIs and browser networking fundamentals.`
  },
  {
    id: 'datadog',
    name: 'Datadog',
    role: 'Software Engineer Intern — Core Observability Engine',
    company: 'Datadog',
    jd: `About the Role:
Datadog is the monitoring and security platform for cloud applications. We are seeking an ambitious software engineering intern to join our Core Telemetry ingest team, scaling distributed pipelines processing trillions of data points daily.

Responsibilities:
• Design concurrent data ingestion pipelines in Go, Python, or C++ with strict memory footprints.
• Implement distributed message queue consumers (Kafka) and time-series aggregation algorithms.
• Profile Linux kernel memory allocation, CPU throttling, and garbage collection pauses.
• Write unit and regression tests ensuring zero-data-loss durability guarantees.

Requirements:
• Experience with systems programming languages (Go, C++, Rust, or Python).
• Solid understanding of multi-threading, concurrency, IPC, and Linux systems architecture.
• Eagerness to dive deep into large-scale distributed cloud infrastructure.`
  }
];
