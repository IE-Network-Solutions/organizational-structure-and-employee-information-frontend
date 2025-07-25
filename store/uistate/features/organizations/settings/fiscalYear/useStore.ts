import { create } from 'zustand';
import { DrawerState } from './interface';
import { Dayjs } from 'dayjs';
import { shallowEqual } from '@/utils/shallowEqual';

export const useFiscalYearDrawerStore = create<DrawerState>((set) => ({
  isFiscalYearOpen: false,
  openfiscalYearDrawer: false,
  workingHour: '40',
  isEditMode: false,
  selectedFiscalYear: null,
  isDeleteMode: false,
  current: 0,
  calendarType: '',
  pageSize: 5,
  currentPage: 1,
  selectedYear: new Date().getFullYear(),
  sessionFormValues: {},
  setSessionFormValues: (values) => set({ sessionFormValues: values }),
  setSelectedYear: (year: number) =>
    set({
      selectedYear: year,
    }),
  setCurrentPage: (value: number) => set({ currentPage: value }),
  setPageSize: (value: number) => set({ pageSize: value }),
  setCalendarType: (value: string) => set({ calendarType: value }),
  toggleFiscalYearDrawer: () =>
    set((state) => ({ isFiscalYearOpen: !state.isFiscalYearOpen })),
  closeFiscalYearDrawer: () => set({ isFiscalYearOpen: false }),
  openFiscalYearDrawer: () => set({ isFiscalYearOpen: true }),
  setOpenFiscalYearDrawer: (isOpen: boolean) =>
    set({ openfiscalYearDrawer: isOpen }),
  setWorkingHour: (hours) => set({ workingHour: hours }),
  setEditMode: (isEdit: any) => set({ isEditMode: isEdit }),
  setSelectedFiscalYear: (fiscalYear: any) =>
    set({ selectedFiscalYear: fiscalYear }),
  setDeleteMode: (isDelete: boolean) => set({ isDeleteMode: isDelete }),
  setCurrent: (value: number) => set({ current: value }),
  formData: {},
  setFormData: (newData) =>
    set((state) => ({
      formData: { ...state.formData, ...newData },
    })),
  fiscalYearEnd: null,
  setFiscalYearEnd: (value: Dayjs | null) => set({ fiscalYearEnd: value }),
  fiscalYearStart: null,
  setFiscalYearStart: (value: Dayjs | null) => set({ fiscalYearStart: value }),
  clearFormData: () => set({ formData: {} }),

  sessionData: [],
  setSessionData: (value: any[]) => set({ sessionData: value }),

  fiscalYearFormValues: {},
  setFiscalYearFormValues: (newData) => set({ fiscalYearFormValues: newData }),

  formValidation: {
    fiscalYearName: '',
    fiscalYearStartDate: null,
    fiscalYearEndDate: null,
  },
  setFormValidation: (newData) =>
    set((state) => ({
      formValidation: { ...state.formValidation, ...newData },
    })),
  isFormValid: false,
  setIsFormValid: (isValid: boolean) => set({ isFormValid: isValid }),

  resetFormState: () =>
    set(() => ({
      formValidation: {
        fiscalYearName: '',
        fiscalYearStartDate: null,
        fiscalYearEndDate: null,
      },
      isFormValid: false,
      fiscalYearFormValues: {},
    })),

  monthRangeValues: [],
  setMonthRangeFormValues: (newData) =>
    set((state) =>
      !shallowEqual(state.monthRangeValues, newData)
        ? { monthRangeValues: newData }
        : state,
    ),
  openDrawer: () => set({ openfiscalYearDrawer: true }),
  setIsOpenFiscalYearDrawer: (isOpen: boolean) =>
    set({ openfiscalYearDrawer: isOpen }),
  fiscalYearPayLoad: null,
  setFiscalYearPayLoad: (value) => set({ fiscalYearPayLoad: value }),
  hasOverlapError: false,
  setHasOverlapError: (value: boolean) => set({ hasOverlapError: value }),
}));
