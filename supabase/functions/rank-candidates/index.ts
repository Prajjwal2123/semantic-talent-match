import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResumeData {
  id: string;
  fileName: string;
  content: string;
}

interface SkillMatch {
  skill: string;
  matched: boolean;
  similarity: number;
}

interface CandidateRanking {
  resumeId: string;
  candidateName: string;
  email?: string;
  matchScore: number;
  matchPercentage: number;
  rank: number;
  skillMatches: SkillMatch[];
  experienceMatch: number;
  overallAnalysis: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumes, jobDescription, requiredSkills, preferredSkills } = await req.json();
    
    if (!resumes || !Array.isArray(resumes) || resumes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one resume is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!requiredSkills || !Array.isArray(requiredSkills)) {
      return new Response(
        JSON.stringify({ error: 'Required skills array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${resumes.length} resumes against job requirements`);
    console.log('Required skills:', requiredSkills);
    console.log('Preferred skills:', preferredSkills);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const allSkills = [...requiredSkills, ...(preferredSkills || [])];
    const rankings: CandidateRanking[] = [];

    // Process each resume
    for (const resume of resumes as ResumeData[]) {
      console.log(`Analyzing resume: ${resume.fileName}`);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are an expert HR analyst performing semantic resume screening. Analyze resumes against job requirements using semantic understanding, not just keyword matching.

For example:
- "Machine Learning Engineer" semantically matches "ML Engineer", "AI Engineer", "Deep Learning Specialist"
- "Python programming" matches "Python development", "Python scripting", "Python 3"
- "AWS" matches "Amazon Web Services", "Cloud (AWS)", etc.

You must evaluate each skill semantically and provide accurate matching scores.`
            },
            {
              role: 'user',
              content: `Analyze this resume against the job requirements.

JOB DESCRIPTION:
${jobDescription}

REQUIRED SKILLS: ${requiredSkills.join(', ')}
PREFERRED SKILLS: ${(preferredSkills || []).join(', ')}

RESUME CONTENT:
${resume.content}

Extract the candidate's name and email if present. Then evaluate how well each skill matches semantically.`
            }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "analyze_resume",
                description: "Analyze a resume against job requirements with semantic matching",
                parameters: {
                  type: "object",
                  properties: {
                    candidateName: {
                      type: "string",
                      description: "Full name of the candidate extracted from resume"
                    },
                    email: {
                      type: "string",
                      description: "Email address if present in resume"
                    },
                    overallMatchPercentage: {
                      type: "number",
                      description: "Overall match percentage 0-100 based on semantic analysis"
                    },
                    experienceMatchPercentage: {
                      type: "number",
                      description: "How well experience level matches job requirements 0-100"
                    },
                    skillMatches: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          skill: { type: "string" },
                          matched: { type: "boolean" },
                          similarity: { 
                            type: "number",
                            description: "Semantic similarity 0-1 where 1 is exact match"
                          }
                        },
                        required: ["skill", "matched", "similarity"]
                      },
                      description: "Semantic match analysis for each required and preferred skill"
                    },
                    analysis: {
                      type: "string",
                      description: "Brief 2-3 sentence analysis of candidate fit"
                    }
                  },
                  required: ["candidateName", "overallMatchPercentage", "experienceMatchPercentage", "skillMatches", "analysis"],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "analyze_resume" } }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error analyzing resume ${resume.fileName}:`, response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Skip this resume but continue with others
        rankings.push({
          resumeId: resume.id,
          candidateName: resume.fileName.replace(/\.[^/.]+$/, ''),
          matchScore: 0,
          matchPercentage: 0,
          rank: 0,
          skillMatches: allSkills.map(s => ({ skill: s, matched: false, similarity: 0 })),
          experienceMatch: 0,
          overallAnalysis: 'Error analyzing this resume'
        });
        continue;
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      
      if (!toolCall) {
        console.error('No tool call in response for resume:', resume.fileName);
        continue;
      }

      const analysis = JSON.parse(toolCall.function.arguments);
      console.log(`Resume ${resume.fileName} analysis:`, analysis);

      rankings.push({
        resumeId: resume.id,
        candidateName: analysis.candidateName || resume.fileName.replace(/\.[^/.]+$/, ''),
        email: analysis.email,
        matchScore: analysis.overallMatchPercentage / 100,
        matchPercentage: Math.round(analysis.overallMatchPercentage),
        rank: 0, // Will be set after sorting
        skillMatches: analysis.skillMatches || allSkills.map(s => ({ skill: s, matched: false, similarity: 0 })),
        experienceMatch: Math.round(analysis.experienceMatchPercentage),
        overallAnalysis: analysis.analysis
      });
    }

    // Sort by match percentage and assign ranks
    rankings.sort((a, b) => b.matchPercentage - a.matchPercentage);
    rankings.forEach((r, i) => r.rank = i + 1);

    console.log(`Completed analysis. Top candidate: ${rankings[0]?.candidateName} (${rankings[0]?.matchPercentage}%)`);

    return new Response(
      JSON.stringify({ rankings }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in rank-candidates function:', error);
    const message = error instanceof Error ? error.message : 'Failed to rank candidates';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
