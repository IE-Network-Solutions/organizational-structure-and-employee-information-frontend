export interface DayOfWeek {
  day: string;
  key: string;
  workDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
  duration?: string;
}

export interface Schedule {
  scheduleName: string;
  standardHours: number;
  detail: DayOfWeek[];
}

export interface ScheduleResponse {
  items: Schedule[];
  meta: any;
}
