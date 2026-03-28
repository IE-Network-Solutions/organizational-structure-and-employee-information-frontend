import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_AI_BASE_URL || 'https://selamnew-ai.ienetworks.co';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data } = await axios.post(`${BASE_URL}/daily-plan`, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 120_000,
    });
    return NextResponse.json(data);
  } catch (e: unknown) {
    const err = e as {
      response?: { status?: number; data?: unknown };
      message?: string;
    };
    const status = err.response?.status ?? 502;
    const payload = err.response?.data;
    return NextResponse.json(
      typeof payload === 'object' && payload !== null
        ? payload
        : { message: err.message || 'Daily plan AI request failed' },
      { status },
    );
  }
}
