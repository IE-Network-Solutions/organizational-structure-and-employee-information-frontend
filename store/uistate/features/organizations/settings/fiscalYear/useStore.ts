import { create } from 'zustand';
import { DrawerState } from './interface';
import { Dayjs } from 'dayjs';

export const useFiscalYearDrawerStore = create<DrawerState>((set) => ({
  isFiscalYearOpen: false,
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
  openDrawer: () => set({ isFiscalYearOpen: true }),
  setWorkingHour: (hours) => set({ workingHour: hours }),
  setEditMode: (isEdit: any) => set({ isEditMode: isEdit }),
  setSelectedFiscalYear: (fiscalYear: any) =>
    set({ selectedFiscalYear: fiscalYear }),
  setDeleteMode: (isDelete) => set({ isDeleteMode: isDelete }),
  setCurrent: (value: number) => set({ current: value }),
  formData: {},
  setFormData: (newData) =>
    set((state) => ({
      formData: { ...state.formData, ...newData },
    })),
  fiscalYearEnd: null,
  setFiscalYearEnd: (value: Dayjs) => set({ fiscalYearEnd: value }),
  fiscalYearStart: null,
  setFiscalYearStart: (value: Dayjs) => set({ fiscalYearStart: value }),
  clearFormData: () => set({ formData: {} }),

  sessionData: [],
  setSessionData: (value: any[]) => set({ sessionData: value }),

  fiscalYearFormValues: {},
  setFiscalYearFormValues: (newData) => set({ fiscalYearFormValues: newData }),

  monthRangeValues: [],
  setMonthRangeFormValues: (newData) =>
    set((state) =>
      JSON.stringify(state.monthRangeValues) !== JSON.stringify(newData)
        ? { monthRangeValues: newData }
        : state,
    ),
}));
