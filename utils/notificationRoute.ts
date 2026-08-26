import type { NotificationType } from '@/store/server/features/notification/interface';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RELATED_ID_KEYS = [
  'employeeId',
  'employee_id',
  'relatedUserId',
  'related_user_id',
  'createdBy',
  'created_by',
  'senderId',
  'sender_id',
  'fromUserId',
  'from_user_id',
  'actorId',
  'actor_id',
  'targetUserId',
  'target_user_id',
  'ownerId',
  'owner_id',
  'planOwnerId',
  'plan_owner_id',
  'requesterId',
  'requester_id',
  'requestorId',
  'applicantId',
  'leaveUserId',
  'userIds',
  'leaveRequestId',
  'leave_request_id',
  'requestId',
  'request_id',
  'approvalWorkflowId',
  'approval_workflow_id',
  'workflowId',
  'workflow_id',
  'delegatorId',
  'delegator_id',
  'delegatedBy',
  'delegated_by',
];

export type NotificationEmployee = {
  id?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
};

export type ResolveNotificationPathOptions = {
  /** Current user (notification recipient) — never used as the “about” employee. */
  recipientUserId?: string;
  employees?: NotificationEmployee[];
};

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value.trim());
}

function splitPath(routeStr: string): { pathname: string; search: string } {
  const s = routeStr.trim();
  if (!s) return { pathname: '', search: '' };
  const [pathname, search = ''] = s.split('?');
  return { pathname, search };
}

function withParams(pathname: string, params: URLSearchParams): string {
  const qs = params.toString();
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return qs ? `${path}?${qs}` : path;
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function firstUuidFromValue(value: unknown): string | undefined {
  if (isUuid(value)) return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstUuidFromValue(item);
      if (found) return found;
    }
  }
  return undefined;
}

function extractIdFromRecord(obj: unknown, depth = 0): string | undefined {
  if (!obj || typeof obj !== 'object' || depth > 3) return undefined;
  const record = obj as Record<string, unknown>;
  for (const key of RELATED_ID_KEYS) {
    const found = firstUuidFromValue(record[key]);
    if (found) return found;
  }
  for (const nestedKey of ['data', 'metadata', 'payload', 'extra', 'context']) {
    const nested = parseMaybeJson(record[nestedKey]);
    const found = extractIdFromRecord(nested, depth + 1);
    if (found) return found;
  }
  return undefined;
}

function extractIdFromQuery(search: string): string | undefined {
  const params = new URLSearchParams(search);
  return (
    firstUuidFromValue(params.get('employeeId')) ||
    firstUuidFromValue(params.get('employee')) ||
    firstUuidFromValue(params.get('createdBy')) ||
    firstUuidFromValue(params.get('userId'))
  );
}

const DELEGATOR_ID_KEYS = [
  'delegatorId',
  'delegator_id',
  'delegatedBy',
  'delegated_by',
  'ownerId',
  'owner_id',
  'requesterId',
  'requester_id',
  'createdBy',
  'created_by',
  'leaveUserId',
];

const LEAVE_REQUEST_ID_KEYS = [
  'leaveRequestId',
  'leave_request_id',
  'requestId',
  'request_id',
];

const APPROVAL_WORKFLOW_ID_KEYS = [
  'approvalWorkflowId',
  'approval_workflow_id',
  'workflowId',
  'workflow_id',
];

function extractIdByKeys(
  obj: unknown,
  keys: string[],
  depth = 0,
): string | undefined {
  if (!obj || typeof obj !== 'object' || depth > 3) return undefined;
  const record = obj as Record<string, unknown>;
  for (const key of keys) {
    const found = firstUuidFromValue(record[key]);
    if (found) return found;
  }
  for (const nestedKey of ['data', 'metadata', 'payload', 'extra', 'context']) {
    const nested = parseMaybeJson(record[nestedKey]);
    const found = extractIdByKeys(nested, keys, depth + 1);
    if (found) return found;
  }
  return undefined;
}

export function extractLeaveRequestContext(item: NotificationType): {
  leaveRequestId?: string;
  approvalWorkflowId?: string;
} {
  const rawRoute = (item.route || item.url || '').trim();
  const { search } = splitPath(rawRoute);
  const params = new URLSearchParams(search);
  const leaveRequestId =
    extractIdByKeys(item, LEAVE_REQUEST_ID_KEYS) ||
    firstUuidFromValue(params.get('leaveRequestId')) ||
    firstUuidFromValue(params.get('requestId'));
  const approvalWorkflowId =
    extractIdByKeys(item, APPROVAL_WORKFLOW_ID_KEYS) ||
    firstUuidFromValue(params.get('approvalWorkflowId')) ||
    firstUuidFromValue(params.get('workflowId'));
  return { leaveRequestId, approvalWorkflowId };
}

