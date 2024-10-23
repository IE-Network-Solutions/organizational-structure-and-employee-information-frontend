import { create } from 'zustand';

interface EmployeType {
  id: string;
  name: string;
  description: string;
}

export interface EmployeTypeUseState {
  isOpen: boolean;
  newEmployeType: EmployeType;
  setOpen: (isOpen: boolean) => void;
  setNewEmployeType: (employeType: EmployeType) => void;
  resetEmployeType: () => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  page: number;
  setPage: (page: number) => void;
}

export const EmployeTypeManagementStore = create<EmployeTypeUseState>(
  (set) => ({
    isOpen: false,
    newEmployeType: {
      id: '',
      name: '',
      description: '',
    },
    pageSize: 5,
    setPageSize: (pageSize: number) => set({ pageSize }),
    page: 1,
    setPage: (page: number) => set({ page }),
    setOpen: (isOpen: boolean) => set({ isOpen }),
    setNewEmployeType: (employeType: EmployeType) =>
      set({ newEmployeType: employeType }),
    resetEmployeType: () =>
      set({
        newEmployeType: {
          id: '',
          name: '',
          description: '',
        },
      }),
  }),
);
