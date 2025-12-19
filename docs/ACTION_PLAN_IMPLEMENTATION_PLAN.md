# Action Plan Source Type Support - Phase-by-Phase Implementation Plan

## 📋 Overview
This document outlines the step-by-step implementation plan for integrating Action Plan source type support (MEETING and SURVEY) into the frontend.

---

## 🎯 Phase 1: Type Definitions & Interfaces
**Goal:** Establish type safety foundation for source types

### Tasks:
1. **Add ActionPlanSourceType Enum**
   - **File:** `types/enumTypes.ts`
   - **Action:** Add new enum after `ActionPlanStatus` enum (around line 13)
   ```typescript
   export enum ActionPlanSourceType {
     MEETING = 'MEETING',
     SURVEY = 'SURVEY',
   }
   ```

2. **Create/Update ActionPlan Interface**
   - **File:** Create `types/action-plan/index.ts` OR update existing interface file
   - **Action:** Define complete ActionPlan interface with source fields
   ```typescript
   import { ActionPlanSourceType } from '@/types/enumTypes';
   import { ActionPlanStatus } from '@/types/enumTypes';

   export interface ActionPlan {
     id: string;
     issue?: string;
     actionToBeTaken?: string;
     description: string;
     responsiblePerson: string[];
     responsibleUsers?: Array<{ responsibleId: string }>;
     status: ActionPlanStatus | string;
     priority: string;
     deadline: string;
     formId?: string | null;
     sourceType: ActionPlanSourceType; // NEW - required
     sourceId?: string; // NEW - optional
     sourceName?: string; // NEW - optional
     tenantId: string;
     createdAt: string;
     updatedAt: string;
     deletedAt?: string | null;
   }
   ```

### Deliverables:
- ✅ `ActionPlanSourceType` enum added to `types/enumTypes.ts`
- ✅ `ActionPlan` interface created/updated with source fields
- ✅ Types exported and accessible

### Testing:
- [ ] Verify enum values match backend (`MEETING`, `SURVEY`)
- [ ] Check TypeScript compilation passes
- [ ] Ensure no breaking changes to existing code

---

## 🔌 Phase 2: API Service Updates
**Goal:** Update API methods to support source type filtering

### Tasks:
1. **Update getAllActionPlan Function**
   - **File:** `store/server/features/CFR/meeting/action-plan/queries.ts`
   - **Location:** Lines 32-54
   - **Action:** 
     - Change endpoint from `/meeting-action-plans` to `/action-plans`
     - Add optional `sourceType` parameter
     - Add `sourceType` to query params conditionally
   ```typescript
   const getAllActionPlan = async (
     pageSizeAction: number,
     currentAction: number,
     empId: string | null,
     priority: string | null,
     status: string | null,
     startAt: string | null,
     endAt: string | null,
     sourceType?: string | null, // NEW parameter
   ) => {
     const token = await getCurrentToken();
     const tenantId = useAuthenticationStore.getState().tenantId;
     const userId = empId || useAuthenticationStore.getState().userId;

     // Build query params
     const params = new URLSearchParams({
       limit: pageSizeAction.toString(),
       page: currentAction.toString(),
       userId: userId,
     });

     if (priority) params.append('priority', priority);
     if (status) params.append('status', status);
     if (startAt) params.append('completionStartDate', startAt);
     if (endAt) params.append('completionEndDate', endAt);
     if (sourceType) params.append('sourceType', sourceType); // NEW

     return crudRequest({
       url: `${ORG_DEV_URL}/action-plans?${params.toString()}`, // Changed endpoint
       method: 'GET',
       headers: {
         Authorization: `Bearer ${token}`,
         tenantId: tenantId,
       },
     });
   };
   ```

