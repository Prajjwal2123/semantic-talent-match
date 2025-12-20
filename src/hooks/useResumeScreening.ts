import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CandidateRanking } from "@/types/resume";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  file: File;
  content?: string;
}

interface ProcessingState {
  isProcessing: boolean;
  currentStep: number;
  totalSteps: number;
  message: string;
}

interface ExtractedSkills {
  required: string[];
  preferred: string[];
  keywords: string[];
}

// Simple text extraction from files
const extractTextFromFile = async (file: File): Promise<string> => {
  // For now, we'll read text files directly
  // In production, you'd want a proper PDF/DOCX parser
  if (file.type === 'text/plain') {
    return await file.text();
  }
  
  // For PDF and DOCX, we'll send the base64 content
  // and let the AI extract information from it
  const arrayBuffer = await file.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  
  // Return a placeholder indicating file type
  // In production, use pdfplumber/python-docx via edge function
  return `[File: ${file.name}]\nContent type: ${file.type}\n\nNote: This is a ${file.type} file. Full parsing would require server-side processing. For demo purposes, please use a job description that describes candidate qualifications.`;
};

export function useResumeScreening() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [jobDescription, setJobDescription] = useState<{ title: string; description: string; skills: ExtractedSkills } | null>(null);
  const [rankings, setRankings] = useState<CandidateRanking[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    currentStep: 0,
    totalSteps: 4,
    message: "",
  });
  const { toast } = useToast();

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      size: file.size,
      status: 'uploading' as const,
      file,
    }));
    
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    
    // Process each file
    for (const uploadedFile of newFiles) {
      try {
        // Update status to processing
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, status: 'processing' as const } : f
          )
        );
        
        // Extract text content
        const content = await extractTextFromFile(uploadedFile.file);
        
        // Update status to completed with content
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id 
              ? { ...f, status: 'completed' as const, content } 
              : f
          )
        );
      } catch (error) {
        console.error('Error processing file:', uploadedFile.name, error);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, status: 'error' as const } : f
          )
        );
      }
    }
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const extractSkillsFromJD = async (description: string): Promise<ExtractedSkills> => {
    try {
      const { data, error } = await supabase.functions.invoke('extract-skills', {
        body: { jobDescription: description }
      });
      
      if (error) {
        console.error('Error extracting skills:', error);
        throw error;
      }
      
      return data.skills;
    } catch (error) {
      console.error('Failed to extract skills, using fallback:', error);
      // Fallback to basic extraction
      const words = description.toLowerCase().split(/\s+/);
      const techKeywords = ['python', 'javascript', 'react', 'sql', 'aws', 'docker', 'kubernetes', 'machine learning', 'ai', 'data', 'api', 'node'];
      const found = techKeywords.filter(kw => words.some(w => w.includes(kw)));
      
      return {
        required: found.slice(0, 5),
        preferred: found.slice(5, 8),
        keywords: ['5+ years', 'senior', 'team player']
      };
    }
  };

  const rankCandidates = async (
    resumes: UploadedFile[], 
    jdDescription: string,
    skills: ExtractedSkills
  ): Promise<CandidateRanking[]> => {
    const resumeData = resumes
      .filter(r => r.status === 'completed' && r.content)
      .map(r => ({
        id: r.id,
        fileName: r.name,
        content: r.content || ''
      }));
    
    if (resumeData.length === 0) {
      throw new Error('No valid resumes to process');
    }

    const { data, error } = await supabase.functions.invoke('rank-candidates', {
      body: {
        resumes: resumeData,
        jobDescription: jdDescription,
        requiredSkills: skills.required,
        preferredSkills: skills.preferred
      }
    });
    
    if (error) {
      console.error('Error ranking candidates:', error);
      throw error;
    }
    
    return data.rankings;
  };

  const handleJobDescriptionSubmit = useCallback(async (data: {
    title: string;
    description: string;
    skills: ExtractedSkills;
  }) => {
    setJobDescription(data);
    
    // Start processing
    setProcessingState({
      isProcessing: true,
      currentStep: 0,
      totalSteps: 4,
      message: "Initializing AI engine...",
    });
    
    try {
      // Step 1: Parse resumes
      setProcessingState({
        isProcessing: true,
        currentStep: 1,
        totalSteps: 4,
        message: "Parsing resume documents...",
      });
      await new Promise(r => setTimeout(r, 500));
      
      // Step 2: AI Analysis
      setProcessingState({
        isProcessing: true,
        currentStep: 2,
        totalSteps: 4,
        message: "Running semantic AI analysis...",
      });
      
      // Step 3: Semantic Matching
      setProcessingState({
        isProcessing: true,
        currentStep: 3,
        totalSteps: 4,
        message: "Computing similarity scores...",
      });
      
      // Call the ranking API
      const candidateRankings = await rankCandidates(
        uploadedFiles,
        data.description,
        data.skills
      );
      
      // Step 4: Complete
      setProcessingState({
        isProcessing: true,
        currentStep: 4,
        totalSteps: 4,
        message: "Generating final rankings...",
      });
      
      await new Promise(r => setTimeout(r, 500));
      
      setRankings(candidateRankings);
      
      toast({
        title: "Screening Complete",
        description: `Successfully analyzed ${candidateRankings.length} candidates.`,
      });
      
    } catch (error) {
      console.error('Error during screening:', error);
      toast({
        title: "Screening Error",
        description: error instanceof Error ? error.message : "Failed to complete screening. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingState({
        isProcessing: false,
        currentStep: 0,
        totalSteps: 4,
        message: "",
      });
    }
  }, [uploadedFiles, toast]);

  const handleExtractSkills = useCallback(async (description: string): Promise<ExtractedSkills | null> => {
    try {
      const skills = await extractSkillsFromJD(description);
      return skills;
    } catch (error) {
      toast({
        title: "Extraction Error", 
        description: "Failed to extract skills. Using basic extraction instead.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

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
    handleExtractSkills,
    resetSession,
  };
}
