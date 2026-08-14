import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import {
  BlueprintAssignment,
  CreateBlueprintInput,
  InstanceFilters,
  MockEmployee,
  OVERTIME_THRESHOLD_HOURS,
  ShiftInstance,
  ShiftInstanceView,
  ShiftSwapRequest,
  SwapFilters,
  SwapRequestView,
  UpdateBlueprintInput,
  WeeklyHoursImpact,
  WorkScheduleBlueprint,
} from '@/types/timesheet/workSchedule';
import {
  durationHours,
  eachDateInRange,
  formatTime,
  getEmployeeDisplayName,
  inferShiftType,
  instanceDateTime,
  isInstanceInPast,
  isTimeWithinWindow,
  isoWeekRange,
  makeInstanceId,
  rollingScheduleWindow,
  shiftsForWeekday,
  timesOverlap,
  weekdayFromDate,
} from './helpers';
import {
  buildSeedSwapTemplates,
  MOCK_EMPLOYEES,
  SEED_ASSIGNMENTS,
  SEED_BLUEPRINTS,
} from './mockData';

export const MOCK_STORAGE_KEY = 'tna-work-schedule-blueprint-mock-v4';

export class MockWorkScheduleError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'MockWorkScheduleError';
  }
}

export interface MockWorkScheduleDb {
  employees: MockEmployee[];
  blueprints: WorkScheduleBlueprint[];
  assignments: BlueprintAssignment[];
  instances: ShiftInstance[];
  swaps: ShiftSwapRequest[];
}

let memoryDb: MockWorkScheduleDb | null = null;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function generateInstancesForAssignment(
  blueprint: WorkScheduleBlueprint,
  assignment: BlueprintAssignment,
  existing: ShiftInstance[],
): ShiftInstance[] {
  if (!blueprint.hasShifts || !(blueprint.shifts || []).length) return [];

  const allowedShiftIds = new Set(
    (assignment.shiftIds || []).length
      ? assignment.shiftIds
      : blueprint.shifts.map((shift) => shift.id),
  );

  const { from, to } = rollingScheduleWindow({
    assignedFrom: assignment.assignedFrom,
    assignedTo: assignment.assignedTo,
  });

  const created: ShiftInstance[] = [];
  for (const date of eachDateInRange(from, to)) {
    const weekday = weekdayFromDate(date);
    if (!blueprint.activeWeekdays.includes(weekday)) continue;

    for (const shift of shiftsForWeekday(blueprint, weekday)) {
      if (!allowedShiftIds.has(shift.id)) continue;
      const startTime = formatTime(shift.startTime);
      const endTime = formatTime(shift.endTime);
      const instanceId = makeInstanceId(
        blueprint.id,
        assignment.userId,
        date,
        shift.id,
      );
      const alreadyExists = [...existing, ...created].some(
        (item) => item.id === instanceId && !item.isCancelled,
      );
      if (alreadyExists) continue;

      const overlap = [...existing, ...created].some(
        (item) =>
          item.assignedUserId === assignment.userId &&
          item.date === date &&
          !item.isCancelled &&
          timesOverlap(item.startTime, item.endTime, startTime, endTime),
      );
      if (overlap) {
        throw new MockWorkScheduleError(
          'OVERLAP_DETECTED',
          `Overlapping shift for ${assignment.userId} on ${date}`,
        );
      }

      created.push({
        id: instanceId,
        blueprintId: blueprint.id,
        assignedUserId: assignment.userId,
        date,
        startTime,
        endTime,
        shiftType: inferShiftType(shift.name),
        shiftId: shift.id,
        shiftName: shift.name,
        isSwappable: blueprint.isSwappable,
        isCancelled: false,
        isOverridden: false,
      });
    }
  }
  return created;
}