2. **Update useGetAllActionPlan Hook**
   - **File:** Same file, lines 65-99
   - **Action:** Add `sourceType` parameter to hook signature and query key
   ```typescript
   export const useGetAllActionPlan = (
     pageSizeAction: number,
     currentAction: number,
     empId: string | null,
     priority: string | null,
     status: string | null,
     startAt: string | null,
     endAt: string | null,
     sourceType?: string | null, // NEW parameter
   ) => {
     return useQuery<any>(
       [
         'action-plans', // Updated query key
         pageSizeAction,
         currentAction,
         empId,
         priority,
         status,
         startAt,
         endAt,
         sourceType, // NEW - add to query key
       ],
       () =>
         getAllActionPlan(
           pageSizeAction,
           currentAction,
           empId,
           priority,
           status,
           startAt,
           endAt,
           sourceType, // NEW
         ),
     );
   };
   ```

### Deliverables:
- ✅ `getAllActionPlan` function updated with new endpoint and sourceType param
- ✅ `useGetAllActionPlan` hook updated with sourceType support
- ✅ Query key includes sourceType for proper cache invalidation
- ✅ Backward compatibility maintained (sourceType is optional)

### Testing:
- [ ] Test API call without sourceType (should work as before)
- [ ] Test API call with `sourceType=MEETING`
- [ ] Test API call with `sourceType=SURVEY`
- [ ] Verify query key changes trigger refetch
- [ ] Check network tab for correct endpoint and params

---

## 🎨 Phase 3: UI Filter Implementation
**Goal:** Add source type filter to the action plan list page

### Tasks:
1. **Add Source Type Filter State**
   - **File:** `app/(afterLogin)/(feedback)/feedback/action-plan/page.tsx`
   - **Location:** Around line 165 (after other Form.useWatch calls)
   - **Action:** Add sourceType form watch
   ```typescript
   const sourceType = Form.useWatch('sourceType', form) || null;
   ```

2. **Add Source Type Filter UI (Desktop)**
   - **File:** Same file
   - **Location:** After line 287 (after Status filter, before Date Range)
   - **Action:** Add new Form.Item for source type filter
   ```typescript
   <Form.Item
     name="sourceType"
     className={isMobile ? 'col-span-12' : 'col-span-3 m-0'}
     data-cy="feedback-action-plan-page-form-item-source-type"
     id="feedback-action-plan-page-form-item-source-type"
   >
     <Select 
       allowClear 
       className="h-12" 
       placeholder="Select source type"
       data-cy="feedback-action-plan-page-select-source-type"
       id="feedback-action-plan-page-select-source-type"
     >
       <Option value="MEETING" data-cy="feedback-action-plan-page-option-source-meeting">
         Meeting
       </Option>
       <Option value="SURVEY" data-cy="feedback-action-plan-page-option-source-survey">
         Survey
       </Option>
     </Select>
   </Form.Item>
   ```

3. **Add Source Type Filter UI (Mobile Modal)**
   - **File:** Same file
   - **Location:** After line 400 (after Date Range in modal)
   - **Action:** Add same Form.Item in modal form

4. **Update API Call**
   - **File:** Same file
   - **Location:** Line 180-188
   - **Action:** Pass sourceType to hook
   ```typescript
   const { data: actionPlan, isLoading } = useGetAllActionPlan(
     pageSizeAction,
     currentAction,
     empId,
     priority,
     status,
     startAt,
     endAt,
     sourceType, // NEW
   );
   ```

5. **Add Import for ActionPlanSourceType**
   - **File:** Same file
   - **Location:** Top of file (around line 4)
   ```typescript
   import { ActionPlanSourceType } from '@/types/enumTypes';
   ```

### Deliverables:
- ✅ Source type filter dropdown added to desktop view
- ✅ Source type filter added to mobile modal
- ✅ Filter state connected to API call
- ✅ Filter works without page reload (React Query handles refetch)

### Testing:
- [ ] Select "Meeting" filter - verify only meeting action plans shown
- [ ] Select "Survey" filter - verify only survey action plans shown
- [ ] Clear filter - verify all action plans shown
- [ ] Test on mobile view - filter appears in modal
- [ ] Verify filter persists when changing other filters
- [ ] Check that pagination resets when filter changes

---

