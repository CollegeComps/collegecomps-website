import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCollegeDb, getUsersDb } from '@/lib/db-helper';
import { getUserTier } from '@/lib/auth-helpers';
import {
  getAICompletion,
  getAdvisorSystemPrompt,
  buildDatabaseContext,
  AI_RATE_LIMITS,
  type AIMessage,
} from '@/lib/ai-client';

/**
 * AI College Advisor Chat - POST /api/ai/chat
 *
 * Provides conversational AI guidance using Anthropic Claude,
 * augmented with real CollegeComps database context (RAG approach).
 *
 * Rate limited by subscription tier.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Please sign in to use the AI advisor.' },
        { status: 401 }
      );
    }

    const { messages, context } = await req.json() as {
      messages: AIMessage[];
      context?: { schoolIds?: string[]; programQuery?: string };
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required.' },
        { status: 400 }
      );
    }

    // Check rate limits based on tier
    const tier = getUserTier(session);
    const tierKey = tier === 'premium' ? 'plus' : (tier as keyof typeof AI_RATE_LIMITS);
    const limits = AI_RATE_LIMITS[tierKey] || AI_RATE_LIMITS.free;

    if (limits.chatMessagesPerDay === 0) {
      return NextResponse.json(
        {
          error: 'AI chat requires a subscription. Upgrade to Plus or AI Pro to access the AI advisor.',
          upgrade: true,
        },
        { status: 403 }
      );
    }

    // TODO: Implement actual rate limit tracking with database/Redis
    // For now, we allow requests through but the tracking infrastructure
    // should be added before launch

    // Build database context for RAG
    let databaseContext = '';
    const collegeDb = getCollegeDb();
    const usersDb = getUsersDb();

    if (collegeDb) {
      const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      const contextData: Parameters<typeof buildDatabaseContext>[0] = {};

      // Get user profile if available
      if (usersDb && session.user.id) {
        const profile = usersDb.prepare(`
          SELECT gpa, sat, act, budget, location_preference, program_interest, career_goals
          FROM user_profiles
          WHERE user_id = ?
        `).get(parseInt(session.user.id)) as any;

        if (profile) {
          contextData.userProfile = profile;
        }
      }

      // If user mentions specific schools or the context includes school IDs, fetch that data
      if (context?.schoolIds && context.schoolIds.length > 0) {
        const placeholders = context.schoolIds.map(() => '?').join(',');
        const institutions = collegeDb.prepare(`
          SELECT
            i.unitid, i.name, i.state, i.city,
            i.control_public_private as control,
            i.acceptance_rate,
            (COALESCE(f.tuition_out_state, f.tuition_in_state, 0) + COALESCE(f.fees, 0) + COALESCE(f.room_board_on_campus, 0)) as cost,
            COALESCE(e.earnings_10_years_after_entry, e.earnings_6_years_after_entry) as avg_salary
          FROM institutions i
          LEFT JOIN financial_data f ON i.unitid = f.unitid
            AND f.year = (SELECT MAX(year) FROM financial_data WHERE unitid = i.unitid)
          LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
          WHERE i.unitid IN (${placeholders})
        `).all(...context.schoolIds);

        contextData.institutions = institutions;
      }

      // For general queries, try to find relevant schools based on keywords
      if (!contextData.institutions || contextData.institutions.length === 0) {
        // Extract potential school names or keywords from the message
        const searchTerms = lastMessage
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 3)
          .slice(0, 5);

        if (searchTerms.length > 0) {
          const likeConditions = searchTerms.map(() => 'i.name LIKE ?').join(' OR ');
          const likeParams = searchTerms.map(t => `%${t}%`);

          try {
            const institutions = collegeDb.prepare(`
              SELECT
                i.unitid, i.name, i.state, i.city,
                i.control_public_private as control,
                i.acceptance_rate,
                (COALESCE(f.tuition_out_state, f.tuition_in_state, 0) + COALESCE(f.fees, 0) + COALESCE(f.room_board_on_campus, 0)) as cost,
                COALESCE(e.earnings_10_years_after_entry, e.earnings_6_years_after_entry) as avg_salary
              FROM institutions i
              LEFT JOIN financial_data f ON i.unitid = f.unitid
                AND f.year = (SELECT MAX(year) FROM financial_data WHERE unitid = i.unitid)
              LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
              WHERE (${likeConditions})
                AND i.name IS NOT NULL
              LIMIT 10
            `).all(...likeParams);

            if (institutions.length > 0) {
              contextData.institutions = institutions;
            }
          } catch {
            // Ignore search errors, proceed without context
          }
        }
      }

      // Search for programs if mentioned
      if (context?.programQuery) {
        try {
          const programs = collegeDb.prepare(`
            SELECT DISTINCT
              ap.cip_title,
              ap.credential_level,
              i.name as institution_name,
              ap.median_earnings_2yr as median_earnings
            FROM academic_programs ap
            JOIN institutions i ON ap.unitid = i.unitid
            WHERE ap.cip_title LIKE ?
            LIMIT 10
          `).all(`%${context.programQuery}%`);

          contextData.programs = programs;
        } catch {
          // Ignore
        }
      }

      databaseContext = buildDatabaseContext(contextData);
    }

    // Call Claude with database context
    const systemPrompt = getAdvisorSystemPrompt(databaseContext);
    const result = await getAICompletion({
      systemPrompt,
      messages,
      maxTokens: 1500,
      temperature: 0.7,
    });

    return NextResponse.json({
      message: result.content,
      usage: result.usage,
      tier: tierKey,
      remainingMessages: limits.chatMessagesPerDay, // TODO: Calculate actual remaining
    });
  } catch (error: any) {
    console.error('AI Chat error:', error);

    if (error.message?.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI features are being set up. Please check back soon!' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get AI response. Please try again.' },
      { status: 500 }
    );
  }
}
