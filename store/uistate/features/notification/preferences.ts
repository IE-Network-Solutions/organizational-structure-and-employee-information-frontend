import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NotificationType } from '@/store/server/features/notification/interface';

export type NotificationPreferenceCategory =
  | 'Essential'
  | 'Leave and attendance'
  | 'Approvals'
  | 'Planning and OKR'
  | 'Training'
  | 'People and recruitment'
  | 'Payroll and pay'
  | 'Organization'
  | 'Other';

export type NotificationDeliveryPreset = 'basic' | 'all' | 'custom';

export interface NotificationPreferenceType {
  key: string;
  label: string;
  category: NotificationPreferenceCategory;
  enabled: boolean;
  locked?: boolean;
}

export interface NotificationPreferenceChannels {
  inApp: boolean;
  push: boolean;
}

interface NotificationPreferencesState {
  channels: NotificationPreferenceChannels;
  types: NotificationPreferenceType[];
  preset: NotificationDeliveryPreset;
  setChannel: (
    channel: keyof NotificationPreferenceChannels,
    enabled: boolean,
  ) => void;
  setTypeEnabled: (key: string, enabled: boolean) => void;
  setPreset: (preset: NotificationDeliveryPreset) => void;
  muteTypeFromNotification: (item: NotificationType) => string;
  ensureTypeFromNotification: (item: NotificationType) => string;
}

