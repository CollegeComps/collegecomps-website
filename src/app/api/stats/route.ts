import { NextResponse } from 'next/server';
import { CollegeDataService } from '@/lib/database';

export async function GET() {
  try {
    const collegeService = new CollegeDataService();
    const stats = await collegeService.getDatabaseStats();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching database stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}