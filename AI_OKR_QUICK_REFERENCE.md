# AI OKR Integration - Quick Reference Card

## 🚀 Quick Start

### For Developers

**Component Location**: `components/ai/OKRSuggestionsModal.tsx`

**Basic Usage**:
```tsx
import OKRSuggestionsModal from '@/components/ai/OKRSuggestionsModal';

<OKRSuggestionsModal
  objectiveTitle="Improve customer satisfaction"
  addKeyResult={addKeyResult}
  getCurrentTotalWeight={getCurrentTotalWeight}
  metrics={metrics}
/>
```

## 📋 API Endpoints

### Production Endpoints

| Endpoint | Method | Purpose | Request Body |
|----------|--------|---------|--------------|
| `/api/ai/okr` | POST | Generate Key Results | `{ objective: string }` |
| `/api/ai/weekly-plan` | POST | Generate weekly tasks | `{ key_result: string }` |
| `/api/ai/daily-plan` | POST | Generate daily tasks | `{ weekly_plan: string }` |

### Backend URL
```
https://selamnew-ai.ienetworks.co
```

## 🎨 UI Components

### Accordion Implementation
```tsx
<Collapse accordion={false} bordered={false}>
  <Panel header={/* Suggestion Header */}>
    {/* Suggestion Content */}
  </Panel>
</Collapse>
```

### Key Features
- ✅ **Expandable Panels**: Each suggestion in a collapsible panel
- ✅ **Visual Icons**: ThunderboltFilled for AI branding
- ✅ **Color-Coded Tags**: Different colors for different attributes
- ✅ **One-Click Add**: Add button in each panel header

## 🔧 Key Functions

### 1. Fetch OKR Suggestions
```typescript
import { fetchOKRKeyResultSuggestions } from '@/utils/aiService';

const suggestions = await fetchOKRKeyResultSuggestions(objectiveTitle);
// Returns: KeyResultSuggestion[]
```

### 2. Weight Normalization
```typescript
// Converts API weights (0.3) to percentages (30%)
// Ensures total = 100%
const normalizedResults = results.map(r => ({
  ...r,
  weight: r.weight <= 1 ? Math.round(r.weight * 100) : Math.round(r.weight),
}));
```

### 3. Metric Type Mapping
```typescript
const metricTypeMapping = {
  'numeric': 'Numeric',
  'percentage': 'Percentage',
  'currency': 'Currency',
  'milestone': 'Milestone',
  'achieved': 'Achieved',
};
```

## 🎯 Type Definitions

### KeyResultSuggestion
```typescript
export type KeyResultSuggestion = {
  title: string;           // Key Result title
  metric_type: string;     // Type: numeric, percentage, etc.
  weight: number;          // Weight percentage (0-100)
  initial_value?: number;  // Optional: starting value
  target_value?: number;   // Optional: target value
};
```

### OKRResponse
```typescript
type OKRResponse = {
  answer?: {
    'Key Results'?: KeyResultSuggestion[];
  };
};
```

## ⚡ Common Tasks

### Add AI Suggestions to Existing Form

**Step 1**: Import the component
```tsx
import OKRSuggestionsModal from '@/components/ai/OKRSuggestionsModal';
```

**Step 2**: Add to your JSX
```tsx
<div className="flex gap-2">
  <OKRSuggestionsModal
    objectiveTitle={formValues.title}
    addKeyResult={handleAddKeyResult}
    getCurrentTotalWeight={getTotalWeight}
    metrics={metricsData}
  />
  <Button>Manual Add</Button>
</div>
```

**Step 3**: Implement required functions
```tsx
const handleAddKeyResult = (keyType: string, metricTypeId: string, suggestion?: any) => {
  // Add key result to your form state
};

const getTotalWeight = () => {
  // Calculate and return current total weight
  return keyResults.reduce((sum, kr) => sum + kr.weight, 0);
};
```

## 🎨 Styling Guide

### Button Styling
```tsx
<Button 
  type="primary" 
  ghost 
  icon={<ThunderboltFilled />}
  className="flex items-center gap-1"
>
  AI Suggestions
</Button>
```

