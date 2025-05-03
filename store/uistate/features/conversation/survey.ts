import { create } from 'zustand';
interface SurveyObject {
  userId: string;
  score: string;
  monthId: string;
  id: string;
}
export interface EmployeeSurveyState {
  open: boolean;
  setOpen: (open: boolean) => void;
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  userId: string | null;
  setUserId: (userId: string) => void;
  departmentId: string | null;
  setDepartmentId: (departmentId: string) => void;
  monthId: string | null;
  setMonthId: (monthId: string) => void;
  page: number;
  setPage: (page: number) => void;
  currentPage: number;
  setCurrentPage: (currentPage: number) => void;
  survey: SurveyObject;
  setSurvey: (survey: SurveyObject) => void;
}

export const EmployeeSurveyStore = create<EmployeeSurveyState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  openModal: false,
  setOpenModal: (openModal) => set({ openModal }),
  userId: null,
  setUserId: (userId) => set({ userId }),
  monthId: null,
  setMonthId: (monthId) => set({ monthId }),
  departmentId: null,
  setDepartmentId: (departmentId) => set({ departmentId }),
  page: 10,
  setPage: (page) => set({ page }),
  currentPage: 1,
  setCurrentPage: (currentPage) => set({ currentPage }),
  survey: { userId: '', score: '', monthId: '', id: '' },
  setSurvey: (survey) => set({ survey }),
}));
