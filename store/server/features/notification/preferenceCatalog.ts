import type { NotificationType } from './interface';

export type PreferenceCategoryId =
  | 'channels'
  | 'essential'
  | 'planning_and_okr'
  | 'training'
  | 'people_and_recruitment'
  | 'payroll_and_pay'
  | 'other';

export type DeliveryPreset = 'basic' | 'custom' | 'all';

export interface NotificationPreferenceItem {
  /** Stable preference key (usually backend notificationType). */
  id: string;
  label: string;
  description?: string;
  category: PreferenceCategoryId;
  /** Backend `source_service` when known. */
  sourceService?: string;
  /** Backend route query `notificationType` when known. */
  notificationType?: string;
  /** Locked / always on. */
  required?: boolean;
  defaultEnabled?: boolean;
  /**
   * Basic / essential delivery-preset membership.
   * Marked from product screenshots (off = basic).
   */
  isBasic?: boolean;
  /** True when inferred from the user's notification history. */
  fromHistory?: boolean;
}

/**
 * Preference ids that belong to the Basic delivery preset
 * (from screenshots where toggles were off while differentiating).
 */
export const BASIC_PREFERENCE_IDS = new Set<string>([
  'leave_request',
  'attendance_violation',
  'recognition',
  'planning',
  'employment_type_updated',
  'salary_change',
  'delegation_assigned',
  'feedback',
  'payroll_approval',
  'allowance',
  'benefit',
  'deduction',
  'incentive',
]);

export function isBasicPreference(
  item: Pick<NotificationPreferenceItem, 'id' | 'isBasic'>,
): boolean {
  return item.isBasic === true || BASIC_PREFERENCE_IDS.has(item.id);
}

export const PREFERENCE_CATEGORY_LABELS: Record<PreferenceCategoryId, string> =
  {
    channels: 'Channels',
    essential: 'Essential',
    planning_and_okr: 'Planning and OKR',
    training: 'Training',
    people_and_recruitment: 'People and Recruitment',
    payroll_and_pay: 'Payroll and Pay',
    other: 'Other',
  };

/** Category display order on the All tab. */
export const PREFERENCE_CATEGORY_ORDER: PreferenceCategoryId[] = [
  'channels',
  'essential',
  'planning_and_okr',
  'training',
  'people_and_recruitment',
  'payroll_and_pay',
  'other',
];

const SOURCE_TO_CATEGORY: Record<string, PreferenceCategoryId> = {
  recruitment: 'people_and_recruitment',
  org_structure: 'people_and_recruitment',
  'org-structure': 'people_and_recruitment',
  payroll: 'payroll_and_pay',
  'compensation-and-benefits': 'payroll_and_pay',
  'time-and-attendance': 'essential',
  time_and_attendance: 'essential',
  approval: 'essential',
  'planning-and-reporting': 'planning_and_okr',
  planning: 'planning_and_okr',
  okr: 'planning_and_okr',
  'training-and-learning': 'training',
  'organizational-development': 'essential',
};

/**
 * Known preference types inferred from backend notification emitters
 * across Documents/Projects services.
 */
