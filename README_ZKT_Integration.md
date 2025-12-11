# ZKT Realtime Data Integration - Developer Guide

## Table of Contents

1. Overview
2. System Architecture
3. Authentication Flow
4. Configuration Setup
5. Realtime Data Fetching
6. Decision Logic: ZKT vs Standard Endpoint
7. Token Management
8. State Management
9. Error Handling & Fallback
10. File Structure & Key Components
11. API Endpoints
12. Code Examples
13. Troubleshooting
14. Best Practices

---

## Overview

### What is ZKT?

ZKT (ZKTeco) is a biometric device manufacturer. This integration allows the application to fetch real-time attendance data directly from ZKT servers, providing up-to-the-minute attendance records for the current day.

### Purpose

- Real-time Data: Get today's attendance data instantly from ZKT servers
- Seamless Integration: Automatically switches between ZKT (for today) and standard endpoints (for historical data)
- Fallback Mechanism: If ZKT fails, automatically falls back to standard endpoint

### Key Benefits

- Real-time attendance data for today
- Automatic endpoint selection based on query criteria
- Graceful fallback to standard endpoint
- Secure token-based authentication
- User-friendly configuration UI

---

## System Architecture

### High-Level Flow

The system follows this flow:

1. User Configuration: User configures ZKT credentials via settings page
2. Authentication: System authenticates with ZKT server and stores token
3. Query Phase: When fetching attendance data, system decides which endpoint to use
4. Execution Phase: Fetches data from appropriate endpoint (ZKT or standard)
5. Fallback Phase: If ZKT fails, automatically uses standard endpoint

### Component Interaction

The integration consists of several key components:

- Configuration Page: Where users enter ZKT credentials
- Authentication API: Next.js proxy route that handles ZKT authentication
- Decision Logic: Determines whether to use ZKT or standard endpoint
- Data Fetching: Retrieves attendance data from the appropriate source
- State Management: Stores configuration and authentication state

---

## Authentication Flow

### Step-by-Step Authentication Process

#### Step 1: User Input (Configuration Page)

Location: app/(afterLogin)/(timesheetInformation)/timesheet/settings/zkt-addon/page.tsx

User provides:

