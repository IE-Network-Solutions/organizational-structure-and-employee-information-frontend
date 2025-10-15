/**
 * AI Feature Route Handlers
 * 
 * This file contains Next.js API route handlers for AI features.
 * These handlers are imported by the route files in /app/api/ai/
 * 
 * Architecture:
 * Browser → /app/api/ai/* → routes.ts (this file) → api.ts → AI Backend
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  handleCopilotRequest,
  handleOKRRequest,
  handleWeeklyPlanRequest,
  handleDailyPlanRequest,
} from './api';

/**
 * Copilot Route Handler
 * POST /api/ai/copilot
 */
export async function copilotRouteHandler(request: NextRequest) {
  const body = await request.json();
  const result = await handleCopilotRequest(body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}

/**
 * OKR Route Handler
 * POST /api/ai/okr
 */
export async function okrRouteHandler(request: Request) {
  const body = await request.json();
  const result = await handleOKRRequest(body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}

/**
 * Weekly Plan Route Handler
 * POST /api/ai/weekly-plan
 */
export async function weeklyPlanRouteHandler(request: Request) {
  const body = await request.json();
  const result = await handleWeeklyPlanRequest(body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}

/**
 * Daily Plan Route Handler
 * POST /api/ai/daily-plan
 */
export async function dailyPlanRouteHandler(request: Request) {
  const body = await request.json();
  const result = await handleDailyPlanRequest(body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}