## 📊 Phase 4: Display Source Information in List
**Goal:** Show source type and source name in the action plan table

### Tasks:
1. **Update Data Mapping**
   - **File:** `app/(afterLogin)/(feedback)/feedback/action-plan/page.tsx`
   - **Location:** Lines 189-197
   - **Action:** Add source fields to data mapping
   ```typescript
   const data = actionPlan?.items?.map((item: any) => ({
     key: item.id,
     issue: item.issue,
     description: item.description,
     deadline: item.deadline,
     priority: item.priority,
     status: item.status,
     responsible: item.responsibleUsers?.map((ru: any) => ru.responsibleId) || [],
     sourceType: item.sourceType, // NEW
     sourceId: item.sourceId, // NEW
     sourceName: item.sourceName, // NEW
   }));
   ```

2. **Add Source Type Column**
   - **File:** Same file
   - **Location:** After "Status" column (around line 144)
   - **Action:** Add new column definition
   ```typescript
   {
     title: 'Source Type',
     dataIndex: 'sourceType',
     render: (sourceType: string, record) => {
       if (!sourceType) return <span>—</span>;
       const isMeeting = sourceType === 'MEETING';
       return (
         <Tag
           className="font-bold border-none min-w-16 text-center capitalize text-[10px]"
           color={isMeeting ? 'blue' : 'green'}
           data-cy={`feedback-action-plan-table-cell-source-type-${record.key}`}
           id={`feedback-action-plan-table-cell-source-type-${record.key}`}
         >
           {sourceType}
         </Tag>
       );
     },
   },
   ```

3. **Add Source Name Column**
   - **File:** Same file
   - **Location:** After Source Type column
   - **Action:** Add source name column with navigation
   ```typescript
   {
     title: 'Source',
     dataIndex: 'sourceName',
     render: (sourceName: string, record) => {
       if (!sourceName || !record.sourceId) return <span>—</span>;
       const isMeeting = record.sourceType === 'MEETING';
       const href = isMeeting 
         ? `/feedback/meeting/${record.sourceId}`
         : `/feedback/categories/${record.sourceId}`;
       
       return (
         <a
           href={href}
           className="text-blue-600 hover:underline text-[12px]"
           data-cy={`feedback-action-plan-table-cell-source-name-${record.key}`}
           id={`feedback-action-plan-table-cell-source-name-${record.key}`}
         >
           {sourceName}
         </a>
       );
     },
   },
   ```

