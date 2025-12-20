import { useState, useCallback } from "react";
import type { Resume, JobDescription, CandidateRanking, ScreeningSession } from "@/types/resume";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  file: File;
}

interface ProcessingState {
  isProcessing: boolean;
  currentStep: number;
  totalSteps: number;
  message: string;
}

// Mock data for demonstration
const generateMockCandidates = (count: number, skills: string[]): CandidateRanking[] => {
  const names = [
    "Sarah Chen", "Michael Rodriguez", "Emily Thompson", "David Kim", 
    "Jessica Williams", "Alex Johnson", "Maria Garcia", "James Wilson",
    "Amanda Brown", "Christopher Lee"
  ];
  
  const emails = names.map(name => 
    name.toLowerCase().replace(' ', '.') + '@email.com'
  );
  
  const analyses = [
    "Strong background in machine learning with excellent technical skills. Would be a great fit for senior roles.",
    "Solid experience in data science. Good communication skills evident from project descriptions.",
    "Extensive Python expertise. May need additional training in cloud technologies.",
    "Well-rounded candidate with leadership experience. Technical skills align well with requirements.",
    "Junior to mid-level experience. Shows potential for growth with proper mentorship.",
  ];
  
  return Array.from({ length: Math.min(count, names.length) }, (_, i) => {
    const matchPercentage = Math.max(35, 95 - (i * 8) + Math.floor(Math.random() * 10));
    
    return {
      resumeId: `resume-${i + 1}`,
      candidateName: names[i],
      email: emails[i],
      matchScore: matchPercentage / 100,
      matchPercentage,
      rank: i + 1,
      skillMatches: skills.map((skill, idx) => ({
        skill,
        matched: Math.random() > 0.3 - (i * 0.05),
        similarity: 0.7 + Math.random() * 0.3,
      })),
      experienceMatch: Math.max(40, matchPercentage - 5 + Math.floor(Math.random() * 10)),
      overallAnalysis: analyses[i % analyses.length],
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage)
    .map((c, i) => ({ ...c, rank: i + 1 }));
};

export function useResumeScreening() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const [rankings, setRankings] = useState<CandidateRanking[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    currentStep: 0,
    totalSteps: 4,
    message: "",
  });

  const handleFilesSelected = useCallback((files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      size: file.size,
      status: 'uploading' as const,
      file,
    }));
    
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    
    // Simulate upload and processing
    newFiles.forEach((uploadedFile, index) => {
      setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, status: 'processing' } : f
          )
        );
        
        setTimeout(() => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id ? { ...f, status: 'completed' } : f
            )
          );
        }, 1000);
      }, 500 * (index + 1));
    });
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleJobDescriptionSubmit = useCallback(async (data: {
    title: string;
    description: string;
    skills: { required: string[]; preferred: string[]; keywords: string[] };
  }) => {
    const jd: JobDescription = {
      id: `jd-${Date.now()}`,
      title: data.title,
      description: data.description,
      requiredSkills: data.skills.required,
      preferredSkills: data.skills.preferred,
      experienceLevel: "Senior",
      keywords: data.skills.keywords,
      createdAt: new Date(),
    };
    
    setJobDescription(jd);
    
    // Start processing simulation
    setProcessingState({
      isProcessing: true,
      currentStep: 0,
      totalSteps: 4,
      message: "Initializing AI engine...",
    });
    
    const messages = [
      "Parsing resume documents...",
      "Running semantic analysis...",
      "Computing similarity scores...",
      "Generating final rankings...",
    ];
    
    for (let i = 0; i < 4; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setProcessingState({
        isProcessing: true,
        currentStep: i + 1,
        totalSteps: 4,
        message: messages[i],
      });
    }
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Generate mock rankings
    const allSkills = [...data.skills.required, ...data.skills.preferred];
    const mockRankings = generateMockCandidates(uploadedFiles.length, allSkills);
    
    setRankings(mockRankings);
    setProcessingState({
      isProcessing: false,
      currentStep: 0,
      totalSteps: 4,
      message: "",
    });
  }, [uploadedFiles.length]);

  const resetSession = useCallback(() => {
    setUploadedFiles([]);
    setJobDescription(null);
    setRankings([]);
    setProcessingState({
      isProcessing: false,
      currentStep: 0,
      totalSteps: 4,
      message: "",
    });
  }, []);

  return {
    uploadedFiles,
    jobDescription,
    rankings,
    processingState,
    handleFilesSelected,
    handleRemoveFile,
    handleJobDescriptionSubmit,
    resetSession,
  };
}