const SEED_TYPES: NotificationPreferenceType[] = [
  {
    key: 'essential.security',
    label: 'Account security alerts',
    category: 'Essential',
    enabled: true,
    locked: true,
  },
  {
    key: 'essential.approvals-action',
    label: 'Items waiting for your approval',
    category: 'Essential',
    enabled: true,
    locked: true,
  },
  {
    key: 'leave.own-status',
    label: 'Your leave request status',
    category: 'Essential',
    enabled: true,
  },
  {
    key: 'leave.wfh-status',
    label: 'Work from home updates',
    category: 'Essential',
    enabled: true,
  },
  {
    key: 'leave.delegation',
    label: 'Leave delegation',
    category: 'Essential',
    enabled: true,
  },
  {
    key: 'leave.late',
    label: 'Late arrival',
    category: 'Essential',
    enabled: true,
  },
  {
    key: 'leave.absent',
    label: 'Absent',
    category: 'Essential',
    enabled: true,
  },
  {
    key: 'leave.rule-violation',
    label: 'Attendance rule violations',
    category: 'Essential',
    enabled: true,
  },
  {
    key: 'approvals.leave',
    label: 'Leave approvals assigned to you',
    category: 'Essential',
    enabled: true,
  },
  {
    key: 'approvals.wfh',
    label: 'WFH approvals assigned to you',
    category: 'Essential',
    enabled: true,
  },
  {
    key: 'other.recognition',
    label: 'Recognition',
    category: 'Essential',
    enabled: true,
  },
  {
    key: 'planning.plan-created',
    label: 'Plan created',
    category: 'Planning and OKR',
    enabled: true,
  },
  {
    key: 'planning.plan-submitted',
    label: 'Plan submitted',
    category: 'Planning and OKR',
    enabled: true,
  },
  {
    key: 'planning.plan-updated',
    label: 'Plan updated',
    category: 'Planning and OKR',
    enabled: true,
  },
  {
    key: 'planning.report-created',
    label: 'Report created',
    category: 'Planning and OKR',
    enabled: true,
  },
  {
    key: 'planning.report-submitted',
    label: 'Report submitted',
    category: 'Planning and OKR',
    enabled: true,
  },
  {
    key: 'planning.report-updated',
    label: 'Report updated',
    category: 'Planning and OKR',
    enabled: true,
  },
  {
    key: 'planning.plan-comments',
    label: 'Plan comments',
    category: 'Planning and OKR',
    enabled: true,
  },
  {
    key: 'planning.report-comments',
    label: 'Report comments',
    category: 'Planning and OKR',
    enabled: true,
  },
  {
    key: 'okr.updates',
    label: 'OKR updates',
    category: 'Planning and OKR',
    enabled: true,
  },
  {
    key: 'okr.weekly-priority',
    label: 'Weekly priority',
    category: 'Planning and OKR',
    enabled: true,
  },
  {
    key: 'okr.key-results',
    label: 'Key results',
    category: 'Planning and OKR',
    enabled: true,
  },
  {
    key: 'training.assignments',
    label: 'Training assignments',
    category: 'Training',
    enabled: true,
  },
  {
    key: 'training.courses',
    label: 'Course updates',
    category: 'Training',
    enabled: true,
  },
  {
    key: 'training.lessons',
    label: 'Lesson updates',
    category: 'Training',
    enabled: true,
  },
  {
    key: 'training.reminders',
    label: 'Training reminders',
    category: 'Training',
    enabled: true,
  },
  {
    key: 'recruitment.candidates',
    label: 'Candidate updates',
    category: 'People and recruitment',
    enabled: true,
  },
  {
    key: 'recruitment.applicants',
    label: 'Applicant updates',
    category: 'People and recruitment',
    enabled: true,
  },
  {
    key: 'recruitment.jobs',
    label: 'Job posting',
    category: 'People and recruitment',
    enabled: true,
  },
  {
    key: 'recruitment.talent-pool',
    label: 'Talent pool',
    category: 'People and recruitment',
    enabled: true,
  },
  {
    key: 'people.employee-profile',
    label: 'Employee profile',
    category: 'People and recruitment',
    enabled: true,
  },
  {
    key: 'people.onboarding',
    label: 'Onboarding',
    category: 'People and recruitment',
    enabled: true,
  },
  {
    key: 'payroll.payslip',
    label: 'Payslip',
    category: 'Payroll and pay',
    enabled: true,
  },
  {
    key: 'payroll.payroll',
    label: 'Payroll',
    category: 'Payroll and pay',
    enabled: true,
  },
  {
    key: 'comp.allowance',
    label: 'Allowance',
    category: 'Payroll and pay',
    enabled: true,
  },
  {
    key: 'comp.benefits',
    label: 'Benefits',
    category: 'Payroll and pay',
    enabled: true,
  },
  {
    key: 'comp.deductions',
    label: 'Deductions',
    category: 'Payroll and pay',
    enabled: true,
  },
  {
    key: 'incentive.updates',
    label: 'Incentive',
    category: 'Payroll and pay',
    enabled: true,
  },
  {
    key: 'incentive.variable-pay',
    label: 'Variable pay',
    category: 'Payroll and pay',
    enabled: true,
  },
  {
    key: 'org.fiscal-year',
    label: 'Fiscal year',
    category: 'Organization',
    enabled: true,
  },
  {
    key: 'org.quarter-completion',
    label: 'Quarter completion',
    category: 'Organization',
    enabled: true,
  },
  {
    key: 'org.chart',
    label: 'Org chart updates',
    category: 'Organization',
    enabled: true,
  },
  {
    key: 'org.branch',
    label: 'Branch updates',
    category: 'Organization',
    enabled: true,
  },
  {
    key: 'other.survey',
    label: 'Survey',
    category: 'Other',
    enabled: true,
  },
  {
    key: 'other.conversation',
    label: 'Conversation',
    category: 'Other',
    enabled: true,
  },
  {
    key: 'other.general',
    label: 'General product updates',
    category: 'Other',
    enabled: true,
  },
];

export const PREFERENCE_CATEGORY_ORDER: NotificationPreferenceCategory[] = [
  'Essential',
  'Planning and OKR',
  'Training',
  'People and recruitment',
  'Payroll and pay',
  'Organization',
  'Other',
];

const ESSENTIAL_KEYS = new Set(
  SEED_TYPES.filter((t) => t.category === 'Essential').map((t) => t.key),
);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
}

function labelFromItem(item: NotificationType): string {
  const title = (item.title ?? '').trim();
  if (title) return title.length > 60 ? `${title.slice(0, 57)}...` : title;
  const body = (item.body ?? '').trim();
  if (body) return body.length > 60 ? `${body.slice(0, 57)}...` : body;
  return 'Notifications like this';
}

