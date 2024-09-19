import { create, StateCreator } from 'zustand';
import { CourseCategory } from '@/types/tna/course';

type TnaManagementState = {
  isShowCourseSidebar: boolean;
  courseCategory: CourseCategory[];
  courseId: string | null;
};

type TnaManagementAction = {
  setIsShowCourseSidebar: (isShowCourseSidebar: boolean) => void;
  setCourseCategory: (courseCategory: CourseCategory[]) => void;
  setCourseId: (courseId: string | null) => void;
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
});

export const useTnaManagementStore = create<
  TnaManagementState & TnaManagementAction
>(tnaManagementSlice);
