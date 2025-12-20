import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription } = await req.json();
    
    if (!jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Job description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracting skills from job description:', jobDescription.substring(0, 100) + '...');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

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
            content: `You are an expert HR analyst. Extract and categorize skills and requirements from job descriptions.
            
Return a JSON object with this exact structure:
{
  "required": ["skill1", "skill2", ...],
  "preferred": ["skill1", "skill2", ...],
  "keywords": ["keyword1", "keyword2", ...]
}

Guidelines:
- "required" should contain technical skills, certifications, and hard requirements
- "preferred" should contain nice-to-have skills and soft skills
- "keywords" should contain experience levels, industry terms, and other important phrases
- Keep each array to 5-8 items maximum
- Be specific with technology names (e.g., "Python" not "programming")`
          },
          {
            role: 'user',
            content: `Extract skills and requirements from this job description:\n\n${jobDescription}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_skills",
              description: "Extract required skills, preferred skills, and keywords from a job description",
              parameters: {
                type: "object",
                properties: {
                  required: {
                    type: "array",
                    items: { type: "string" },
                    description: "Required technical skills and hard requirements"
                  },
                  preferred: {
                    type: "array",
                    items: { type: "string" },
                    description: "Nice-to-have skills and soft skills"
                  },
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Experience levels, industry terms, and important phrases"
                  }
                },
                required: ["required", "preferred", "keywords"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_skills" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
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
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received:', JSON.stringify(data).substring(0, 200));
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const extractedSkills = JSON.parse(toolCall.function.arguments);
    console.log('Extracted skills:', extractedSkills);

    return new Response(
      JSON.stringify({ skills: extractedSkills }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in extract-skills function:', error);
    const message = error instanceof Error ? error.message : 'Failed to extract skills';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
