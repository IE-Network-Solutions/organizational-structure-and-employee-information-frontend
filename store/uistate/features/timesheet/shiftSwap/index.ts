import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import dayjs from 'dayjs';
import {
  CalendarViewMode,
  ShiftAssignment,
  ShiftAuditLog,
  ShiftInAppNotification,
  ShiftModuleFilters,
  ShiftSwapApprovalConfig,
  ShiftSwapRequest,
  ShiftSwapStatus,
  ShiftTemplate,
  WeekDay,
} from '@/types/timesheet/shiftSwap';

const nowIso = () => dayjs().toISOString();

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const seedTemplates = (): ShiftTemplate[] => {
  const stamp = nowIso();
  return [
    {
      id: 'shift-morning',
      name: 'Morning Shift',
      startTime: '08:00',
      endTime: '16:00',
      breakDurationMinutes: 60,
      gracePeriodMinutes: 10,
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      overtimeEligible: true,
      isNightShift: false,
      color: '#3636F0',
      isActive: true,
      description: 'Standard weekday morning coverage.',
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: 'shift-afternoon',
      name: 'Afternoon Shift',
      startTime: '14:00',
      endTime: '22:00',
      breakDurationMinutes: 45,
      gracePeriodMinutes: 10,
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      overtimeEligible: true,
      isNightShift: false,
      color: '#1D9BF0',
      isActive: true,
      description: 'Late-day operations coverage.',
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: 'shift-night',
      name: 'Night Shift',
      startTime: '22:00',
      endTime: '06:00',
      breakDurationMinutes: 45,
      gracePeriodMinutes: 15,
      workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
      overtimeEligible: true,
      isNightShift: true,
      color: '#8C62FF',
      isActive: true,
      description: 'Overnight coverage with night differential.',
      createdAt: stamp,
      updatedAt: stamp,
    },
    {
      id: 'shift-weekend',
      name: 'Weekend Shift',
      startTime: '09:00',
      endTime: '17:00',
      breakDurationMinutes: 60,
      gracePeriodMinutes: 15,
      workingDays: ['saturday', 'sunday'],
      overtimeEligible: false,
      isNightShift: false,
      color: '#0BA259',
      isActive: true,
      description: 'Weekend support roster.',
      createdAt: stamp,
      updatedAt: stamp,
    },
  ];
};

const seedPeople = [
  {
    id: 'emp-demo-1',
    name: 'Abebe Kebede',
    departmentId: 'dept-ops',
    departmentName: 'Operations',
    locationId: 'loc-hq',
    locationName: 'HQ',
    teamId: 'team-alpha',
    teamName: 'Alpha',
    positionId: 'pos-officer',
    positionName: 'Operations Officer',
  },
  {
    id: 'emp-demo-2',
    name: 'Sara Hailu',
    departmentId: 'dept-ops',
    departmentName: 'Operations',
    locationId: 'loc-hq',
    locationName: 'HQ',
    teamId: 'team-alpha',
    teamName: 'Alpha',
    positionId: 'pos-lead',
    positionName: 'Team Lead',
  },
  {
    id: 'emp-demo-3',
    name: 'Daniel Mekonnen',
    departmentId: 'dept-cs',
    departmentName: 'Customer Support',
    locationId: 'loc-branch',
    locationName: 'Bole Branch',
    teamId: 'team-bravo',
    teamName: 'Bravo',
    positionId: 'pos-agent',
    positionName: 'Support Agent',
  },
  {
    id: 'emp-demo-4',
    name: 'Liya Tadesse',
    departmentId: 'dept-cs',
    departmentName: 'Customer Support',
    locationId: 'loc-branch',
    locationName: 'Bole Branch',
    teamId: 'team-bravo',
    teamName: 'Bravo',
    positionId: 'pos-agent',
    positionName: 'Support Agent',
  },
  {
    id: 'emp-demo-5',
    name: 'Yonatan Girma',
    departmentId: 'dept-fin',
    departmentName: 'Finance',
    locationId: 'loc-hq',
    locationName: 'HQ',
    teamId: 'team-finance',
    teamName: 'Finance Desk',
    positionId: 'pos-analyst',
    positionName: 'Analyst',
  },
  {
    id: 'emp-demo-6',
    name: 'Marta Alemu',
    departmentId: 'dept-hr',
    departmentName: 'Human Resources',
    locationId: 'loc-hq',
    locationName: 'HQ',
    teamId: 'team-hr',
    teamName: 'People Ops',
    positionId: 'pos-hr',
    positionName: 'HR Officer',
  },
];

