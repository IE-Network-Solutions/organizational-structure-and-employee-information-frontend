import { Dayjs } from 'dayjs';

export interface DrawerState {
  isFiscalYearOpen: boolean;
  workingHour: string | number;
  selectedFiscalYear: any;
  isEditMode: boolean;
  isDeleteMode: boolean;
  current: number;
  calendarType: string | null;
  pageSize: number;
  currentPage: number;
  selectedYear: number;
  sessionFormValues: any;
  formData: Record<string, any>;
  setFormData: (newData: Record<string, any>) => void;
  fiscalYearEnd: Dayjs | null;
  setFiscalYearEnd: (fiscalYearEndDate: Dayjs) => void;
  fiscalYearStart: Dayjs | null;
  setFiscalYearStart: (fiscalYearStartDate: Dayjs) => void;
  clearFormData: () => void;
  setSessionFormValues: (values: any) => void;
  setSelectedYear: (year: number) => void;
  setCurrentPage: (currentPage: number) => void;
  setPageSize: (value: number) => void;
  setCalendarType: (value: string | null) => void;
  setDeleteMode: (isDelete: boolean) => void;
  toggleFiscalYearDrawer: () => void;
  closeFiscalYearDrawer: () => void;
  openDrawer: () => void;
  setWorkingHour: (hours: string | number) => void;
  setSelectedFiscalYear: (fiscalYear: any) => void;
  setEditMode: (isEdit: boolean) => void; // Toggle edit mode
  setCurrent: (current: number) => void; // Update the current fiscal year
}
