import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const AI_API_BASE_URL = 'https://selamnew-ai.ienetworks.co';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context, memory, top_k: topK, userInfo, usage } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Prepare context for the AI backend
    const contextData = context?.messages || [];

    // Limit context to last 10 messages to avoid token limits
    const limitedContext = contextData.slice(-10);

    // Prepare enhanced payload with copilot usage information
    const payload = {
      query,
      memory: memory || [],
      top_k: topK || 3,
      context: { messages: limitedContext },
      // Include user context for personalized responses
      userInfo: userInfo
        ? {
            userId: userInfo.userId,
            tenantId: userInfo.tenantId,
            role: userInfo.role,
            timestamp: new Date().toISOString(),
          }
        : undefined,
      // Track copilot usage analytics
      usage: usage
        ? {
            sessionId: usage.sessionId,
            chatId: usage.chatId,
            messageCount: usage.messageCount,
            feature: 'chatbot',
            timestamp: new Date().toISOString(),
          }
        : undefined,
    };

    // Forward the request to the AI backend with enhanced payload
    const response = await axios.post(`${AI_API_BASE_URL}/copilot`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    // Log error for debugging (consider using a proper logging service in production)
    // console.error('Copilot API error:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error:
            error.response?.data?.message || 'Failed to get response from AI',
        },
        { status: error.response?.status || 500 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
