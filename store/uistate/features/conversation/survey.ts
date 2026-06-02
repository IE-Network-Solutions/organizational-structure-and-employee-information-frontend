import { create } from 'zustand';
interface SurveyObject {
  userId: string;
  score: string;
  monthId: string;
  id: string;
}
interface SearchUserParams {
  user_name: string;
}
interface User {
  userId: string;
}
interface SearchParams {
  category_name: string;
  category_description: string;
  createdBy: string;
}
export type AssignSurveyModalInitialValues = {
  assignmentId?: string;
  departmentIds?: string[];
  userIds?: string[];
  surveyId?: string;
};

export interface EmployeeSurveyState {
  targetAchievementViewMode: 'surveyAssignment' | 'targetAssignment';
  setTargetAchievementViewMode: (
    targetAchievementViewMode: 'surveyAssignment' | 'targetAssignment',
  ) => void;
  toggleTargetAchievementViewMode: () => void;
  openEmployeeSurvey: boolean;
  setOpenEmployeeSurvey: (openEmployeeSurvey: boolean) => void;
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  userId: string | null;
  setUserId: (userId: string) => void;
  departmentId: string | null;
  setDepartmentId: (departmentId: string) => void;
  monthId: string | null;
  setMonthId: (monthId: string) => void;
  surveyId: string | null;
  setSurveyId: (surveyId: string | null) => void;
  employeeSurveyFilterPopoverOpen: boolean;
  setEmployeeSurveyFilterPopoverOpen: (open: boolean) => void;
  filterDraftDepartmentId: string | null;
  setFilterDraftDepartmentId: (id: string | null) => void;
  filterDraftMonthId: string | null;
  setFilterDraftMonthId: (id: string | null) => void;
  filterDraftSurveyId: string | null;
  setFilterDraftSurveyId: (id: string | null) => void;
  page: number;
  setPage: (page: number) => void;
  currentPage: number;
  setCurrentPage: (currentPage: number) => void;
  survey: SurveyObject;
  setSurvey: (survey: SurveyObject) => void;
  openSurveyCategoryModal: boolean;
  setOpenSurveyCategoryModal: (openSurveyCategoryModal: boolean) => void;
  surveyCategoryEditId: string | null;
  setSurveyCategoryEditId: (surveyCategoryEditId: string | null) => void;
  searchUserParams: SearchUserParams;
  setSearchUserParams: (key: keyof SearchUserParams, value: string) => void;
  selectedUsers: User[];
  setSelectedUsers: (users: User[]) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  current: number;
  setCurrent: (current: number) => void;
  searchParams: SearchParams;
  setSearchParams: (key: keyof SearchParams, value: string | boolean) => void;
  openAssignSurveyModal: boolean;
  setOpenAssignSurveyModal: (openAssignSurveyModal: boolean) => void;
  assignSurveyModalInitialValues: AssignSurveyModalInitialValues | null;
  setAssignSurveyModalInitialValues: (
    values: AssignSurveyModalInitialValues | null,
  ) => void;
}

export const EmployeeSurveyStore = create<EmployeeSurveyState>((set) => ({
  targetAchievementViewMode: 'targetAssignment',
  setTargetAchievementViewMode: (targetAchievementViewMode) =>
    set({ targetAchievementViewMode }),
  toggleTargetAchievementViewMode: () =>
    set((state) => ({
      targetAchievementViewMode:
        state.targetAchievementViewMode === 'surveyAssignment'
          ? 'targetAssignment'
          : 'surveyAssignment',
    })),
  openAssignSurveyModal: false,
  setOpenAssignSurveyModal: (openAssignSurveyModal) =>
    set({ openAssignSurveyModal }),
  assignSurveyModalInitialValues: null,
  setAssignSurveyModalInitialValues: (assignSurveyModalInitialValues) =>
    set({ assignSurveyModalInitialValues }),
  openEmployeeSurvey: false,
  setOpenEmployeeSurvey: (openEmployeeSurvey) => set({ openEmployeeSurvey }),
  openModal: false,
  setOpenModal: (openModal) => set({ openModal }),
  userId: null,
  setUserId: (userId) => set({ userId }),
  monthId: null,
  setMonthId: (monthId) => set({ monthId }),
  surveyId: null,
  setSurveyId: (surveyId) => set({ surveyId }),
  departmentId: null,
  setDepartmentId: (departmentId) => set({ departmentId }),
  employeeSurveyFilterPopoverOpen: false,
  setEmployeeSurveyFilterPopoverOpen: (employeeSurveyFilterPopoverOpen) =>
    set({ employeeSurveyFilterPopoverOpen }),
  filterDraftDepartmentId: null,
  setFilterDraftDepartmentId: (filterDraftDepartmentId) =>
    set({ filterDraftDepartmentId }),
  filterDraftMonthId: null,
  setFilterDraftMonthId: (filterDraftMonthId) => set({ filterDraftMonthId }),
  filterDraftSurveyId: null,
  setFilterDraftSurveyId: (filterDraftSurveyId) => set({ filterDraftSurveyId }),
  page: 10,
  setPage: (page) => set({ page }),
  currentPage: 1,
  setCurrentPage: (currentPage) => set({ currentPage }),
  survey: { userId: '', score: '', monthId: '', id: '' },
  setSurvey: (survey) => set({ survey }),
  openSurveyCategoryModal: false,
  setOpenSurveyCategoryModal: (openSurveyCategoryModal) =>
    set({ openSurveyCategoryModal }),
  surveyCategoryEditId: null,
  setSurveyCategoryEditId: (surveyCategoryEditId) =>
    set({ surveyCategoryEditId }),
  searchUserParams: { user_name: '' },
  setSearchUserParams: (key: keyof SearchUserParams, value: string) =>
    set({ searchUserParams: { [key]: value } }),
  selectedUsers: [],
  setSelectedUsers: (users) => set({ selectedUsers: users }),
  pageSize: 12,
  setPageSize: (pageSize) => set({ pageSize }),
  current: 1,
  setCurrent: (current) => set({ current }),
  searchParams: {
    category_name: '',
    category_description: '',
    createdBy: '',
  },
  setSearchParams: (key, value) =>
    set((state) => ({
      searchParams: { ...state.searchParams, [key]: value },
    })),
}));
