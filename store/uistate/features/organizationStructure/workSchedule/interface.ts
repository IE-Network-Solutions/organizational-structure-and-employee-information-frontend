export interface ScheduleDetail {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  duration: number;
  workDay: boolean;
}

export interface ShiftDraft {
  key: string;
  id?: string;
  name: string;
  startTime: string;
  endTime: string;
  isSwappable: boolean;
  applyToAllDays: boolean;
  days: string[];
  breaks?: Array<{
    id?: string;
    breakTypeId: string;
    sortOrder?: number;
    startAt?: string | null;
    endAt?: string | null;
    startAtFrom?: string | null;
    startAtTo?: string | null;
    endAtFrom?: string | null;
    endAtTo?: string | null;
  }>;
}

export interface ScheduleState {
  id: string;
  detail: ScheduleDetail[];
  shifts: ShiftDraft[];
  standardHours: number;
  validationError: string;
  isOpen: boolean;
  isEditMode: boolean;
  scheduleName: string;
  isDeleteMode: boolean;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setId: (id: string) => void;
  setDetail: (day: string, data: Partial<ScheduleDetail>) => void;
  setShifts: (shifts: ShiftDraft[]) => void;
  addShift: (shift?: Partial<ShiftDraft>) => void;
  updateShift: (key: string, data: Partial<ShiftDraft>) => void;
  removeShift: (key: string) => void;
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
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}
