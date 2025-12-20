import { Brain, FileSearch, BarChart3, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProcessingStep {
  id: string;
  label: string;
  icon: typeof Brain;
  status: "pending" | "active" | "completed";
}

interface ProcessingOverlayProps {
  currentStep: number;
  totalSteps: number;
  message: string;
}

const steps: ProcessingStep[] = [
  { id: "parse", label: "Parsing Resumes", icon: FileSearch, status: "pending" },
  { id: "analyze", label: "AI Analysis", icon: Brain, status: "pending" },
  { id: "match", label: "Semantic Matching", icon: BarChart3, status: "pending" },
  { id: "rank", label: "Ranking Candidates", icon: CheckCircle2, status: "pending" },
];

export function ProcessingOverlay({ currentStep, totalSteps, message }: ProcessingOverlayProps) {
  const progress = (currentStep / totalSteps) * 100;
  
  const getStepStatus = (index: number): ProcessingStep["status"] => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="w-full max-w-lg p-8 rounded-2xl glass-strong shadow-2xl animate-scale-in">
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-2xl gradient-primary opacity-20 animate-pulse" />
            <div className="absolute inset-2 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Brain className="w-8 h-8 text-primary-foreground animate-pulse" />
            </div>
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            Processing Candidates
          </h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} variant="gradient" className="h-2" />
        </div>
        
        <div className="space-y-3">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const Icon = step.icon;
            
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-xl transition-all duration-300",
                  status === "active" && "bg-primary/10",
                  status === "completed" && "bg-accent/5"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                  status === "pending" && "bg-muted",
                  status === "active" && "gradient-primary shadow-glow",
                  status === "completed" && "bg-accent"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    status === "pending" && "text-muted-foreground",
                    status === "active" && "text-primary-foreground animate-pulse",
                    status === "completed" && "text-accent-foreground"
                  )} />
                </div>
                
                <div className="flex-1">
                  <p className={cn(
                    "font-medium transition-colors",
                    status === "pending" && "text-muted-foreground",
                    status === "active" && "text-foreground",
                    status === "completed" && "text-accent"
                  )}>
                    {step.label}
                  </p>
                </div>
                
                {status === "completed" && (
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                )}
                
                {status === "active" && (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
