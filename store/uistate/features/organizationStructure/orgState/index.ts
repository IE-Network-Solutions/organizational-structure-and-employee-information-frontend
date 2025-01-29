import create from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  Department,
  OrgData,
  OrganizationState,
} from '@/types/dashboard/organization';

const useOrganizationStore = create<OrganizationState>((set) => ({
  orgData: {
    id: uuidv4(),
    name: 'CEO',
    description: 'CEO of the company',
    branchId: null,
    department: [],
  },
  departmentTobeDeletedId: '',
  departmentTobeShiftedId: '',
  setOrgData: (data: OrgData) => set({ orgData: data }),
  setBranchId: (branchId: string) =>
    set((state) => ({
      orgData: {
        ...state.orgData,
        branchId,
      },
    })),
  addDepartment: (parentId: string, department: Omit<Department, 'id'>) =>
    set((state) => {
      const newDepartment = { ...department, id: uuidv4() };
      const addDeptRecursively = (depts: Department[]): Department[] => {
        return depts.map((dept) => {
          if (dept.id === parentId) {
            return {
              ...dept,
              department: [...(dept.department || []), newDepartment],
            };
          }
          return {
            ...dept,
            department: addDeptRecursively(dept.department || []),
          };
        });
      };

      if (parentId === 'root') {
        return {
          orgData: {
            ...state.orgData,
            department: [...state.orgData.department, newDepartment],
          },
        };
      }

      return {
        orgData: {
          ...state.orgData,
          department: addDeptRecursively(state.orgData.department),
        },
      };
    }),

  updateDepartment: (updatedDepartment: Department) =>
    set((state) => {
      const updateDeptRecursively = (depts: Department[]): Department[] =>
        depts?.map((dept) => {
          if (dept.id === updatedDepartment.id) {
            return { ...dept, ...updatedDepartment };
          }
          return {
            ...dept,
            department: updateDeptRecursively(dept.department),
          };
        });
      return {
        orgData: {
          ...state.orgData,
          department: updateDeptRecursively(state.orgData.department),
        },
      };
    }),
  deleteDepartment: (departmentId: string) =>
    set((state) => {
      const deleteDeptRecursively = (depts: Department[]): Department[] =>
        depts
          .filter((dept) => dept.id !== departmentId)
          ?.map((dept) => ({
            ...dept,
            department: deleteDeptRecursively(dept.department),
          }));
      return {
        orgData: {
          ...state.orgData,
          department: deleteDeptRecursively(state.orgData.department),
        },
      };
    }),
  isFormVisible: false,
  setIsFormVisible: (visible: boolean) => set({ isFormVisible: visible }),
  selectedDepartment: null,
  setSelectedDepartment: (department: Department | null) =>
    set({ selectedDepartment: department }),
  parentId: null,
  setParentId: (id: string | null) => set({ parentId: id }),
  isDeleteConfirmVisible: false,
  setIsDeleteConfirmVisible: (visible: boolean) =>
    set({ isDeleteConfirmVisible: visible }),

  chartDownlaodLoading: false,
  setChartDonwnloadLoading: (chartDownlaodLoading: boolean) =>
    set({ chartDownlaodLoading }),

  drawerVisible: false,
  drawerContent: '',
  footerButtonText: '',
  drawTitle: '',

  setDrawerVisible: (visible: boolean) => set({ drawerVisible: visible }),
  setDrawerContent: (content: string) => set({ drawerContent: content }),
  setFooterButtonText: (text: string) => set({ footerButtonText: text }),
  setDrawTitle: (title: string) => set({ drawTitle: title }),
  setDepartmentTobeDeletedId: (departmentTobeDeletedId: string) =>
    set({ departmentTobeDeletedId }),
  setShiftDepartmentId: (departmentTobeShiftedId: string) =>
    set({ departmentTobeShiftedId }),
}));

export default useOrganizationStore;
