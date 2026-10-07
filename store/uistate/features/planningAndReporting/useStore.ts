// useStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
type MkAsATask = {
  title: string | null;
  mid: string | null;
};

export interface PlanningAndReporting {
  mkAsATask: MkAsATask | null;
  setMKAsATask: (mkAsATask: MkAsATask | null) => void;

  newComment: string;
  setNewComment: (newComment: string) => void;

  viewComment: boolean;
  setViewComment: (viewComment: boolean) => void;

  open: boolean;
  setOpen: (open: boolean) => void;
  openReportModal: boolean;
  setOpenReportModal: (open: boolean) => void;

  isEditing: boolean;
  setEditing: (open: boolean) => void;

  activeTab: number;
  setActiveTab: (activeTab: number) => void;

  activePlanPeriod: number;
  setActivePlanPeriod: (activePlanPeriod: number) => void;

  activePlanPeriodId: string;
  setActivePlanPeriodId: (activePlanPeriodId: string) => void;

  selectedUser: string[];
  setSelectedUser: (selectedUser: string[]) => void;
  planningDefaultFilterApplied: boolean;
  setPlanningDefaultFilterApplied: (value: boolean) => void;
  weights: Record<string, number>;
  totalWeight: number;

  setWeight: (key: string, weight: number) => void;
  removeWeight: (key: string) => void;
  resetWeights: () => void;

  selectedStatuses: Record<string, string | undefined>; // Map task IDs to their statuses
  setStatus: (taskId: string, status: any) => void; // Function to update status
  resetStatuses: () => void;
  page: number; // Map task IDs to their statuses
  setPage: (page: number) => void; // Function to update status
  pageSize: number;
  setPageSize: (value: number) => void;
  pageReporting: number; // Map task IDs to their statuses
  setPageReporting: (pageReporting: number) => void; // Function to update status
  pageSizeReporting: number;
  setPageSizeReporting: (value: number) => void;
  selectedPlanId: string;
  setSelectedPlanId: (selectedPlanId: string) => void;

  selectedReportId: string;
  setSelectedReportId: (selectedReportId: string) => void;

  // Fiscal year and session filters
  selectedFiscalYearId: string | null;
  setSelectedFiscalYearId: (yearId: string | null) => void;

  selectedSessionIds: string[];
  setSelectedSessionIds: (sessionIds: string[]) => void;

  allSessionsOfYear: string[];
  setAllSessionsOfYear: (sessions: string[]) => void;

  /** Planning tab: department / plan-type / employee filters (toolbar popover) */
  planningFilterDepartment: string | undefined;
  setPlanningFilterDepartment: (id: string | undefined) => void;
  planningFilterPlanType: string;
  setPlanningFilterPlanType: (value: string) => void;
  planningFilterEmployee: string;
  setPlanningFilterEmployee: (value: string) => void;

  /** Page-embedded create plan (KR + composer) instead of drawer on desktop */
  inlinePlanningMode: boolean;
  setInlinePlanningMode: (value: boolean) => void;

  /** Full-screen mobile/tablet sheet for KR pick + inline composer */
  mobilePlanComposerOpen: boolean;
  setMobilePlanComposerOpen: (value: boolean) => void;

  /** Plan card: inline report form instead of drawer (plan row id) */
  inlineReportPlanId: string | null;
  setInlineReportPlanId: (id: string | null) => void;

  /** InlinePlanningWorkspace: edit existing plan (plan id) */
  inlineEditPlanId: string | null;
  setInlineEditPlanId: (id: string | null) => void;
}