export const KNOWN_NOTIFICATION_PREFERENCES: NotificationPreferenceItem[] = [
  // Channels (delivery — not backend notificationType)
  {
    id: 'channel_in_app',
    label: 'In-app',
    description: 'Show notifications in the bell inbox',
    category: 'channels',
    defaultEnabled: true,
  },
  {
    id: 'channel_browser_push',
    label: 'Browser push',
    description: 'Browser push alerts when the tab is closed',
    category: 'channels',
    defaultEnabled: true,
  },

  // Essential / T&A / recognition
  {
    id: 'leave_request',
    label: 'Leave request updates',
    description: 'Leave and WFH request status and approvals',
    category: 'essential',
    sourceService: 'time-and-attendance',
    notificationType: 'leave_request',
    defaultEnabled: true,
    isBasic: true,
  },
  {
    id: 'attendance_violation',
    label: 'Attendance rule violations',
    category: 'essential',
    sourceService: 'time-and-attendance',
    notificationType: 'attendance_violation',
    defaultEnabled: true,
    isBasic: true,
  },
  {
    id: 'recognition',
    label: 'Recognition',
    category: 'essential',
    sourceService: 'organizational-development',
    notificationType: 'recognition',
    defaultEnabled: true,
    isBasic: true,
  },

  // Planning / OKR
  {
    id: 'planning',
    label: 'Plan / report updates',
    description: 'Plans, reports, comments, and weekly priorities',
    category: 'planning_and_okr',
    sourceService: 'planning-and-reporting',
    notificationType: 'planning',
    defaultEnabled: true,
    isBasic: true,
  },

  // Training
  {
    id: 'informational',
    label: 'Training assignments',
    description: 'Course assignment and training updates',
    category: 'training',
    sourceService: 'training-and-learning',
    notificationType: 'informational',
    defaultEnabled: true,
  },

  // People / recruitment / org
  {
    id: 'jobApplication',
    label: 'New job applications',
    category: 'people_and_recruitment',
    sourceService: 'recruitment',
    notificationType: 'jobApplication',
    defaultEnabled: true,
  },
  {
    id: 'candidateStageChange',
    label: 'Candidate stage updates',
    category: 'people_and_recruitment',
    sourceService: 'recruitment',
    notificationType: 'candidateStageChange',
    defaultEnabled: true,
  },
  {
    id: 'approvalRequired',
    label: 'Recruitment approvals assigned to you',
    category: 'people_and_recruitment',
    sourceService: 'recruitment',
    notificationType: 'approvalRequired',
    defaultEnabled: true,
  },
  {
    id: 'approvalInitiationRequired',
    label: 'Start recruitment approval',
    category: 'people_and_recruitment',
    sourceService: 'recruitment',
    notificationType: 'approvalInitiationRequired',
    defaultEnabled: true,
  },
  {
    id: 'candidateApprovalOutcome',
    label: 'Candidate approval outcomes',
    category: 'people_and_recruitment',
    sourceService: 'recruitment',
    notificationType: 'candidateApprovalOutcome',
    defaultEnabled: true,
  },
  {
    id: 'hiringManagerAssigned',
    label: 'Hiring manager assignment',
    category: 'people_and_recruitment',
    sourceService: 'recruitment',
    notificationType: 'hiringManagerAssigned',
    defaultEnabled: true,
  },
  {
    id: 'jobChatMention',
    label: 'Job chat mentions',
    category: 'people_and_recruitment',
    sourceService: 'recruitment',
    notificationType: 'jobChatMention',
    defaultEnabled: true,
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
    category: 'people_and_recruitment',
    sourceService: 'recruitment',
    notificationType: 'onboarding',
    defaultEnabled: true,
  },
  {
    id: 'decision',
    label: 'Application decisions',
    category: 'people_and_recruitment',
    sourceService: 'recruitment',
    notificationType: 'decision',
    defaultEnabled: true,
  },
  {
    id: 'org_structure',
    label: 'Organization structure changes',
    category: 'people_and_recruitment',
    sourceService: 'org_structure',
    notificationType: 'org_structure',
    defaultEnabled: true,
  },
  {
    id: 'job_change',
    label: 'Job changes',
    category: 'people_and_recruitment',
    sourceService: 'org_structure',
    notificationType: 'job_change',
    defaultEnabled: true,
  },
  {
    id: 'employment_type_updated',
    label: 'Employment type updates',
    category: 'people_and_recruitment',
    sourceService: 'org_structure',
    notificationType: 'employment_type_updated',
    defaultEnabled: true,
    isBasic: true,
  },
  {
    id: 'salary_change',
    label: 'Salary changes',
    category: 'people_and_recruitment',
    sourceService: 'org_structure',
    notificationType: 'salary_change',
    defaultEnabled: true,
    isBasic: true,
  },
  {
    id: 'resignation_submitted',
    label: 'Resignation submitted',
    category: 'people_and_recruitment',
    sourceService: 'org_structure',
    notificationType: 'resignation_submitted',
    defaultEnabled: true,
  },
  {
    id: 'delegation_assigned',
    label: 'Delegation assigned',
    category: 'people_and_recruitment',
    sourceService: 'org_structure',
    notificationType: 'delegation_assigned',
    defaultEnabled: true,
    isBasic: true,
  },

  // Payroll
  {
    id: 'payroll_approval',
    label: 'Payroll',
    description: 'Payroll approval updates',
    category: 'payroll_and_pay',
    sourceService: 'payroll',
    notificationType: 'payroll_approval',
    defaultEnabled: true,
    isBasic: true,
  },
  {
    id: 'allowance',
    label: 'Allowance',
    category: 'payroll_and_pay',
    sourceService: 'payroll',
    notificationType: 'allowance',
    defaultEnabled: true,
    isBasic: true,
  },
  {
    id: 'benefit',
    label: 'Benefits',
    category: 'payroll_and_pay',
    sourceService: 'payroll',
    notificationType: 'benefit',
    defaultEnabled: true,
    isBasic: true,
  },
  {
    id: 'deduction',
    label: 'Deductions',
    category: 'payroll_and_pay',
    sourceService: 'payroll',
    notificationType: 'deduction',
    defaultEnabled: true,
    isBasic: true,
  },
  {
    id: 'incentive',
    label: 'Incentive',
    category: 'payroll_and_pay',
    sourceService: 'payroll',
    notificationType: 'incentive',
    defaultEnabled: true,
    isBasic: true,
  },

  // Other
  {
    id: 'feedback',
    label: 'Feedback',
    category: 'other',
    sourceService: 'organizational-development',
    notificationType: 'feedback',
    defaultEnabled: true,
    isBasic: true,
  },
];

