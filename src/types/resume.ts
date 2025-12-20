export interface Resume {
  id: string;
  fileName: string;
  candidateName: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: string[];
  education: string[];
  rawText: string;
  uploadedAt: Date;
}

export interface JobDescription {
  id: string;
  title: string;
  company?: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string;
  keywords: string[];
  createdAt: Date;
}

export interface CandidateRanking {
  resumeId: string;
  candidateName: string;
  email?: string;
  matchScore: number;
  matchPercentage: number;
  rank: number;
  skillMatches: {
    skill: string;
    matched: boolean;
    similarity: number;
  }[];
  experienceMatch: number;
  overallAnalysis: string;
}

export interface ScreeningSession {
  id: string;
  jobDescription: JobDescription;
  resumes: Resume[];
  rankings: CandidateRanking[];
  createdAt: Date;
  status: 'uploading' | 'processing' | 'completed';
}
