# AI Response Components

This directory contains components for displaying AI-generated responses in a professional and user-friendly manner.

## Components

### 1. `AIResponseFormatter`

A versatile component that formats AI responses, especially structured content like step-by-step instructions.

**Features:**

- Automatically detects and formats OKR creation instructions
- Supports both compact (chat) and full display modes
- Parses numbered steps and formats them with icons
- Includes action buttons for navigation
- Responsive design for mobile and desktop

**Usage:**

```tsx
import AIResponseFormatter from '@/components/ai/AIResponseFormatter';

// In chat context (compact mode)
<AIResponseFormatter
  response={aiResponse}
  compact={true}
  onActionClick={(action) => handleAction(action)}
/>

// Full display mode
<AIResponseFormatter
  response={aiResponse}
  compact={false}
  onActionClick={(action) => handleAction(action)}
/>
```

### 2. `OKRInstructionsDisplay`

A comprehensive component specifically designed for displaying OKR creation instructions.

**Features:**

- Professional card-based layout
- Step-by-step instructions with icons
- Action buttons for quick navigation
- Pro tips and additional guidance
- Fully responsive design

**Usage:**

```tsx
import OKRInstructionsDisplay from '@/components/ai/OKRInstructionsDisplay';

<OKRInstructionsDisplay
  instructionText={backendResponse}
  title="How to Create OKR"
  showAsCard={true}
  onActionClick={(action) => handleNavigation(action)}
/>;
```

### 3. `OKRInstructionsDemo`

A demo component showcasing both display formats with sample data.

**Usage:**

```tsx
import OKRInstructionsDemo from '@/components/ai/OKRInstructionsDemo';

<OKRInstructionsDemo />;
```

## Integration with ChatBot

The `ChatBot` component has been updated to use `AIResponseFormatter` for better display of AI responses:

```tsx
// Bot messages now use formatted display
{
  message.sender === 'bot' ? (
    <AIResponseFormatter
      response={message.text}
      compact={true}
      onActionClick={(action) => handleAction(action)}
    />
  ) : (
    message.text
  );
}
```

## Backend Response Format

The components work best with responses that follow this structure:

```
How to create OKR
To create an OKR, follow these steps:
1. **Go to the OKR Dashboard**: Access the dashboard where you can manage your objectives and key results.
2. **Click "My OKR"**: Select this option to view your personal objectives and key results.
3. **Click "Set Objective"**: This will allow you to create and define a new objective for your OKR plan.
4. **Define Your Objective**: Clearly state what you want to achieve. Make sure it is specific, measurable, achievable, relevant, and time-bound (SMART).
5. **Add Key Results**: For each objective, define key results that will help measure your progress. Key results should also be specific and quantifiable.
6. **Save Your OKR**: Once you have defined your objective and key results, save your OKR to keep track of your goals.
```

## Action Handling

Both components support action callbacks for navigation:

```tsx
const handleActionClick = (action: string) => {
  switch (action) {
    case 'go-to-dashboard':
      router.push('/okr/dashboard');
      break;
    case 'view-my-okr':
      router.push('/okr');
      break;
    case 'create-objective':
      // Open objective creation modal
      break;
    default:
  }
};
```

## Styling

The components use Tailwind CSS classes and Ant Design components for consistent styling with the rest of the application. Custom CSS modules are provided for additional styling needs.

## Mobile Responsiveness

All components are fully responsive and adapt to different screen sizes:

- Compact layouts on mobile devices
- Touch-friendly buttons and interactions
- Optimized spacing and typography
- Scrollable content areas where needed