function buildSeedDb(): MockWorkScheduleDb {
  const employees = clone(MOCK_EMPLOYEES);
  const blueprints = clone(SEED_BLUEPRINTS);
  const assignments = clone(SEED_ASSIGNMENTS);
  const instances: ShiftInstance[] = [];

  for (const assignment of assignments) {
    const blueprint = blueprints.find(
      (item) => item.id === assignment.blueprintId,
    );
    if (!blueprint) continue;
    instances.push(
      ...generateInstancesForAssignment(blueprint, assignment, instances),
    );
  }

  const swaps: ShiftSwapRequest[] = [];
  for (const template of buildSeedSwapTemplates()) {
    const requesterShiftId = makeInstanceId(
      template.blueprintId,
      template.requesterId,
      template.requesterDate,
      template.shiftId,
    );
    const targetShiftId = makeInstanceId(
      template.blueprintId,
      template.targetUserId,
      template.targetDate,
      template.shiftId,
    );
    const requesterShift = instances.find(
      (item) => item.id === requesterShiftId,
    );
    const targetShift = instances.find((item) => item.id === targetShiftId);
    if (!requesterShift || !targetShift) continue;

    if (template.status === 'APPROVED') {
      const requesterUserId = requesterShift.assignedUserId;
      requesterShift.assignedUserId = targetShift.assignedUserId;
      targetShift.assignedUserId = requesterUserId;
      requesterShift.swappedAt = template.adminApprovedAt;
      targetShift.swappedAt = template.adminApprovedAt;
    }

    swaps.push({
      id: template.id,
      requesterShiftId,
      targetShiftId,
      requesterId: template.requesterId,
      targetUserId: template.targetUserId,
      status: template.status,
      reason: template.reason,
      peerAcceptedAt: template.peerAcceptedAt,
      adminApprovedAt: template.adminApprovedAt,
      createdAt: template.createdAt,
    });
  }

  return { employees, blueprints, assignments, instances, swaps };
}

function loadFromStorage(): MockWorkScheduleDb {
  if (typeof window === 'undefined') return buildSeedDb();
  try {
    const raw = window.localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) {
      const seeded = buildSeedDb();
      window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as MockWorkScheduleDb;
    if (
      !parsed?.employees?.length ||
      !parsed?.blueprints ||
      !parsed?.assignments ||
      !parsed?.instances ||
      !parsed?.swaps
    ) {
      const seeded = buildSeedDb();
      window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return parsed;
  } catch {
    return buildSeedDb();
  }
}

function persist() {
  if (!memoryDb || typeof window === 'undefined') return;
  window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(memoryDb));
}

function getDb(): MockWorkScheduleDb {
  if (!memoryDb) {
    memoryDb = loadFromStorage();
  }
  expireStaleSwaps(memoryDb);
  return memoryDb;
}

function requireEmployee(id: string): MockEmployee {
  const employee = getDb().employees.find((item) => item.id === id);
  if (!employee) {
    throw new MockWorkScheduleError(
      'EMPLOYEE_NOT_FOUND',
      'Mock employee not found',
    );
  }
  return employee;
}

function ensureEmployee(
  id: string,
  profile?: Partial<Omit<MockEmployee, 'id'>>,
): MockEmployee {
  const db = getDb();
  const existing = db.employees.find((item) => item.id === id);
  if (existing) {
    if (profile) {
      existing.firstName = profile.firstName ?? existing.firstName;
      existing.lastName = profile.lastName ?? existing.lastName;
      existing.email = profile.email ?? existing.email;
      existing.jobTitle = profile.jobTitle ?? existing.jobTitle;
    }
    return existing;
  }
  const created: MockEmployee = {
    id,
    firstName: profile?.firstName || 'Employee',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    jobTitle: profile?.jobTitle || '',
  };
  db.employees.push(created);
  return created;
}

function requireBlueprint(id: string): WorkScheduleBlueprint {
  const blueprint = getDb().blueprints.find((item) => item.id === id);
  if (!blueprint) {
    throw new MockWorkScheduleError(
      'BLUEPRINT_NOT_FOUND',
      'Blueprint not found',
    );
  }
  return blueprint;
}

function requireInstance(id: string): ShiftInstance {
  const instance = getDb().instances.find((item) => item.id === id);
  if (!instance) {
    throw new MockWorkScheduleError(
      'INSTANCE_NOT_FOUND',
      'Shift instance not found',
    );
  }
  return instance;
}

function requireSwap(id: string): ShiftSwapRequest {
  const swap = getDb().swaps.find((item) => item.id === id);
  if (!swap) {
    throw new MockWorkScheduleError('SWAP_NOT_FOUND', 'Swap request not found');
  }
  return swap;
}

