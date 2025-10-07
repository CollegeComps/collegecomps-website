import { NextRequest, NextResponse } from 'next/server';
import { CollegeDataService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const unitid = searchParams.get('unitid');
    
    if (!unitid) {
      return NextResponse.json({ error: 'unitid is required' }, { status: 400 });
    }

    const unitidNum = parseInt(unitid);
    if (isNaN(unitidNum)) {
      return NextResponse.json({ error: 'unitid must be a valid number' }, { status: 400 });
    }

    const db = new CollegeDataService();
    const financialData = db.getInstitutionFinancialData(unitidNum);

    return NextResponse.json({
      financialData,
      unitid: unitidNum
    });

  } catch (error) {
    console.error('Error fetching financial data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}