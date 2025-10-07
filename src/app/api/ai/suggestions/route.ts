import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// This will use OpenAI/Anthropic API for intelligent suggestions
// For now, we'll create a smart context-aware system that uses the database + AI enhancement

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has premium access
    const isPremium = session.user.subscriptionTier === 'premium';
    
    if (!isPremium) {
      return NextResponse.json({ 
        error: 'Premium subscription required for AI-powered suggestions',
        isPremium: false 
      }, { status: 403 });
    }

    const body = await req.json();
    const { query, type, context } = body; // type: 'school' | 'major'

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Get user preferences for context
    const userContext = context || {};
    const { intended_major, degree_level, location_preference, budget_range } = userContext;

    // Build AI prompt based on type
    let aiPrompt = '';
    let systemContext = '';

    if (type === 'school') {
      systemContext = `You are an expert college admissions counselor helping a student find the right schools. 
User context: ${intended_major ? `Major: ${intended_major}` : ''} ${degree_level ? `Degree: ${degree_level}` : ''}
${budget_range ? `Budget: ${budget_range}` : ''} ${location_preference ? `Location preference: ${location_preference}` : ''}`;

      aiPrompt = `The student is typing: "${query}"
Suggest 5-8 colleges/universities that match this search, considering their context. 
Include a mix of reach, match, and safety schools if applicable.
Return ONLY a JSON array of objects with this format:
[{"name": "School Name", "reason": "Brief reason why this matches (1 sentence)", "type": "reach|match|safety"}]`;

    } else if (type === 'major') {
      systemContext = `You are an expert academic advisor helping a student choose their field of study.
User context: ${degree_level ? `Degree: ${degree_level}` : ''} ${intended_major ? `Current interest: ${intended_major}` : ''}`;

      aiPrompt = `The student is typing: "${query}"
Suggest 5-8 academic majors/programs that match this search.
Include both exact matches and related fields they might not have considered.
Return ONLY a JSON array of objects with this format:
[{"name": "Major Name (CIP standardized)", "reason": "Brief description or why it matches", "career_prospects": "brief note on careers"}]`;
    }

    // For MVP, we'll use a simple intelligent matching system
    // TODO: Replace with actual OpenAI/Anthropic API call
    const suggestions = await getIntelligentSuggestions(query, type, userContext);

    return NextResponse.json({
      suggestions,
      isPremium: true,
      aiEnhanced: true,
      prompt: aiPrompt, // For debugging/logging
    });

  } catch (error) {
    console.error('AI suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI suggestions' },
      { status: 500 }
    );
  }
}

// Intelligent suggestion system (will be replaced with actual AI API)
async function getIntelligentSuggestions(
  query: string, 
  type: 'school' | 'major',
  context: any
) {
  const Database = require('better-sqlite3');
  const path = require('path');
  
  const dbPath = path.join(process.cwd(), '..', 'college-scrapper', 'data', 'college_data.db');
  const db = new Database(dbPath, { readonly: true });

  let suggestions = [];

  if (type === 'school') {
    // Smart school matching with context
    const schools = db.prepare(`
      SELECT DISTINCT 
        i.institution_name as name,
        i.state,
        i.city,
        i.control,
        fd.tuition_in_state,
        fd.tuition_out_state,
        ad.admission_rate
      FROM institutions i
      LEFT JOIN financial_data fd ON i.institution_id = fd.institution_id
      LEFT JOIN admissions_data ad ON i.institution_id = ad.institution_id
      WHERE i.institution_name LIKE ?
      ORDER BY 
        CASE 
          WHEN i.institution_name LIKE ? THEN 1
          ELSE 2
        END,
        i.institution_name
      LIMIT 8
    `).all(`%${query}%`, `${query}%`);

    suggestions = schools.map((school: any) => {
      let reason = '';
      let type = 'match';

      // Determine school type based on admission rate
      if (school.admission_rate) {
        if (school.admission_rate < 0.20) {
          type = 'reach';
          reason = 'Highly selective institution';
        } else if (school.admission_rate > 0.60) {
          type = 'safety';
          reason = 'More accessible admission rates';
        } else {
          reason = 'Competitive but achievable';
        }
      }

      // Add context-based reasons
      if (context.budget_range === 'low' && school.tuition_in_state < 15000) {
        reason += ' • Affordable in-state tuition';
      }
      if (school.control === 'Public') {
        reason += ' • Public institution';
      } else if (school.control === 'Private not-for-profit') {
        reason += ' • Private institution';
      }

      return {
        name: school.name,
        reason: reason || 'Matches your search',
        type,
        location: `${school.city}, ${school.state}`,
        tuition: school.tuition_in_state || school.tuition_out_state,
      };
    });

  } else if (type === 'major') {
    // Smart major matching
    const majors = db.prepare(`
      SELECT DISTINCT 
        program_title as name,
        credential_level,
        COUNT(*) as school_count
      FROM academic_programs
      WHERE program_title LIKE ?
      GROUP BY program_title, credential_level
      ORDER BY 
        CASE 
          WHEN program_title LIKE ? THEN 1
          ELSE 2
        END,
        school_count DESC
      LIMIT 8
    `).all(`%${query}%`, `${query}%`);

    // Get earnings data for context
    suggestions = majors.map((major: any) => {
      let reason = `Available at ${major.school_count} institution${major.school_count > 1 ? 's' : ''}`;
      
      if (major.credential_level) {
        reason += ` • ${major.credential_level}`;
      }

      return {
        name: major.name,
        reason,
        career_prospects: 'View salary data for details',
        school_count: major.school_count,
      };
    });
  }

  db.close();
  return suggestions;
}

// Future: OpenAI integration
async function getAISuggestions(prompt: string, systemContext: string) {
  // Uncomment when ready to integrate OpenAI
  /*
  const OpenAI = require('openai');
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemContext },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return JSON.parse(completion.choices[0].message.content);
  */
  
  return [];
}
