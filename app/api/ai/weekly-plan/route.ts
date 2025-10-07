import { NextResponse } from 'next/server';

const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_BASE_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const resp = await fetch(`${AI_BASE_URL}/weekly-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // Ensure no caching while experimenting
      cache: 'no-store',
    });

    const data = await resp.json().catch(() => ({}));

    return NextResponse.json(data, { status: resp.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch weekly plan suggestions' },
      { status: 500 },
    );
  }
}
