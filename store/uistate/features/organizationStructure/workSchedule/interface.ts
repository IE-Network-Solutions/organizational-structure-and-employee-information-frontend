
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
  setName: (name: string) => void;
  setDetail: (dayOfWeek: string, data: Partial<ScheduleDetail>) => void;
  createWorkSchedule: () => any;
  getSchedule:()=>any
}