/**
 * AI Client for CollegeComps
 *
 * Provides a unified interface for AI-powered features using Anthropic Claude API.
 * Supports streaming responses for the chat advisor and structured outputs
 * for recommendations and analysis.
 */

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AICompletionOptions {
  systemPrompt: string;
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

interface AICompletionResult {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

const COLLEGECOMPS_SYSTEM_CONTEXT = `You are CollegeComps AI Advisor, an expert college guidance counselor powered by comprehensive data from IPEDS and the College Scorecard covering 6,000+ U.S. institutions.

Your expertise includes:
- College ROI analysis and financial planning for education
- Program comparisons across institutions
- Career outcomes and salary data for graduates
- Scholarship and financial aid guidance
- Application strategy and school selection
- Student loan analysis and repayment planning

Guidelines:
- Always base recommendations on data when available
- Be honest about limitations - if you don't have specific data, say so
- Consider the student's full context: academic profile, finances, goals, and preferences
- Provide actionable, specific advice rather than generic platitudes
- When discussing costs, use real ranges from the database when provided
- Always consider ROI (return on investment) as a key factor
- Be encouraging but realistic about admissions chances
- Never guarantee admission outcomes
- Cite data sources when making claims (IPEDS, College Scorecard, BLS)`;

/**
 * Get AI completion from Anthropic Claude API
 */
export async function getAICompletion(options: AICompletionOptions): Promise<AICompletionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured. AI features require an Anthropic API key.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature ?? 0.7,
      system: options.systemPrompt,
      messages: options.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error (${response.status}): ${error}`);
  }

  const data = await response.json();

  return {
    content: data.content[0]?.text || '',
    usage: {
      inputTokens: data.usage?.input_tokens || 0,
      outputTokens: data.usage?.output_tokens || 0,
    },
  };
}

/**
 * Get streaming AI completion for chat interface
 */
export async function getAIStreamingCompletion(options: AICompletionOptions): Promise<ReadableStream> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature ?? 0.7,
      system: options.systemPrompt,
      messages: options.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error (${response.status}): ${error}`);
  }

  return response.body!;
}

/**
 * Build database context for RAG-style queries
 */
export function buildDatabaseContext(data: {
  institutions?: any[];
  programs?: any[];
  financialData?: any[];
  earningsData?: any[];
  userProfile?: any;
}): string {
  const parts: string[] = [];

  if (data.userProfile) {
    parts.push(`Student Profile:
- GPA: ${data.userProfile.gpa || 'Not provided'}
- SAT: ${data.userProfile.sat || 'Not provided'}
- ACT: ${data.userProfile.act || 'Not provided'}
- Budget: ${data.userProfile.budget ? `$${data.userProfile.budget.toLocaleString()}/year` : 'Not provided'}
- Location Preference: ${data.userProfile.location_preference || 'No preference'}
- Program Interest: ${data.userProfile.program_interest || 'Undecided'}
- Career Goals: ${data.userProfile.career_goals || 'Not specified'}`);
  }

  if (data.institutions && data.institutions.length > 0) {
    parts.push(`\nRelevant Institutions (from IPEDS/College Scorecard data):`);
    for (const inst of data.institutions.slice(0, 20)) {
      parts.push(`- ${inst.name} (${inst.state}): ${inst.control === 1 ? 'Public' : 'Private'}, ` +
        `Acceptance Rate: ${inst.acceptance_rate ? `${(inst.acceptance_rate * 100).toFixed(1)}%` : 'N/A'}, ` +
        `Cost: ${inst.cost ? `$${inst.cost.toLocaleString()}/year` : 'N/A'}, ` +
        `Avg Salary After: ${inst.avg_salary ? `$${inst.avg_salary.toLocaleString()}` : 'N/A'}`);
    }
  }

  if (data.programs && data.programs.length > 0) {
    parts.push(`\nRelevant Programs:`);
    for (const prog of data.programs.slice(0, 15)) {
      parts.push(`- ${prog.cip_title} at ${prog.institution_name || 'various institutions'}: ` +
        `${prog.credential_level || ''}, ` +
        `Median Earnings: ${prog.median_earnings ? `$${prog.median_earnings.toLocaleString()}` : 'N/A'}`);
    }
  }

  return parts.join('\n');
}

/**
 * AI feature rate limits by subscription tier
 */
export const AI_RATE_LIMITS = {
  free: {
    chatMessagesPerDay: 3,
    recommendationsPerDay: 1,
    essayReviewsPerMonth: 0,
    reportsPerMonth: 0,
  },
  plus: {
    chatMessagesPerDay: 15,
    recommendationsPerDay: 5,
    essayReviewsPerMonth: 0,
    reportsPerMonth: 1,
  },
  ai_pro: {
    chatMessagesPerDay: 100,
    recommendationsPerDay: 25,
    essayReviewsPerMonth: 5,
    reportsPerMonth: 3,
  },
  family: {
    chatMessagesPerDay: 200,
    recommendationsPerDay: 50,
    essayReviewsPerMonth: -1, // unlimited
    reportsPerMonth: -1, // unlimited
  },
} as const;

export type AITier = keyof typeof AI_RATE_LIMITS;

/**
 * Get the system prompt for the college advisor
 */
export function getAdvisorSystemPrompt(databaseContext?: string): string {
  let prompt = COLLEGECOMPS_SYSTEM_CONTEXT;

  if (databaseContext) {
    prompt += `\n\nHere is relevant data from the CollegeComps database to inform your response:\n${databaseContext}`;
  }

  return prompt;
}

export type { AIMessage, AICompletionOptions, AICompletionResult };
