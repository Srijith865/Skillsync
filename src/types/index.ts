export type NavigationTab = 'dashboard' | 'match_analysis' | 'roadmap' | 'prep_repl' | 'landing';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Milestone {
  week: number;
  title: string;
  description: string;
  completed: boolean;
  hours: number;
  tasks: TaskItem[];
}

export interface InterviewQuestion {
  id: string;
  type: 'TECHNICAL' | 'SYSTEMS' | 'BEHAVIORAL';
  difficulty: 'FOUNDATIONAL' | 'INTERMEDIATE' | 'SENIOR_INTERN';
  question: string;
  suggested_answer: string;
  rubric: string;
}

export interface MissingSkill {
  name: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  reason: string;
}

export interface CategoryScores {
  hard_skills: number;
  core_cs: number;
  frameworks: number;
  experience_relevance: number;
}

export interface AnalysisResult {
  id: string;
  roleTitle: string;
  companyName: string;
  resumeName: string;
  matchScore: number;
  matchTier: string;
  categoryScores: CategoryScores;
  matchingSkills: string[];
  missingSkills: MissingSkill[];
  strengths: string[];
  improvements: string[];
  roadmap: Milestone[];
  interviewQuestions: InterviewQuestion[];
  isDemoMode: boolean;
  demoNotice?: string;
  modelUsed?: string;
  createdAt: string;
}

export interface SystemHealth {
  status: string;
  runtime: string;
  aiConfigured: boolean;
  model: string;
  databaseConfigured: boolean;
  timestamp: string;
}
