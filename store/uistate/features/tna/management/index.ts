import { create, StateCreator } from 'zustand';
import { CourseCategory } from '@/types/tna/course';

type TnaManagementState = {
  isShowCourseSidebar: boolean;
  courseCategory: CourseCategory[];
  courseId: string | null;
  // Course sidebar form states
  isDraft: boolean;
  selectedDepartmentIds: string[];
  selectedUserIds: string[];
  departmentUsersMap: Record<string, any[]>;
  isUsersLoading: boolean;
};

type TnaManagementAction = {
  setIsShowCourseSidebar: (isShowCourseSidebar: boolean) => void;
  setCourseCategory: (courseCategory: CourseCategory[]) => void;
  setCourseId: (courseId: string | null) => void;
  // Course sidebar form actions
  setIsDraft: (isDraft: boolean) => void;
  setSelectedDepartmentIds: (selectedDepartmentIds: string[]) => void;
  setSelectedUserIds: (selectedUserIds: string[]) => void;
  setDepartmentUsersMap: (departmentUsersMap: Record<string, any[]>) => void;
  setIsUsersLoading: (isUsersLoading: boolean) => void;
  // Reset sidebar form state
  resetCourseSidebarForm: () => void;
};

const tnaManagementSlice: StateCreator<
  TnaManagementState & TnaManagementAction
> = (set) => ({
  isShowCourseSidebar: false,
  setIsShowCourseSidebar: (isShowCourseSidebar: boolean) => {
    set({ isShowCourseSidebar });
  },

  courseCategory: [],
  setCourseCategory: (courseCategory: CourseCategory[]) => {
    set({ courseCategory });
  },

  courseId: null,
  setCourseId: (courseId: string | null) => {
    set({ courseId });
  },

  // Course sidebar form states
  isDraft: false,
  setIsDraft: (isDraft: boolean) => {
    set({ isDraft });
  },

  selectedDepartmentIds: [],
  setSelectedDepartmentIds: (selectedDepartmentIds: string[]) => {
    set({ selectedDepartmentIds });
  },

  selectedUserIds: [],
  setSelectedUserIds: (selectedUserIds: string[]) => {
    set({ selectedUserIds });
  },

  departmentUsersMap: {},
  setDepartmentUsersMap: (departmentUsersMap: Record<string, any[]>) => {
    set({ departmentUsersMap });
  },

  isUsersLoading: false,
  setIsUsersLoading: (isUsersLoading: boolean) => {
    set({ isUsersLoading });
  },

  // Reset all sidebar form states
  resetCourseSidebarForm: () => {
    set({
      isDraft: false,
      selectedDepartmentIds: [],
      selectedUserIds: [],
      departmentUsersMap: {},
      isUsersLoading: false,
    });
  },
});

export const useTnaManagementStore = create<
  TnaManagementState & TnaManagementAction
>(tnaManagementSlice);
