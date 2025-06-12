import { Dayjs } from 'dayjs';

export interface DrawerState {
  isFiscalYearOpen: boolean;
  workingHour: string | number;
  selectedFiscalYear: any;
  isEditMode: boolean;
  isDeleteMode: boolean;
  current: number;
  calendarType: string;
  pageSize: number;
  currentPage: number;
  selectedYear: number;
  formData: Record<string, any>;
  setFormData: (newData: Record<string, any>) => void;
  fiscalYearEnd: Dayjs | null;
  setFiscalYearEnd: (fiscalYearEndDate: Dayjs) => void;
  fiscalYearStart: Dayjs | null;
  setFiscalYearStart: (fiscalYearStartDate: Dayjs) => void;
  clearFormData: () => void;
  setSelectedYear: (year: number) => void;
  setCurrentPage: (currentPage: number) => void;
  setPageSize: (value: number) => void;
  setCalendarType: (value: string) => void;
  setDeleteMode: (isDelete: boolean) => void;
  toggleFiscalYearDrawer: () => void;
  closeFiscalYearDrawer: () => void;
  openDrawer: () => void;
  openfiscalYearDrawer: boolean;

  isOpenfiscalYearDrawer: boolean;
  setIsOpenFiscalYearDrawer: (isOpenfiscalYearDrawer: boolean) => void;

  setOpenFiscalYearDrawer: (openfiscalYearDrawer: boolean) => void;
  setWorkingHour: (hours: string | number) => void;
  setSelectedFiscalYear: (fiscalYear: any) => void;
  setEditMode: (isEdit: boolean) => void; // Toggle edit mode
  setCurrent: (current: number) => void; // Update the current fiscal year

  sessionData: any[];
  setSessionData: (data: any) => void;

  fiscalYearFormValues: Record<string, any>;
  setFiscalYearFormValues: (newData: Record<string, any>) => void;
  fiscalYearPayLoad: any;
  setFiscalYearPayLoad:(newData: Record<string, any>) => void;

  sessionFormValues: Record<string, any>;
  setSessionFormValues: (newData: Record<string, any>) => void;

  monthRangeValues: any;
  setMonthRangeFormValues: (newData: any) => void;
}
