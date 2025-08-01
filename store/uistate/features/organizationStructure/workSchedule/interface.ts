export interface ScheduleDetail {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  hours: number;
  status: boolean;
}

export interface ScheduleState {
  id: string;
  detail: ScheduleDetail[];
  standardHours: number;
  validationError: string;
  isOpen: boolean;
  isEditMode: boolean;
  scheduleName: string;
  isDeleteMode: boolean;
  setId: (id: string) => void;
  setDetail: (dayOfWeek: string, data: Partial<ScheduleDetail>) => void;
  createWorkSchedule: () => any;
  getSchedule: () => any;
  clearState: () => void;
  setStandardHours: (standardHours: number) => void;
  setValidationError: (error: string) => void;
  clearValidationError: () => void;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  openDrawer: () => void;
  setEditMode: (isEdit: boolean) => void;
  setDeleteMode: (isDelete: boolean) => void;
  setScheduleName: (scheduleName: string) => void;
}
