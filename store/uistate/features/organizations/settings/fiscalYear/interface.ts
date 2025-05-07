import { Dayjs } from 'dayjs';

export interface FormValidation {
  fiscalYearName: string;
  fiscalYearStartDate: Dayjs | null;
  fiscalYearEndDate: Dayjs | null;
}

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
  setDeleteMode: (isDeleteMode: boolean) => void;
  toggleFiscalYearDrawer: () => void;
  closeFiscalYearDrawer: () => void;
  openFiscalYearDrawer: () => void;
  setWorkingHour: (hours: string | number) => void;
  setSelectedFiscalYear: (fiscalYear: any) => void;
  setEditMode: (isEdit: boolean) => void;
  setCurrent: (current: number) => void;

  sessionData: any[];
  setSessionData: (data: any) => void;

  fiscalYearFormValues: Record<string, any>;
  setFiscalYearFormValues: (newData: Record<string, any>) => void;

  sessionFormValues: Record<string, any>;
  setSessionFormValues: (newData: Record<string, any>) => void;

  monthRangeValues: any;
  setMonthRangeFormValues: (newData: any) => void;

  formValidation: FormValidation;
  setFormValidation: (newData: Partial<FormValidation>) => void;
  isFormValid: boolean;
  setIsFormValid: (isValid: boolean) => void;
  resetFormState: () => void;
}
