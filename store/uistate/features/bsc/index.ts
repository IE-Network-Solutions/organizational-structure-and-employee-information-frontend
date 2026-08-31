import { create } from 'zustand';
import { EvaluationCycle, KpiLibraryItem } from '@/types/bsc';
import type { Month } from '@/store/server/features/organizationStructure/fiscalYear/interface';

export interface BscRoleContext {
  positionId: string | null;
  positionTitle: string;
  evaluationConfigId: string;
  departmentName?: string | null;
}

interface BscUiState {
  setupModalOpen: boolean;
  editingConfig: EvaluationCycle | null;
  selectedConfigId: string | null;
  roleContext: BscRoleContext | null;
  openDeleteModal: boolean;
  deletedId: string;
  roleSearch: string;
  roleDepartmentFilter: string | undefined;
  kpiSearch: string;
  kpiModalOpen: boolean;
  editingKpi: KpiLibraryItem | null;
  assignModalOpen: boolean;
  myScorecardSessionId: string | undefined;
  myScorecardMonthId: string | undefined;
  myScorecardSessionMonths: Month[];
  myKpiPeriodView: 'month' | 'quarter';
  setSetupModalOpen: (v: boolean) => void;
  setEditingConfig: (v: EvaluationCycle | null) => void;
  openCreateSetup: () => void;
  openEditSetup: (config: EvaluationCycle) => void;
  closeSetupModal: () => void;
  setSelectedConfigId: (v: string | null) => void;
  setRoleContext: (v: BscRoleContext | null) => void;
  setOpenDeleteModal: (v: boolean) => void;
  setDeletedId: (v: string) => void;
  setRoleSearch: (v: string) => void;
  setRoleDepartmentFilter: (v: string | undefined) => void;
  setKpiSearch: (v: string) => void;
  openKpiModal: (kpi?: KpiLibraryItem | null) => void;
  closeKpiModal: () => void;
  setAssignModalOpen: (v: boolean) => void;
  setMyScorecardSessionId: (v: string | undefined) => void;
  setMyScorecardMonthId: (v: string | undefined) => void;
  setMyScorecardSessionMonths: (v: Month[]) => void;
  setMyKpiPeriodView: (v: 'month' | 'quarter') => void;
}

export const useBscUiStore = create<BscUiState>((set) => ({
  setupModalOpen: false,
  editingConfig: null,
  selectedConfigId: null,
  roleContext: null,
  openDeleteModal: false,
  deletedId: '',
  roleSearch: '',
  roleDepartmentFilter: undefined,
  kpiSearch: '',
  kpiModalOpen: false,
  editingKpi: null,
  assignModalOpen: false,
  myScorecardSessionId: undefined,
  myScorecardMonthId: undefined,
  myScorecardSessionMonths: [],
  myKpiPeriodView: 'month',
  setSetupModalOpen: (setupModalOpen) => set({ setupModalOpen }),
  setEditingConfig: (editingConfig) => set({ editingConfig }),
  openCreateSetup: () =>
    set({ setupModalOpen: true, editingConfig: null }),
  openEditSetup: (editingConfig) =>
    set({ setupModalOpen: true, editingConfig }),
  closeSetupModal: () =>
    set({ setupModalOpen: false, editingConfig: null }),
  setSelectedConfigId: (selectedConfigId) => set({ selectedConfigId }),
  setRoleContext: (roleContext) => set({ roleContext }),
  setOpenDeleteModal: (openDeleteModal) => set({ openDeleteModal }),
  setDeletedId: (deletedId) => set({ deletedId }),
  setRoleSearch: (roleSearch) => set({ roleSearch }),
  setRoleDepartmentFilter: (roleDepartmentFilter) =>
    set({ roleDepartmentFilter }),
  setKpiSearch: (kpiSearch) => set({ kpiSearch }),
  openKpiModal: (kpi = null) =>
    set({ kpiModalOpen: true, editingKpi: kpi || null }),
  closeKpiModal: () => set({ kpiModalOpen: false, editingKpi: null }),
  setAssignModalOpen: (assignModalOpen) => set({ assignModalOpen }),
  setMyScorecardSessionId: (myScorecardSessionId) =>
    set({ myScorecardSessionId }),
  setMyScorecardMonthId: (myScorecardMonthId) => set({ myScorecardMonthId }),
  setMyScorecardSessionMonths: (myScorecardSessionMonths) =>
    set({ myScorecardSessionMonths }),
  setMyKpiPeriodView: (myKpiPeriodView) => set({ myKpiPeriodView }),
}));
