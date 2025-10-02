import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const AI_API_BASE_URL = 'https://selamnew-ai.ienetworks.co';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Prepare context for the AI backend
    const contextData = context?.messages || [];
    
    // Limit context to last 10 messages to avoid token limits
    const limitedContext = contextData.slice(-10);

    // Forward the request to the AI backend with context
    const response = await axios.post(
      `${AI_API_BASE_URL}/copilot`,
      { 
        query,
        context: { messages: limitedContext }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Copilot API error:', error);
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.message || 'Failed to get response from AI' },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