export const PlanningAndReportingStore = create<PlanningAndReporting>()(
  devtools((set) => ({
    newComment: '',
    setNewComment: (newComment: string) => set({ newComment }),

    viewComment: false,
    setViewComment: (viewComment: boolean) => set({ viewComment }),

    mkAsATask: null,
    setMKAsATask: (mkAsATask: MkAsATask | null) => set({ mkAsATask }),

    open: false,
    setOpen: (open: boolean) => set({ open }),
    selectedStatuses: {},
    setStatus: (taskId, status) =>
      set((state) => ({
        selectedStatuses: {
          ...state.selectedStatuses,
          [taskId]: status, // Update the specific task status
        },
      })),
    resetStatuses: () => set({ selectedStatuses: {} }), // Reset to initial state

    openReportModal: false,
    setOpenReportModal: (openReportModal: boolean) => set({ openReportModal }),
    isEditing: false,
    setEditing: (isEditing: boolean) => set({ isEditing }),
    activeTab: 1,
    setActiveTab: (activeTab: number) => set({ activeTab }),

    selectedPlanId: '',
    setSelectedPlanId: (selectedPlanId: string) => set({ selectedPlanId }),

    selectedReportId: '',
    setSelectedReportId: (selectedReportId: string) =>
      set({ selectedReportId }),

    activePlanPeriod: 1,
    setActivePlanPeriod: (activePlanPeriod: number) =>
      set({ activePlanPeriod }),

    activePlanPeriodId: '',
    setActivePlanPeriodId: (activePlanPeriodId: string) =>
      set({ activePlanPeriodId }),

    selectedUser: [],
    setSelectedUser: (selectedUser: string[]) => set({ selectedUser }),
    planningDefaultFilterApplied: false,
    setPlanningDefaultFilterApplied: (planningDefaultFilterApplied: boolean) =>
      set({ planningDefaultFilterApplied }),
    weights: {},
    totalWeight: 0,

    page: 1, // Map task IDs to their statuses
    setPage: (page: number) => set({ page }), // Function to update status
    pageSize: 10,
    setPageSize: (value: number) => set({ pageSize: value }),

    pageReporting: 1, // Map task IDs to their statuses
    setPageReporting: (pageReporting: number) => set({ pageReporting }), // Function to update status
    pageSizeReporting: 10,
    setPageSizeReporting: (value: number) => set({ pageSizeReporting: value }),

    setWeight: (key, weight) =>
      set((state) => {
        const updatedWeights = { ...state.weights, [key]: Number(weight) || 0 };
        const newTotal = Object.values(updatedWeights).reduce(
          (acc, val) => acc + Number(val || 0),
          0,
        );
        return { weights: updatedWeights, totalWeight: newTotal };
      }),

    removeWeight: (key) =>
      set((state) => {
        /* eslint-disable-next-line @typescript-eslint/naming-convention */
        /*eslint-disable @typescript-eslint/no-unused-vars */
        const { [key]: index, ...remainingWeights } = state.weights;
        /*eslint-enable @typescript-eslint/no-unused-vars */
        /* eslint-ensable-next-line @typescript-eslint/naming-convention */

        const newTotal = Object.values(remainingWeights).reduce(
          (acc, val) => Number(acc) + Number(val || 0),
          0,
        );
        return { weights: remainingWeights, totalWeight: newTotal };
      }),

    resetWeights: () => set({ weights: {}, totalWeight: 0 }),

    // Fiscal year and session filters
    selectedFiscalYearId: null,
    setSelectedFiscalYearId: (selectedFiscalYearId: string | null) =>
      set({ selectedFiscalYearId }),

    selectedSessionIds: [],
    setSelectedSessionIds: (selectedSessionIds: string[]) =>
      set({ selectedSessionIds }),

    allSessionsOfYear: [],
    setAllSessionsOfYear: (allSessionsOfYear: string[]) =>
      set({ allSessionsOfYear }),

    planningFilterDepartment: undefined,
    setPlanningFilterDepartment: (
      planningFilterDepartment: string | undefined,
    ) => set({ planningFilterDepartment }),

    planningFilterPlanType: 'myPlan',
    setPlanningFilterPlanType: (planningFilterPlanType: string) =>
      set({ planningFilterPlanType }),

    planningFilterEmployee: 'all',
    setPlanningFilterEmployee: (planningFilterEmployee: string) =>
      set({ planningFilterEmployee }),

    inlinePlanningMode: false,
    setInlinePlanningMode: (inlinePlanningMode: boolean) =>
      set({ inlinePlanningMode }),

    mobilePlanComposerOpen: false,
    setMobilePlanComposerOpen: (mobilePlanComposerOpen: boolean) =>
      set({ mobilePlanComposerOpen }),

    inlineReportPlanId: null,
    setInlineReportPlanId: (inlineReportPlanId: string | null) =>
      set({ inlineReportPlanId }),

    inlineEditPlanId: null,
    setInlineEditPlanId: (inlineEditPlanId: string | null) =>
      set({ inlineEditPlanId }),
  })),
);
