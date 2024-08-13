export interface DayOfWeek {
  day: string;
  key: string;
  workDay: boolean;
  startingTime?: string | null;
  endTime?: string | null;
  duration?: string;
}

export interface Schedule {
  scheduleName: string;
  standardHours: number;
  daysOfWeek: DayOfWeek[];
}

export interface ScheduleResponse {
  data: Schedule;
}
