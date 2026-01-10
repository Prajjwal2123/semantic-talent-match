URL: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

📋 Project Report: Intelligent Resume Screening System
🎯 Project Overview
A production-grade, AI-powered resume screening platform that uses semantic matching to rank candidates against job descriptions—moving beyond simple keyword matching to understand contextual relationships between skills.

🛠️ Technology Stack
Layer	Technology	Why We Chose It
Frontend Framework	React 18 + TypeScript	Type-safe, component-based architecture for maintainable UI
Build Tool	Vite	Lightning-fast HMR, optimized production builds
Styling	Tailwind CSS + shadcn/ui	Utility-first CSS with accessible, customizable components
State Management	TanStack React Query	Server state caching, automatic refetching, optimistic updates
Routing	React Router DOM	Client-side navigation with nested routes
Backend	Lovable Cloud (Supabase Edge Functions)	Serverless, auto-scaling, no infrastructure management
AI Model	Google Gemini 2.5 Flash	Fast, cost-effective, excellent at structured extraction
API Style	REST via Edge Functions	UI-ready, cloud-deployable, microservice-friendly
🧠 AI Architecture
Function	Purpose	Model
extract-skills	Parses job descriptions → required skills, preferred skills, keywords	Gemini 2.5 Flash
rank-candidates	Semantic matching of resumes against JD, returns ranked candidates	Gemini 2.5 Flash
Why Semantic Matching over Keywords?

Keywords fail: "ML Engineer" ≠ "Machine Learning Specialist" (keyword mismatch)
Embeddings succeed: AI understands contextual equivalence
Uses function calling (structured JSON output) for reliable parsing
🎨 Design System
Element	Implementation
Typography	Sora (headings) + Inter (body)
Color Palette	Deep Indigo primary (#4338ca), Emerald accent (#10b981)
UI Pattern	Glassmorphism with backdrop blur, gradient accents
Components	Custom variants: glass, gradient, accent for cards, buttons, badges
📁 Project Structure
src/
├── components/        # UI components (Header, CandidateCard, FileUploadZone...)
├── hooks/             # Custom hooks (useResumeScreening)
├── pages/             # Route pages (Index, NotFound)
├── types/             # TypeScript interfaces (Resume, CandidateRanking...)
├── integrations/      # Supabase client (auto-generated)
└── lib/               # Utilities

supabase/functions/
├── extract-skills/    # JD parsing endpoint
└── rank-candidates/   # Semantic ranking endpoint
🔑 Key Features Implemented
Multi-file resume upload with drag-and-drop
AI-powered skill extraction from job descriptions
Semantic candidate ranking with match percentages
Real-time processing overlay with step indicators
Responsive glass-morphism UI
🚀 Production-Ready Aspects
✅ REST API architecture (/extract-skills, /rank-candidates)
✅ Error handling (rate limits, API failures)
✅ CORS configured for web clients
✅ TypeScript end-to-end
✅ SEO meta tags configured
