import { create, StateCreator } from 'zustand';
import { CourseCategory } from '@/types/tna/course';

type TnaManagementState = {
  isShowCourseSidebar: boolean;
  courseCategory: CourseCategory[];
};

type TnaManagementAction = {
  setIsShowCourseSidebar: (isShowCourseSidebar: boolean) => void;
  setCourseCategory: (courseCategory: CourseCategory[]) => void;
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
});

export const useTnaManagementStore = create<
  TnaManagementState & TnaManagementAction
>(tnaManagementSlice);
