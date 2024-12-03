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

interface TransferDepartment {
  id: string;
  name: string;
  description?: string;
  branchId: string;
  departmentToDelete: string[];
  department: ChildDepartment[];
}

interface TransferStore {
  rootDepartment: RootDepartment | undefined;
  setRootDepartment: (department: RootDepartment) => void;
  childDepartment: ChildDepartment[];
  setChildDepartment: (departments: ChildDepartment[]) => void;

  transferDepartment: TransferDepartment | undefined;
  setTransferDepartment: (department: TransferDepartment) => void;
  resetStore: () => void;
}

export const useTransferStore = create<TransferStore>((set) => ({
  rootDepartment: undefined,
  setRootDepartment: (department) => set({ rootDepartment: department }),

  childDepartment: [],
  setChildDepartment: (departments) => set({ childDepartment: departments }),

  transferDepartment: undefined,
  setTransferDepartment: (department) =>
    set({ transferDepartment: department }),
  resetStore: () =>
    set({
      rootDepartment: undefined,
      childDepartment: [],
      transferDepartment: undefined,
    }),
}));
