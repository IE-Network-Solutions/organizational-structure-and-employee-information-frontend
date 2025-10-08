import { NextResponse } from 'next/server';
import { AI_BASE_URL } from '@/utils/constants';



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resp = await fetch(`${AI_BASE_URL}/daily-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch daily plan suggestions' },
      { status: 500 },
    );
  }
}