function humanizeTypeKey(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function normalizeSource(source?: string | null): string {
  return (source ?? '').toLowerCase().replace(/_/g, '-');
}

export function categoryForSourceService(
  sourceService?: string | null,
): PreferenceCategoryId {
  const key = normalizeSource(sourceService);
  if (!key) return 'other';
  if (SOURCE_TO_CATEGORY[key]) return SOURCE_TO_CATEGORY[key];
  for (const [pattern, category] of Object.entries(SOURCE_TO_CATEGORY)) {
    if (key.includes(pattern)) return category;
  }
  return 'other';
}

/** Parse `notificationType` from a notification route/url. */
export function extractNotificationTypeFromItem(
  item: NotificationType,
): string | undefined {
  const raw = (item.route || item.url || '').trim();
  if (!raw) return undefined;
  const search = raw.includes('?') ? raw.split('?')[1] : '';
  if (!search) return undefined;
  const value = new URLSearchParams(search).get('notificationType');
  return value?.trim() || undefined;
}

/**
 * Merge the known backend catalog with distinct types seen in the user's
 * notification history (hybrid approach C).
 */
export function buildHybridPreferenceList(
  historyItems: NotificationType[] = [],
): NotificationPreferenceItem[] {
  const byId = new Map<string, NotificationPreferenceItem>();
  for (const item of KNOWN_NOTIFICATION_PREFERENCES) {
    byId.set(item.id, { ...item });
  }

  for (const historyItem of historyItems) {
    const notificationType = extractNotificationTypeFromItem(historyItem);
    const source = historyItem.source_service;
    const key =
      notificationType ||
      (source
        ? `source:${normalizeSource(source)}`
        : historyItem.title
          ? `title:${historyItem.title.trim().toLowerCase()}`
          : undefined);

    if (!key) continue;
    if (byId.has(key)) continue;

    // Prefer matching known rows by notificationType field even if id differs
    const knownMatch = KNOWN_NOTIFICATION_PREFERENCES.find(
      (p) => p.notificationType === notificationType,
    );
    if (knownMatch) continue;

    byId.set(key, {
      id: key,
      label: notificationType
        ? humanizeTypeKey(notificationType)
        : historyItem.title?.trim() || 'Unknown notification',
      description: historyItem.body?.trim() || undefined,
      category: categoryForSourceService(source),
      sourceService: source,
      notificationType: notificationType,
      defaultEnabled: true,
      fromHistory: true,
    });
  }

  return Array.from(byId.values());
}

export function groupPreferencesByCategory(
  items: NotificationPreferenceItem[],
): Array<{
  category: PreferenceCategoryId;
  label: string;
  items: NotificationPreferenceItem[];
}> {
  const groups = new Map<PreferenceCategoryId, NotificationPreferenceItem[]>();
  for (const item of items) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }

  return PREFERENCE_CATEGORY_ORDER.filter((category) =>
    groups.has(category),
  ).map((category) => ({
    category,
    label: PREFERENCE_CATEGORY_LABELS[category],
    items: groups.get(category) ?? [],
  }));
}