function resolveDelegatorEmployeeId(
  item: NotificationType,
  options: ResolveNotificationPathOptions = {},
): string | undefined {
  const skip = options.recipientUserId;
  const rawRoute = (item.route || item.url || '').trim();
  const { search } = splitPath(rawRoute);
  const params = new URLSearchParams(search);
  const fromQuery =
    firstUuidFromValue(params.get('delegatorId')) ||
    firstUuidFromValue(params.get('createdBy'));
  const fromPayload = extractIdByKeys(item, DELEGATOR_ID_KEYS);
  const fromText = findEmployeeIdFromText(
    `${item.title ?? ''} ${item.body ?? ''}`,
    options.employees,
    skip,
  );
  const picked = [fromPayload, fromQuery, fromText].find(
    (id) => id && id !== skip,
  );
  return picked;
}

function isLeaveDelegationNotification(
  text: string,
  pathname: string,
): boolean {
  if (pathname.includes('leave-management') && text.includes('delegat')) {
    return true;
  }
  return (
    (text.includes('delegat') ||
      text.includes('assigned you') ||
      text.includes('acting on behalf')) &&
    (text.includes('leave') ||
      text.includes('absence') ||
      pathname.includes('leave'))
  );
}

function resolveLeaveDelegationPath(
  params: URLSearchParams,
  item: NotificationType,
  options: ResolveNotificationPathOptions,
): string {
  const delegatorId = resolveDelegatorEmployeeId(item, options);
  const { leaveRequestId, approvalWorkflowId } =
    extractLeaveRequestContext(item);
  if (delegatorId) params.set('employeeId', delegatorId);
  if (leaveRequestId) params.set('leaveRequestId', leaveRequestId);
  if (approvalWorkflowId) params.set('approvalWorkflowId', approvalWorkflowId);
  return withParams('/timesheet/leave-management/leaves', params);
}