### Panel Styling
```tsx
<Panel
  className="mb-2 border rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50"
  style={{ 
    borderColor: '#e0e7ff',
    overflow: 'hidden'
  }}
>
```

### Tag Colors
- **Weight**: `color="blue"`
- **Type**: `color="purple"`
- **Initial**: `color="cyan"`
- **Target**: `color="green"`

## 🔍 Debugging

### Check API Response
```typescript
console.log('API Response:', await fetchOKRKeyResultSuggestions('Test Objective'));
```

### Verify Weight Calculation
```typescript
console.log('Current Total Weight:', getCurrentTotalWeight());
console.log('After Adding:', getCurrentTotalWeight() + suggestion.weight);
```

### Check Metric Mapping
```typescript
console.log('Available Metrics:', metrics?.items?.map(m => m.name));
```

## ⚠️ Validation Rules

### Weight Validation
- ✅ Individual weights: 0-100%
- ✅ Total weight must equal 100% before submission
- ✅ Cannot add suggestion if total would exceed 100%

### Required Fields
- ✅ Objective title (for generation)
- ✅ Metric type (for each key result)
- ✅ Weight (for each key result)

### Milestone Validation
- ✅ Must have at least 1 milestone
- ✅ Milestone weights must sum to 100%
- ✅ Each milestone must have a title

## 📦 Dependencies

### NPM Packages
```json
{
  "antd": "^5.x",
  "axios": "^1.x",
  "react": "^18.x",
  "next": "^14.x"
}
```

### Icons Used
```tsx
import { ThunderboltFilled, PlusOutlined } from '@ant-design/icons';
```

## 🧪 Testing Commands

### Test API Directly
```bash
# Test OKR endpoint
curl -X POST "https://selamnew-ai.ienetworks.co/okr" \
  -H "Content-Type: application/json" \
  -d '{"objective": "Test Objective"}'

# Test Weekly Plan
curl -X POST "https://selamnew-ai.ienetworks.co/weekly-plan" \
  -H "Content-Type: application/json" \
  -d '{"key_result": "Test Key Result"}'

# Test Daily Plan
curl -X POST "https://selamnew-ai.ienetworks.co/daily-plan" \
  -H "Content-Type: application/json" \
  -d '{"weekly_plan": "Test Weekly Plan"}'
```

## 🐛 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Button disabled | No objective title | Enter objective title first |
| Empty suggestions | API error | Check network tab, verify endpoint |
| Weight overflow | Total > 100% | Remove some key results |
| Type mismatch | Metric not found | Ensure metrics loaded |

## 📱 Responsive Design

### Mobile Considerations
- ✅ Modal width adjusts automatically
- ✅ Tags wrap on small screens
- ✅ Buttons stack vertically if needed
- ✅ Accordion works seamlessly on touch

### Desktop Features
- ✅ Wider modal (800px)
- ✅ Side-by-side layout
- ✅ Hover effects on panels
- ✅ Smooth animations

## 🔗 Related Files

### Frontend
```
components/ai/OKRSuggestionsModal.tsx
components/ai/AISuggestionsModal.tsx
utils/aiService.ts
```

### Backend API Routes
```
app/api/ai/okr/route.ts
app/api/ai/weekly-plan/route.ts
app/api/ai/daily-plan/route.ts
```

### Integration Points
```
app/(afterLogin)/(okrplanning)/okr/_components/okrDrawer/index.tsx
app/(afterLogin)/(okrplanning)/okr/_components/dashboard/editObjective/index.tsx
```

## 💡 Pro Tips

1. **Auto-Generation**: Modal auto-generates on open if objective is set
2. **Weight Handling**: Always normalized to percentages
3. **Metric Mapping**: Handles API → Internal → Database mapping
4. **Error States**: Graceful fallback for empty or error responses
5. **Performance**: Uses `cache: 'no-store'` for fresh suggestions

## 📞 Support Contacts

- **Frontend Issues**: Check browser console & network tab
- **API Issues**: Contact AI team
- **Integration Help**: Review implementation guide
- **Bug Reports**: Include API response + console logs

---

**Last Updated**: October 2025
**Version**: 1.0
**Status**: ✅ Production Ready


