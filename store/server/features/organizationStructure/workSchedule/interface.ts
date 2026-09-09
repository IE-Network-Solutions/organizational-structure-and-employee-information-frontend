export interface DayOfWeek {
  day: string;
  key?: string;
  id?: string;
  workDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number;
}

export interface WorkScheduleShiftBreak {
  breakTypeId: string;
  sortOrder?: number;
  startAt?: string | null;
  endAt?: string | null;
  startAtFrom?: string | null;
  startAtTo?: string | null;
  endAtFrom?: string | null;
  endAtTo?: string | null;
}

export interface WorkScheduleShift {
  id?: string;
  name: string;
  startTime: string;
  endTime: string;
  isSwappable?: boolean;
  applyToAllDays?: boolean;
  days?: string[];
  breaks?: WorkScheduleShiftBreak[];
}

export interface Schedule {
  name?: string;
  scheduleName?: string;
  standardHours?: number;
  detail: DayOfWeek[];
  shifts?: WorkScheduleShift[];
}

export interface DayOfWeekResponse {
  id: string;
  day: string;
  dayOfWeek?: string;
  startTime?: string | null;
  endTime?: string | null;
  duration?: string;
  hours?: string;
  workDay: boolean;
}

export interface ResponseSchedule {
  id?: string;
  name: string;
  standardHours: number;
  detail: DayOfWeekResponse[];
  shifts?: WorkScheduleShift[];
}

export interface ScheduleResponse {
  items: ResponseSchedule[];
  meta: any;
}

export interface ScheduleUsageResponse {
  count: number;
  hasUsers: boolean;
}
