import { create } from 'zustand';
import {
  EvaluationCycle,
  KpiLibraryItem,
  BscPerspectiveDefinition,
} from '@/types/bsc';
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
  perspectiveModalOpen: boolean;
  editingPerspective: BscPerspectiveDefinition | null;
  perspectiveKpiModalOpen: boolean;
  perspectiveKpiContext: string | null;
  viewingPerspectiveKpis: BscPerspectiveDefinition | null;
  assignModalOpen: boolean;
  myScorecardSessionId: string | undefined;
  myScorecardMonthId: string | undefined;
  myScorecardSessionMonths: Month[];
  scorecardTab: 'mine' | 'team' | 'all' | 'kpis' | 'bsc' | 'checkin';
  bscCatalogView: 'scorecards' | 'people';
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
  openCreatePerspective: () => void;
  openEditPerspective: (item: BscPerspectiveDefinition) => void;
  closePerspectiveModal: () => void;
  openPerspectiveKpiModal: (perspectiveName: string) => void;
  closePerspectiveKpiModal: () => void;
  openViewPerspectiveKpis: (item: BscPerspectiveDefinition) => void;
  closeViewPerspectiveKpis: () => void;
  openAssignPerspectives: () => void;
  closeAssignModal: () => void;
  setAssignModalOpen: (v: boolean) => void;
  setMyScorecardSessionId: (v: string | undefined) => void;
  setMyScorecardMonthId: (v: string | undefined) => void;
  setMyScorecardSessionMonths: (v: Month[]) => void;
  setScorecardTab: (
    v: 'mine' | 'team' | 'all' | 'kpis' | 'bsc' | 'checkin',
  ) => void;
  setBscCatalogView: (v: 'scorecards' | 'people') => void;
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
  perspectiveModalOpen: false,
  editingPerspective: null,
  perspectiveKpiModalOpen: false,
  perspectiveKpiContext: null,
  viewingPerspectiveKpis: null,
  assignModalOpen: false,
  myScorecardSessionId: undefined,
  myScorecardMonthId: undefined,
  myScorecardSessionMonths: [],
  scorecardTab: 'mine',
  bscCatalogView: 'scorecards',
  setSetupModalOpen: (setupModalOpen) => set({ setupModalOpen }),
  setEditingConfig: (editingConfig) => set({ editingConfig }),
  openCreateSetup: () => set({ setupModalOpen: true, editingConfig: null }),
  openEditSetup: (editingConfig) =>
    set({ setupModalOpen: true, editingConfig }),
  closeSetupModal: () => set({ setupModalOpen: false, editingConfig: null }),
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
  openCreatePerspective: () =>
    set({ perspectiveModalOpen: true, editingPerspective: null }),
  openEditPerspective: (editingPerspective) =>
    set({ perspectiveModalOpen: true, editingPerspective }),
  closePerspectiveModal: () =>
    set({ perspectiveModalOpen: false, editingPerspective: null }),
  openPerspectiveKpiModal: (perspectiveName) =>
    set({
      perspectiveKpiModalOpen: true,
      perspectiveKpiContext: perspectiveName,
    }),
  closePerspectiveKpiModal: () =>
    set({ perspectiveKpiModalOpen: false, perspectiveKpiContext: null }),
  openViewPerspectiveKpis: (viewingPerspectiveKpis) =>
    set({ viewingPerspectiveKpis }),
  closeViewPerspectiveKpis: () => set({ viewingPerspectiveKpis: null }),
  openAssignPerspectives: () => set({ assignModalOpen: true }),
  closeAssignModal: () => set({ assignModalOpen: false }),
  setAssignModalOpen: (assignModalOpen) => set({ assignModalOpen }),
  setMyScorecardSessionId: (myScorecardSessionId) =>
    set({ myScorecardSessionId }),
  setMyScorecardMonthId: (myScorecardMonthId) => set({ myScorecardMonthId }),
  setMyScorecardSessionMonths: (myScorecardSessionMonths) =>
    set({ myScorecardSessionMonths }),
  setScorecardTab: (scorecardTab) => set({ scorecardTab }),
  setBscCatalogView: (bscCatalogView) => set({ bscCatalogView }),
}));
