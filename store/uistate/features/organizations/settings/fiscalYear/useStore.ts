import { create } from 'zustand';
import { DrawerState } from './interface';
import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { shallowEqual } from '@/utils/shallowEqual';
import { getCalendarTypeFromSessionCount } from './wizardUtils';
import {
  buildFiscalYearFormValues,
  buildMonthStructureKeyFromState,
  buildSessionStructureKeyFromState,
  resolveMonthWizardState,
  resolveSessionRows,
} from './wizardActions';

const emptyWizardFields = {
  sessionStructureKey: null as string | null,
  monthStructureKey: null as string | null,
  expandedMonthSession: null as number | null,
};

export const useFiscalYearDrawerStore = create<DrawerState>((set, get) => ({
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
  setEditMode: (isEdit: boolean) => set({ isEditMode: isEdit }),
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
  setSessionData: (value) =>
    set((state) => ({
      sessionData:
        typeof value === 'function' ? value(state.sessionData) : value,
    })),
  sessionStructureKey: null,
  monthStructureKey: null,
  monthDataBySession: {},
  monthFormFields: {},
  expandedMonthSession: null,
  setExpandedMonthSession: (index) => set({ expandedMonthSession: index }),

  syncSessions: () => {
    const state = get();
    const structureKey = buildSessionStructureKeyFromState(state);

    if (
      state.sessionStructureKey === structureKey &&
      state.sessionData.length > 0
    ) {
      return;
    }

    const sessionData = resolveSessionRows(state);
    set({
      sessionData,
      sessionStructureKey: structureKey,
      sessionFormValues: {
        ...state.sessionFormValues,
        sessionData,
        fiscalYearStart: state.fiscalYearStart,
        fiscalYearEnd: state.fiscalYearEnd,
      },
    });
  },

  syncMonths: () => {
    const state = get();
    const monthStructureKey = buildMonthStructureKeyFromState({
      ...state,
      sessionStructureKey: state.sessionStructureKey,
    });

    if (
      state.monthStructureKey === monthStructureKey &&
      state.monthRangeValues.length > 0
    ) {
      return;
    }

    const monthState = resolveMonthWizardState(state);
    set({
      monthStructureKey,
      monthDataBySession: monthState.monthDataBySession,
      monthRangeValues: monthState.monthRangeValues,
      monthFormFields: monthState.monthFormFields,
      expandedMonthSession:
        state.expandedMonthSession ??
        (Object.keys(monthState.monthDataBySession).length > 0 ? 0 : null),
    });
  },

  goToStep: (step: number, options?: { sync?: boolean }) => {
    const state = get();
    const shouldSync = options?.sync ?? step > state.current;

    if (shouldSync && step === 1) {
      get().syncSessions();
    } else if (shouldSync && step === 2) {
      get().syncMonths();
    }

    set({ current: step });
  },

  getStepFormValues: (step: number) => {
    const state = get();
    if (step === 0) return state.fiscalYearFormValues;
    if (step === 1) return { sessionData: state.sessionData };
    if (step === 2) return state.monthFormFields;
    return {};
  },

  updateFiscalYearFields: (values) => {
    const calendarType = values.fiscalYearCalenderId ?? get().calendarType;
    const isValid = Boolean(
      values.fiscalYearName &&
      values.fiscalYearStartDate &&
      values.fiscalYearEndDate &&
      values.fiscalYearCalenderId,
    );

    set({
      fiscalYearFormValues: values,
      calendarType,
      fiscalYearStart: values.fiscalYearStartDate ?? get().fiscalYearStart,
      fiscalYearEnd: values.fiscalYearEndDate ?? get().fiscalYearEnd,
      formValidation: {
        fiscalYearName: values.fiscalYearName,
        fiscalYearStartDate: values.fiscalYearStartDate ?? null,
        fiscalYearEndDate: values.fiscalYearEndDate ?? null,
      },
      isFormValid: isValid,
    });
  },

  updateSessionFields: (values) => {
    const state = get();
    const sessionData = Array.isArray(values.sessionData)
      ? values.sessionData
      : [];
    set({
      sessionData,
      sessionFormValues: {
        ...values,
        sessionData,
        fiscalYearStart: state.fiscalYearStart,
        fiscalYearEnd: state.fiscalYearEnd,
      },
    });
  },

  updateMonthFields: (values) => {
    const monthNumbers = Object.keys(values)
      .filter((key) => key.startsWith('monthName_'))
      .map((key) => parseInt(key.replace('monthName_', ''), 10))
      .sort((a, b) => a - b);

    const monthRangeValues = monthNumbers
      .map((monthNumber) => ({
        monthNumber,
        monthName: values[`monthName_${monthNumber}`],
        monthStartDate: values[`monthStartDate_${monthNumber}`] ?? null,
        monthEndDate: values[`monthEndDate_${monthNumber}`] ?? null,
        monthDescription: values[`monthDescription_${monthNumber}`] ?? '',
      }))
      .filter(
        (month) =>
          month.monthName && month.monthStartDate && month.monthEndDate,
      );

    set((state) =>
      !shallowEqual(state.monthRangeValues, monthRangeValues)
        ? {
            monthRangeValues,
            monthFormFields: values,
          }
        : { monthFormFields: values },
    );
  },

  resetWizard: () =>
    set({
      current: 0,
      isEditMode: false,
      selectedFiscalYear: null,
      calendarType: '',
      fiscalYearStart: null,
      fiscalYearEnd: null,
      fiscalYearFormValues: {},
      sessionFormValues: {},
      sessionData: [],
      monthRangeValues: [],
      monthDataBySession: {},
      monthFormFields: {},
      hasOverlapError: false,
      isFormValid: false,
      wizardOpenToken: 0,
      formValidation: {
        fiscalYearName: '',
        fiscalYearStartDate: null,
        fiscalYearEndDate: null,
      },
      ...emptyWizardFields,
    }),

  prepareEditWizard: (fiscalYear: any) => {
    const sessionCount = fiscalYear?.sessions?.length ?? 0;
    const calendarType = getCalendarTypeFromSessionCount(sessionCount);
    const fiscalYearFormValues = buildFiscalYearFormValues(
      fiscalYear,
      calendarType,
    );
    const fiscalYearStart = fiscalYear?.startDate
      ? dayjs(fiscalYear.startDate)
      : null;
    const fiscalYearEnd = fiscalYear?.endDate
      ? dayjs(fiscalYear.endDate)
      : null;

    set({
      current: 0,
      isEditMode: true,
      selectedFiscalYear: fiscalYear,
      calendarType,
      fiscalYearStart,
      fiscalYearEnd,
      fiscalYearFormValues,
      sessionFormValues: {},
      sessionData: [],
      monthRangeValues: [],
      monthDataBySession: {},
      monthFormFields: {},
      hasOverlapError: false,
      isFormValid: true,
      formValidation: {
        fiscalYearName: fiscalYear?.name ?? '',
        fiscalYearStartDate: fiscalYearStart,
        fiscalYearEndDate: fiscalYearEnd,
      },
      openfiscalYearDrawer: true,
      wizardOpenToken: Date.now(),
      sessionStructureKey: null,
      monthStructureKey: null,
      expandedMonthSession: null,
    });
  },

  prepareCreateWizard: () =>
    set({
      current: 0,
      isEditMode: false,
      selectedFiscalYear: null,
      calendarType: '',
      fiscalYearStart: null,
      fiscalYearEnd: null,
      fiscalYearFormValues: {},
      sessionFormValues: {},
      sessionData: [],
      monthRangeValues: [],
      monthDataBySession: {},
      monthFormFields: {},
      hasOverlapError: false,
      isFormValid: false,
      formValidation: {
        fiscalYearName: '',
        fiscalYearStartDate: null,
        fiscalYearEndDate: null,
      },
      openfiscalYearDrawer: true,
      wizardOpenToken: Date.now(),
      sessionStructureKey: null,
      monthStructureKey: null,
      expandedMonthSession: null,
    }),

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
  searchQuery: '',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  wizardOpenToken: 0,
}));
