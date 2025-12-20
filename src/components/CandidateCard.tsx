import { User, Mail, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { CandidateRanking } from "@/types/resume";

interface CandidateCardProps {
  candidate: CandidateRanking;
  animationDelay?: number;
}

export function CandidateCard({ candidate, animationDelay = 0 }: CandidateCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "accent";
    if (score >= 60) return "default";
    if (score >= 40) return "warning";
    return "destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Partial Match";
    return "Low Match";
  };

  const scoreColor = getScoreColor(candidate.matchPercentage);
  const progressVariant = scoreColor === "default" ? "gradient" : 
                          scoreColor === "accent" ? "gradient-accent" : 
                          scoreColor as "warning" | "destructive";

  return (
    <Card 
      variant="glass" 
      className="overflow-hidden animate-slide-up hover:shadow-xl transition-all duration-300"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Rank & Score Section */}
          <div className={cn(
            "flex lg:flex-col items-center justify-between lg:justify-center gap-4 p-6 lg:w-32",
            "bg-gradient-to-br",
            scoreColor === "accent" && "from-accent/20 to-accent/5",
            scoreColor === "default" && "from-primary/20 to-primary/5",
            scoreColor === "warning" && "from-warning/20 to-warning/5",
            scoreColor === "destructive" && "from-destructive/20 to-destructive/5"
          )}>
            <div className="text-center">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rank</span>
              <p className={cn(
                "text-4xl font-display font-bold",
                scoreColor === "accent" && "text-accent",
                scoreColor === "default" && "text-primary",
                scoreColor === "warning" && "text-warning",
                scoreColor === "destructive" && "text-destructive"
              )}>
                #{candidate.rank}
              </p>
            </div>
            
            <div className="text-center lg:mt-2">
              <div className={cn(
                "text-3xl font-display font-bold",
                scoreColor === "accent" && "text-accent",
                scoreColor === "default" && "text-primary",
                scoreColor === "warning" && "text-warning",
                scoreColor === "destructive" && "text-destructive"
              )}>
                {candidate.matchPercentage}%
              </div>
              <Badge variant={scoreColor === "default" ? "default" : scoreColor} className="mt-1">
                {getScoreLabel(candidate.matchPercentage)}
              </Badge>
            </div>
          </div>
          
          {/* Candidate Info */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground">
                    {candidate.candidateName}
                  </h3>
                  {candidate.email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {candidate.email}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Experience: {candidate.experienceMatch}%</span>
              </div>
            </div>
            
            {/* Match Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Match</span>
                <span className="font-medium text-foreground">{candidate.matchPercentage}%</span>
              </div>
              <Progress value={candidate.matchPercentage} variant={progressVariant} />
            </div>
            
            {/* Skill Matches */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Skills Assessment
              </p>
              <div className="flex flex-wrap gap-2">
                {candidate.skillMatches.slice(0, 8).map((skillMatch) => (
                  <div
                    key={skillMatch.skill}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                      skillMatch.matched
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "bg-muted text-muted-foreground border border-border"
                    )}
                  >
                    {skillMatch.matched ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3 opacity-50" />
                    )}
                    {skillMatch.skill}
                    {skillMatch.matched && (
                      <span className="text-[10px] opacity-70">
                        {Math.round(skillMatch.similarity * 100)}%
                      </span>
                    )}
                  </div>
                ))}
                {candidate.skillMatches.length > 8 && (
                  <Badge variant="muted" className="text-xs">
                    +{candidate.skillMatches.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Analysis Summary */}
            {candidate.overallAnalysis && (
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {candidate.overallAnalysis}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
