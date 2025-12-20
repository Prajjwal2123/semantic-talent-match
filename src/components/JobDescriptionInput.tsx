import { useState } from "react";
import { Briefcase, Sparkles, Tag, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface ExtractedSkills {
  required: string[];
  preferred: string[];
  keywords: string[];
}

interface JobDescriptionInputProps {
  onSubmit: (data: { title: string; description: string; skills: ExtractedSkills }) => void;
  isProcessing?: boolean;
}

export function JobDescriptionInput({ onSubmit, isProcessing }: JobDescriptionInputProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [extractedSkills, setExtractedSkills] = useState<ExtractedSkills | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtractSkills = async () => {
    if (!description.trim()) return;
    
    setIsExtracting(true);
    
    // Simulate AI extraction - in production this would call the AI endpoint
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock extracted skills based on description
    const mockSkills: ExtractedSkills = {
      required: ["Python", "Machine Learning", "TensorFlow", "Data Analysis", "SQL"],
      preferred: ["Docker", "Kubernetes", "AWS", "REST APIs"],
      keywords: ["5+ years experience", "Senior level", "Team leadership", "Agile"],
    };
    
    setExtractedSkills(mockSkills);
    setIsExtracting(false);
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !extractedSkills) return;
    onSubmit({ title, description, skills: extractedSkills });
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>Paste or enter the job requirements</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Job Title
          </label>
          <Input
            placeholder="e.g., Senior Machine Learning Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background/50"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Job Description
          </label>
          <Textarea
            placeholder="Paste the full job description here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[200px] bg-background/50 resize-none"
          />
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleExtractSkills}
            disabled={!description.trim() || isExtracting}
            className="flex-1"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Extract Skills with AI
              </>
            )}
          </Button>
        </div>
        
        {extractedSkills && (
          <div className="space-y-4 p-4 rounded-xl bg-muted/50 animate-scale-in">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-foreground">Extracted Requirements</span>
            </div>
            
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.required.map((skill) => (
                  <Badge key={skill} variant="default" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Preferred Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.preferred.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <Button
          variant="gradient"
          size="lg"
          onClick={handleSubmit}
          disabled={!title.trim() || !extractedSkills || isProcessing}
          className="w-full mt-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Start Screening"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
