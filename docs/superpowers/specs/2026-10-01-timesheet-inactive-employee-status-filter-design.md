# Timesheet: Active/Inactive status filter for Attendance & Leave history

**Date:** 2026-10-01  
**Status:** Approved for planning  
**Repos:** `organizational-structure-and-employee-information-frontend` (primary); `time-and-attendance-backend` only if a list endpoint still blanks inactive users after the frontend change

## Problem

After an employee is deactivated (Org `user_role.deletedAt` set), HR cannot select them in Timesheet Employee Attendance or Leave Management filters. Those pickers use active-only Org user lists, so attendance and leave history that still exists in T&A by `userId` is unreachable from the admin UI.

## Goal

Let HR filter Employee Attendance, Leave Management (Leaves), and Leave Balance by **Status: Active | Inactive** the same way Manage Employees does, and when Status is Inactive, view that cohort’s historical data.

## Non-goals

- New Attendance/Leave tabs on employee detail
- Changing global `useGetAllUsers` app-wide
- Creating, editing, approving, or adjusting leave/attendance/balances for inactive employees
- Dashboard or other Timesheet screens beyond the three named below
- Firebase disable / login / reactivate / offboarding changes

## UX

Add a **Status** select on:

1. Employee Attendance table filters  
2. Leave Management → Leaves filters  
3. Leave Management → Leave Balance filters  

| Option | Behavior | Org mapping |
|--------|----------|-------------|
| Active (default) | Current behavior | `deletedAt = null` (active membership) |
| Inactive | Show deactivated employees and their history | `deletedAt = notNull` |
| Cleared | Treat as Active | active only |

**View-only when Inactive:** hide/disable new leave request, balance adjust, and attendance correction entry points on these screens. Viewing existing table/history data remains allowed.

**Status switch:** clearing/changing Status clears the selected employee (and employee-scoped filter fields) so a stale ID is not kept across cohorts.

**Inactive + no employee selected:** do not load “all inactive” history by default; require an employee selection (or keep empty / prompt) so queries stay bounded—especially Leave Balance, which is already employee-scoped.

Optional: Inactive badge on employee options when Status is Inactive (not required if Status makes the cohort clear).

## Architecture

### Shared frontend hook

Introduce a timesheet-scoped hook/helper, e.g. `useTimesheetFilterUsers(status)`, that fetches Org users with the same deletedAt semantics as Manage Employees (`allStatus` → `deletedAt=null` | `deletedAt=notNull`).

Do **not** change `useGetAllUsers` / other shared active-only consumers used for create/assign flows.

### Screen wiring

| Screen | Change |
|--------|--------|
| Employee Attendance | Status in filter form/UI store → drives employee Select options; attendance queries continue to use `userIds` when an employee is selected |
| Leaves | Same Status → employee options; leave-request list filters by selected `userId`(s) as today |
| Leave Balance | Same Status → employee Select; existing `/leave-balance/...` calls by `userId` unchanged |

Default Status = Active on load so production behavior is unchanged until HR selects Inactive.

### Name resolution

Any name cell that resolves users via an active-only cache must use the status-aware list (or fall back to showing the ID) so Inactive rows do not show “Unknown”.

### Backend

Attendance and leave-request history are stored in T&A by `userId` and should return data once inactive IDs are selectable.

Leave balance by `userId` should likewise work without Org “active only” intersection.

If, after frontend work, a specific list still returns empty for Inactive because it intersects with Org `getAllActiveUsers`, add a **narrow** T&A fix for that admin history path only. Do not change crons, exports, or default active-user sync to include inactive users globally.

## Error handling

- Org user fetch failure → empty employee options + existing toast/error pattern  
- T&A history failure → existing table error/empty states; no special inactive-only copy required  

Soft-deleted Org HR rows (job/docs/info cascade on deactivate) do not block T&A history lookups by `userId`.

## Testing

- Active (default): pickers and data match current behavior  
- Inactive: inactive employees appear in the picker; selecting one shows attendance / leaves / leave balance history  
- View-only: create/edit/adjust actions unavailable under Inactive  
- Switching Status clears employee selection  
- Manage Employees and unrelated modules still use active-only pickers where they do today  

## Success criteria

HR can set Status to Inactive on Attendance, Leaves, and Leave Balance, pick a deactivated employee, and see their historical attendance and leave data without being able to mutate that employee’s timesheet state from those screens.
