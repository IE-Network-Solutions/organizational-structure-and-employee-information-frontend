import { NextRequest, NextResponse } from 'next/server';
import {
  copilotRouteHandler,
  okrRouteHandler,
  weeklyPlanRouteHandler,
  dailyPlanRouteHandler,
} from '@/store/server/features/ai/routes';

/**
 * Unified AI API Route Handler
 * 
 * This single route file handles all AI endpoints using Next.js dynamic routes.
 * Endpoints:
 * - POST /api/ai/copilot
 * - POST /api/ai/okr
 * - POST /api/ai/weekly-plan
 * - POST /api/ai/daily-plan
 */

export async function POST(
  request: NextRequest,
  { params }: { params: { endpoint: string } }
) {
  const endpoint = params.endpoint;

  // Route to appropriate handler based on endpoint
  switch (endpoint) {
    case 'copilot':
      return copilotRouteHandler(request);
    
    case 'okr':
      return okrRouteHandler(request);
    
    case 'weekly-plan':
      return weeklyPlanRouteHandler(request);
    
    case 'daily-plan':
      return dailyPlanRouteHandler(request);
    
    default:
      return NextResponse.json(
        { error: `Unknown AI endpoint: ${endpoint}` },
        { status: 404 }
      );
  }
}