function haystack(item: NotificationType): {
  text: string;
  source: string;
  route: string;
} {
  const source = (item.source_service ?? '').toLowerCase().replace(/_/g, '-');
  const route = (item.route ?? '').toLowerCase();
  const text =
    `${item.title ?? ''} ${item.body ?? ''} ${source} ${route}`.toLowerCase();
  return { text, source, route };
}

/** Map inbox items onto stable seed keys when heuristics match. */
export function resolveSeedKeyFromItem(item: NotificationType): string | null {
  const { text, source, route } = haystack(item);

  if (
    text.includes('security') ||
    text.includes('new device') ||
    text.includes('logged in')
  ) {
    return 'essential.security';
  }

  const isWfh =
    text.includes('wfh') ||
    text.includes('work from home') ||
    text.includes('work-from-home');
  const isLeave = text.includes('leave') || route.includes('leave');
  const isApprover =
    text.includes('approval') ||
    text.includes('to approve') ||
    text.includes('awaiting your') ||
    text.includes('at your level') ||
    text.includes('pending your') ||
    text.includes('needs your');

  if (isApprover && isWfh) return 'approvals.wfh';
  if (
    isApprover &&
    isLeave &&
    !text.includes('your leave') &&
    !text.includes('leave request submitted') &&
    !text.includes('leave request approved') &&
    !text.includes('leave request rejected')
  ) {
    return 'approvals.leave';
  }
  if (isApprover) return 'essential.approvals-action';

  if (
    text.includes('acting on behalf') ||
    text.includes('delegat') ||
    (text.includes('assigned you') && isLeave)
  ) {
    return 'leave.delegation';
  }

  if (text.includes('rule violation') || text.includes('early clock')) {
    return 'leave.rule-violation';
  }
  if (
    text.includes('late arrival') ||
    (text.includes('attendance') &&
      (text.includes('late') || text.includes('tardy')))
  ) {
    return 'leave.late';
  }
  if (text.includes('absent')) return 'leave.absent';

  if (
    isWfh &&
    (text.includes('your') ||
      text.includes('submitted') ||
      text.includes('approved') ||
      text.includes('rejected') ||
      text.includes('status'))
  ) {
    return 'leave.wfh-status';
  }

  if (
    isLeave &&
    (text.includes('your leave') ||
      text.includes('leave request submitted') ||
      text.includes('leave request approved') ||
      text.includes('leave request rejected') ||
      text.includes('leave has been'))
  ) {
    return 'leave.own-status';
  }

  if (
    text.includes('commented on the report') ||
    text.includes('report comment')
  ) {
    return 'planning.report-comments';
  }
  if (text.includes('plan comment') || text.includes('commented on the plan')) {
    return 'planning.plan-comments';
  }

  if (
    text.includes('submitted a report') ||
    text.includes('report submitted')
  ) {
    return 'planning.report-submitted';
  }
  if (text.includes('updated a report') || text.includes('report updated')) {
    return 'planning.report-updated';
  }
  if (
    text.includes('report created') ||
    text.includes('created a report') ||
    text.includes('new report')
  ) {
    return 'planning.report-created';
  }

  if (text.includes('submitted a plan') || text.includes('plan submitted')) {
    return 'planning.plan-submitted';
  }
  if (text.includes('updated a plan') || text.includes('plan updated')) {
    return 'planning.plan-updated';
  }
  if (
    text.includes('plan created') ||
    text.includes('created a plan') ||
    text.includes('new plan')
  ) {
    return 'planning.plan-created';
  }
  if (source.includes('planning-and-reporting')) {
    return 'planning.plan-updated';
  }

  if (text.includes('weekly priority')) return 'okr.weekly-priority';
  if (text.includes('key result')) return 'okr.key-results';
  if (
    text.includes('objective') ||
    (/\bokr\b/.test(text) && !text.includes('plan')) ||
    (source.includes('okr') && !source.includes('planning-and-reporting'))
  ) {
    return 'okr.updates';
  }

  if (
    text.includes('reminder') &&
    (text.includes('training') ||
      text.includes('course') ||
      source.includes('training') ||
      source.includes('learning'))
  ) {
    return 'training.reminders';
  }
  if (text.includes('lesson')) return 'training.lessons';
  if (text.includes('course')) return 'training.courses';
  if (
    text.includes('training') ||
    text.includes('tna') ||
    source.includes('training') ||
    source.includes('learning')
  ) {
    return 'training.assignments';
  }

  if (text.includes('talent pool')) return 'recruitment.talent-pool';
  if (text.includes('job posting') || text.includes('job ')) {
    return 'recruitment.jobs';
  }
  if (text.includes('applicant')) return 'recruitment.applicants';
  if (text.includes('candidate') || source.includes('recruitment')) {
    return 'recruitment.candidates';
  }
  if (text.includes('onboard')) return 'people.onboarding';
  if (
    text.includes('new employee') ||
    text.includes('employee profile') ||
    source.includes('employee')
  ) {
    return 'people.employee-profile';
  }

  if (text.includes('variable pay')) return 'incentive.variable-pay';
  if (text.includes('incentive') || source.includes('incentive')) {
    return 'incentive.updates';
  }
  if (text.includes('deduction')) return 'comp.deductions';
  if (text.includes('benefit')) return 'comp.benefits';
  if (text.includes('allowance') || source.includes('compensation')) {
    return 'comp.allowance';
  }
  if (text.includes('payslip') || text.includes('pay slip')) {
    return 'payroll.payslip';
  }
  if (text.includes('payroll') || source.includes('payroll')) {
    return 'payroll.payroll';
  }

  if (text.includes('quarter') || route.includes('quarter_completion')) {
    return 'org.quarter-completion';
  }
  if (text.includes('fiscal')) return 'org.fiscal-year';
  if (text.includes('branch')) return 'org.branch';
  if (
    source.includes('org-structure') ||
    text.includes('org chart') ||
    text.includes('organization structure')
  ) {
    return 'org.chart';
  }

  if (text.includes('recognition')) return 'other.recognition';
  if (text.includes('survey')) return 'other.survey';
  if (
    text.includes('conversation') ||
    text.includes('feedback') ||
    text.includes('meeting') ||
    source.includes('feedback') ||
    source.includes('conversation')
  ) {
    return 'other.conversation';
  }

  return null;
}

