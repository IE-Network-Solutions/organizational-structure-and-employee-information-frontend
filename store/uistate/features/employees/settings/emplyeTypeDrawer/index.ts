import { create } from 'zustand';
import type { EmploymentTypeInfo } from '@/store/server/features/employees/employeeManagment/employmentType/interface';

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
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
  editingEmploymentType: EmploymentTypeInfo | null;
  setEditingEmploymentType: (
    editingEmploymentType: EmploymentTypeInfo | null,
  ) => void;
}

export const EmployeTypeManagementStore = create<EmployeTypeUseState>(
  (set) => ({
    isOpen: false,
    newEmployeType: {
      id: '',
      name: '',
      description: '',
    },
    pageSize: 6,
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
    isEditMode: false,
    setIsEditMode: (isEditMode: boolean) => set({ isEditMode }),
    editingEmploymentType: null,
    setEditingEmploymentType: (
      editingEmploymentType: EmploymentTypeInfo | null,
    ) => set({ editingEmploymentType }),
  }),
);
