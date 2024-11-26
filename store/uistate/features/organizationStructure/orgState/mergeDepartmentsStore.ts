import create from 'zustand';
interface RootDepartment {
  id: string;
  name: string;
  branchId: string;
  description?: string;
}

interface ChildDepartment {
  id: string;
  name: string;
  branchId: string;
  description?: string;
}

interface MergeDepartment {
  id: string;
  name: string;
  description?: string;
  branchId: string;
  departmentToDelete: string[];
  department: ChildDepartment[];
}

interface MergeStore {
  rootDepartment: RootDepartment | undefined;
  setRootDepartment: (department: RootDepartment) => void;
  childDepartment: ChildDepartment[];
  setChildDepartment: (departments: ChildDepartment[]) => void;

  mergeDepartment: MergeDepartment | undefined;
  setMergeDepartment: (department: MergeDepartment) => void;
  resetStore: () => void;
}

export const useMergeStore = create<MergeStore>((set) => ({
  rootDepartment: undefined,
  setRootDepartment: (department) => set({ rootDepartment: department }),

  childDepartment: [],
  setChildDepartment: (departments) => set({ childDepartment: departments }),

  mergeDepartment: undefined,
  setMergeDepartment: (department) => set({ mergeDepartment: department }),
  resetStore: () =>
    set({
      rootDepartment: undefined,
      childDepartment: [],
      mergeDepartment: undefined,
    }),
}));