function expireStaleSwaps(db: MockWorkScheduleDb): boolean {
  let changed = false;
  const now = dayjs();
  for (const swap of db.swaps) {
    if (swap.status !== 'PENDING_PEER' && swap.status !== 'PENDING_ADMIN')
      continue;
    const requester = db.instances.find(
      (item) => item.id === swap.requesterShiftId,
    );
    const target = db.instances.find((item) => item.id === swap.targetShiftId);
    if (!requester || !target) continue;
    const earliest = instanceDateTime(requester).isBefore(
      instanceDateTime(target),
    )
      ? instanceDateTime(requester)
      : instanceDateTime(target);
    if (earliest.isBefore(now)) {
      swap.status = 'EXPIRED';
      changed = true;
    }
  }
  if (changed) persist();
  return changed;
}

function toInstanceView(instance: ShiftInstance): ShiftInstanceView {
  const employee =
    getDb().employees.find((item) => item.id === instance.assignedUserId) ||
    ensureEmployee(instance.assignedUserId);
  const blueprint = requireBlueprint(instance.blueprintId);
  return {
    ...instance,
    employee,
    blueprintTitle: blueprint.title,
    hasShifts: blueprint.hasShifts,
  };
}

function weekHours(
  userId: string,
  date: string,
  extra?: ShiftInstance[],
  excludeIds: string[] = [],
): number {
  const { from, to } = isoWeekRange(date);
  const db = getDb();
  const pool = extra ?? db.instances;
  return pool
    .filter(
      (item) =>
        item.assignedUserId === userId &&
        !item.isCancelled &&
        !excludeIds.includes(item.id) &&
        dayjs(item.date).isSameOrAfter(from) &&
        dayjs(item.date).isSameOrBefore(to),
    )
    .reduce(
      (sum, item) => sum + durationHours(item.startTime, item.endTime),
      0,
    );
}

export function calculateSwapImpact(
  requesterShift: ShiftInstance,
  targetShift: ShiftInstance,
): WeeklyHoursImpact {
  const requesterBefore = weekHours(
    requesterShift.assignedUserId,
    requesterShift.date,
  );
  const targetBefore = weekHours(targetShift.assignedUserId, targetShift.date);

  const hypothetical = getDb().instances.map((item) => ({ ...item }));
  const req = hypothetical.find((item) => item.id === requesterShift.id);
  const tgt = hypothetical.find((item) => item.id === targetShift.id);
  if (req && tgt) {
    const requesterUserId = req.assignedUserId;
    req.assignedUserId = tgt.assignedUserId;
    tgt.assignedUserId = requesterUserId;
  }

  const requesterAfter = weekHours(
    requesterShift.assignedUserId,
    requesterShift.date,
    hypothetical,
  );
  const targetAfter = weekHours(
    targetShift.assignedUserId,
    targetShift.date,
    hypothetical,
  );

  const overtimeUserIds: string[] = [];
  if (requesterAfter > OVERTIME_THRESHOLD_HOURS) {
    overtimeUserIds.push(requesterShift.assignedUserId);
  }
  if (targetAfter > OVERTIME_THRESHOLD_HOURS) {
    overtimeUserIds.push(targetShift.assignedUserId);
  }

  return {
    requesterBefore: Number(requesterBefore.toFixed(2)),
    requesterAfter: Number(requesterAfter.toFixed(2)),
    targetBefore: Number(targetBefore.toFixed(2)),
    targetAfter: Number(targetAfter.toFixed(2)),
    overtimeTriggered: overtimeUserIds.length > 0,
    overtimeUserIds,
  };
}

function toSwapView(swap: ShiftSwapRequest): SwapRequestView {
  const requesterShift = toInstanceView(requireInstance(swap.requesterShiftId));
  const targetShift = toInstanceView(requireInstance(swap.targetShiftId));
  return {
    ...swap,
    requester: requireEmployee(swap.requesterId),
    target: requireEmployee(swap.targetUserId),
    requesterShift,
    targetShift,
    impact: calculateSwapImpact(requesterShift, targetShift),
  };
}

function hasPendingSwap(instanceId: string): boolean {
  return getDb().swaps.some(
    (item) =>
      (item.requesterShiftId === instanceId ||
        item.targetShiftId === instanceId) &&
      (item.status === 'PENDING_PEER' || item.status === 'PENDING_ADMIN'),
  );
}