function categorizeFromText(
  text: string,
  source: string,
  route: string,
): NotificationPreferenceCategory {
  if (
    text.includes('security') ||
    text.includes('new device') ||
    (text.includes('approval') &&
      (text.includes('awaiting your') || text.includes('at your level')))
  ) {
    return 'Essential';
  }
  if (
    text.includes('approval') ||
    text.includes('to approve') ||
    text.includes('awaiting your')
  ) {
    return 'Approvals';
  }
  if (
    source.includes('planning') ||
    text.includes('plan ') ||
    text.includes('report ') ||
    text.includes('okr') ||
    text.includes('weekly priority') ||
    text.includes('key result')
  ) {
    return 'Planning and OKR';
  }
  if (
    source.includes('training') ||
    source.includes('learning') ||
    text.includes('training') ||
    text.includes('tna') ||
    text.includes('course') ||
    text.includes('lesson')
  ) {
    return 'Training';
  }
  if (
    source.includes('recruitment') ||
    text.includes('candidate') ||
    text.includes('applicant') ||
    text.includes('onboard') ||
    text.includes('employee')
  ) {
    return 'People and recruitment';
  }
  if (
    source.includes('payroll') ||
    source.includes('compensation') ||
    source.includes('incentive') ||
    text.includes('payslip') ||
    text.includes('allowance') ||
    text.includes('incentive')
  ) {
    return 'Payroll and pay';
  }
  if (
    source.includes('org-structure') ||
    text.includes('fiscal') ||
    text.includes('quarter') ||
    route.includes('quarter_completion')
  ) {
    return 'Organization';
  }
  if (
    source.includes('time-and-attendance') ||
    text.includes('leave') ||
    text.includes('attendance') ||
    text.includes('wfh') ||
    text.includes('work from home')
  ) {
    return 'Leave and attendance';
  }
  return 'Other';
}

