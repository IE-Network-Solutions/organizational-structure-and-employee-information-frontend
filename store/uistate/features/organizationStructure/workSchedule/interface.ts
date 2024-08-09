
export interface ScheduleDetail {
  id: string;
  dayOfWeek:  string;
  startTime:  string;
  endTime:  string;
  hours: number;
  status:boolean;
}

export interface ScheduleState {
  name: string;
  detail: ScheduleDetail[];
  standardHours: number;
  setName: (name: string) => void;
  setStandardHours: (hours: number) => void;
  setDetail: (dayOfWeek: string, data: Partial<ScheduleDetail>) => void;
  createWorkSchedule: () => any;
  getSchedule:()=>any
}