const weekdayKey = (date: string): WeekDay =>
  dayjs(date).format('dddd').toLowerCase() as WeekDay;

const buildSeedAssignments = (): ShiftAssignment[] => {
  const templates = seedTemplates();
  const start = dayjs().startOf('week').add(1, 'day');
  const assignments: ShiftAssignment[] = [];
  const stamp = nowIso();

  for (let i = 0; i < 12; i += 1) {
    const date = start.add(i, 'day').format('YYYY-MM-DD');
    const day = weekdayKey(date);
    seedPeople.forEach((person, index) => {
      const template =
        day === 'saturday' || day === 'sunday'
          ? templates.find((item) => item.id === 'shift-weekend')
          : templates[index % 3];
      if (!template?.workingDays.includes(day) || !template.isActive) return;
      if (index % 5 === 0 && i % 3 === 0) return;
      assignments.push({
        id: `asgn-${person.id}-${date}`,
        shiftTemplateId: template.id,
        date,
        assigneeType: 'employee',
        assigneeId: person.id,
        assigneeName: person.name,
        employeeId: person.id,
        employeeName: person.name,
        departmentId: person.departmentId,
        departmentName: person.departmentName,
        locationId: person.locationId,
        locationName: person.locationName,
        teamId: person.teamId,
        teamName: person.teamName,
        positionId: person.positionId,
        positionName: person.positionName,
        createdAt: stamp,
        updatedAt: stamp,
      });
    });
  }

  return assignments;
};

const buildSeedSwaps = (assignments: ShiftAssignment[]): ShiftSwapRequest[] => {
  const stamp = nowIso();
  const first = assignments.find(
    (item) =>
      item.employeeId === 'emp-demo-1' &&
      item.shiftTemplateId === 'shift-morning',
  );
  const second = assignments.find(
    (item) =>
      item.employeeId === 'emp-demo-2' &&
      item.date !== first?.date &&
      item.shiftTemplateId === 'shift-afternoon',
  );
  if (!first || !second) return [];

  return [
    {
      id: 'swap-demo-1',
      requesterId: first.employeeId,
      requesterName: first.employeeName,
      requesterAssignmentId: first.id,
      counterpartId: second.employeeId,
      counterpartName: second.employeeName,
      counterpartAssignmentId: second.id,
      reason: 'Medical appointment in the afternoon.',
      status: 'pending_manager',
      requireColleagueConfirmation: true,
      requireManagerApproval: true,
      requireHrApproval: false,
      colleagueConfirmedAt: stamp,
      createdAt: stamp,
      updatedAt: stamp,
    },
  ];
};

const buildSeedAudit = (): ShiftAuditLog[] => {
  const stamp = nowIso();
  return [
    {
      id: createId(),
      action: 'created',
      entityType: 'template',
      entityId: 'shift-morning',
      actorName: 'System',
      description: 'Morning Shift template created.',
      timestamp: stamp,
    },
    {
      id: createId(),
      action: 'assigned',
      entityType: 'assignment',
      entityId: 'seed',
      actorName: 'HR Admin',
      description:
        'Initial weekly roster published for Operations and Support.',
      timestamp: stamp,
    },
    {
      id: createId(),
      action: 'swap_requested',
      entityType: 'swap',
      entityId: 'swap-demo-1',
      actorName: 'Abebe Kebede',
      description: 'Shift swap requested with Sara Hailu.',
      timestamp: stamp,
    },
  ];
};

const initialFilters: ShiftModuleFilters = {
  search: '',
};

type ShiftSwapState = {
  templates: ShiftTemplate[];
  assignments: ShiftAssignment[];
  swapRequests: ShiftSwapRequest[];
  auditLogs: ShiftAuditLog[];
  notifications: ShiftInAppNotification[];
  approvalConfig: ShiftSwapApprovalConfig;
  filters: ShiftModuleFilters;
  calendarView: CalendarViewMode;
  calendarDate: string;
  activeSection: string;
  isTemplateModalOpen: boolean;
  editingTemplateId: string | null;
  isAssignModalOpen: boolean;
  isBulkAssignModalOpen: boolean;
  isCopyModalOpen: boolean;
  isSwapModalOpen: boolean;
  selectedAssignmentId: string | null;
  selectedSwapId: string | null;
  deleteTemplateId: string | null;
  deleteAssignmentId: string | null;
  hasHydratedDirectory: boolean;
};

