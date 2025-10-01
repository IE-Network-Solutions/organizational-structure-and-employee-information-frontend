# AI OKR Integration - Implementation Guide

## Overview
This document describes the implementation of AI-powered Key Result suggestions for the OKR feature, aligned with the SelamNew AI API.

## Architecture

### Frontend Components

#### 1. OKRSuggestionsModal Component
**Location**: `components/ai/OKRSuggestionsModal.tsx`

**Features**:
- ✅ Accordion-style UI using Ant Design's `Collapse` component
- ✅ Auto-generation on modal open
- ✅ Weight validation (ensures total = 100%)
- ✅ Metric type mapping (API format → internal format)
- ✅ Visual feedback with ThunderboltFilled icon
- ✅ Expandable/collapsible suggestion panels
- ✅ One-click "Add" button per suggestion

**Props**:
```typescript
interface OKRSuggestionsModalProps {
  objectiveTitle: string;
  addKeyResult: (keyType: string, metricTypeId: string, suggestion?: Partial<KeyResultSuggestion>) => void;
  getCurrentTotalWeight: () => number;
  metrics: any;
}
```

**Usage**:
```tsx
<OKRSuggestionsModal
  objectiveTitle={objectiveValue?.title || ''}
  addKeyResult={addKeyResult}
  getCurrentTotalWeight={getCurrentTotalWeight}
  metrics={metrics}
/>
```

#### 2. AI Service Layer
**Location**: `utils/aiService.ts`

**Type Definitions**:
```typescript
export type KeyResultSuggestion = {
  title: string;
  metric_type: string;
  weight: number;
  initial_value?: number;
  target_value?: number;
};
```

**API Function**:
```typescript
export async function fetchOKRKeyResultSuggestions(objective: string): Promise<KeyResultSuggestion[]>
```

### Backend API Routes

#### OKR Endpoint
**Location**: `app/api/ai/okr/route.ts`

**Configuration**:
- Base URL: `https://selamnew-ai.ienetworks.co`
- Endpoint: `/okr`
- Method: POST
- Cache: Disabled (`cache: 'no-store'`)

**Request Format**:
```json
{
  "objective": "string"
}
```

**Response Format**:
```json
{
  "answer": {
    "Key Results": [
      {
        "title": "string",
        "metric_type": "string",
        "weight": number,
        "initial_value": number,
        "target_value": number
      }
    ]
  }
}
```

## API Integration Details

### 1. OKR Key Results Generation

**Endpoint**: `/okr`

**Request Body**:
```json
{
  "objective": "Add AI features to SelamNew Workspaces"
}
```

**Example Response**:
```json
{
  "answer": {
    "Key Results": [
      {
        "title": "Finalize UI Design",
        "metric_type": "achieved",
        "weight": 0.3
      },
      {
        "title": "Complete Test Deployment",
        "metric_type": "numeric",
        "weight": 0.3,
        "initial_value": 0,
        "target_value": 100
      }
    ]
  }
}
```

### 2. Weekly Plan Generation

**Endpoint**: `/weekly-plan`
**Location**: `app/api/ai/weekly-plan/route.ts`

**Request Body**:
```json
{
  "key_result": "Prepare data pipeline for AI MVP"
}
```

**Response**:
```json
{
  "weekly_plan": {
    "WeeklyTasks": [
      {
        "title": "Identify Data Sources",
        "target": 3,
        "weight": 10,
        "priority": "high"
      }
    ]
  }
}
```

### 3. Daily Plan Generation

**Endpoint**: `/daily-plan`
**Location**: `app/api/ai/daily-plan/route.ts`

**Request Body**:
```json
{
  "weekly_plan": "Finalize 20% ETL pipeline"
}
```

**Response**:
```json
{
  "daily_plan": {
    "DailyTasks": [
      {
        "title": "Ingest raw data",
        "weight": 1,
        "priority": "high"
      }
    ]
  }
}
```

## Metric Type Mapping

The component handles mapping between API metric types and internal system types:

### API → Internal Mapping
```typescript
const metricTypeMapping = {
  'numeric': 'Numeric',
  'percentage': 'Percentage',
  'currency': 'Currency',
  'milestone': 'Milestone',
  'achieved': 'Achieved',
  'achieve': 'Achieved',
};
```

### Internal → Database Mapping
```typescript
const metricNameMapping = {
  'Milestone': 'Milestone',
  'Currency': 'Currency',
  'Numeric': 'Numeric',
  'Percentage': 'Percentage',
  'Achieved': 'Achieve',
};
```

## Weight Normalization

The component automatically normalizes weights to ensure they sum to 100%:

1. **Convert decimals to percentages**: `0.3` → `30%`
2. **Proportional adjustment**: If sum ≠ 100, adjust proportionally
3. **Rounding correction**: Handle rounding errors to ensure exact 100%

```typescript
// Example: API returns weights [0.3, 0.3, 0.4]
// After normalization: [30, 30, 40] = 100%
```

## User Flow

### Creating OKR with AI Suggestions

1. **User opens OKR creation modal**
   - Located in: `app/(afterLogin)/(okrplanning)/okr/_components/okrDrawer/index.tsx`

2. **User enters objective title**
   - Example: "Increase customer satisfaction"

3. **User clicks "AI Suggestions" button**
   - Button displays ThunderboltFilled icon
   - Modal opens with auto-generation

4. **AI generates Key Results**
   - API call to `/api/ai/okr`
   - Returns 3-5 Key Result suggestions
   - Weights automatically normalized to 100%

