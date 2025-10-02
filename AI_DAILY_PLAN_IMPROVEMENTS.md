# AI Daily Plan Feature Improvements

## Summary of Changes

This document outlines the improvements made to the AI Planning Suggestion feature for Daily Plans.

## Changes Made

### 1. **AISuggestionsModal Component** (`components/ai/AISuggestionsModal.tsx`)

#### Added Weekly Plan Tasks Dropdown
- **Previous Behavior**: Users had to manually type the weekly plan task in a text area
- **New Behavior**: Users select from a dropdown of all available weekly plan tasks
- **Benefits**:
  - Eliminates typing errors
  - Shows all available weekly plan tasks
  - Includes search/filter functionality
  - Better user experience

#### Enhanced AI Prompt Generation
- **Key Change**: Combined Key Result and Weekly Plan as a single string sent to the AI
- **Format**: 
  ```
  Key Result: [Selected Key Result Title]
  Weekly Plan: [Selected Weekly Plan Task]
  ```
- **Benefits**:
  - Provides better context to the AI
  - More accurate daily task suggestions
  - Seamless integration of both planning levels

#### Auto-Fill Form Fields
- **Key Change**: AI-generated tasks now automatically populate form fields
- **Fields Populated**:
  - Task name (from AI suggestion title)
  - Weight (normalized to sum to 100)
  - Priority (from AI suggestion)
  - Target value (from AI suggestion or default 0)
- **Benefits**:
  - No manual data entry required
  - Consistent with "Add Plan Task" button behavior
  - Immediate visual feedback

#### Manual Task Approval (Fixed Implementation)
- **Key Change**: Uses exact same logic as weekly plans
- **Process**:
  - User clicks "Generate" button
  - AI generates suggestions and shows them in a list
  - User clicks "Add" button for each task they want to include
  - Tasks go through board form validation
  - handleAddName is called to add to names list and calculate weights
  - Board form is cleared after adding
  - Tasks appear in the numbered list (like existing tasks)
- **Benefits**:
  - User approval required - no automatic addition
  - Matches weekly plan behavior exactly
  - Proper weight calculation (no duplication)
  - Duplicate prevention prevents adding same tasks twice
  - User can selectively add only desired tasks

#### Weight Management
- **Key Change**: Daily plan weights automatically sum to 100
- **Logic**:
  - If AI provides weights: normalize to sum to 100
  - If no weights provided: distribute equally among tasks
  - Last task adjusted to ensure exact sum of 100
- **Benefits**:
  - Ensures valid daily plans
  - No manual weight adjustment needed
  - Matches business requirements

#### Type System Improvements
- Added `WeeklyPlanTask` type: `{ id: string; task: string }`
- Added `getWeeklyPlanTasks?: () => WeeklyPlanTask[]` prop
- State management updated to use `weeklyPlanTaskId` instead of `weeklyPlanText`

### 2. **Create Plan Component** (`app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/createPlan/index.tsx`)

#### Added Weekly Plan Tasks Provider
- Implemented `getWeeklyPlanTasks` function that:
  - Retrieves tasks from `planningPeriodHierarchy?.parentPlan?.plans`
  - Filters for unreported plans (`isReported === false`)
  - Maps tasks to `{ id, task }` format
  - Returns empty array for non-daily plans (weekly plans)

### 3. **Edit Plan Component** (`app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/editPlan/index.tsx`)

#### Same Improvements as Create Plan
- Added `getWeeklyPlanTasks` function with identical logic
- Ensures consistency between create and edit workflows

## Technical Details

### Data Flow for Daily Plans

1. **User Opens Daily Plan Creation**
   - Component fetches parent plan (Weekly Plan) data
   - Extracts all weekly tasks from unreported weekly plans

2. **User Opens AI Suggestion Modal**
   - Modal displays two dropdowns:
     - Key Result dropdown (from parent weekly plan's key results)
     - Weekly Plan dropdown (all tasks from parent weekly plan)

3. **User Selects Options**
   - Selects a Key Result to attach daily tasks to
   - Selects a Weekly Plan task as context

4. **AI Generation**
   - Combines: `"Key Result: [title]\nWeekly Plan: [task]"`
   - Sends combined prompt to AI service
   - AI returns daily task suggestions with weights normalized to sum to 100

5. **Manual Task Approval (Fixed Implementation)**
   - **FIXED**: Tasks are generated and shown in suggestions list
   - User must click "Add" button for each task they want to include
   - Uses exact same logic as weekly plans (no special daily plan handling)
   - Tasks go through board form validation then to names list
   - **NEW**: AI-added tasks now appear in the numbered task list
   - **NEW**: Tasks are marked with "AI" badge for easy identification
   - **NEW**: Proper numbering sequence (existing tasks + AI tasks)
   - Proper weight calculation (no duplication)
   - Duplicate prevention: won't add tasks that already exist
   - User has full control over which tasks to include
   - Process matches weekly plan behavior exactly

## User Experience Improvements

### Before
- ❌ Manual text input prone to errors
- ❌ No visibility of available weekly tasks
- ❌ Unclear what context to provide
- ❌ Key Result and Weekly Plan sent separately (less context)
- ❌ Tasks not properly auto-filled in form fields
- ❌ Weights don't sum to 100 for daily plans

### After
- ✅ Dropdown with all weekly plan tasks
- ✅ Search/filter functionality
- ✅ Clear visibility of available options
- ✅ Combined context sent to AI (better suggestions)
- ✅ "Generate" button disabled until both selections made
- ✅ Seamless "Add Plan Task" button functionality
- ✅ **AI-generated tasks auto-fill form fields (Task, Weight, Priority, Target)**
- ✅ **Daily plan weights automatically sum to 100**
- ✅ **Tasks appear immediately in the plan list after clicking "Add"**
- ✅ **FIXED: Manual task approval - user clicks "Add" for each task**
- ✅ **FIXED: "Generate" button shows suggestions for approval**
- ✅ **FIXED: Uses exact same logic as weekly plans**
- ✅ **FIXED: Proper weight calculation (no duplication)**
- ✅ **FIXED: Duplicate prevention - won't add same tasks twice**
- ✅ **FIXED: Matches weekly plan behavior exactly**
- ✅ **NEW: AI-added tasks appear in numbered task list**
- ✅ **NEW: Tasks marked with "AI" badge for identification**
- ✅ **NEW: Proper sequential numbering (existing + AI tasks)**

## Testing Recommendations

1. **Create Daily Plan**
   - Verify weekly tasks appear in dropdown
   - Verify search functionality works
   - Verify AI generates relevant suggestions
   - Verify "Add" button works correctly

2. **Edit Daily Plan**
   - Verify same functionality as create
   - Verify existing tasks are preserved

3. **Edge Cases**
   - No weekly tasks available
   - Multiple unreported weekly plans
   - Weekly plan with many tasks (scroll behavior)

## Future Enhancements (Optional)

- Show weekly task target values in dropdown
- Group weekly tasks by key result in dropdown
- Display weekly task priority/weight in dropdown options
- Add ability to select multiple weekly tasks for context