type ShiftSwapActions = {
  setActiveSection: (section: string) => void;
  setCalendarView: (view: CalendarViewMode) => void;
  setCalendarDate: (date: string) => void;
  setFilters: (filters: Partial<ShiftModuleFilters>) => void;
  resetFilters: () => void;
  setIsTemplateModalOpen: (open: boolean, templateId?: string | null) => void;
  setIsAssignModalOpen: (open: boolean, assignmentId?: string | null) => void;
  setIsBulkAssignModalOpen: (open: boolean) => void;
  setIsCopyModalOpen: (open: boolean) => void;
  setIsSwapModalOpen: (open: boolean, assignmentId?: string | null) => void;
  setSelectedSwapId: (id: string | null) => void;
  setDeleteTemplateId: (id: string | null) => void;
  setDeleteAssignmentId: (id: string | null) => void;
  upsertTemplate: (
    payload: Omit<ShiftTemplate, 'id' | 'createdAt' | 'updatedAt'> & {
      id?: string;
    },
    actorName: string,
  ) => void;
  deleteTemplate: (id: string, actorName: string) => void;
  assignShifts: (
    payload: {
      shiftTemplateId: string;
      dates: string[];
      people: Array<
        Pick<
          ShiftAssignment,
          | 'employeeId'
          | 'employeeName'
          | 'departmentId'
          | 'departmentName'
          | 'locationId'
          | 'locationName'
          | 'teamId'
          | 'teamName'
          | 'positionId'
          | 'positionName'
        > & {
          assigneeType?: ShiftAssignment['assigneeType'];
          assigneeId?: string;
          assigneeName?: string;
        }
      >;
      notes?: string;
    },
    actorName: string,
  ) => void;
  moveAssignment: (
    assignmentId: string,
    next: { date?: string; employeeId?: string; employeeName?: string },
    actorName: string,
  ) => void;
  deleteAssignment: (id: string, actorName: string) => void;
  copySchedule: (
    payload: { sourceFrom: string; sourceTo: string; targetFrom: string },
    actorName: string,
  ) => void;
  requestSwap: (payload: {
    requesterAssignmentId: string;
    counterpartAssignmentId: string;
    reason?: string;
    attachmentName?: string;
    actorName: string;
  }) => void;
  advanceSwap: (
    id: string,
    decision: 'approve' | 'reject' | 'cancel',
    actorName: string,
    rejectedReason?: string,
  ) => void;
  updateApprovalConfig: (
    config: ShiftSwapApprovalConfig,
    actorName: string,
  ) => void;
  markNotificationsRead: () => void;
  hydrateFromDirectory: (
    people: Array<{
      id: string;
      name: string;
      departmentId?: string;
      departmentName?: string;
      locationId?: string;
      locationName?: string;
      teamId?: string;
      teamName?: string;
      positionId?: string;
      positionName?: string;
    }>,
  ) => void;
};

const pushAudit = (
  logs: ShiftAuditLog[],
  entry: Omit<ShiftAuditLog, 'id' | 'timestamp'>,
): ShiftAuditLog[] =>
  [
    {
      id: createId(),
      timestamp: nowIso(),
      ...entry,
    },
    ...logs,
  ].slice(0, 200);

const pushNotification = (
  items: ShiftInAppNotification[],
  title: string,
  message: string,
): ShiftInAppNotification[] =>
  [
    {
      id: createId(),
      title,
      message,
      createdAt: nowIso(),
      read: false,
    },
    ...items,
  ].slice(0, 50);

const applySwapToAssignments = (
  assignments: ShiftAssignment[],
  swap: ShiftSwapRequest,
): ShiftAssignment[] => {
  const requester = assignments.find(
    (item) => item.id === swap.requesterAssignmentId,
  );
  const counterpart = assignments.find(
    (item) => item.id === swap.counterpartAssignmentId,
  );
  if (!requester || !counterpart) return assignments;

  return assignments.map((item) => {
    if (item.id === requester.id) {
      return {
        ...item,
        employeeId: counterpart.employeeId,
        employeeName: counterpart.employeeName,
        assigneeId: counterpart.employeeId,
        assigneeName: counterpart.employeeName,
        departmentId: counterpart.departmentId,
        departmentName: counterpart.departmentName,
        locationId: counterpart.locationId,
        locationName: counterpart.locationName,
        teamId: counterpart.teamId,
        teamName: counterpart.teamName,
        positionId: counterpart.positionId,
        positionName: counterpart.positionName,
        updatedAt: nowIso(),
      };
    }
    if (item.id === counterpart.id) {
      return {
        ...item,
        employeeId: requester.employeeId,
        employeeName: requester.employeeName,
        assigneeId: requester.employeeId,
        assigneeName: requester.employeeName,
        departmentId: requester.departmentId,
        departmentName: requester.departmentName,
        locationId: requester.locationId,
        locationName: requester.locationName,
        teamId: requester.teamId,
        teamName: requester.teamName,
        positionId: requester.positionId,
        positionName: requester.positionName,
        updatedAt: nowIso(),
      };
    }
    return item;
  });
};

