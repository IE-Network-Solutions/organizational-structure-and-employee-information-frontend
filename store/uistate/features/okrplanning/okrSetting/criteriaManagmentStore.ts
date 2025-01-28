import { create } from 'zustand';

interface CriteriaManagementState {
  weights: Record<string, string>;
  selectedCriteria: { name: string; vpCriteriaId: string }[];
  selectedDepartment: string[];
  filteredUsers: any[];
  userTypeFilter: 'all' | 'team leads' | 'team members';
  setUserTypeFilter: (filter: 'all' | 'team leads' | 'team members') => void;
  setWeights: (weights: Record<string, string>) => void;
  setSelectedCriteria: (
    criteria: { name: string; vpCriteriaId: string }[],
  ) => void;
  setSelectedDepartment: (department: string[]) => void;
  setFilteredUsers: (users: any[]) => void;
}

const useCriteriaManagementStore = create<CriteriaManagementState>((set) => ({
  weights: {},
  selectedCriteria: [],
  selectedDepartment: [],
  filteredUsers: [],
  userTypeFilter: 'all',
  setUserTypeFilter: (filter) => set({ userTypeFilter: filter }),
  setWeights: (weights) => set({ weights }),
  setSelectedCriteria: (criteria) => set({ selectedCriteria: criteria }),
  setSelectedDepartment: (department) => set({ selectedDepartment: department }),
  setFilteredUsers: (users) => set({ filteredUsers: users }),
}));

export default useCriteriaManagementStore;
