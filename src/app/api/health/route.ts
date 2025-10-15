import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { getUsersDb } from '@/lib/db-helper';

export const dynamic = 'force-dynamic';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      institutionCount?: number;
      error?: string;
    };
    usersDatabase: {
      status: 'up' | 'down';
      responseTime?: number;
      userCount?: number;
      error?: string;
    };
    memory: {
      usage: string;
      limit: string;
      percentage: number;
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  const healthCheck: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    checks: {
      database: { status: 'down' },
      usersDatabase: { status: 'down' },
      memory: {
        usage: '0 MB',
        limit: '0 MB',
        percentage: 0
      }
    }
  };

  // Check College Database
  try {
    const dbStart = Date.now();
    const db = getDatabase();
    
    if (!db) {
      throw new Error('Database connection failed');
    }

    const result = await db.prepare('SELECT COUNT(*) as count FROM institutions').get() as { count: number };
    const dbTime = Date.now() - dbStart;

    healthCheck.checks.database = {
      status: 'up',
      responseTime: dbTime,
      institutionCount: result.count
    };
  } catch (error: any) {
    healthCheck.status = 'unhealthy';
    healthCheck.checks.database = {
      status: 'down',
      error: error.message
    };
  }

  // Check Users Database
  try {
    const userDbStart = Date.now();
    const userDb = getUsersDb();
    
    if (!userDb) {
      throw new Error('Users database connection failed');
    }

    const result = await userDb.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const userDbTime = Date.now() - userDbStart;

    healthCheck.checks.usersDatabase = {
      status: 'up',
      responseTime: userDbTime,
      userCount: result.count
    };
  } catch (error: any) {
    healthCheck.status = 'degraded'; // Users DB is less critical than main DB
    healthCheck.checks.usersDatabase = {
      status: 'down',
      error: error.message
    };
  }

  // Check Memory Usage
  try {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const percentage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);

    healthCheck.checks.memory = {
      usage: `${heapUsedMB} MB`,
      limit: `${heapTotalMB} MB`,
      percentage
    };
  } catch (error) {
    // Memory check is informational, don't fail health check
  }

  // Determine overall status
  const totalTime = Date.now() - startTime;
  
  // If main database is down, mark as unhealthy
  if (healthCheck.checks.database.status === 'down') {
    healthCheck.status = 'unhealthy';
  }
  // If response time is too slow, mark as degraded
  else if (totalTime > 5000 || (healthCheck.checks.database.responseTime && healthCheck.checks.database.responseTime > 3000)) {
    healthCheck.status = 'degraded';
  }

  // Return appropriate HTTP status code
  const statusCode = healthCheck.status === 'healthy' ? 200 : 
                     healthCheck.status === 'degraded' ? 200 : 503;

  return NextResponse.json(healthCheck, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
