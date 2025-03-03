import { create } from 'zustand';

interface DepartmentState {
  rootDeptId: string | null;
  childDeptId: string | null;
  mergedDeptName: string;
  teamLeader: string | null;
  setRootDeptId: (id: string | null) => void;
  setChildDeptId: (id: string | null) => void;
  setMergedDeptName: (name: string) => void;
  setTeamLeader: (leader: string | null) => void;
}

const useDepartmentStore = create<DepartmentState>((set) => ({
  rootDeptId: null,
  childDeptId: null,
  mergedDeptName: '',
  teamLeader: null,
  setRootDeptId: (id) => set({ rootDeptId: id }),
  setChildDeptId: (id) => set({ childDeptId: id }),
  setMergedDeptName: (name) => set({ mergedDeptName: name }),
  setTeamLeader: (leader) => set({ teamLeader: leader }),
}));

export default useDepartmentStore;
