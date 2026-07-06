import { create } from 'zustand';
import type { VpScoringFailedAssignment } from '@/store/server/features/okrplanning/okr/criteria/mutation';

interface CriteriaManagementState {
  weights: Record<string, string>;
  selectedCriteria: { name: string; vpCriteriaId: string }[];
  selectedDepartment: string[];
  filteredUsers: any[];
  userTypeFilter: 'all' | 'team leads' | 'team members';
  failedAssignments: VpScoringFailedAssignment[];
  isFailedAssignmentModalVisible: boolean;
  setUserTypeFilter: (filter: 'all' | 'team leads' | 'team members') => void;
  setWeights: (weights: Record<string, string>) => void;
  setSelectedCriteria: (
    criteria: { name: string; vpCriteriaId: string }[],
  ) => void;
  setSelectedDepartment: (department: string[]) => void;
  setFilteredUsers: (users: any[]) => void;
  showFailedAssignments: (failed: VpScoringFailedAssignment[]) => void;
  closeFailedAssignmentModal: () => void;
}

const useCriteriaManagementStore = create<CriteriaManagementState>((set) => ({
  weights: {},
  selectedCriteria: [],
  selectedDepartment: [],
  filteredUsers: [],
  userTypeFilter: 'all',
  failedAssignments: [],
  isFailedAssignmentModalVisible: false,
  setUserTypeFilter: (filter) => set({ userTypeFilter: filter }),
  setWeights: (weights) => set({ weights }),
  setSelectedCriteria: (criteria) => set({ selectedCriteria: criteria }),
  setSelectedDepartment: (department) =>
    set({ selectedDepartment: department }),
  setFilteredUsers: (users) => set({ filteredUsers: users }),
  showFailedAssignments: (failed) =>
    set({
      failedAssignments: failed,
      isFailedAssignmentModalVisible: failed.length > 0,
    }),
  closeFailedAssignmentModal: () =>
    set({ failedAssignments: [], isFailedAssignmentModalVisible: false }),
}));

export default useCriteriaManagementStore;
