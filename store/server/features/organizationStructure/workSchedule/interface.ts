export interface DayOfWeek {
  day: string;
  key?: string;
  id?: string;
  workDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number;
}

export interface Schedule {
  name?: string;
  scheduleName?: string;
  standardHours?: number;
  detail: DayOfWeek[];
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
  name: string;
  standardHours: number;
  detail: DayOfWeekResponse[];
}

export interface ScheduleResponse {
  items: ResponseSchedule[];
  meta: any;
}
