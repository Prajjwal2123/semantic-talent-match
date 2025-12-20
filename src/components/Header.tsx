import { Brain, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass-strong">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <Sparkles className="w-3 h-3 text-accent absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">ResumeAI</h1>
            <p className="text-xs text-muted-foreground">Intelligent Screening</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Dashboard
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Candidates
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Analytics
          </a>
        </nav>
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">AI</span>
          </div>
        </div>
      </div>
    </header>
  );
}