const nextSwapStatus = (
  swap: ShiftSwapRequest,
  stage: 'colleague' | 'manager' | 'hr',
): ShiftSwapStatus => {
  if (stage === 'colleague') {
    if (swap.requireManagerApproval) return 'pending_manager';
    if (swap.requireHrApproval) return 'pending_hr';
    return 'approved';
  }
  if (stage === 'manager') {
    if (swap.requireHrApproval) return 'pending_hr';
    return 'approved';
  }
  return 'approved';
};

const seededAssignments = buildSeedAssignments();

export const useShiftSwapStore = create<ShiftSwapState & ShiftSwapActions>()(
  persist(
    (set, get) => ({
      templates: seedTemplates(),
      assignments: seededAssignments,
      swapRequests: buildSeedSwaps(seededAssignments),
      auditLogs: buildSeedAudit(),
      notifications: [
        {
          id: createId(),
          title: 'Swap awaiting manager',
          message: 'Abebe Kebede and Sara Hailu have a pending shift swap.',
          createdAt: nowIso(),
          read: false,
        },
      ],
      approvalConfig: {
        requireColleagueConfirmation: true,
        requireManagerApproval: true,
        requireHrApproval: false,
      },
      filters: initialFilters,
      calendarView: 'week',
      calendarDate: dayjs().format('YYYY-MM-DD'),
      activeSection: 'overview',
      isTemplateModalOpen: false,
      editingTemplateId: null,
      isAssignModalOpen: false,
      isBulkAssignModalOpen: false,
      isCopyModalOpen: false,
      isSwapModalOpen: false,
      selectedAssignmentId: null,
      selectedSwapId: null,
      deleteTemplateId: null,
      deleteAssignmentId: null,
      hasHydratedDirectory: false,

      setActiveSection: (activeSection) => set({ activeSection }),
      setCalendarView: (calendarView) => set({ calendarView }),
      setCalendarDate: (calendarDate) => set({ calendarDate }),
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      resetFilters: () => set({ filters: initialFilters }),
      setIsTemplateModalOpen: (open, templateId = null) =>
        set({
          isTemplateModalOpen: open,
          editingTemplateId: open ? templateId : null,
        }),
      setIsAssignModalOpen: (open, assignmentId = null) =>
        set({
          isAssignModalOpen: open,
          selectedAssignmentId: open ? assignmentId : null,
        }),
      setIsBulkAssignModalOpen: (open) => set({ isBulkAssignModalOpen: open }),
      setIsCopyModalOpen: (open) => set({ isCopyModalOpen: open }),
      setIsSwapModalOpen: (open, assignmentId = null) =>
        set({
          isSwapModalOpen: open,
          selectedAssignmentId: open ? assignmentId : null,
        }),
      setSelectedSwapId: (selectedSwapId) => set({ selectedSwapId }),
      setDeleteTemplateId: (deleteTemplateId) => set({ deleteTemplateId }),
      setDeleteAssignmentId: (deleteAssignmentId) =>
        set({ deleteAssignmentId }),

      upsertTemplate: (payload, actorName) => {
        const stamp = nowIso();
        set((state) => {
          if (payload.id) {
            return {
              templates: state.templates.map((item) =>
                item.id === payload.id
                  ? { ...item, ...payload, updatedAt: stamp }
                  : item,
              ),
              auditLogs: pushAudit(state.auditLogs, {
                action: 'updated',
                entityType: 'template',
                entityId: payload.id,
                actorName,
                description: `Shift template "${payload.name}" was updated.`,
              }),
            };
          }
          const created: ShiftTemplate = {
            ...payload,
            id: createId(),
            createdAt: stamp,
            updatedAt: stamp,
          };
          return {
            templates: [created, ...state.templates],
            auditLogs: pushAudit(state.auditLogs, {
              action: 'created',
              entityType: 'template',
              entityId: created.id,
              actorName,
              description: `Shift template "${created.name}" was created.`,
            }),
          };
        });
      },

      deleteTemplate: (id, actorName) => {
        const template = get().templates.find((item) => item.id === id);
        set((state) => ({
          templates: state.templates.filter((item) => item.id !== id),
          assignments: state.assignments.filter(
            (item) => item.shiftTemplateId !== id,
          ),
          deleteTemplateId: null,
          auditLogs: pushAudit(state.auditLogs, {
            action: 'deleted',
            entityType: 'template',
            entityId: id,
            actorName,
            description: `Shift template "${template?.name || id}" was deleted.`,
          }),
        }));
      },

      assignShifts: (payload, actorName) => {
        const template = get().templates.find(
          (item) => item.id === payload.shiftTemplateId,
        );
        if (!template) return;
        const stamp = nowIso();
        const created: ShiftAssignment[] = [];
        payload.dates.forEach((date) => {
          const day = weekdayKey(date);
          if (!template.workingDays.includes(day)) return;
          payload.people.forEach((person) => {
            const exists = get().assignments.some(
              (item) =>
                item.employeeId === person.employeeId && item.date === date,
            );
            if (exists) return;
            created.push({
              id: createId(),
              shiftTemplateId: template.id,
              date,
              assigneeType: person.assigneeType || 'employee',
              assigneeId: person.assigneeId || person.employeeId,
              assigneeName: person.assigneeName || person.employeeName,
              employeeId: person.employeeId,
              employeeName: person.employeeName,
              departmentId: person.departmentId,
              departmentName: person.departmentName,
              locationId: person.locationId,
              locationName: person.locationName,
              teamId: person.teamId,
              teamName: person.teamName,
              positionId: person.positionId,
              positionName: person.positionName,
              notes: payload.notes,
              createdAt: stamp,
              updatedAt: stamp,
            });
          });
        });

        set((state) => ({
          assignments: [...created, ...state.assignments],
          isAssignModalOpen: false,
          isBulkAssignModalOpen: false,
          auditLogs: pushAudit(state.auditLogs, {
            action: 'assigned',
            entityType: 'assignment',
            entityId: created[0]?.id || template.id,
            actorName,
            description: `${created.length} shift assignment(s) created using "${template.name}".`,
          }),
          notifications: pushNotification(
            state.notifications,
            'Shifts assigned',
            `${created.length} shift(s) were published to the roster.`,
          ),
        }));
      },

      moveAssignment: (assignmentId, next, actorName) => {
        set((state) => ({
          assignments: state.assignments.map((item) =>
            item.id === assignmentId
              ? {
                  ...item,
                  date: next.date || item.date,
                  employeeId: next.employeeId || item.employeeId,
                  employeeName: next.employeeName || item.employeeName,
                  assigneeId: next.employeeId || item.assigneeId,
                  assigneeName: next.employeeName || item.assigneeName,
                  updatedAt: nowIso(),
                }
              : item,
          ),
          auditLogs: pushAudit(state.auditLogs, {
            action: 'reassigned',
            entityType: 'assignment',
            entityId: assignmentId,
            actorName,
            description: 'A shift assignment was moved on the calendar.',
          }),
        }));
      },

      deleteAssignment: (id, actorName) => {
        set((state) => ({
          assignments: state.assignments.filter((item) => item.id !== id),
          deleteAssignmentId: null,
          auditLogs: pushAudit(state.auditLogs, {
            action: 'deleted',
            entityType: 'assignment',
            entityId: id,
            actorName,
            description: 'A shift assignment was removed.',
          }),
        }));
      },

      copySchedule: ({ sourceFrom, sourceTo, targetFrom }, actorName) => {
        const sourceStart = dayjs(sourceFrom);
        const sourceEnd = dayjs(sourceTo);
        const diff = sourceEnd.diff(sourceStart, 'day');
        const targetStart = dayjs(targetFrom);
        const stamp = nowIso();
        const created: ShiftAssignment[] = [];

        get().assignments.forEach((item) => {
          const date = dayjs(item.date);
          if (
            date.isBefore(sourceStart, 'day') ||
            date.isAfter(sourceEnd, 'day')
          ) {
            return;
          }
          const offset = date.diff(sourceStart, 'day');
          const nextDate = targetStart.add(offset, 'day').format('YYYY-MM-DD');
          const exists = get().assignments.some(
            (assignment) =>
              assignment.employeeId === item.employeeId &&
              assignment.date === nextDate,
          );
          if (exists) return;
          created.push({
            ...item,
            id: createId(),
            date: nextDate,
            createdAt: stamp,
            updatedAt: stamp,
          });
        });

        set((state) => ({
          assignments: [...created, ...state.assignments],
          isCopyModalOpen: false,
          auditLogs: pushAudit(state.auditLogs, {
            action: 'copied',
            entityType: 'assignment',
            entityId: created[0]?.id || 'copy',
            actorName,
            description: `Copied ${created.length} assignment(s) from ${sourceFrom}–${sourceTo} to ${targetFrom} (+${diff} days).`,
          }),
          notifications: pushNotification(
            state.notifications,
            'Schedule copied',
            `${created.length} shift(s) were copied to the new period.`,
          ),
        }));
      },

      requestSwap: ({
        requesterAssignmentId,
        counterpartAssignmentId,
        reason,
        attachmentName,
        actorName,
      }) => {
        const { assignments, approvalConfig } = get();
        const requester = assignments.find(
          (item) => item.id === requesterAssignmentId,
        );
        const counterpart = assignments.find(
          (item) => item.id === counterpartAssignmentId,
        );
        if (!requester || !counterpart) return;

        const status: ShiftSwapStatus =
          approvalConfig.requireColleagueConfirmation
            ? 'pending_colleague'
            : approvalConfig.requireManagerApproval
              ? 'pending_manager'
              : approvalConfig.requireHrApproval
                ? 'pending_hr'
                : 'approved';

        const swap: ShiftSwapRequest = {
          id: createId(),
          requesterId: requester.employeeId,
          requesterName: requester.employeeName,
          requesterAssignmentId,
          counterpartId: counterpart.employeeId,
          counterpartName: counterpart.employeeName,
          counterpartAssignmentId,
          reason,
          attachmentName,
          status,
          requireColleagueConfirmation:
            approvalConfig.requireColleagueConfirmation,
          requireManagerApproval: approvalConfig.requireManagerApproval,
          requireHrApproval: approvalConfig.requireHrApproval,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };

        set((state) => ({
          swapRequests: [swap, ...state.swapRequests],
          isSwapModalOpen: false,
          selectedAssignmentId: null,
          assignments:
            status === 'approved'
              ? applySwapToAssignments(state.assignments, swap)
              : state.assignments,
          auditLogs: pushAudit(state.auditLogs, {
            action: status === 'approved' ? 'swap_approved' : 'swap_requested',
            entityType: 'swap',
            entityId: swap.id,
            actorName,
            description: `${requester.employeeName} requested a swap with ${counterpart.employeeName}.`,
          }),
          notifications: pushNotification(
            state.notifications,
            status === 'approved' ? 'Swap completed' : 'Swap request submitted',
            status === 'approved'
              ? 'Schedules were updated automatically after approval.'
              : `${counterpart.employeeName} and approvers were notified.`,
          ),
        }));
      },

      advanceSwap: (id, decision, actorName, rejectedReason) => {
        const current = get().swapRequests.find((item) => item.id === id);
        if (!current) return;

        if (decision === 'cancel') {
          set((state) => ({
            swapRequests: state.swapRequests.map((item) =>
              item.id === id
                ? { ...item, status: 'cancelled', updatedAt: nowIso() }
                : item,
            ),
            selectedSwapId: null,
            auditLogs: pushAudit(state.auditLogs, {
              action: 'swap_cancelled',
              entityType: 'swap',
              entityId: id,
              actorName,
              description: `Swap request between ${current.requesterName} and ${current.counterpartName} was cancelled.`,
            }),
            notifications: pushNotification(
              state.notifications,
              'Swap cancelled',
              'The shift swap request was cancelled.',
            ),
          }));
          return;
        }

        if (decision === 'reject') {
          set((state) => ({
            swapRequests: state.swapRequests.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: 'rejected',
                    rejectedBy: actorName,
                    rejectedReason,
                    updatedAt: nowIso(),
                  }
                : item,
            ),
            selectedSwapId: null,
            auditLogs: pushAudit(state.auditLogs, {
              action: 'swap_rejected',
              entityType: 'swap',
              entityId: id,
              actorName,
              description: `Swap request was rejected by ${actorName}.`,
            }),
            notifications: pushNotification(
              state.notifications,
              'Swap rejected',
              `${current.requesterName} was notified that the swap was declined.`,
            ),
          }));
          return;
        }

        const stamp = nowIso();
        let nextStatus = current.status;
        const patch: Partial<ShiftSwapRequest> = { updatedAt: stamp };
        if (current.status === 'pending_colleague') {
          nextStatus = nextSwapStatus(current, 'colleague');
          patch.colleagueConfirmedAt = stamp;
        } else if (current.status === 'pending_manager') {
          nextStatus = nextSwapStatus(current, 'manager');
          patch.managerApprovedAt = stamp;
        } else if (current.status === 'pending_hr') {
          nextStatus = nextSwapStatus(current, 'hr');
          patch.hrApprovedAt = stamp;
        }
        patch.status = nextStatus;

        set((state) => ({
          swapRequests: state.swapRequests.map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
          assignments:
            nextStatus === 'approved'
              ? applySwapToAssignments(state.assignments, current)
              : state.assignments,
          selectedSwapId: nextStatus === 'approved' ? null : id,
          auditLogs: pushAudit(state.auditLogs, {
            action: nextStatus === 'approved' ? 'swap_approved' : 'updated',
            entityType: 'swap',
            entityId: id,
            actorName,
            description:
              nextStatus === 'approved'
                ? `Swap approved. ${current.requesterName} and ${current.counterpartName} schedules were updated.`
                : `Swap moved to ${nextStatus.replaceAll('_', ' ')} by ${actorName}.`,
          }),
          notifications: pushNotification(
            state.notifications,
            nextStatus === 'approved' ? 'Swap approved' : 'Swap advanced',
            nextStatus === 'approved'
              ? 'Roster, attendance, and payroll sources now use the updated shifts.'
              : `The request is now ${nextStatus.replaceAll('_', ' ')}.`,
          ),
        }));
      },

      updateApprovalConfig: (approvalConfig, actorName) => {
        set((state) => ({
          approvalConfig,
          auditLogs: pushAudit(state.auditLogs, {
            action: 'config_updated',
            entityType: 'config',
            entityId: 'swap-approval',
            actorName,
            description: 'Shift swap approval workflow was updated.',
          }),
        }));
      },

      markNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((item) => ({
            ...item,
            read: true,
          })),
        })),

      hydrateFromDirectory: (people) => {
        if (get().hasHydratedDirectory || people.length < 2) return;
        const mapped = people.slice(0, 6);
        const idMap = seedPeople.reduce<
          Record<string, (typeof mapped)[number]>
        >((acc, person, index) => {
          if (mapped[index]) acc[person.id] = mapped[index];
          return acc;
        }, {});

        set((state) => ({
          hasHydratedDirectory: true,
          assignments: state.assignments.map((item) => {
            const next = idMap[item.employeeId];
            if (!next) return item;
            return {
              ...item,
              employeeId: next.id,
              employeeName: next.name,
              assigneeId: next.id,
              assigneeName: next.name,
              departmentId: next.departmentId,
              departmentName: next.departmentName,
              locationId: next.locationId,
              locationName: next.locationName,
              teamId: next.teamId,
              teamName: next.teamName,
              positionId: next.positionId,
              positionName: next.positionName,
            };
          }),
          swapRequests: state.swapRequests.map((item) => {
            const requester = idMap[item.requesterId];
            const counterpart = idMap[item.counterpartId];
            return {
              ...item,
              requesterId: requester?.id || item.requesterId,
              requesterName: requester?.name || item.requesterName,
              counterpartId: counterpart?.id || item.counterpartId,
              counterpartName: counterpart?.name || item.counterpartName,
            };
          }),
        }));
      },
    }),
    {
      name: 'shift-swap-management-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        templates: state.templates,
        assignments: state.assignments,
        swapRequests: state.swapRequests,
        auditLogs: state.auditLogs,
        notifications: state.notifications,
        approvalConfig: state.approvalConfig,
        hasHydratedDirectory: state.hasHydratedDirectory,
      }),
    },
  ),
);

export const getActorName = (
  userData?: Record<string, any>,
  fallback = 'Current User',
) => {
  const name = [userData?.firstName, userData?.middleName, userData?.lastName]
    .filter(Boolean)
    .join(' ');
  return name || userData?.email || fallback;
};
