import { create } from 'zustand';

interface CriteriaManagementState {
  weights: Record<string, string>;
  selectedCriteria: { name: string; vpCriteriaId: string }[];
  selectedDepartment: string | null;
  filteredUsers: any[];
  setWeights: (weights: Record<string, string>) => void;
  setSelectedCriteria: (
    criteria: { name: string; vpCriteriaId: string }[],
  ) => void;
  setSelectedDepartment: (department: string | null) => void;
  setFilteredUsers: (users: any[]) => void;
}

const useCriteriaManagementStore = create<CriteriaManagementState>((set) => ({
  weights: {},
  selectedCriteria: [],
  selectedDepartment: null,
  filteredUsers: [],
  setWeights: (weights) => set({ weights }),
  setSelectedCriteria: (criteria) => set({ selectedCriteria: criteria }),
  setSelectedDepartment: (department) =>
    set({ selectedDepartment: department }),
  setFilteredUsers: (users) => set({ filteredUsers: users }),
}));

export default useCriteriaManagementStore;