- URL: ZKT server URL (e.g., https://zkt-server.example.com)
- Username: ZKT account username
- Password: ZKT account password

#### Step 2: Client-Side Authentication Request

Location: store/server/features/timesheet/zkt/mutation.ts

The user submits the form, which triggers the authenticateZkt mutation. The payload includes:

- url: The ZKT server URL
- username: ZKT username
- password: ZKT password

#### Step 3: Next.js API Route (Proxy)

Location: app/api/zkt/auth/route.ts

Purpose: Acts as a proxy to avoid CORS issues

Process:

1. Receives url, username, password from client
2. Validates required fields
3. Sanitizes URL (removes trailing slash)
4. Constructs ZKT endpoint: ${url}/jwt-api-token-auth/
5. Forwards request to ZKT server (server-to-server, no CORS)
6. Returns token to client

#### Step 4: Token Storage

Location: app/(afterLogin)/(timesheetInformation)/timesheet/settings/zkt-addon/page.tsx

Upon successful authentication, the system stores:

- zktAuthToken in localStorage: JWT token from ZKT server
- zktPassUrl in localStorage: ZKT server URL
- Configuration in Zustand Store: isZktConfigured flag and zktSavedData

---

## Configuration Setup

### Configuration Page

Location: /timesheet/settings/zkt-addon

### Configuration States

#### State 1: Not Configured (isZktConfigured: false)

Shows form with three fields:

- URL (required, must be valid URL)
- Username (required)
- Password (required, masked input)

User fills form and clicks "Save". System authenticates and stores credentials.

#### State 2: Configured (isZktConfigured: true)

Shows configured user info:

- Avatar with username initial
- Username
- Clickable ZKT server URL
- Delete button to remove configuration

On delete: Clears localStorage and Zustand store.

### Configuration Storage

Zustand Store (store/uistate/features/timesheet/settings/index.ts):

- isZktConfigured: boolean
- zktSavedData: { url: string; username: string } | null

LocalStorage:

- zktAuthToken: Authentication token
- zktPassUrl: ZKT server URL

---

## Realtime Data Fetching

### Main Query Hook

Location: store/server/features/timesheet/attendance/queries.ts

Hook: useGetAttendances(query, data, isKeepData, isEnabled)

### Fetching Process

#### Step 1: Decision Logic

Before fetching, system checks if ZKT endpoint should be used using the shouldUseZKTEndpoint function.

#### Step 2: ZKT Data Fetching

Function: fetchZKTAttendance()

Process:

1. Retrieves passUrl from localStorage or Zustand store
2. Retrieves zktToken from localStorage
3. Validates both are present (throws error if missing)
4. Gets today's date in YYYY-MM-DD format
5. Constructs request payload with passUrl, ZKTToken, and date filter (today only)
6. Sends POST request to ${TIME_AND_ATTENDANCE_URL}/attendance
7. Returns response as ApiResponse<AttendanceRecord>

Key Points:

- Always uses today's date (real-time data)
- No query parameters (pagination handled differently)
- Simple headers (Content-Type: application/json only)
- No encryption (token is already secure)

#### Step 3: Standard Endpoint (Fallback)

If ZKT is not used or fails:

- Uses standard authentication headers
- Supports all filter options
- Supports pagination via query parameters
- Supports exports

---

## Decision Logic: ZKT vs Standard Endpoint

### Function: shouldUseZKTEndpoint(data)

Location: store/server/features/timesheet/attendance/queries.ts

### Decision Conditions

#### USE ZKT Endpoint When:

1. No exportType (exports always use standard endpoint)
2. No filters OR Only today's date filter
3. No other filter criteria:
   - No userIds filter
   - No attendanceRecordIds filter
   - No type filter (late/early/absent/present)
   - No breakTypeId filter
   - No locations filter

Date Filter Logic:

- If no date filter: Use ZKT (assumes today)
- If date filter exists:
  - from === today AND to === today → Use ZKT
  - Otherwise → Use Standard

#### USE Standard Endpoint When:

1. Export requested (exportType: 'PDF' | 'EXCEL')
2. Any non-date filters:
   - userIds array has items
   - attendanceRecordIds array has items
   - type is specified
   - breakTypeId is specified
   - locations array has items
3. Date range is not today:
   - from !== today OR to !== today
4. ZKT authentication fails (automatic fallback)

---

## Token Management

### Utility Functions

Location: utils/zktToken.ts

### Available Functions

#### getZktToken(): string | null

Retrieves ZKT authentication token from localStorage.

Storage Key: localStorage['zktAuthToken']

#### hasZktToken(): boolean

Checks if ZKT token exists.

#### getZktPassUrl(): string | null

Retrieves ZKT server URL (passUrl) from localStorage.

Storage Key: localStorage['zktPassUrl']

#### setZktPassUrl(passUrl: string): void

Stores ZKT server URL in localStorage.

#### removeZktPassUrl(): void

Removes ZKT passUrl from localStorage.

### Token Retrieval Priority

When fetching passUrl, system checks in this order:

1. localStorage (getZktPassUrl())
2. Zustand Store (useTimesheetSettingsStore.getState().zktSavedData?.url)

### Token Lifecycle

1. Creation: User authenticates → Token received → Stored in localStorage
2. Usage: Retrieved from localStorage for each ZKT request
3. Validation: Token validity is checked by ZKT server on each request
4. Expiration: If token expires, request fails → Falls back to standard endpoint
5. Deletion: User deletes configuration → Token removed from localStorage

---

## State Management

### Zustand Store

Location: store/uistate/features/timesheet/settings/index.ts

### State Structure

- isZktConfigured: boolean (Configuration Status)
- zktSavedData: { url: string; username: string } | null (Saved Configuration Data)

### Actions

#### setIsZktConfigured(isZktConfigured: boolean)

Updates configuration status.

#### setZktSavedData(zktSavedData: { url: string; username: string } | null)

Stores or updates ZKT configuration data.

#### resetZktConfiguration()

Resets ZKT configuration:

- Sets isZktConfigured to false
- Sets zktSavedData to null
- Removes zktAuthToken from localStorage
- Removes zktPassUrl from localStorage

---

## Error Handling & Fallback

### Error Scenarios

#### Error 1: Missing Credentials

Error: "passUrl is not found in localStorage or store"
Location: fetchZKTAttendance()

Handling:

- Throws error
- Caught in getAttendances()
- Automatically falls back to standard endpoint

#### Error 2: Missing Token

Error: "ZKTToken is not found in localStorage"
Location: fetchZKTAttendance()

Handling:

- Throws error
- Falls back to standard endpoint

#### Error 3: Authentication Failure

Error: ZKT server rejects token
Location: Backend API

Handling:

- Request fails
- Error caught in try-catch
- Falls back to standard endpoint

#### Error 4: Network Errors

Error: Network timeout, connection refused, etc.

Handling:

- Error caught
- Falls back to standard endpoint

### Fallback Mechanism

Location: store/server/features/timesheet/attendance/queries.ts

The system implements a silent fallback mechanism:

- Try ZKT endpoint first (if conditions are met)
- If ZKT fails, catch error silently
- Continue to standard endpoint
- No error message shown to user
- Seamless transition - user doesn't notice the switch
- Always works - standard endpoint is always available
- No data loss - same data structure returned

---

## File Structure & Key Components

### Core Files

Project Structure:

- app/api/zkt/auth/route.ts - ZKT authentication proxy
- app/(afterLogin)/(timesheetInformation)/timesheet/settings/zkt-addon/page.tsx - ZKT configuration UI
- store/server/features/timesheet/attendance/queries.ts - Main attendance queries (ZKT logic)
- store/server/features/timesheet/attendance/mutation.ts - ZKT attendance mutations
- store/server/features/timesheet/zkt/mutation.ts - ZKT authentication mutation
- store/uistate/features/timesheet/settings/index.ts - Zustand store for ZKT config
- utils/zktToken.ts - Token management utilities

### File Responsibilities

#### app/api/zkt/auth/route.ts

- Purpose: Next.js API route for ZKT authentication
- Function: Proxy to avoid CORS issues
- Method: POST
- Input: { url, username, password }
- Output: { token }

#### app/(afterLogin)/(timesheetInformation)/timesheet/settings/zkt-addon/page.tsx

- Purpose: ZKT configuration UI
- Features: Form for credentials, display configured state, delete configuration

#### store/server/features/timesheet/attendance/queries.ts

- Purpose: Main attendance data fetching
- Key Functions:
  - shouldUseZKTEndpoint(): Decision logic
  - fetchZKTAttendance(): ZKT data fetching
  - getAttendances(): Main query function with fallback

#### store/server/features/timesheet/attendance/mutation.ts

- Purpose: ZKT attendance mutations
- Key Function: useFetchZKTAttendance(): Manual ZKT fetch hook

#### store/server/features/timesheet/zkt/mutation.ts

- Purpose: ZKT authentication
- Key Function: useAuthenticateZkt(): Authentication hook

#### utils/zktToken.ts

- Purpose: Token management utilities
- Functions: Get/set/remove token and passUrl

#### store/uistate/features/timesheet/settings/index.ts

- Purpose: ZKT configuration state management
- Store: Zustand store for ZKT settings

---

## API Endpoints

### Endpoint 1: ZKT Authentication

Endpoint: POST /api/zkt/auth
Location: Next.js API route (client-side accessible)

Request Body:

- url: string (ZKT server URL)
- username: string (ZKT username)
- password: string (ZKT password)

Response:

- token: string (JWT token from ZKT server)

Error Response:

- error: string (Error message)

### Endpoint 2: ZKT Attendance Data

Endpoint: POST ${TIME_AND_ATTENDANCE_URL}/attendance
Location: Backend API

Request Body (ZKT Mode):

- passUrl: string (ZKT server URL)
- ZKTToken: string (Authentication token)
- filter: { date: { from: string; to: string } } (YYYY-MM-DD format, today only)

Request Body (Standard Mode):

- exportType?: 'PDF' | 'EXCEL'
- filter: {
  - attendanceRecordIds?: string[]
  - userIds?: string[]
  - type?: 'late' | 'early' | 'absent' | 'present'
  - breakTypeId?: string
  - date?: { from: string; to: string }
  - locations?: string[]
    }
- data?: Array<{...}>

Response:

- data: AttendanceRecord[]
- ... other response fields

### Endpoint 3: ZKT Server Authentication

Endpoint: POST ${zktUrl}/jwt-api-token-auth/
Location: External ZKT server

Request Body:

- username: string
- password: string

Response:

- token: string (JWT token)

---

## Code Examples

### Example 1: Using Attendance Query (Automatic ZKT)

This will automatically use ZKT if querying today's data:

```typescript
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';

function AttendanceComponent() {
  const { data, isLoading } = useGetAttendances(
    {}, // query params
    {
      filter: {
        // No filters = uses ZKT (today)
      }
    },
    true,  // keepPreviousData
    true   // enabled
  );

  return (
    <div>
      {isLoading ? 'Loading...' : JSON.stringify(data)}
    </div>
  );
}
```

### Example 2: Querying Today's Data (Uses ZKT)

```typescript
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import dayjs from 'dayjs';

function TodayAttendance() {
  const today = dayjs().format('YYYY-MM-DD');

  const { data } = useGetAttendances(
    {},
    {
      filter: {
        date: {
          from: today,
          to: today,
        },
      },
    },
  );

  // This will use ZKT endpoint automatically
}
```

### Example 3: Querying Historical Data (Uses Standard)

```typescript
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';

function HistoricalAttendance() {
  const { data } = useGetAttendances(
    {},
    {
      filter: {
        date: {
          from: '2024-01-01',
          to: '2024-01-31',
        },
      },
    },
  );

  // This will use standard endpoint (not today)
}
```

### Example 4: Manual ZKT Fetch

```typescript
import { useFetchZKTAttendance } from '@/store/server/features/timesheet/attendance/mutation';
import dayjs from 'dayjs';

function ManualZKTFetch() {
  const { mutate: fetchZKT, isLoading } = useFetchZKTAttendance();

  const handleFetch = () => {
    const today = dayjs().format('YYYY-MM-DD');

    fetchZKT(
      {
        date: {
          from: today,
          to: today
        }
      },
      {
        onSuccess: (data) => {
          console.log('ZKT Data:', data);
        },
        onError: (error) => {
          console.error('ZKT Error:', error);
        }
      }
    );
  };

  return (
    <button onClick={handleFetch} disabled={isLoading}>
      Fetch ZKT Data
    </button>
  );
}
```

### Example 5: Configuring ZKT

```typescript
import { useAuthenticateZkt } from '@/store/server/features/timesheet/zkt/mutation';
import { setZktPassUrl } from '@/utils/zktToken';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';

function ConfigureZKT() {
  const { mutate: authenticateZkt, isLoading } = useAuthenticateZkt();
  const { setIsZktConfigured, setZktSavedData } = useTimesheetSettingsStore();

  const handleConfigure = (url: string, username: string, password: string) => {
    authenticateZkt(
      { url, username, password },
      {
        onSuccess: (data) => {
          // Store token
          if (typeof window !== 'undefined' && data?.token) {
            window.localStorage.setItem('zktAuthToken', data.token);
            setZktPassUrl(url);
          }

          // Update store
          setZktSavedData({ url, username });
          setIsZktConfigured(true);
        },
        onError: (error) => {
          console.error('Authentication failed:', error);
        }
      }
    );
  };

  return (
    // Form UI here
  );
}
```

### Example 6: Checking ZKT Configuration

```typescript
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { hasZktToken, getZktToken, getZktPassUrl } from '@/utils/zktToken';

function CheckZKTStatus() {
  const { isZktConfigured, zktSavedData } = useTimesheetSettingsStore();
  const hasToken = hasZktToken();
  const token = getZktToken();
  const passUrl = getZktPassUrl();

  return (
    <div>
      <p>Configured: {isZktConfigured ? 'Yes' : 'No'}</p>
      <p>Has Token: {hasToken ? 'Yes' : 'No'}</p>
      <p>PassUrl: {passUrl || 'Not set'}</p>
      <p>Username: {zktSavedData?.username || 'Not set'}</p>
    </div>
  );
}
```

### Example 7: Resetting ZKT Configuration

```typescript
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';

function ResetZKT() {
  const { resetZktConfiguration } = useTimesheetSettingsStore();

  const handleReset = () => {
    resetZktConfiguration();
    // This will:
    // - Set isZktConfigured to false
    // - Clear zktSavedData
    // - Remove zktAuthToken from localStorage
    // - Remove zktPassUrl from localStorage
  };

  return (
    <button onClick={handleReset}>
      Reset ZKT Configuration
    </button>
  );
}
```

---

## Troubleshooting

### Issue 1: ZKT Not Being Used When Expected

Symptoms: Always using standard endpoint even for today's data

Possible Causes:

1. ZKT not configured (isZktConfigured: false)
2. Missing token in localStorage
3. Missing passUrl in localStorage
4. Date filter format incorrect
5. Other filters present (userIds, type, etc.)

Debugging Steps:

- Check configuration: console.log('Is Configured:', useTimesheetSettingsStore.getState().isZktConfigured)
- Check token: console.log('Has Token:', hasZktToken())
- Check passUrl: console.log('PassUrl:', getZktPassUrl())
- Check decision logic: console.log('Should Use ZKT:', shouldUseZKTEndpoint(data))

Solution:

- Ensure ZKT is configured via settings page
- Check localStorage for zktAuthToken and zktPassUrl
- Verify date filter is exactly today in YYYY-MM-DD format
- Remove other filters if testing ZKT

### Issue 2: Authentication Fails

Symptoms: Error when saving ZKT credentials

Possible Causes:

1. Invalid URL format
2. Incorrect username/password
3. ZKT server not accessible
4. CORS issues (shouldn't happen with proxy)

Solution:

- Verify URL is correct and accessible
- Test credentials directly on ZKT server
- Check ZKT server logs
- Verify Next.js API route is working

### Issue 3: Token Expired

Symptoms: ZKT requests fail, falls back to standard endpoint

Possible Causes:

1. Token expired (JWT tokens have expiration)
2. Token invalid
3. ZKT server changed authentication

Solution:

- Re-authenticate via settings page
- Check token expiration in ZKT server settings
- Verify token format is correct

### Issue 4: Fallback Not Working

Symptoms: Error shown to user instead of silent fallback

Possible Causes:

1. Error not caught in try-catch
2. Standard endpoint also failing

Solution:

- Check error handling in getAttendances()
- Verify standard endpoint is working
- Check network connectivity

### Issue 5: Date Format Issues

Symptoms: ZKT not used even with today's date

Possible Causes:

1. Date format mismatch
2. Timezone issues
3. Date comparison logic

Debugging:

- Check today's date: console.log('Today:', dayjs().format('YYYY-MM-DD'))
- Check filter dates: console.log('Filter From:', data.filter?.date?.from)
- Check match: console.log('Match:', data.filter?.date?.from === today && data.filter?.date?.to === today)

Solution:

- Ensure dates are in YYYY-MM-DD format
- Use dayjs().format('YYYY-MM-DD') for consistency
- Check timezone settings

### Issue 6: localStorage Not Persisting

Symptoms: Configuration lost on page refresh

Possible Causes:

1. localStorage disabled
2. Incognito/private mode
3. Storage quota exceeded

Solution:

- Check browser localStorage support
- Verify not in private mode
- Check browser console for storage errors

---

## Best Practices

### 1. Always Provide Fallback

- Never rely solely on ZKT endpoint
- Always have standard endpoint as backup
- Silent fallback provides better UX

### 2. Validate Before Using

- Check token exists before ZKT request
- Check passUrl exists before ZKT request
- Validate date format before comparison

### 3. Error Handling

- Catch all ZKT errors
- Log errors for debugging
- Don't show errors to user (silent fallback)

### 4. Token Management

- Store tokens securely (localStorage is acceptable for client-side)
- Clear tokens on logout
- Re-authenticate if token expires

### 5. Date Handling

- Always use dayjs().format('YYYY-MM-DD') for consistency
- Compare dates as strings (not Date objects)
- Handle timezone considerations

### 6. Testing

- Test with ZKT configured
- Test with ZKT not configured
- Test with invalid token
- Test with network errors
- Test date filter variations

### 7. Code Organization

- Keep ZKT logic separate from standard logic
- Use utility functions for token management
- Centralize decision logic in one function

### 8. Documentation

- Document ZKT-specific behavior
- Comment decision logic
- Explain fallback mechanism

---

## Summary

### Key Takeaways

1. ZKT provides real-time data for today's attendance only
2. Automatic endpoint selection based on query criteria
3. Graceful fallback to standard endpoint if ZKT fails
4. Token-based authentication via Next.js proxy
5. Configuration via UI in settings page
6. State management via Zustand and localStorage

### When to Use ZKT

USE ZKT when:

- Querying today's attendance data
- No filters or only today's date filter
- Real-time data is needed

DON'T use ZKT when:

- Exporting data
- Querying historical data (not today)
- Filtering by users, types, locations, etc.
- ZKT is not configured

### Integration Points

- Configuration: /timesheet/settings/zkt-addon
- Authentication: /api/zkt/auth
- Data Fetching: useGetAttendances() hook
- Token Management: utils/zktToken.ts
- State Management: Zustand store

---

## Additional Resources

### Related Files to Review

1. store/server/features/timesheet/attendance/queries.ts - Main logic
2. app/api/zkt/auth/route.ts - Authentication proxy
3. utils/zktToken.ts - Token utilities
4. store/uistate/features/timesheet/settings/index.ts - State management

### Environment Variables

- NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL - Backend API URL

### Dependencies

- dayjs - Date formatting
- react-query - Data fetching
- zustand - State management
- axios - HTTP requests (in API route)

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: Development Team