/** Resolve which preference id a live notification maps to. */
export function resolvePreferenceIdForNotification(
  item: NotificationType,
): string | undefined {
  const notificationType = extractNotificationTypeFromItem(item);
  if (notificationType) {
    const byType = KNOWN_NOTIFICATION_PREFERENCES.find(
      (p) => p.notificationType === notificationType,
    );
    if (byType) return byType.id;
    return notificationType;
  }
  const source = normalizeSource(item.source_service);
  if (source) {
    const bySource = KNOWN_NOTIFICATION_PREFERENCES.find(
      (p) => normalizeSource(p.sourceService) === source,
    );
    if (bySource) return bySource.id;
    return `source:${source}`;
  }
  const title = item.title?.trim().toLowerCase();
  return title ? `title:${title}` : undefined;
}

export function isPreferenceEnabled(
  preferenceId: string | undefined,
  enabledById: Record<string, boolean>,
  fallback = true,
): boolean {
  if (!preferenceId) return fallback;
  if (Object.prototype.hasOwnProperty.call(enabledById, preferenceId)) {
    return enabledById[preferenceId] === true;
  }
  const known = KNOWN_NOTIFICATION_PREFERENCES.find(
    (p) => p.id === preferenceId,
  );
  if (known) return known.defaultEnabled !== false;
  return fallback;
}

/**
 * Whether a notification should appear in-app given persisted preferences.
 * Channel `channel_in_app` gates all in-app delivery.
 */
export function isNotificationAllowedInApp(
  item: NotificationType,
  enabledById: Record<string, boolean>,
): boolean {
  if (!isPreferenceEnabled('channel_in_app', enabledById, true)) {
    return false;
  }
  const preferenceId = resolvePreferenceIdForNotification(item);
  return isPreferenceEnabled(preferenceId, enabledById, true);
}

export function filterNotificationsByPreferences<T extends NotificationType>(
  items: T[],
  enabledById: Record<string, boolean>,
): T[] {
  return items.filter((item) => isNotificationAllowedInApp(item, enabledById));
}

export function buildEnabledMapForPreset(
  preferences: NotificationPreferenceItem[],
  preset: DeliveryPreset,
  previous: Record<string, boolean> = {},
): Record<string, boolean> {
  const next: Record<string, boolean> = { ...previous };
  for (const item of preferences) {
    if (preset === 'all') {
      next[item.id] = true;
    } else if (preset === 'basic') {
      next[item.id] = isBasicPreference(item);
    } else if (next[item.id] === undefined) {
      next[item.id] = item.defaultEnabled !== false;
    }
  }
  // Channels stay available on every preset; keep prior channel values unless All.
  if (preset === 'all') {
    next.channel_in_app = true;
    next.channel_browser_push = true;
  } else if (preset === 'basic') {
    // Channels are not "basic types" but in-app should stay on for essentials.
    if (next.channel_in_app === undefined) next.channel_in_app = true;
  }
  return next;
}
