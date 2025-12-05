# ZKT Realtime Data Integration - Comprehensive Developer Guide

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Authentication Flow](#authentication-flow)
4. [Configuration Setup](#configuration-setup)
5. [Realtime Data Fetching](#realtime-data-fetching)
6. [Decision Logic: ZKT vs Standard Endpoint](#decision-logic-zkt-vs-standard-endpoint)
7. [Token Management](#token-management)
8. [State Management](#state-management)
9. [Error Handling & Fallback](#error-handling--fallback)
10. [File Structure & Key Components](#file-structure--key-components)
11. [API Endpoints](#api-endpoints)
12. [Code Examples](#code-examples)
13. [Troubleshooting](#troubleshooting)
14. [Best Practices](#best-practices)

---

## Overview

### What is ZKT?

ZKT (ZKTeco) is a biometric device manufacturer. This integration allows the application to fetch **real-time attendance data** directly from ZKT servers, providing up-to-the-minute attendance records for the current day.

### Purpose

- **Real-time Data**: Get today's attendance data instantly from ZKT servers
- **Seamless Integration**: Automatically switches between ZKT (for today) and standard endpoints (for historical data)
- **Fallback Mechanism**: If ZKT fails, automatically falls back to standard endpoint

### Key Benefits

- ✅ Real-time attendance data for today
- ✅ Automatic endpoint selection based on query criteria
- ✅ Graceful fallback to standard endpoint
- ✅ Secure token-based authentication
- ✅ User-friendly configuration UI

---

## System Architecture

### High-Level Flow

```
┌─────────────────┐
│   User Config   │
│  ZKT Settings   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Authentication │
│  /api/zkt/auth  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Store Token    │      │  Store passUrl   │
│  localStorage   │      │  localStorage    │
└────────┬────────┘      └────────┬─────────┘
         │                        │
         └──────────┬─────────────┘
                    ▼
         ┌──────────────────────┐
         │  Attendance Query    │
         │  useGetAttendances   │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ shouldUseZKTEndpoint │
         │    (Decision Logic)  │
         └──────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌─────────────────┐
│  ZKT Endpoint│      │ Standard Endpoint│
│  (Today Only)│      │ (Historical/All) │
└──────────────┘      └─────────────────┘
```

### Component Interaction

1. **Configuration Phase**: User configures ZKT credentials via settings page
2. **Authentication Phase**: System authenticates with ZKT server and stores token
3. **Query Phase**: When fetching attendance data, system decides which endpoint to use
4. **Execution Phase**: Fetches data from appropriate endpoint (ZKT or standard)
5. **Fallback Phase**: If ZKT fails, automatically uses standard endpoint

---

## Authentication Flow

### Step-by-Step Authentication Process

#### 1. User Input (Configuration Page)

**File**: `app/(afterLogin)/(timesheetInformation)/timesheet/settings/zkt-addon/page.tsx`

User provides:

- **URL**: ZKT server URL (e.g., `https://zkt-server.example.com`)
- **Username**: ZKT account username
- **Password**: ZKT account password

#### 2. Client-Side Authentication Request

**File**: `store/server/features/timesheet/zkt/mutation.ts`

```typescript
// User submits form → triggers authenticateZkt mutation
const payload: ZktAuthPayload = {
  url: values.url,
  username: values.username,
  password: values.password,
};

authenticateZkt(payload, {
  onSuccess: (data) => {
    // Token received and stored
  },
});
```

**Request Flow**:

```
Client → POST /api/zkt/auth → Next.js API Route → ZKT Server
```

#### 3. Next.js API Route (Proxy)

**File**: `app/api/zkt/auth/route.ts`

**Purpose**: Acts as a proxy to avoid CORS issues

**Process**:

1. Receives `{ url, username, password }` from client
2. Validates required fields
3. Sanitizes URL (removes trailing slash)
4. Constructs ZKT endpoint: `${url}/jwt-api-token-auth/`
5. Forwards request to ZKT server (server-to-server, no CORS)
6. Returns token to client

**Key Code**:

```typescript
const sanitizedUrl = url.replace(/\/$/, '');
const endpoint = `${sanitizedUrl}/jwt-api-token-auth/`;

const response = await axios.post(
  endpoint,
  {
    username,
    password,
  },
  {
    headers: { 'Content-Type': 'application/json' },
  },
);
```

#### 4. Token Storage

**File**: `app/(afterLogin)/(timesheetInformation)/timesheet/settings/zkt-addon/page.tsx`

Upon successful authentication:

```typescript
onSuccess: (data) => {
  if (typeof window !== 'undefined' && data?.token) {
    // Store authentication token
    window.localStorage.setItem('zktAuthToken', data.token);

    // Store passUrl (ZKT server URL)
    setZktPassUrl(values.url);
  }

  // Update Zustand store
  setZktSavedData({
    url: values.url,
    username: values.username,
  });
  setIsZktConfigured(true);
};
```

**Storage Locations**:

- `localStorage['zktAuthToken']`: JWT token from ZKT server
- `localStorage['zktPassUrl']`: ZKT server URL
- Zustand Store: Configuration state (`isZktConfigured`, `zktSavedData`)

---

## Configuration Setup

### Configuration Page

**Location**: `/timesheet/settings/zkt-addon`

### Configuration States

#### 1. **Not Configured** (`isZktConfigured: false`)

- Shows form with three fields:
  - URL (required, must be valid URL)
  - Username (required)
  - Password (required, masked input)
- User fills form and clicks "Save"
- System authenticates and stores credentials

#### 2. **Configured** (`isZktConfigured: true`)

- Shows configured user info:
  - Avatar with username initial
  - Username
  - Clickable ZKT server URL
- Delete button to remove configuration
- On delete: Clears localStorage and Zustand store

### Configuration Storage

**Zustand Store** (`store/uistate/features/timesheet/settings/index.ts`):

```typescript
{
  isZktConfigured: boolean;
  zktSavedData: {
    url: string;
    username: string;
  } | null;
}
```

**LocalStorage**:

- `zktAuthToken`: Authentication token
- `zktPassUrl`: ZKT server URL

---

## Realtime Data Fetching

### Main Query Hook

**File**: `store/server/features/timesheet/attendance/queries.ts`

**Hook**: `useGetAttendances(query, data, isKeepData, isEnabled)`

### Fetching Process

#### Step 1: Decision Logic

Before fetching, system checks if ZKT endpoint should be used:

```typescript
const getAttendances = async (query, data) => {
  // Check if we should use ZKT endpoint
  if (shouldUseZKTEndpoint(data)) {
    try {
      const zktResponse = await fetchZKTAttendance();
      return zktResponse;
    } catch (error) {
      // Fallback to standard endpoint
    }
  }

  // Use standard endpoint
  return await crudRequest({...});
};
```

#### Step 2: ZKT Data Fetching

**Function**: `fetchZKTAttendance()`

**Process**:

1. Retrieves `passUrl` from localStorage or Zustand store
2. Retrieves `zktToken` from localStorage
3. Validates both are present (throws error if missing)
4. Gets today's date in `YYYY-MM-DD` format
5. Constructs request payload:
   ```typescript
   {
     passUrl: string,        // ZKT server URL
     ZKTToken: string,       // Authentication token
     filter: {
       date: {
         from: "2024-01-15", // Today's date
         to: "2024-01-15"     // Today's date
       }
     }
   }
   ```
6. Sends POST request to `${TIME_AND_ATTENDANCE_URL}/attendance`
7. Returns response as `ApiResponse<AttendanceRecord>`

**Key Points**:

- **Always uses today's date** (real-time data)
- **No query parameters** (pagination handled differently)
- **Simple headers** (`Content-Type: application/json` only)
- **No encryption** (token is already secure)

#### Step 3: Standard Endpoint (Fallback)

If ZKT is not used or fails:

- Uses standard authentication headers
- Supports all filter options
- Supports pagination via query parameters
- Supports exports

---

## Decision Logic: ZKT vs Standard Endpoint

### Function: `shouldUseZKTEndpoint(data)`

**File**: `store/server/features/timesheet/attendance/queries.ts`

### Decision Tree

```
┌─────────────────────────┐
│  Attendance Request     │
└───────────┬─────────────┘
            │
            ▼
    ┌───────────────┐
    │ Has exportType?│
    └───────┬───────┘
            │
      ┌─────┴─────┐
      │           │
     YES          NO
      │           │
      ▼           ▼
   STANDARD   ┌──────────────┐
              │ Has Filters? │
              └──────┬───────┘
                     │
            ┌────────┴────────┐
            │                 │
           YES               NO
            │                 │
            ▼                 ▼
    ┌──────────────┐    ┌──────────────┐
    │ Other Filters?│    │   USE ZKT    │
    └──────┬───────┘    └──────────────┘
           │
      ┌────┴────┐
      │         │
     YES        NO
      │         │
      ▼         ▼
  STANDARD  ┌──────────────┐
            │ Date Filter? │
            └──────┬───────┘
                   │
          ┌────────┴────────┐
          │                 │
         YES               NO
          │                 │
          ▼                 ▼
    ┌──────────────┐    ┌──────────────┐
    │ Is Today?    │    │   USE ZKT    │
    └──────┬───────┘    └──────────────┘
           │
      ┌────┴────┐
      │         │
     YES        NO
      │         │
      ▼         ▼
   USE ZKT   STANDARD
```

### Detailed Conditions

#### ✅ **USE ZKT Endpoint** When:

1. **No exportType** (exports always use standard endpoint)
2. **No filters** OR **Only today's date filter**
3. **No other filter criteria**:
   - No `userIds` filter
   - No `attendanceRecordIds` filter
   - No `type` filter (late/early/absent/present)
   - No `breakTypeId` filter
   - No `locations` filter

**Date Filter Logic**:

- If **no date filter**: Use ZKT (assumes today)
- If **date filter exists**:
  - `from === today` AND `to === today` → Use ZKT
  - Otherwise → Use Standard

#### ❌ **USE Standard Endpoint** When:

1. **Export requested** (`exportType: 'PDF' | 'EXCEL'`)
2. **Any non-date filters**:
   - `userIds` array has items
   - `attendanceRecordIds` array has items
   - `type` is specified
   - `breakTypeId` is specified
   - `locations` array has items
3. **Date range is not today**:
   - `from !== today` OR `to !== today`
4. **ZKT authentication fails** (automatic fallback)

### Code Implementation

```typescript
const shouldUseZKTEndpoint = (
  data: Partial<AttendanceRequestBody>,
): boolean => {
  // Rule 1: Exports always use standard endpoint
  if (data.exportType) {
    return false;
  }

  const filter = data.filter || {};

  // Rule 2: Check for other filters (non-date)
  const hasOtherFilters =
    (filter.userIds && filter.userIds.length > 0) ||
    (filter.attendanceRecordIds && filter.attendanceRecordIds.length > 0) ||
    filter.type ||
    filter.breakTypeId ||
    (filter.locations && filter.locations.length > 0);

  if (hasOtherFilters) {
    return false;
  }

  // Rule 3: No date filter = use ZKT (today)
  if (!filter.date) {
    return true;
  }

  // Rule 4: Date filter exists - check if it's today only
  const today = getTodayDate(); // YYYY-MM-DD format
  const isTodayOnly = filter.date.from === today && filter.date.to === today;

  return isTodayOnly;
};
```

---

## Token Management

### Utility Functions

**File**: `utils/zktToken.ts`

### Available Functions

#### 1. `getZktToken(): string | null`

Retrieves ZKT authentication token from localStorage.

```typescript
const token = getZktToken();
if (!token) {
  // Token not found - need to authenticate
}
```

**Storage Key**: `localStorage['zktAuthToken']`

#### 2. `hasZktToken(): boolean`

Checks if ZKT token exists.

```typescript
if (hasZktToken()) {
  // Token is available
}
```

#### 3. `getZktPassUrl(): string | null`

Retrieves ZKT server URL (passUrl) from localStorage.

**Storage Key**: `localStorage['zktPassUrl']`

#### 4. `setZktPassUrl(passUrl: string): void`

Stores ZKT server URL in localStorage.

```typescript
setZktPassUrl('https://zkt-server.example.com');
```

#### 5. `removeZktPassUrl(): void`

Removes ZKT passUrl from localStorage.

### Token Retrieval Priority

When fetching `passUrl`, system checks in this order:

1. **localStorage** (`getZktPassUrl()`)
2. **Zustand Store** (`useTimesheetSettingsStore.getState().zktSavedData?.url`)

**Implementation**:

```typescript
const getPassUrl = (): string | null => {
  const passUrlFromStorage = getZktPassUrl();
  if (passUrlFromStorage) {
    return passUrlFromStorage;
  }
  const zktSavedData = useTimesheetSettingsStore.getState().zktSavedData;
  return zktSavedData?.url || null;
};
```

### Token Lifecycle

1. **Creation**: User authenticates → Token received → Stored in localStorage
2. **Usage**: Retrieved from localStorage for each ZKT request
3. **Validation**: Token validity is checked by ZKT server on each request
4. **Expiration**: If token expires, request fails → Falls back to standard endpoint
5. **Deletion**: User deletes configuration → Token removed from localStorage

---

## State Management

### Zustand Store

**File**: `store/uistate/features/timesheet/settings/index.ts`

### State Structure

```typescript
{
  // Configuration Status
  isZktConfigured: boolean;

  // Saved Configuration Data
  zktSavedData: {
    url: string;        // ZKT server URL
    username: string;   // ZKT username
  } | null;
}
```

### Actions

#### `setIsZktConfigured(isZktConfigured: boolean)`

Updates configuration status.

#### `setZktSavedData(zktSavedData: { url: string; username: string } | null)`

Stores or updates ZKT configuration data.

#### `resetZktConfiguration()`

Resets ZKT configuration:

- Sets `isZktConfigured` to `false`
- Sets `zktSavedData` to `null`
- Removes `zktAuthToken` from localStorage
- Removes `zktPassUrl` from localStorage

### Usage Example

```typescript
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';

const {
  isZktConfigured,
  zktSavedData,
  setIsZktConfigured,
  setZktSavedData,
  resetZktConfiguration,
} = useTimesheetSettingsStore();
```

---

## Error Handling & Fallback

### Error Scenarios

#### 1. **Missing Credentials**

**Error**: `"passUrl is not found in localStorage or store"`
**Location**: `fetchZKTAttendance()`

**Handling**:

- Throws error
- Caught in `getAttendances()`
- Automatically falls back to standard endpoint

#### 2. **Missing Token**

**Error**: `"ZKTToken is not found in localStorage"`
**Location**: `fetchZKTAttendance()`

**Handling**:

- Throws error
- Falls back to standard endpoint

#### 3. **Authentication Failure**

**Error**: ZKT server rejects token
**Location**: Backend API

**Handling**:

- Request fails
- Error caught in try-catch
- Falls back to standard endpoint

#### 4. **Network Errors**

**Error**: Network timeout, connection refused, etc.

**Handling**:

- Error caught
- Falls back to standard endpoint

### Fallback Mechanism

**File**: `store/server/features/timesheet/attendance/queries.ts`

```typescript
const getAttendances = async (query, data) => {
  // Try ZKT endpoint
  if (shouldUseZKTEndpoint(data)) {
    try {
      const zktResponse = await fetchZKTAttendance();
      return zktResponse;
    } catch (error) {
      // Silent fallback - no error shown to user
      // Continue to standard endpoint below
    }
  }

  // Standard endpoint (always works)
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance`,
    method: 'POST',
    headers: requestHeaders,
    data: data,
    params: query,
  });
};
```

**Key Points**:

- ✅ **Silent fallback**: No error message shown to user
- ✅ **Seamless transition**: User doesn't notice the switch
- ✅ **Always works**: Standard endpoint is always available
- ✅ **No data loss**: Same data structure returned

---

## File Structure & Key Components

### Core Files

```
PEP/
├── app/
│   ├── api/
│   │   └── zkt/
│   │       └── auth/
│   │           └── route.ts              # ZKT authentication proxy
│   └── (afterLogin)/(timesheetInformation)/timesheet/settings/
│       └── zkt-addon/
│           └── page.tsx                  # ZKT configuration UI
│
├── store/
│   ├── server/
│   │   └── features/
│   │       ├── timesheet/
│   │       │   ├── attendance/
│   │       │   │   ├── queries.ts        # Main attendance queries (ZKT logic)
│   │       │   │   ├── mutation.ts      # ZKT attendance mutations
│   │       │   │   └── interface.ts      # TypeScript interfaces
│   │       │   └── zkt/
│   │       │       └── mutation.ts       # ZKT authentication mutation
│   │       └── uistate/
│   │           └── features/timesheet/settings/
│   │               └── index.ts          # Zustand store for ZKT config
│
└── utils/
    └── zktToken.ts                       # Token management utilities
```

### File Responsibilities

#### 1. `app/api/zkt/auth/route.ts`

- **Purpose**: Next.js API route for ZKT authentication
- **Function**: Proxy to avoid CORS issues
- **Method**: POST
- **Input**: `{ url, username, password }`
- **Output**: `{ token }`

#### 2. `app/(afterLogin)/(timesheetInformation)/timesheet/settings/zkt-addon/page.tsx`

- **Purpose**: ZKT configuration UI
- **Features**:
  - Form for credentials
  - Display configured state
  - Delete configuration

#### 3. `store/server/features/timesheet/attendance/queries.ts`

- **Purpose**: Main attendance data fetching
- **Key Functions**:
  - `shouldUseZKTEndpoint()`: Decision logic
  - `fetchZKTAttendance()`: ZKT data fetching
  - `getAttendances()`: Main query function with fallback

#### 4. `store/server/features/timesheet/attendance/mutation.ts`

- **Purpose**: ZKT attendance mutations
- **Key Function**: `useFetchZKTAttendance()`: Manual ZKT fetch hook

#### 5. `store/server/features/timesheet/zkt/mutation.ts`

- **Purpose**: ZKT authentication
- **Key Function**: `useAuthenticateZkt()`: Authentication hook

#### 6. `utils/zktToken.ts`

- **Purpose**: Token management utilities
- **Functions**: Get/set/remove token and passUrl

#### 7. `store/uistate/features/timesheet/settings/index.ts`

- **Purpose**: ZKT configuration state management
- **Store**: Zustand store for ZKT settings

---

## API Endpoints

### 1. ZKT Authentication

**Endpoint**: `POST /api/zkt/auth`
**Location**: Next.js API route (client-side accessible)

**Request Body**:

```typescript
{
  url: string; // ZKT server URL
  username: string; // ZKT username
  password: string; // ZKT password
}
```

**Response**:

```typescript
{
  token: string; // JWT token from ZKT server
}
```

**Error Response**:

```typescript
{
  error: string; // Error message
}
```

### 2. ZKT Attendance Data

**Endpoint**: `POST ${TIME_AND_ATTENDANCE_URL}/attendance`
**Location**: Backend API

**Request Body (ZKT Mode)**:

```typescript
{
  passUrl: string; // ZKT server URL
  ZKTToken: string; // Authentication token
  filter: {
    date: {
      from: string; // YYYY-MM-DD format
      to: string; // YYYY-MM-DD format
    }
  }
}
```

**Request Body (Standard Mode)**:

```typescript
{
  exportType?: 'PDF' | 'EXCEL';
  filter: {
    attendanceRecordIds?: string[];
    userIds?: string[];
    type?: 'late' | 'early' | 'absent' | 'present';
    breakTypeId?: string;
    date?: {
      from: string;
      to: string;
    };
    locations?: string[];
  };
  data?: Array<{...}>;
}
```

**Response**:

```typescript
{
  data: AttendanceRecord[];
  // ... other response fields
}
```

### 3. ZKT Server Authentication

**Endpoint**: `POST ${zktUrl}/jwt-api-token-auth/`
**Location**: External ZKT server

**Request Body**:

```typescript
{
  username: string;
  password: string;
}
```

**Response**:

```typescript
{
  token: string; // JWT token
}
```

---

## Code Examples

### Example 1: Using Attendance Query (Automatic ZKT)

```typescript
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';

function AttendanceComponent() {
  // This will automatically use ZKT if querying today's data
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

**Symptoms**: Always using standard endpoint even for today's data

**Possible Causes**:

1. ZKT not configured (`isZktConfigured: false`)
2. Missing token in localStorage
3. Missing passUrl in localStorage
4. Date filter format incorrect
5. Other filters present (userIds, type, etc.)

**Debugging Steps**:

```typescript
// Check configuration
console.log(
  'Is Configured:',
  useTimesheetSettingsStore.getState().isZktConfigured,
);
console.log('Has Token:', hasZktToken());
console.log('PassUrl:', getZktPassUrl());

// Check decision logic
const shouldUse = shouldUseZKTEndpoint(data);
console.log('Should Use ZKT:', shouldUse);
```

**Solution**:

- Ensure ZKT is configured via settings page
- Check localStorage for `zktAuthToken` and `zktPassUrl`
- Verify date filter is exactly today in `YYYY-MM-DD` format
- Remove other filters if testing ZKT

### Issue 2: Authentication Fails

**Symptoms**: Error when saving ZKT credentials

**Possible Causes**:

1. Invalid URL format
2. Incorrect username/password
3. ZKT server not accessible
4. CORS issues (shouldn't happen with proxy)

**Debugging Steps**:

```typescript
// Check network tab for:
// - Request to /api/zkt/auth
// - Response status and error message
// - ZKT server response
```

**Solution**:

- Verify URL is correct and accessible
- Test credentials directly on ZKT server
- Check ZKT server logs
- Verify Next.js API route is working

### Issue 3: Token Expired

**Symptoms**: ZKT requests fail, falls back to standard endpoint

**Possible Causes**:

1. Token expired (JWT tokens have expiration)
2. Token invalid
3. ZKT server changed authentication

**Solution**:

- Re-authenticate via settings page
- Check token expiration in ZKT server settings
- Verify token format is correct

### Issue 4: Fallback Not Working

**Symptoms**: Error shown to user instead of silent fallback

**Possible Causes**:

1. Error not caught in try-catch
2. Standard endpoint also failing

**Solution**:

- Check error handling in `getAttendances()`
- Verify standard endpoint is working
- Check network connectivity

### Issue 5: Date Format Issues

**Symptoms**: ZKT not used even with today's date

**Possible Causes**:

1. Date format mismatch
2. Timezone issues
3. Date comparison logic

**Debugging**:

```typescript
const today = dayjs().format('YYYY-MM-DD');
console.log('Today:', today);
console.log('Filter From:', data.filter?.date?.from);
console.log('Filter To:', data.filter?.date?.to);
console.log(
  'Match:',
  data.filter?.date?.from === today && data.filter?.date?.to === today,
);
```

**Solution**:

- Ensure dates are in `YYYY-MM-DD` format
- Use `dayjs().format('YYYY-MM-DD')` for consistency
- Check timezone settings

### Issue 6: localStorage Not Persisting

**Symptoms**: Configuration lost on page refresh

**Possible Causes**:

1. localStorage disabled
2. Incognito/private mode
3. Storage quota exceeded

**Solution**:

- Check browser localStorage support
- Verify not in private mode
- Check browser console for storage errors

---

## Best Practices

### 1. **Always Provide Fallback**

- Never rely solely on ZKT endpoint
- Always have standard endpoint as backup
- Silent fallback provides better UX

### 2. **Validate Before Using**

- Check token exists before ZKT request
- Check passUrl exists before ZKT request
- Validate date format before comparison

### 3. **Error Handling**

- Catch all ZKT errors
- Log errors for debugging
- Don't show errors to user (silent fallback)

### 4. **Token Management**

- Store tokens securely (localStorage is acceptable for client-side)
- Clear tokens on logout
- Re-authenticate if token expires

### 5. **Date Handling**

- Always use `dayjs().format('YYYY-MM-DD')` for consistency
- Compare dates as strings (not Date objects)
- Handle timezone considerations

### 6. **Testing**

- Test with ZKT configured
- Test with ZKT not configured
- Test with invalid token
- Test with network errors
- Test date filter variations

### 7. **Code Organization**

- Keep ZKT logic separate from standard logic
- Use utility functions for token management
- Centralize decision logic in one function

### 8. **Documentation**

- Document ZKT-specific behavior
- Comment decision logic
- Explain fallback mechanism

---

## Summary

### Key Takeaways

1. **ZKT provides real-time data** for today's attendance only
2. **Automatic endpoint selection** based on query criteria
3. **Graceful fallback** to standard endpoint if ZKT fails
4. **Token-based authentication** via Next.js proxy
5. **Configuration via UI** in settings page
6. **State management** via Zustand and localStorage

### When to Use ZKT

✅ **Use ZKT when**:

- Querying today's attendance data
- No filters or only today's date filter
- Real-time data is needed

❌ **Don't use ZKT when**:

- Exporting data
- Querying historical data (not today)
- Filtering by users, types, locations, etc.
- ZKT is not configured

### Integration Points

- **Configuration**: `/timesheet/settings/zkt-addon`
- **Authentication**: `/api/zkt/auth`
- **Data Fetching**: `useGetAttendances()` hook
- **Token Management**: `utils/zktToken.ts`
- **State Management**: Zustand store

---

## Additional Resources

### Related Files to Review

1. `store/server/features/timesheet/attendance/queries.ts` - Main logic
2. `app/api/zkt/auth/route.ts` - Authentication proxy
3. `utils/zktToken.ts` - Token utilities
4. `store/uistate/features/timesheet/settings/index.ts` - State management

### Environment Variables

- `NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL` - Backend API URL

### Dependencies

- `dayjs` - Date formatting
- `react-query` - Data fetching
- `zustand` - State management
- `axios` - HTTP requests (in API route)

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: Development Team
