import { NextResponse } from 'next/server';
import { CollegeDataService } from '@/lib/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unitid = searchParams.get('unitid');

  if (!unitid) {
    return NextResponse.json({ error: 'Missing unitid parameter' }, { status: 400 });
  }

  try {
    const db = new CollegeDataService();
    const programLength = await db.getInstitutionProgramLength(parseInt(unitid));

    return NextResponse.json({
      programLength
    });
  } catch (error) {
    console.error('Error determining program length:', error);
    return NextResponse.json(
      { error: 'Failed to determine program length', programLength: 4 },
      { status: 500 }
    );
  }
}
