# SelamNew Copilot UI Components

Production-ready Copilot UI for the SelamNew HR SaaS application. This is a modular, enterprise-grade interface designed for context-aware, role-based AI assistance.

## 🎯 Overview

The Copilot provides a natural language interface for interacting with SelamNew across three main modules:
- **Time & Attendance**
- **Employee & Organization**
- **OKR Management**

## 📁 Component Structure

```
copilot/
├── index.tsx              # Main entry component (manages state)
├── CopilotButton.tsx      # Header button trigger
├── CopilotPanel.tsx       # Main drawer panel container
├── CopilotHeader.tsx      # Panel header with title/close
├── CopilotMessages.tsx    # Message display component
├── CopilotInput.tsx       # Input area with send functionality
├── CopilotEmptyState.tsx # First-time experience with example prompts
└── README.md              # This file
```

## 🏗️ Architecture

### Component Hierarchy

```
Copilot (index.tsx)
├── CopilotButton (header trigger)
└── CopilotPanel (drawer)
    ├── CopilotHeader
    ├── CopilotMessages (or CopilotEmptyState)
    ├── CopilotInput
    └── Footer (security note)
```

### State Management

Currently, state is managed locally within `CopilotPanel`:
- `messages`: Array of conversation messages
- `inputValue`: Current input text
- `isLoading`: Loading state for async operations

**Future Enhancement**: Consider moving to a global store (Zustand) for:
- Cross-component message persistence
- Chat history management
- User preferences

## 🔌 Extension Points for AI Integration

### 1. Replace Mock Response Generator

**Location**: `CopilotPanel.tsx` → `generateMockResponse()`

**Current**:
```typescript
const generateMockResponse = useCallback((userQuery: string): string => {
  // Mock responses based on keywords
  return `Mock response...`;
}, []);
```

**Replace with**:
```typescript
const generateMockResponse = useCallback(async (userQuery: string, context: ChatContext) => {
  const response = await fetchCopilotResponse(userQuery, {
    messages: context.messages,
    userRole: userData?.role,
    tenantId: tenantId,
    module: detectModule(userQuery), // 'attendance' | 'employees' | 'okr'
  });
  
  return {
    text: response.text,
    metadata: {
      source: response.source, // e.g., 'Time & Attendance'
      confidence: response.confidence, // e.g., 'Based on attendance records'
    },
  };
}, []);
```

### 2. API Integration

**Expected API Signature**:
```typescript
interface CopilotRequest {
  query: string;
  context: {
    messages: Message[];
    userRole: string;
    tenantId: string;
    module?: 'attendance' | 'employees' | 'okr';
  };
}

interface CopilotResponse {
  text: string;
  metadata?: {
    source: string;
    confidence: string;
  };
  actions?: Array<{
    label: string;
    type: 'navigate' | 'execute' | 'show';
    payload: any;
  }>;
}

async function fetchCopilotResponse(
  request: CopilotRequest
): Promise<CopilotResponse>
```

**Integration Point**: `CopilotPanel.tsx` → `handleSend()`

Replace the mock delay and response with:
```typescript
const response = await fetchCopilotResponse({
  query: userInput,
  context: {
    messages: messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    userRole: userData?.role,
    tenantId: tenantId,
  },
});
```

### 3. Message Metadata

**Location**: `CopilotMessages.tsx` → `Message` interface

The `Message` interface already supports metadata:
```typescript
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'copilot';
  timestamp: Date;
  metadata?: {
    source?: string;      // Data source (e.g., 'Time & Attendance')
    confidence?: string;  // Confidence cue (e.g., 'Based on attendance records')
  };
}
```

**Future Extensions**:
- Add `insights?: Array<{ type: 'at-risk' | 'on-track', text: string }>`
- Add `actions?: Array<ActionButton>`
- Add `structuredData?: { type: 'table' | 'chart', data: any }`

### 4. Structured Content Rendering

**Location**: `CopilotMessages.tsx` → `renderMessageContent()`

Currently renders plain text. Extend to support:
- **Bullet summaries**: Parse markdown lists
- **Highlighted insights**: Detect ⚠️ At risk, ✅ On track patterns
- **Action buttons**: Render actionable suggestions
- **Charts/Tables**: Render structured data visualizations

**Example Extension**:
```typescript
const renderMessageContent = (message: Message) => {
  if (message.metadata?.structuredData) {
    return <StructuredDataRenderer data={message.metadata.structuredData} />;
  }
  
  if (message.metadata?.actions) {
    return (
      <>
        <Text>{message.text}</Text>
        <ActionButtons actions={message.metadata.actions} />
      </>
    );
  }
  
  return <Text>{message.text}</Text>;
};
```

### 5. Role-Based Access Control

**Location**: `CopilotPanel.tsx` → `handleSend()`

Add RBAC checks before processing queries:
```typescript
const hasPermission = checkPermission(userQuery, userRole);
if (!hasPermission) {
  addMessage({
    text: 'You do not have permission to access this information.',
    sender: 'copilot',
  });
  return;
}
```

## 🎨 Design Principles

### Enterprise-Grade Styling
- **Colors**: Neutral grays, subtle blues for user messages
- **Shadows**: Soft, professional shadows (not flashy)
- **Spacing**: Generous padding, clear hierarchy
- **Typography**: Clean, readable fonts

### Accessibility
- Keyboard navigation (Enter to send)
- ARIA labels on interactive elements
- Focus management
- Screen reader friendly

### Responsive Design
- Desktop: 400px width
- Tablet: 380px width
- Mobile: Full width

## 🔐 Security & Trust UX

The UI includes subtle trust indicators:
- Footer note: "Responses are role-aware and based on system data"
- Metadata tags showing data source
- Confidence cues in responses

**Future**: Add audit logging, query validation, rate limiting.

## 🧪 Testing

### Component Tests
Each component includes `data-cy` attributes for Cypress/E2E testing:
- `copilot-button`
- `copilot-panel`
- `copilot-input`
- `copilot-send-button`
- `copilot-message-{id}`
- `copilot-example-prompt-{category}-{prompt}`

### Mock Data
Currently uses mock responses for development. Replace with actual API calls in production.

## 📝 Usage Example

```tsx
import Copilot from '@/components/copilot';

// In your header component
<Copilot />
```

The component handles all state management internally. No props required.

## 🚀 Future Enhancements

1. **Chat History**: Persist conversations across sessions
2. **Multi-turn Context**: Better conversation flow handling
3. **Voice Input**: Speech-to-text integration
4. **Export Conversations**: Download chat history
5. **Customizable Prompts**: User-defined quick actions
6. **Analytics**: Track usage patterns, popular queries
7. **Multi-language**: Internationalization support

## 📚 Related Files

- AI Service: `@/utils/aiService` (for API integration)
- Authentication: `@/store/uistate/features/authentication`
- Employee Data: `@/store/server/features/employees`

## ⚠️ Important Notes

- **No AI Logic**: This is UI-only. All AI logic should be handled by the backend API.
- **Mock Data**: Current responses are placeholders. Clearly marked in code.
- **Security**: Never expose sensitive data in client-side code. All data access should go through authenticated API calls.
- **Performance**: Consider message pagination for long conversations.
