import { FileText, Users, Target, Zap, RotateCcw } from "lucide-react";
import { Header } from "@/components/Header";
import { FileUploadZone } from "@/components/FileUploadZone";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { CandidateCard } from "@/components/CandidateCard";
import { StatsCard } from "@/components/StatsCard";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { Button } from "@/components/ui/button";
import { useResumeScreening } from "@/hooks/useResumeScreening";

const Index = () => {
  const {
    uploadedFiles,
    rankings,
    processingState,
    handleFilesSelected,
    handleRemoveFile,
    handleJobDescriptionSubmit,
    resetSession,
  } = useResumeScreening();

  const hasResults = rankings.length > 0;
  const excellentMatches = rankings.filter(r => r.matchPercentage >= 80).length;
  const goodMatches = rankings.filter(r => r.matchPercentage >= 60 && r.matchPercentage < 80).length;
  const averageScore = rankings.length > 0 
    ? Math.round(rankings.reduce((sum, r) => sum + r.matchPercentage, 0) / rankings.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero gradient background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
      />
      
      <Header />
      
      <main className="relative container mx-auto px-4 py-8">
        {!hasResults ? (
          <>
            {/* Hero Section */}
            <section className="text-center mb-12 animate-fade-in">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                AI-Powered Resume Screening
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload resumes and job descriptions. Our semantic AI engine matches candidates 
                using advanced NLP — going beyond keywords to understand true relevance.
              </p>
            </section>
            
            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Resume Upload */}
              <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
                <FileUploadZone
                  title="Upload Resumes"
                  description="Drag and drop PDF or DOCX files to analyze"
                  acceptedFormats={[".pdf", ".docx", ".doc"]}
                  multiple={true}
                  onFilesSelected={handleFilesSelected}
                  uploadedFiles={uploadedFiles}
                  onRemoveFile={handleRemoveFile}
                />
              </div>
              
              {/* Job Description */}
              <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
                <JobDescriptionInput
                  onSubmit={handleJobDescriptionSubmit}
                  isProcessing={processingState.isProcessing}
                />
              </div>
            </div>
            
            {/* Features Section */}
            <section className="mt-16 max-w-4xl mx-auto">
              <h2 className="font-display text-2xl font-semibold text-foreground text-center mb-8">
                How It Works
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: FileText,
                    title: "Multi-Format Parsing",
                    description: "Supports PDF and DOCX formats with intelligent text extraction"
                  },
                  {
                    icon: Zap,
                    title: "Semantic Matching",
                    description: "AI understands context — 'ML Engineer' matches 'Machine Learning'"
                  },
                  {
                    icon: Target,
                    title: "Smart Rankings",
                    description: "Get scored candidates with detailed skill breakdowns"
                  }
                ].map((feature, index) => (
                  <div 
                    key={feature.title}
                    className="text-center p-6 rounded-2xl glass animate-slide-up"
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                  >
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8 animate-fade-in">
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Screening Results
                </h1>
                <p className="text-muted-foreground">
                  {rankings.length} candidates analyzed and ranked
                </p>
              </div>
              
              <Button variant="outline" onClick={resetSession}>
                <RotateCcw className="w-4 h-4" />
                New Screening
              </Button>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard
                title="Total Candidates"
                value={rankings.length}
                icon={Users}
                variant="primary"
              />
              <StatsCard
                title="Excellent Matches"
                value={excellentMatches}
                subtitle="80%+ match score"
                icon={Target}
                variant="accent"
              />
              <StatsCard
                title="Good Matches"
                value={goodMatches}
                subtitle="60-79% match score"
                icon={Zap}
              />
              <StatsCard
                title="Average Score"
                value={`${averageScore}%`}
                icon={FileText}
              />
            </div>
            
            {/* Candidates List */}
            <div className="space-y-4">
              {rankings.map((candidate, index) => (
                <CandidateCard
                  key={candidate.resumeId}
                  candidate={candidate}
                  animationDelay={index * 100}
                />
              ))}
            </div>
          </>
        )}
      </main>
      
      {/* Processing Overlay */}
      {processingState.isProcessing && (
        <ProcessingOverlay
          currentStep={processingState.currentStep}
          totalSteps={processingState.totalSteps}
          message={processingState.message}
        />
      )}
    </div>
  );
};

export default Index;