/** Fallback ad-hoc key when no seed match. */
export function getNotificationTypeKey(item: NotificationType): string {
  const matched = resolveSeedKeyFromItem(item);
  if (matched) return matched;
  const source = (item.source_service ?? 'unknown')
    .toLowerCase()
    .replace(/_/g, '-');
  const title =
    slugify(item.title ?? item.body ?? 'notification') || 'notification';
  return `${source}.${title}`;
}

export function getNotificationTypeMeta(item: NotificationType): {
  key: string;
  label: string;
  category: NotificationPreferenceCategory;
} {
  const { text, source, route } = haystack(item);
  const seedKey = resolveSeedKeyFromItem(item);
  if (seedKey) {
    const seed = SEED_TYPES.find((t) => t.key === seedKey);
    return {
      key: seedKey,
      label: seed?.label ?? labelFromItem(item),
      category: seed?.category ?? categorizeFromText(text, source, route),
    };
  }
  return {
    key: getNotificationTypeKey(item),
    label: labelFromItem(item),
    category: categorizeFromText(text, source, route),
  };
}

function derivePreset(
  types: NotificationPreferenceType[],
): NotificationDeliveryPreset {
  const unlocked = types.filter((t) => !t.locked);
  const nonEssential = unlocked.filter(
    (t) => t.category !== 'Essential' && !ESSENTIAL_KEYS.has(t.key),
  );
  const allNonEssentialOff =
    nonEssential.length > 0 && nonEssential.every((t) => !t.enabled);
  const allUnlockedOn = unlocked.every((t) => t.enabled);

  if (allUnlockedOn) return 'all';
  if (allNonEssentialOff) return 'basic';
  return 'custom';
}

function applyPreset(
  types: NotificationPreferenceType[],
  preset: 'basic' | 'all',
): NotificationPreferenceType[] {
  return types.map((t) => {
    if (t.locked) return { ...t, enabled: true };
    if (preset === 'all') return { ...t, enabled: true };
    // basic: only Essential on
    return {
      ...t,
      enabled: t.category === 'Essential' || ESSENTIAL_KEYS.has(t.key),
    };
  });
}

export const useNotificationPreferencesStore =
  create<NotificationPreferencesState>()(
    persist(
      (set, get) => ({
        channels: { inApp: true, push: true },
        types: SEED_TYPES.map((t) => ({ ...t })),
        preset: 'all',
        setChannel: (channel, enabled) =>
          set((state) => ({
            channels: { ...state.channels, [channel]: enabled },
          })),
        setTypeEnabled: (key, enabled) =>
          set((state) => {
            const types = state.types.map((t) =>
              t.key === key && !t.locked ? { ...t, enabled } : t,
            );
            return { types, preset: derivePreset(types) };
          }),
        setPreset: (preset) =>
          set((state) => {
            if (preset === 'custom') {
              return { preset: 'custom' };
            }
            return {
              preset,
              types: applyPreset(state.types, preset),
            };
          }),
        ensureTypeFromNotification: (item) => {
          const meta = getNotificationTypeMeta(item);
          const existing = get().types.find((t) => t.key === meta.key);
          if (!existing) {
            set((state) => {
              const types = [
                ...state.types,
                {
                  key: meta.key,
                  label: meta.label,
                  category: meta.category,
                  enabled: true,
                },
              ];
              return { types, preset: derivePreset(types) };
            });
          }
          return meta.key;
        },
        muteTypeFromNotification: (item) => {
          const meta = getNotificationTypeMeta(item);
          const existing = get().types.find((t) => t.key === meta.key);
          if (existing) {
            if (!existing.locked) {
              set((state) => {
                const types = state.types.map((t) =>
                  t.key === meta.key ? { ...t, enabled: false } : t,
                );
                return { types, preset: derivePreset(types) };
              });
            }
          } else {
            set((state) => {
              const types = [
                ...state.types,
                {
                  key: meta.key,
                  label: meta.label,
                  category: meta.category,
                  enabled: false,
                },
              ];
              return { types, preset: derivePreset(types) };
            });
          }
          return meta.key;
        },
      }),
      {
        name: 'notification-preferences-prototype-v5',
        partialize: (state) => ({
          channels: state.channels,
          types: state.types,
          preset: state.preset,
        }),
      },
    ),
  );