function wouldOverlapAfterSwap(
  requesterShift: ShiftInstance,
  targetShift: ShiftInstance,
): boolean {
  const db = getDb();
  const requesterOther = db.instances.filter(
    (item) =>
      item.assignedUserId === requesterShift.assignedUserId &&
      item.id !== requesterShift.id &&
      item.date === targetShift.date &&
      !item.isCancelled,
  );
  const targetOther = db.instances.filter(
    (item) =>
      item.assignedUserId === targetShift.assignedUserId &&
      item.id !== targetShift.id &&
      item.date === requesterShift.date &&
      !item.isCancelled,
  );
  return (
    requesterOther.some((item) =>
      timesOverlap(
        item.startTime,
        item.endTime,
        targetShift.startTime,
        targetShift.endTime,
      ),
    ) ||
    targetOther.some((item) =>
      timesOverlap(
        item.startTime,
        item.endTime,
        requesterShift.startTime,
        requesterShift.endTime,
      ),
    )
  );
}

export function listMockEmployees(): MockEmployee[] {
  return clone(getDb().employees);
}

export function getMockEmployee(id: string): MockEmployee {
  return clone(requireEmployee(id));
}

export function listBlueprints(): WorkScheduleBlueprint[] {
  return clone(getDb().blueprints).sort(
    (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
  );
}

export function getBlueprint(id: string): WorkScheduleBlueprint {
  return clone(requireBlueprint(id));
}

function validateBlueprintShifts(input: CreateBlueprintInput): void {
  const shifts = input.shifts || [];
  if (!input.activeWeekdays?.length) {
    throw new MockWorkScheduleError(
      'INVALID_WEEKDAYS',
      'Select at least one work day.',
    );
  }
  if (durationHours(input.defaultStartTime, input.defaultEndTime) <= 0) {
    throw new MockWorkScheduleError(
      'INVALID_DAY_WINDOW',
      'Day end time must be after day start time.',
    );
  }

  for (const shift of shifts) {
    if (!shift.name?.trim()) {
      throw new MockWorkScheduleError(
        'INVALID_SHIFT',
        'Each shift needs a name.',
      );
    }
    if (!shift.weekdays?.length) {
      throw new MockWorkScheduleError(
        'INVALID_SHIFT_DAYS',
        `Select at least one day for ${shift.name}.`,
      );
    }
    const invalidDay = shift.weekdays.find(
      (day) => !input.activeWeekdays.includes(day),
    );
    if (invalidDay) {
      throw new MockWorkScheduleError(
        'INVALID_SHIFT_DAYS',
        `${shift.name} includes ${invalidDay}, which is not a selected work day.`,
      );
    }
    if (
      !isTimeWithinWindow(
        shift.startTime,
        shift.endTime,
        input.defaultStartTime,
        input.defaultEndTime,
      )
    ) {
      throw new MockWorkScheduleError(
        'SHIFT_OUTSIDE_DAY_WINDOW',
        `${shift.name} must sit inside the day start and end times.`,
      );
    }
  }

  for (const weekday of input.activeWeekdays) {
    const dayShifts = shifts.filter((shift) =>
      shift.weekdays.includes(weekday),
    );
    for (let i = 0; i < dayShifts.length; i += 1) {
      for (let j = i + 1; j < dayShifts.length; j += 1) {
        if (
          timesOverlap(
            dayShifts[i].startTime,
            dayShifts[i].endTime,
            dayShifts[j].startTime,
            dayShifts[j].endTime,
          )
        ) {
          throw new MockWorkScheduleError(
            'SHIFT_OVERLAP',
            `${dayShifts[i].name} and ${dayShifts[j].name} overlap on ${weekday}.`,
          );
        }
      }
    }
  }
}

export function createBlueprint(
  input: CreateBlueprintInput,
): WorkScheduleBlueprint {
  const shifts = (input.shifts || []).map((shift) => ({
    ...shift,
    id: shift.id || uuidv4(),
    name: shift.name.trim(),
    startTime: formatTime(shift.startTime),
    endTime: formatTime(shift.endTime),
  }));
  const normalized: CreateBlueprintInput = {
    ...input,
    hasShifts: shifts.length > 0,
    isSwappable: shifts.length > 0 ? Boolean(input.isSwappable) : false,
    shifts,
  };
  validateBlueprintShifts(normalized);

  const db = getDb();
  const blueprint: WorkScheduleBlueprint = {
    ...normalized,
    id: uuidv4(),
    createdAt: dayjs().toISOString(),
  };
  db.blueprints.unshift(blueprint);
  persist();
  return clone(blueprint);
}

export function updateBlueprint(
  id: string,
  input: UpdateBlueprintInput,
): WorkScheduleBlueprint {
  const db = getDb();
  const blueprint = requireBlueprint(id);
  const shifts = (input.shifts ?? blueprint.shifts ?? []).map((shift) => ({
    ...shift,
    id: shift.id || uuidv4(),
    name: shift.name.trim(),
    startTime: formatTime(shift.startTime),
    endTime: formatTime(shift.endTime),
  }));
  const next: WorkScheduleBlueprint = {
    ...blueprint,
    ...input,
    id: blueprint.id,
    createdAt: blueprint.createdAt,
    shifts,
    hasShifts: shifts.length > 0,
    isSwappable:
      shifts.length > 0
        ? Boolean(input.isSwappable ?? blueprint.isSwappable)
        : false,
  };
  validateBlueprintShifts(next);
  const index = db.blueprints.findIndex((item) => item.id === id);
  db.blueprints[index] = next;

  if (next.hasShifts) {
    for (const instance of db.instances) {
      if (instance.blueprintId !== id) continue;
      if (
        instance.isCancelled ||
        instance.isOverridden ||
        instance.swappedAt ||
        isInstanceInPast(instance)
      ) {
        continue;
      }
      const weekday = weekdayFromDate(instance.date);
      const shift = next.shifts.find(
        (item) =>
          item.id === instance.shiftId && item.weekdays.includes(weekday),
      );
      if (!next.activeWeekdays.includes(weekday) || !shift) {
        instance.isCancelled = true;
        continue;
      }
      instance.startTime = formatTime(shift.startTime);
      instance.endTime = formatTime(shift.endTime);
      instance.shiftType = inferShiftType(shift.name);
      instance.shiftName = shift.name;
      instance.shiftId = shift.id;
      instance.isSwappable = next.isSwappable;
    }

    for (const assignment of db.assignments.filter(
      (item) => item.blueprintId === id,
    )) {
      db.instances.push(
        ...generateInstancesForAssignment(next, assignment, db.instances),
      );
    }
  } else {
    for (const instance of db.instances) {
      if (instance.blueprintId !== id) continue;
      if (
        instance.isCancelled ||
        instance.swappedAt ||
        isInstanceInPast(instance)
      ) {
        continue;
      }
      instance.isCancelled = true;
    }
  }

  persist();
  return clone(next);
}

export function deleteBlueprint(id: string): void {
  const db = getDb();
  requireBlueprint(id);
  const instanceIds = db.instances
    .filter((item) => item.blueprintId === id)
    .map((item) => item.id);
  db.blueprints = db.blueprints.filter((item) => item.id !== id);
  db.assignments = db.assignments.filter((item) => item.blueprintId !== id);
  db.instances = db.instances.filter((item) => item.blueprintId !== id);
  db.swaps = db.swaps.filter(
    (item) =>
      !instanceIds.includes(item.requesterShiftId) &&
      !instanceIds.includes(item.targetShiftId),
  );
  persist();
}

export function listAssignments(blueprintId?: string): BlueprintAssignment[] {
  const db = getDb();
  const items = blueprintId
    ? db.assignments.filter((item) => item.blueprintId === blueprintId)
    : db.assignments;
  return clone(items);
}

export function listAssignmentsForUser(userId: string): Array<
  BlueprintAssignment & {
    blueprint: WorkScheduleBlueprint;
    shifts: WorkScheduleBlueprint['shifts'];
  }
> {
  const db = getDb();
  return db.assignments
    .filter((item) => item.userId === userId)
    .map((assignment) => {
      const blueprint = requireBlueprint(assignment.blueprintId);
      const shiftIds = assignment.shiftIds || [];
      const shifts = blueprint.hasShifts
        ? blueprint.shifts.filter((shift) => shiftIds.includes(shift.id))
        : [];
      return {
        ...clone(assignment),
        blueprint: clone(blueprint),
        shifts: clone(shifts),
      };
    });
}

export function assignEmployees(params: {
  blueprintId: string;
  userIds: string[];
  shiftIds?: string[];
  assignedFrom?: string;
  assignedTo?: string;
  employees?: Array<Partial<MockEmployee> & { id: string }>;
}): BlueprintAssignment[] {
  const db = getDb();
  const blueprint = requireBlueprint(params.blueprintId);
  const shiftIds = params.shiftIds || [];

  if (blueprint.hasShifts) {
    if (!shiftIds.length) {
      throw new MockWorkScheduleError(
        'SHIFT_REQUIRED',
        'Select at least one shift for this work schedule.',
      );
    }
    const invalid = shiftIds.find(
      (id) => !blueprint.shifts.some((shift) => shift.id === id),
    );
    if (invalid) {
      throw new MockWorkScheduleError(
        'INVALID_SHIFT',
        'One or more selected shifts do not belong to this work schedule.',
      );
    }
  }

  const created: BlueprintAssignment[] = [];

  for (const userId of params.userIds) {
    const profile = params.employees?.find((item) => item.id === userId);
    ensureEmployee(userId, profile);
    const existing = db.assignments.find(
      (item) => item.blueprintId === blueprint.id && item.userId === userId,
    );
    if (existing) {
      existing.shiftIds = blueprint.hasShifts ? [...shiftIds] : [];
      existing.assignedFrom = params.assignedFrom;
      existing.assignedTo = params.assignedTo;
      if (blueprint.hasShifts) {
        for (const instance of db.instances) {
          if (
            instance.blueprintId !== blueprint.id ||
            instance.assignedUserId !== userId ||
            instance.isCancelled ||
            instance.swappedAt ||
            isInstanceInPast(instance)
          ) {
            continue;
          }
          if (instance.shiftId && !shiftIds.includes(instance.shiftId)) {
            instance.isCancelled = true;
          }
        }
        db.instances.push(
          ...generateInstancesForAssignment(blueprint, existing, db.instances),
        );
      }
      created.push(clone(existing));
      continue;
    }

    const assignment: BlueprintAssignment = {
      id: uuidv4(),
      blueprintId: blueprint.id,
      userId,
      shiftIds: blueprint.hasShifts ? [...shiftIds] : [],
      assignedFrom: params.assignedFrom,
      assignedTo: params.assignedTo,
    };

    if (blueprint.hasShifts) {
      const generated = generateInstancesForAssignment(
        blueprint,
        assignment,
        db.instances,
      );
      db.instances.push(...generated);
    }

    db.assignments.push(assignment);
    created.push(assignment);
  }

  persist();
  return clone(created);
}

export function unassignEmployee(blueprintId: string, userId: string): void {
  const db = getDb();
  db.assignments = db.assignments.filter(
    (item) => !(item.blueprintId === blueprintId && item.userId === userId),
  );
  const instanceIds = db.instances
    .filter(
      (item) =>
        item.blueprintId === blueprintId &&
        item.assignedUserId === userId &&
        !isInstanceInPast(item) &&
        !item.swappedAt,
    )
    .map((item) => item.id);
  db.instances = db.instances.map((item) =>
    instanceIds.includes(item.id) ? { ...item, isCancelled: true } : item,
  );
  persist();
}

export function listInstances(
  filters: InstanceFilters = {},
): ShiftInstanceView[] {
  const db = getDb();
  return db.instances
    .filter((item) => {
      if (!filters.includeCancelled && item.isCancelled) return false;
      if (filters.userId && item.assignedUserId !== filters.userId)
        return false;
      if (filters.blueprintId && item.blueprintId !== filters.blueprintId)
        return false;
      if (filters.from && dayjs(item.date).isBefore(filters.from, 'day'))
        return false;
      if (filters.to && dayjs(item.date).isAfter(filters.to, 'day'))
        return false;
      return true;
    })
    .map((item) => toInstanceView(item))
    .sort((a, b) =>
      `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
    );
}

export function listBaselineBands(filters: {
  userId?: string;
  blueprintId?: string;
  from?: string;
  to?: string;
}): Array<{
  date: string;
  blueprint: WorkScheduleBlueprint;
  employee: MockEmployee;
  startTime: string;
  endTime: string;
}> {
  const db = getDb();
  const bands: Array<{
    date: string;
    blueprint: WorkScheduleBlueprint;
    employee: MockEmployee;
    startTime: string;
    endTime: string;
  }> = [];

  const assignments = db.assignments.filter((item) => {
    if (filters.userId && item.userId !== filters.userId) return false;
    if (filters.blueprintId && item.blueprintId !== filters.blueprintId)
      return false;
    return true;
  });

  for (const assignment of assignments) {
    const blueprint = requireBlueprint(assignment.blueprintId);
    if (blueprint.hasShifts) continue;
    const employee = ensureEmployee(assignment.userId);
    const window = rollingScheduleWindow({
      assignedFrom: assignment.assignedFrom,
      assignedTo: assignment.assignedTo,
    });
    const from = filters.from ?? window.from;
    const to = filters.to ?? window.to;
    for (const date of eachDateInRange(from, to)) {
      const weekday = weekdayFromDate(date);
      if (!blueprint.activeWeekdays.includes(weekday)) continue;
      bands.push({
        date,
        blueprint,
        employee,
        startTime: formatTime(blueprint.defaultStartTime),
        endTime: formatTime(blueprint.defaultEndTime),
      });
    }
  }
  return bands;
}

export function updateInstance(
  id: string,
  input: {
    startTime?: string;
    endTime?: string;
    assignedUserId?: string;
    isCancelled?: boolean;
    shiftType?: ShiftInstance['shiftType'];
  },
): ShiftInstanceView {
  const db = getDb();
  const instance = requireInstance(id);
  if (input.assignedUserId) requireEmployee(input.assignedUserId);

  const nextStart = input.startTime ?? instance.startTime;
  const nextEnd = input.endTime ?? instance.endTime;
  const nextUser = input.assignedUserId ?? instance.assignedUserId;

  const overlap = db.instances.some(
    (item) =>
      item.id !== id &&
      item.assignedUserId === nextUser &&
      item.date === instance.date &&
      !item.isCancelled &&
      timesOverlap(item.startTime, item.endTime, nextStart, nextEnd),
  );
  if (overlap) {
    throw new MockWorkScheduleError(
      'OVERLAP_DETECTED',
      'This change would overlap another shift for the employee.',
    );
  }

  instance.startTime = nextStart;
  instance.endTime = nextEnd;
  instance.assignedUserId = nextUser;
  if (typeof input.isCancelled === 'boolean')
    instance.isCancelled = input.isCancelled;
  if (input.shiftType) instance.shiftType = input.shiftType;
  if (input.startTime || input.endTime || input.assignedUserId) {
    instance.isOverridden = true;
  }
  persist();
  return toInstanceView(instance);
}

export function listSwaps(filters: SwapFilters = {}): SwapRequestView[] {
  const db = getDb();
  const statuses = filters.status
    ? Array.isArray(filters.status)
      ? filters.status
      : [filters.status]
    : undefined;
  return db.swaps
    .filter((item) => {
      if (statuses && !statuses.includes(item.status)) return false;
      if (
        filters.userId &&
        item.requesterId !== filters.userId &&
        item.targetUserId !== filters.userId
      ) {
        return false;
      }
      return true;
    })
    .map((item) => toSwapView(item))
    .sort(
      (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
    );
}

export function listEligibleSwapTargets(
  requesterShiftId: string,
): ShiftInstanceView[] {
  const requester = requireInstance(requesterShiftId);
  const blueprint = requireBlueprint(requester.blueprintId);
  if (!blueprint.hasShifts) {
    throw new MockWorkScheduleError(
      'SWAP_NOT_SUPPORTED_FOR_BASELINE',
      'Swap is not supported for baseline schedules.',
    );
  }
  if (
    !requester.isSwappable ||
    requester.isCancelled ||
    isInstanceInPast(requester)
  ) {
    return [];
  }

  return getDb()
    .instances.filter((item) => {
      if (item.id === requester.id) return false;
      if (item.assignedUserId === requester.assignedUserId) return false;
      if (!item.isSwappable || item.isCancelled) return false;
      if (isInstanceInPast(item)) return false;
      if (hasPendingSwap(item.id)) return false;
      const targetBlueprint = requireBlueprint(item.blueprintId);
      if (!targetBlueprint.hasShifts) return false;
      return !wouldOverlapAfterSwap(requester, item);
    })
    .map((item) => toInstanceView(item));
}

export function createSwapRequest(params: {
  requesterShiftId: string;
  targetShiftId: string;
  reason?: string;
}): SwapRequestView {
  const db = getDb();
  const requesterShift = requireInstance(params.requesterShiftId);
  const targetShift = requireInstance(params.targetShiftId);
  const requesterBlueprint = requireBlueprint(requesterShift.blueprintId);
  const targetBlueprint = requireBlueprint(targetShift.blueprintId);

  if (!requesterBlueprint.hasShifts || !targetBlueprint.hasShifts) {
    throw new MockWorkScheduleError(
      'SWAP_NOT_SUPPORTED_FOR_BASELINE',
      'Swap is not supported for baseline schedules.',
    );
  }
  if (!requesterShift.isSwappable || !targetShift.isSwappable) {
    throw new MockWorkScheduleError(
      'SHIFT_NOT_SWAPPABLE',
      'One or both shifts are not swappable.',
    );
  }
  if (requesterShift.isCancelled || targetShift.isCancelled) {
    throw new MockWorkScheduleError(
      'SHIFT_CANCELLED',
      'Cannot swap a cancelled shift.',
    );
  }
  if (requesterShift.assignedUserId === targetShift.assignedUserId) {
    throw new MockWorkScheduleError(
      'SAME_EMPLOYEE',
      'Cannot swap with your own shift.',
    );
  }
  if (isInstanceInPast(requesterShift) || isInstanceInPast(targetShift)) {
    throw new MockWorkScheduleError(
      'SHIFT_IN_PAST',
      'Cannot swap a shift that has already started.',
    );
  }
  if (hasPendingSwap(requesterShift.id) || hasPendingSwap(targetShift.id)) {
    throw new MockWorkScheduleError(
      'SWAP_ALREADY_PENDING',
      'A pending swap already exists for one of these shifts.',
    );
  }
  if (wouldOverlapAfterSwap(requesterShift, targetShift)) {
    throw new MockWorkScheduleError(
      'OVERLAP_DETECTED',
      'This swap would create overlapping shifts.',
    );
  }

  const swap: ShiftSwapRequest = {
    id: uuidv4(),
    requesterShiftId: requesterShift.id,
    targetShiftId: targetShift.id,
    requesterId: requesterShift.assignedUserId,
    targetUserId: targetShift.assignedUserId,
    status: 'PENDING_PEER',
    reason: params.reason,
    createdAt: dayjs().toISOString(),
  };
  db.swaps.unshift(swap);
  persist();
  return toSwapView(swap);
}

export function peerRespondToSwap(
  id: string,
  accept: boolean,
  actorUserId: string,
): SwapRequestView {
  const swap = requireSwap(id);
  if (swap.status !== 'PENDING_PEER') {
    throw new MockWorkScheduleError(
      'INVALID_SWAP_STATUS',
      'This swap is not waiting for peer review.',
    );
  }
  if (swap.targetUserId !== actorUserId) {
    throw new MockWorkScheduleError(
      'FORBIDDEN',
      'Only the target peer can respond to this request.',
    );
  }
  if (accept) {
    swap.status = 'PENDING_ADMIN';
    swap.peerAcceptedAt = dayjs().toISOString();
  } else {
    swap.status = 'REJECTED_PEER';
  }
  persist();
  return toSwapView(swap);
}

export function adminRespondToSwap(
  id: string,
  accept: boolean,
  rejectionReason?: string,
): SwapRequestView {
  const swap = requireSwap(id);
  if (swap.status !== 'PENDING_ADMIN') {
    throw new MockWorkScheduleError(
      'INVALID_SWAP_STATUS',
      'This swap is not waiting for admin approval.',
    );
  }
  const requesterShift = requireInstance(swap.requesterShiftId);
  const targetShift = requireInstance(swap.targetShiftId);

  if (accept) {
    if (wouldOverlapAfterSwap(requesterShift, targetShift)) {
      throw new MockWorkScheduleError(
        'OVERLAP_DETECTED',
        'Approving this swap would create overlapping shifts.',
      );
    }
    const requesterUserId = requesterShift.assignedUserId;
    requesterShift.assignedUserId = targetShift.assignedUserId;
    targetShift.assignedUserId = requesterUserId;
    requesterShift.swappedAt = dayjs().toISOString();
    targetShift.swappedAt = dayjs().toISOString();
    swap.status = 'APPROVED';
    swap.adminApprovedAt = dayjs().toISOString();
  } else {
    swap.status = 'REJECTED_ADMIN';
    swap.adminRejectedAt = dayjs().toISOString();
    swap.rejectionReason = rejectionReason;
  }
  persist();
  return toSwapView(swap);
}

export function resetMockWorkScheduleDb(): MockWorkScheduleDb {
  memoryDb = buildSeedDb();
  persist();
  return clone(memoryDb);
}

export { getEmployeeDisplayName };