export function findEmployeeIdFromText(
  text: string,
  employees: NotificationEmployee[] | undefined,
  skipUserId?: string,
): string | undefined {
  if (!text || !employees?.length) return undefined;
  const haystack = text.toLowerCase();
  const candidates: { id: string; name: string }[] = [];
  for (const emp of employees) {
    if (!emp?.id || emp.id === skipUserId) continue;
    const full = [emp.firstName, emp.middleName, emp.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    const firstLast = [emp.firstName, emp.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (full.length >= 5) candidates.push({ id: emp.id, name: full });
    if (
      firstLast.length >= 5 &&
      firstLast.toLowerCase() !== full.toLowerCase()
    ) {
      candidates.push({ id: emp.id, name: firstLast });
    }
  }
  candidates.sort((a, b) => b.name.length - a.name.length);
  for (const candidate of candidates) {
    if (haystack.includes(candidate.name.toLowerCase())) return candidate.id;
  }
  return undefined;
}

export function resolveRelatedEmployeeId(
  item: NotificationType,
  options: ResolveNotificationPathOptions = {},
): string | undefined {
  const skip = options.recipientUserId;
  const rawRoute = (item.route || item.url || '').trim();
  const { search } = splitPath(rawRoute);
  const fromQuery = extractIdFromQuery(search);
  const fromPayload = extractIdFromRecord(item);
  const fromText = findEmployeeIdFromText(
    `${item.title ?? ''} ${item.body ?? ''}`,
    options.employees,
    skip,
  );
  const picked = [fromPayload, fromQuery, fromText].find(
    (id) => id && id !== skip,
  );
  return picked;
}

function haystackOf(item: NotificationType): string {
  return `${item.title ?? ''} ${item.body ?? ''} ${item.source_service ?? ''} ${item.route ?? ''}`.toLowerCase();
}

function isApproverNotification(text: string): boolean {
  return (
    text.includes('your level') ||
    text.includes('at your level') ||
    text.includes('awaiting your') ||
    text.includes('pending your') ||
    text.includes('needs your') ||
    text.includes('waiting for your') ||
    text.includes('new leave request') ||
    text.includes('leave request approval') ||
    text.includes('new wfh request approval') ||
    text.includes('wfh request approval') ||
    text.includes('new work from home request approval') ||
    text.includes('work from home request approval') ||
    (text.includes('approval') &&
      (text.includes('leave') ||
        text.includes('work from home') ||
        text.includes('wfh')))
  );
}

/** First-level or later leave/WFH approval assigned to the logged-in approver. */
function isLeaveApproverActionNotification(text: string): boolean {
  if (isOwnLeaveNotification(text)) return false;
  return (
    text.includes('new leave request approval') ||
    text.includes('leave request approval') ||
    text.includes('new wfh request approval') ||
    text.includes('wfh request approval') ||
    text.includes('new work from home request approval') ||
    text.includes('work from home request approval') ||
    (isApproverNotification(text) &&
      (text.includes('leave') ||
        text.includes('work from home') ||
        text.includes('wfh')))
  );
}

function isOwnLeaveNotification(text: string): boolean {
  return (
    (text.includes('leave') &&
      (text.includes('your leave') ||
        text.includes('leave request submitted') ||
        text.includes('leave request approved') ||
        text.includes('leave request rejected') ||
        text.includes('leave has been'))) ||
    false
  );
}

function isApproverLike(text: string): boolean {
  return (
    isApproverNotification(text) ||
    text.includes('to approve') ||
    text.includes('for approval') ||
    text.includes('pending approval')
  );
}

function isPlanningNotification(
  pathname: string,
  source: string,
  text: string,
): boolean {
  return (
    pathname.includes('planning-and-reporting') ||
    source.includes('planning-and-reporting') ||
    text.includes('plan created') ||
    text.includes('created a plan') ||
    text.includes('submitted a plan') ||
    text.includes('new plan') ||
    text.includes('updated a plan') ||
    text.includes('plan comment') ||
    text.includes('commented on the plan') ||
    text.includes('report created') ||
    text.includes('submitted a report') ||
    text.includes('created a report') ||
    text.includes('updated a report')
  );
}

function isTimesheetNotification(
  pathname: string,
  source: string,
  text: string,
): boolean {
  return (
    pathname.includes('timesheet') ||
    pathname.includes('time-and-attendance') ||
    source.includes('time-and-attendance') ||
    text.includes('leave') ||
    text.includes('work from home') ||
    text.includes('wfh') ||
    text.includes('attendance') ||
    text.includes('check in') ||
    text.includes('check out') ||
    text.includes('rule violation') ||
    text.includes('late arrival')
  );
}

function isTnaNotification(
  pathname: string,
  source: string,
  text: string,
): boolean {
  return (
    pathname.includes('/tna') ||
    source.includes('training') ||
    source.includes('learning') ||
    text.includes('training') ||
    text.includes('tna') ||
    text.includes('course') ||
    text.includes('lesson')
  );
}

function isOkrNotification(
  pathname: string,
  source: string,
  text: string,
): boolean {
  return (
    pathname.includes('/okr') ||
    pathname.includes('weekly-priority') ||
    (source.includes('okr') && !source.includes('planning-and-reporting')) ||
    text.includes('weekly priority') ||
    text.includes('key result') ||
    text.includes('objective') ||
    (/\bokr\b/.test(text) && !text.includes('plan'))
  );
}

function isRecruitmentNotification(
  pathname: string,
  source: string,
  text: string,
): boolean {
  return (
    pathname.includes('recruitment') ||
    source.includes('recruitment') ||
    text.includes('candidate') ||
    text.includes('applicant') ||
    text.includes('job posting') ||
    text.includes('talent pool')
  );
}

function isPayrollNotification(
  pathname: string,
  source: string,
  text: string,
): boolean {
  return (
    pathname.includes('payroll') ||
    pathname.includes('mypayroll') ||
    source.includes('payroll') ||
    text.includes('payslip') ||
    text.includes('pay slip') ||
    text.includes('payroll')
  );
}

function isCompensationNotification(
  pathname: string,
  source: string,
  text: string,
): boolean {
  return (
    pathname.includes('allowance') ||
    pathname.includes('benefit') ||
    pathname.includes('deduction') ||
    pathname.includes('compensationsetting') ||
    source.includes('compensation') ||
    text.includes('allowance') ||
    text.includes('benefit') ||
    text.includes('deduction')
  );
}

function isIncentiveNotification(
  pathname: string,
  source: string,
  text: string,
): boolean {
  return (
    pathname.includes('incentive') ||
    pathname.includes('variable-pay') ||
    source.includes('incentive') ||
    text.includes('incentive') ||
    text.includes('variable pay')
  );
}

function isFeedbackNotification(
  pathname: string,
  source: string,
  text: string,
): boolean {
  return (
    pathname.includes('feedback') ||
    source.includes('feedback') ||
    source.includes('conversation') ||
    text.includes('recognition') ||
    text.includes('meeting') ||
    text.includes('survey') ||
    text.includes('conversation') ||
    text.includes('feedback')
  );
}

function isOrgNotification(
  pathname: string,
  source: string,
  text: string,
): boolean {
  return (
    pathname.includes('organization') ||
    source.includes('org-structure') ||
    text.includes('fiscal year') ||
    text.includes('quarter') ||
    text.includes('org chart') ||
    text.includes('branch')
  );
}

function isEmployeeNotification(
  pathname: string,
  source: string,
  text: string,
): boolean {
  return (
    (pathname.includes('/employees') &&
      !pathname.includes('/employees/notification')) ||
    source.includes('employee') ||
    text.includes('employee profile') ||
    text.includes('new employee') ||
    text.includes('onboard')
  );
}

function ensureParam(params: URLSearchParams, key: string, value?: string) {
  if (value && !params.get(key)) params.set(key, value);
}

function attachEmployee(params: URLSearchParams, employeeId?: string) {
  if (employeeId) {
    params.set('employeeId', employeeId);
    params.set('userId', employeeId);
  }
}

function pathHasUuid(pathname: string): boolean {
  return pathname.split('/').some((part) => isUuid(part));
}

function resolveTimesheetPath(
  pathname: string,
  params: URLSearchParams,
  text: string,
  employeeId?: string,
  item?: NotificationType,
): string {
  if (employeeId) params.set('employeeId', employeeId);

  if (item) {
    const ctx = extractLeaveRequestContext(item);
    if (ctx.leaveRequestId) params.set('leaveRequestId', ctx.leaveRequestId);
    if (ctx.approvalWorkflowId) {
      params.set('approvalWorkflowId', ctx.approvalWorkflowId);
    }
  }

  const isWfh = text.includes('work from home') || /\bwfh\b/.test(text);
  const isViolation =
    text.includes('rule violation') ||
    text.includes('late arrival') ||
    text.includes('absent');
  const isHrLeave =
    pathname.includes('leave-management') || text.includes('leave management');
  const isEmployeeAttendance =
    pathname.includes('employee-attendance') ||
    isViolation ||
    (text.includes('attendance') &&
      !pathname.includes('my-timesheet') &&
      (text.includes('employee') || text.includes('team')));

  const isMyTimesheetContext =
    !pathname ||
    pathname === '/timesheet' ||
    pathname.startsWith('/timesheet/my-timesheet');

  // Both first approver ("New Leave Request") and later levels
  // ("Leave Request Approval") open My Approvals — ignore generic backend routes.
  if (isLeaveApproverActionNotification(text)) {
    params.set('type', isWfh ? 'WorkFromHome' : 'Leave');
    return withParams('/timesheet/my-timesheet/my-approvals', params);
  }

  if (isApproverNotification(text) && (isMyTimesheetContext || !pathname)) {
    params.set('type', isWfh ? 'WorkFromHome' : 'Leave');
    return withParams('/timesheet/my-timesheet/my-approvals', params);
  }

  if (isHrLeave) {
    return withParams('/timesheet/leave-management/leaves', params);
  }

  if (isEmployeeAttendance) {
    if (!params.get('tab')) {
      params.set('tab', isViolation ? 'violations' : 'attendance');
    }
    return withParams('/timesheet/employee-attendance', params);
  }

  if (pathname.includes('/my-approvals')) {
    params.set('type', isWfh ? 'WorkFromHome' : 'Leave');
    return withParams('/timesheet/my-timesheet/my-approvals', params);
  }

  if (
    pathname.includes('/leave') ||
    pathname.includes('/attendance') ||
    pathname.includes('/work-from-home')
  ) {
    return withParams(pathname, params);
  }

  if (isWfh) {
    if (isApproverLike(text)) {
      params.set('type', 'WorkFromHome');
      return withParams('/timesheet/my-timesheet/my-approvals', params);
    }
    ensureParam(params, 'scope', 'my');
    return withParams('/timesheet/my-timesheet/work-from-home', params);
  }

  if (isOwnLeaveNotification(text) || text.includes('leave')) {
    if (isApproverLike(text)) {
      params.set('type', 'Leave');
      return withParams('/timesheet/my-timesheet/my-approvals', params);
    }
    return withParams('/timesheet/my-timesheet/leave', params);
  }

  if (
    text.includes('attendance') ||
    text.includes('check in') ||
    text.includes('check out')
  ) {
    return withParams('/timesheet/my-timesheet/attendance', params);
  }

  if (
    !pathname ||
    pathname === '/timesheet/my-timesheet' ||
    pathname === '/timesheet/my-timesheet/overview' ||
    pathname === '/timesheet'
  ) {
    return withParams('/timesheet/my-timesheet/overview', params);
  }

  return withParams(pathname, params);
}

function resolvePlanningPath(
  pathname: string,
  params: URLSearchParams,
  text: string,
  employeeId?: string,
): string {
  attachEmployee(params, employeeId);

  const isReport =
    text.includes('report created') ||
    text.includes('submitted a report') ||
    text.includes('created a report') ||
    text.includes('report approval') ||
    (text.includes('report') && !text.includes('plan'));

  if (!params.get('tab')) {
    params.set('tab', isReport ? 'report' : 'plan');
  }

  const base =
    pathname.includes('planning-and-reporting') && pathname.startsWith('/')
      ? pathname.split('?')[0]
      : '/planning-and-reporting';
  return withParams(base, params);
}

function resolveTnaPath(
  pathname: string,
  params: URLSearchParams,
  text: string,
  employeeId?: string,
): string {
  attachEmployee(params, employeeId);
  if (pathHasUuid(pathname)) return withParams(pathname, params);
  if (isApproverLike(text) || pathname.includes('review')) {
    return withParams('/tna/review', params);
  }
  if (pathname.includes('management')) {
    return withParams('/tna/management', params);
  }
  return withParams('/tna/my-training', params);
}

function resolveOkrPath(
  pathname: string,
  params: URLSearchParams,
  text: string,
  employeeId?: string,
): string {
  attachEmployee(params, employeeId);
  if (
    pathname.includes('weekly-priority') ||
    text.includes('weekly priority')
  ) {
    if (!params.get('tab')) {
      params.set('tab', text.includes('team') ? 'team' : 'department');
    }
    return withParams('/weekly-priority', params);
  }
  if (
    text.includes('variable pay') ||
    /\bvp\b/.test(text) ||
    pathname.includes('/okr/dashboard')
  ) {
    return withParams(
      employeeId ? `/okr/dashboard/${employeeId}` : '/okr/dashboard',
      params,
    );
  }
  if (pathHasUuid(pathname)) return withParams(pathname, params);
  if (!params.get('tab') && employeeId) params.set('tab', '2');
  return withParams('/okr', params);
}

function resolveRecruitmentPath(
  pathname: string,
  params: URLSearchParams,
  text: string,
  employeeId?: string,
): string {
  attachEmployee(params, employeeId);
  if (pathHasUuid(pathname)) return withParams(pathname, params);
  if (text.includes('talent pool') || pathname.includes('talent-resource')) {
    return withParams('/recruitment/talent-resource', params);
  }
  if (text.includes('job') && !text.includes('candidate')) {
    return withParams('/recruitment/jobs', params);
  }
  return withParams('/recruitment/candidate', params);
}

function resolvePayrollPath(
  pathname: string,
  params: URLSearchParams,
  text: string,
  employeeId?: string,
): string {
  attachEmployee(params, employeeId);
  if (
    pathname.toLowerCase().includes('mypayroll') ||
    text.includes('payslip') ||
    text.includes('pay slip') ||
    text.includes('my payroll')
  ) {
    return withParams('/myPayroll', params);
  }
  if (employeeId) {
    return withParams(`/employee-information/${employeeId}`, params);
  }
  return withParams(
    pathname.includes('payroll') ? pathname : '/payroll',
    params,
  );
}

function resolveCompensationPath(
  pathname: string,
  params: URLSearchParams,
  text: string,
  employeeId?: string,
): string {
  attachEmployee(params, employeeId);
  if (pathname.includes('compensationsetting') || text.includes('setting')) {
    return withParams(
      pathname.includes('compensationsetting')
        ? pathname
        : '/compensationSetting/allowanceType',
      params,
    );
  }
  if (text.includes('benefit') || pathname.includes('benefit')) {
    return withParams('/benefit', params);
  }
  if (text.includes('deduction') || pathname.includes('deduction')) {
    return withParams('/deduction', params);
  }
  return withParams('/allowance', params);
}

function resolveIncentivePath(
  pathname: string,
  params: URLSearchParams,
  text: string,
  employeeId?: string,
): string {
  attachEmployee(params, employeeId);
  if (text.includes('variable pay') || pathname.includes('variable-pay')) {
    return withParams('/variable-pay', params);
  }
  return withParams('/incentives', params);
}

function resolveFeedbackPath(
  pathname: string,
  params: URLSearchParams,
  text: string,
  employeeId?: string,
): string {
  attachEmployee(params, employeeId);
  if (pathHasUuid(pathname)) return withParams(pathname, params);
  if (text.includes('recognition') || pathname.includes('recognition')) {
    return withParams('/feedback/recognition', params);
  }
  if (text.includes('meeting') || pathname.includes('meeting')) {
    return withParams('/feedback/meeting', params);
  }
  if (text.includes('conversation') || pathname.includes('conversation')) {
    return withParams('/feedback/conversation', params);
  }
  return withParams('/feedback/feedback', params);
}

function resolveOrgPath(
  pathname: string,
  params: URLSearchParams,
  text: string,
): string {
  if (pathHasUuid(pathname)) return withParams(pathname, params);
  if (text.includes('fiscal') || text.includes('quarter')) {
    return withParams(
      '/organization/settings/fiscalYear/fiscalYearCard',
      params,
    );
  }
  if (text.includes('branch')) {
    return withParams('/organization/settings/branches', params);
  }
  if (text.includes('chart') || pathname.includes('chart')) {
    return withParams('/organization/chart/org-structure', params);
  }
  return withParams(
    pathname.startsWith('/organization') ? pathname : '/organization/chart',
    params,
  );
}

function resolveEmployeePath(
  pathname: string,
  params: URLSearchParams,
  employeeId?: string,
): string {
  attachEmployee(params, employeeId);
  if (pathHasUuid(pathname)) return withParams(pathname, params);
  if (employeeId) {
    return withParams(`/employees/manage-employees/${employeeId}`, params);
  }
  return withParams('/employees/manage-employees', params);
}

/**
 * Maps a notification to a specific in-app path.
 * Backend routes are often generic parent pages; this upgrades them to the
 * matching tab and employee/entity filter so every type behaves the same way.
 */
export function resolveNotificationPath(
  item: NotificationType,
  options: ResolveNotificationPathOptions = {},
): string {
  const raw = (item.route || item.url || '').trim();
  const prefixed = raw ? (raw.startsWith('/') ? raw : `/${raw}`) : '';
  const { pathname, search } = splitPath(prefixed);
  const params = new URLSearchParams(search);
  const text = haystackOf(item);
  const source = (item.source_service ?? '').toLowerCase().replace(/_/g, '-');
  const employeeId = resolveRelatedEmployeeId(item, options);

  if (isPlanningNotification(pathname, source, text)) {
    return resolvePlanningPath(pathname, params, text, employeeId);
  }
  if (isTnaNotification(pathname, source, text)) {
    return resolveTnaPath(pathname, params, text, employeeId);
  }
  if (isOkrNotification(pathname, source, text)) {
    return resolveOkrPath(pathname, params, text, employeeId);
  }
  if (isRecruitmentNotification(pathname, source, text)) {
    return resolveRecruitmentPath(pathname, params, text, employeeId);
  }
  if (isPayrollNotification(pathname, source, text)) {
    return resolvePayrollPath(pathname, params, text, employeeId);
  }
  if (isCompensationNotification(pathname, source, text)) {
    return resolveCompensationPath(pathname, params, text, employeeId);
  }
  if (isIncentiveNotification(pathname, source, text)) {
    return resolveIncentivePath(pathname, params, text, employeeId);
  }
  if (isFeedbackNotification(pathname, source, text)) {
    return resolveFeedbackPath(pathname, params, text, employeeId);
  }
  if (isLeaveDelegationNotification(text, pathname)) {
    return resolveLeaveDelegationPath(params, item, options);
  }
  if (isTimesheetNotification(pathname, source, text)) {
    return resolveTimesheetPath(pathname, params, text, employeeId, item);
  }
  if (isOrgNotification(pathname, source, text)) {
    return resolveOrgPath(pathname, params, text);
  }
  if (isEmployeeNotification(pathname, source, text)) {
    return resolveEmployeePath(pathname, params, employeeId);
  }

  if (prefixed) {
    if (employeeId) ensureParam(params, 'employeeId', employeeId);
    return withParams(pathname, params);
  }

  return `/employees/notification?id=${encodeURIComponent(item.id)}`;
}