5. **User reviews suggestions in Accordion UI**
   - Each suggestion displayed in collapsible panel
   - Shows: Title, Weight, Metric Type, Initial/Target values
   - Visual indicators: Tags with colors

6. **User adds desired suggestions**
   - Click "Add" button on any suggestion
   - System validates total weight doesn't exceed 100%
   - Key Result added to form with pre-filled values

7. **User submits OKR**
   - All Key Results validated (sum must = 100%)
   - OKR created with AI-suggested Key Results

## Integration Points

### 1. OKR Drawer (Create)
**File**: `app/(afterLogin)/(okrplanning)/okr/_components/okrDrawer/index.tsx`
**Line**: 528-533

```tsx
<OKRSuggestionsModal
  objectiveTitle={objectiveValue?.title || ''}
  addKeyResult={addKeyResult}
  getCurrentTotalWeight={getCurrentTotalWeight}
  metrics={metrics}
/>
```

### 2. Edit Objective
**File**: `app/(afterLogin)/(okrplanning)/okr/_components/dashboard/editObjective/index.tsx`
**Line**: 517-522

```tsx
<OKRSuggestionsModal
  objectiveTitle={objectiveValue?.title || ''}
  addKeyResult={addKeyResult}
  getCurrentTotalWeight={getCurrentTotalWeight}
  metrics={metrics}
/>
```

## Error Handling

### Frontend Validation
- ✅ Objective title required before generation
- ✅ Weight overflow prevention (can't exceed 100%)
- ✅ Empty response handling

### API Error Handling
```typescript
try {
  const results = await fetchOKRKeyResultSuggestions(objectiveTitle);
  // Process results...
} catch (error) {
  NotificationMessage.error({
    message: 'Failed to generate key result suggestions',
  });
}
```

### Backend Error Handling
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resp = await fetch(`${AI_BASE_URL}/okr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    
    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch OKR key result suggestions' },
      { status: 500 },
    );
  }
}
```

## UI/UX Features

### Accordion Design
- **Collapsed State**: Shows "AI Key Result Suggestion" with Add button
- **Expanded State**: Shows full details (title, weight, type, values)
- **Visual Design**: 
  - Gradient background (indigo-50 to blue-50)
  - ThunderboltFilled icon for AI branding
  - Color-coded tags for different attributes
  - Smooth expand/collapse animations

### Accessibility
- ✅ Keyboard navigation support (Collapse component)
- ✅ Clear visual feedback on hover
- ✅ Disabled state when objective not entered
- ✅ Loading indicators during API calls

## Testing

### Manual Testing Checklist
- [ ] Open OKR creation modal
- [ ] Enter objective title
- [ ] Click "AI Suggestions" button
- [ ] Verify auto-generation on modal open
- [ ] Verify suggestions display in accordion format
- [ ] Expand/collapse suggestion panels
- [ ] Verify weight totals to 100%
- [ ] Add a suggestion to Key Results list
- [ ] Verify weight validation works
- [ ] Try to exceed 100% weight limit
- [ ] Verify error messages display correctly
- [ ] Regenerate suggestions
- [ ] Submit OKR with AI-suggested Key Results

### cURL Testing
```bash
# Test OKR endpoint directly
curl -X POST "https://selamnew-ai.ienetworks.co/okr" \
  -H "Content-Type: application/json" \
  -d '{
    "objective": "Add AI features to SelamNew Workspaces"
  }'
```

## Future Enhancements

### Planned Features
1. **Suggestion History**: Save previously generated suggestions
2. **Custom Weight Adjustment**: Allow users to adjust weights before adding
3. **Batch Add**: Add multiple suggestions at once
4. **Suggestion Feedback**: Rate suggestion quality
5. **Context-Aware Suggestions**: Consider existing Key Results

### Additional API Integrations
1. **Copilot**: Integrate `/copilot` endpoint for help/guidance
2. **Weekly Planning**: Connect with `/weekly-plan` for Key Result breakdown
3. **Daily Planning**: Connect with `/daily-plan` for task generation

## Configuration

### Environment Variables
```env
# Not currently required, but recommended for future
NEXT_PUBLIC_AI_API_URL=https://selamnew-ai.ienetworks.co
```

### API Base URL
**Current**: Hardcoded in route files
**Location**: `app/api/ai/*/route.ts`
```typescript
const AI_BASE_URL = 'https://selamnew-ai.ienetworks.co';
```

## Security Considerations

### Current State
- ✅ API calls proxied through Next.js API routes (prevents CORS)
- ✅ No authentication required (as per API spec)
- ⚠️ No rate limiting implemented
- ⚠️ No request validation

### Future Security Enhancements
```typescript
// Future: Add authentication
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // As mentioned in API docs
}
```

## Troubleshooting

### Common Issues

**Issue**: AI Suggestions button is disabled
- **Solution**: Ensure objective title field is filled

**Issue**: No suggestions generated
- **Solution**: Check browser console for API errors
- **Solution**: Test endpoint directly with cURL

**Issue**: Weight total exceeds 100%
- **Solution**: Check weight normalization logic
- **Solution**: Verify API response format

**Issue**: Metric type not recognized
- **Solution**: Check metric type mapping in `metricTypeMapping`
- **Solution**: Verify metrics are loaded from backend

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check network tab for request/response details
4. Review this documentation
5. Contact AI team for API-related issues

## Version History

### v1.0 (Current)
- ✅ Accordion UI implementation
- ✅ OKR Key Result generation
- ✅ Weight normalization
- ✅ Metric type mapping
- ✅ Integration with OKR create/edit flows

### Planned v1.1
- Suggestion history
- Batch operations
- Enhanced error messages
- Performance optimizations


