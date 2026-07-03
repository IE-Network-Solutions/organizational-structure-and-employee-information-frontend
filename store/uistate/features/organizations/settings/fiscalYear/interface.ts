import { Dayjs } from 'dayjs';
import { MonthRow, MonthSessionRow, SessionRow } from './wizardActions';

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
  setFiscalYearEnd: (fiscalYearEndDate: Dayjs | null) => void;
  fiscalYearStart: Dayjs | null;
  setFiscalYearStart: (fiscalYearStartDate: Dayjs | null) => void;
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
  openfiscalYearDrawer: boolean;
  setOpenFiscalYearDrawer: (isOpen: boolean) => void;

  sessionData: SessionRow[];
  setSessionData: (data: SessionRow[] | ((prev: SessionRow[]) => SessionRow[])) => void;
  sessionStructureKey: string | null;
  monthStructureKey: string | null;
  monthDataBySession: Record<number, MonthSessionRow[]>;
  monthFormFields: Record<string, any>;
  expandedMonthSession: number | null;
  setExpandedMonthSession: (index: number | null) => void;

  prepareEditWizard: (fiscalYear: any) => void;
  prepareCreateWizard: () => void;
  syncSessions: () => void;
  syncMonths: () => void;
  goToStep: (step: number, options?: { sync?: boolean }) => void;
  getStepFormValues: (step: number) => Record<string, any>;
  updateFiscalYearFields: (values: Record<string, any>) => void;
  updateSessionFields: (values: Record<string, any>) => void;
  updateMonthFields: (values: Record<string, any>) => void;
  resetWizard: () => void;

  fiscalYearFormValues: Record<string, any>;
  setFiscalYearFormValues: (newData: Record<string, any>) => void;
  fiscalYearPayLoad: any;
  setFiscalYearPayLoad: (newData: any) => void;

  sessionFormValues: Record<string, any>;
  setSessionFormValues: (newData: Record<string, any>) => void;

  monthRangeValues: MonthRow[];
  setMonthRangeFormValues: (newData: MonthRow[]) => void;

  formValidation: FormValidation;
  setFormValidation: (newData: Partial<FormValidation>) => void;
  isFormValid: boolean;
  setIsFormValid: (isValid: boolean) => void;
  resetFormState: () => void;

  openDrawer: () => void;
  setIsOpenFiscalYearDrawer: (isOpen: boolean) => void;

  hasOverlapError: boolean;
  setHasOverlapError: (hasOverlapError: boolean) => void;

  wizardOpenToken: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}