4. **Add Import for Tag Component**
   - **File:** Same file
   - **Location:** Line 8 (Tag is already imported, verify it's there)

### Deliverables:
- ✅ Source Type column displays with colored badges (blue for MEETING, green for SURVEY)
- ✅ Source Name column displays with clickable links
- ✅ Missing data handled gracefully (shows "—")
- ✅ Navigation links work correctly

### Testing:
- [ ] Verify source type badges display correctly
- [ ] Verify source name links navigate to correct pages
- [ ] Test with action plans missing source data (should show "—")
- [ ] Check responsive design (columns fit on mobile)
- [ ] Verify badge colors are distinct and accessible

---

## 🔍 Phase 5: Detail View (If Applicable)
**Goal:** Add source information section to action plan detail view

### Tasks:
1. **Locate Detail View Component**
   - **Action:** Find if there's a detail view/modal for action plans
   - **Search:** Look for components that show single action plan details

2. **Add Source Information Section**
   - **File:** TBD (detail view component)
   - **Action:** Add source info section similar to guide example
   ```typescript
   <div className="source-info mb-4">
     <h3 className="text-lg font-semibold mb-2">Source Information</h3>
     <div className="space-y-2">
       <p>
         <strong>Type:</strong>{' '}
         <Tag color={actionPlan.sourceType === 'MEETING' ? 'blue' : 'green'}>
           {actionPlan.sourceType}
         </Tag>
       </p>
       {actionPlan.sourceName && (
         <p>
           <strong>Source:</strong>{' '}
           <a 
             href={actionPlan.sourceType === 'MEETING' 
               ? `/feedback/meeting/${actionPlan.sourceId}`
               : `/feedback/categories/${actionPlan.sourceId}`
             }
             className="text-blue-600 hover:underline"
           >
             {actionPlan.sourceName}
           </a>
         </p>
       )}
     </div>
   </div>
   ```

### Deliverables:
- ✅ Source information section added to detail view
- ✅ Navigation link to source works correctly
- ✅ Handles missing source data gracefully

### Testing:
- [ ] Source info displays in detail view
- [ ] Navigation link works
- [ ] Missing data handled correctly

---

## ✅ Phase 6: Validation & Safety Checks
**Goal:** Ensure no source fields are sent in create/update requests

### Tasks:
1. **Review Create Mutations**
   - **Files to Check:**
     - `store/server/features/CFR/meeting/action-plan/mutations.ts`
     - `store/server/features/organization-development/categories/mutation.ts`
   - **Action:** Verify create/update functions don't include source fields
   - **Check:** Ensure request payloads exclude `sourceType`, `sourceId`, `sourceName`

2. **Add Type Safety to Mutations**
   - **Action:** Create/update DTO types that explicitly exclude source fields
   ```typescript
   export interface CreateActionPlanDto {
     actionToBeTaken: string;
     description?: string;
     responsiblePerson: string[];
     status: string;
     priority: string;
     deadline: string;
     // Explicitly NO sourceType, sourceId, sourceName
   }
   ```

3. **Document Safety Measures**
   - **Action:** Add comments in mutation files warning against including source fields

### Deliverables:
- ✅ All create/update mutations verified
- ✅ Type definitions prevent source field inclusion
- ✅ Documentation/comments added

### Testing:
- [ ] Create action plan from meeting - verify no source fields in request
- [ ] Create action plan from survey - verify no source fields in request
- [ ] Update action plan - verify no source fields in request
- [ ] Check network tab for all mutation requests

---

## 🎨 Phase 7: UI Styling Enhancements
**Goal:** Polish source type badges and ensure consistent styling

### Tasks:
1. **Create Badge Style Constants**
   - **File:** Create `constants/actionPlanBadges.ts` OR add to existing constants
   - **Action:** Define badge color mappings
   ```typescript
   import { ActionPlanSourceType } from '@/types/enumTypes';

   export const sourceTypeBadgeColors = {
     [ActionPlanSourceType.MEETING]: 'blue',
     [ActionPlanSourceType.SURVEY]: 'green',
   };

   export const sourceTypeLabels = {
     [ActionPlanSourceType.MEETING]: 'Meeting',
     [ActionPlanSourceType.SURVEY]: 'Survey',
   };
   ```

2. **Update Badge Rendering**
   - **File:** `app/(afterLogin)/(feedback)/feedback/action-plan/page.tsx`
   - **Action:** Use constants for consistent styling
   ```typescript
   import { sourceTypeBadgeColors, sourceTypeLabels } from '@/constants/actionPlanBadges';
   
   // In column render:
   <Tag
     className="font-bold border-none min-w-16 text-center capitalize text-[10px]"
     color={sourceTypeBadgeColors[sourceType]}
   >
     {sourceTypeLabels[sourceType] || sourceType}
   </Tag>
   ```

3. **Ensure Mobile Responsiveness**
   - **Action:** Verify table columns work on mobile
   - **Check:** Source columns don't break layout

### Deliverables:
- ✅ Consistent badge styling across all views
- ✅ Mobile-responsive design maintained
- ✅ Accessible color contrast

### Testing:
- [ ] Badge colors are consistent
- [ ] Mobile view displays correctly
- [ ] Color contrast meets accessibility standards

---

## 🧪 Phase 8: Testing & Quality Assurance
**Goal:** Comprehensive testing of all functionality

### Test Checklist:

#### Functional Tests:
- [ ] Filter by "All" shows both MEETING and SURVEY action plans
- [ ] Filter by "Meeting" shows only MEETING action plans
- [ ] Filter by "Survey" shows only SURVEY action plans
- [ ] Source type badges display correctly
- [ ] Source name links navigate to correct pages
- [ ] Missing source data shows "—" gracefully
- [ ] Pagination works with filters
- [ ] Filter combinations work (e.g., Meeting + High Priority)
- [ ] Mobile filter modal works correctly
- [ ] Create action plan doesn't send source fields
- [ ] Update action plan doesn't send source fields

#### Edge Cases:
- [ ] Action plan with null sourceType (should show "—")
- [ ] Action plan with null sourceName but valid sourceId
- [ ] Action plan with null sourceId but valid sourceName
- [ ] Empty action plan list with filter applied
- [ ] Rapid filter changes don't cause race conditions

#### Integration Tests:
- [ ] Backend returns source fields in response
- [ ] API endpoint `/action-plans` works correctly
- [ ] Query key invalidation works
- [ ] React Query cache updates correctly

#### UI/UX Tests:
- [ ] Loading states display correctly
- [ ] Error states handled gracefully
- [ ] Table responsive on all screen sizes
- [ ] Badge colors are accessible
- [ ] Links have hover states

---

## 📝 Phase 9: Documentation & Cleanup
**Goal:** Finalize implementation and document changes

### Tasks:
1. **Update Code Comments**
   - Add JSDoc comments to new functions
   - Document source type filter behavior

2. **Update README/Changelog**
   - Document new feature
   - Note breaking changes (if any)

3. **Code Review Checklist**
   - [ ] Remove console.logs
   - [ ] Remove unused imports
   - [ ] Verify all data-cy attributes present
   - [ ] Check TypeScript strict mode compliance
   - [ ] Verify no hardcoded values

4. **Performance Check**
   - [ ] Verify no unnecessary re-renders
   - [ ] Check query optimization
   - [ ] Verify proper memoization if needed

### Deliverables:
- ✅ Code is clean and documented
- ✅ All tests passing
- ✅ Documentation updated
- ✅ Ready for code review

---

## 🚀 Implementation Order Summary

1. **Phase 1** → Type Definitions (Foundation)
2. **Phase 2** → API Service Updates (Backend Integration)
3. **Phase 3** → UI Filter Implementation (User Control)
4. **Phase 4** → Display Source Information (Visual Feedback)
5. **Phase 5** → Detail View (If Applicable)
6. **Phase 6** → Validation & Safety (Critical)
7. **Phase 7** → UI Styling (Polish)
8. **Phase 8** → Testing (Quality Assurance)
9. **Phase 9** → Documentation (Finalization)

---

## ⚠️ Important Notes

1. **Backward Compatibility:** Ensure existing functionality continues to work
2. **No Source Fields in Requests:** Critical - backend will reject/ignore them
3. **Query Key Management:** Include sourceType in query key for proper caching
4. **Error Handling:** Gracefully handle missing or null source data
5. **Mobile Support:** Ensure all new UI elements work on mobile

---

## 📊 Estimated Timeline

- **Phase 1:** 30 minutes
- **Phase 2:** 1 hour
- **Phase 3:** 1.5 hours
- **Phase 4:** 1.5 hours
- **Phase 5:** 1 hour (if applicable)
- **Phase 6:** 1 hour
- **Phase 7:** 30 minutes
- **Phase 8:** 2 hours
- **Phase 9:** 30 minutes

**Total Estimated Time:** ~9-10 hours

---

## ✅ Acceptance Criteria Checklist

- [x] Action plans show source type and source name in list view
- [x] Action plans can be filtered by source type
- [x] Filtering works without page reload
- [x] Existing action plan screens remain functional
- [x] No source-related fields are sent during create/update requests
- [x] Backend responses with new fields are handled correctly
- [x] Source information displays in detail view (if applicable)
- [x] Navigation links to source work correctly
- [x] Missing source data handled gracefully
- [x] Mobile responsive design maintained

---

**Last Updated:** Implementation Plan Created
**Status:** Ready for Implementation
