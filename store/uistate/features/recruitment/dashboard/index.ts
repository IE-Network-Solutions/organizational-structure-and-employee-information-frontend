import { create } from 'zustand';

export interface RecruitmentDashboardState {
  search: string;
  setSearch: (search: string) => void;
  departmentId: string;
  setDepartmentId: (departmentId: string) => void;
  stageId: string;
  setStageId: (stageId: string) => void;
  jobId: string;
  setJobId: (jobId: string) => void;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  jobPostPage: number;
  setJobPostPage: (jobPostPage: number) => void;
  jobPostLimit: number;
  setJobPostLimit: (jobPostLimit: number) => void;
  jobPostDepartmentId: string;
  setJobPostDepartmentId: (jobPostDepartmentId: string) => void;
  jobPostStageId: string;
  setJobPostStageId: (jobPostStageId: string) => void;
  jobPostJobId: string;
  setJobPostJobId: (jobPostJobId: string) => void;
  jobPostSearch: string;
  setJobPostSearch: (jobPostSearch: string) => void;
  jobPostStartDate: string;
  setJobPostStartDate: (jobPostStartDate: string) => void;
  jobPostEndDate: string;
  setJobPostEndDate: (jobPostEndDate: string) => void;
}

export const useRecruitmentDashboardStore = create<RecruitmentDashboardState>(
  (set) => ({
    search: '',
    setSearch: (search: string) => set({ search }),
    departmentId: '',
    setDepartmentId: (departmentId: string) => set({ departmentId }),
    stageId: '',
    setStageId: (stageId: string) => set({ stageId }),
    jobId: '',
    setJobId: (jobId: string) => set({ jobId }),
    page: 1,
    setPage: (page: number) => set({ page }),
    limit: 5,
    setLimit: (limit: number) => set({ limit }),
    jobPostPage: 1,
    setJobPostPage: (jobPostPage: number) => set({ jobPostPage }),
    jobPostLimit: 5,
    setJobPostLimit: (jobPostLimit: number) => set({ jobPostLimit }),
    jobPostDepartmentId: '',
    setJobPostDepartmentId: (jobPostDepartmentId: string) =>
      set({ jobPostDepartmentId }),
    jobPostStageId: '',
    setJobPostStageId: (jobPostStageId: string) => set({ jobPostStageId }),
    jobPostJobId: '',
    setJobPostJobId: (jobPostJobId: string) => set({ jobPostJobId }),
    jobPostSearch: '',
    setJobPostSearch: (jobPostSearch: string) => set({ jobPostSearch }),
    jobPostStartDate: '',
    setJobPostStartDate: (jobPostStartDate: string) =>
      set({ jobPostStartDate }),
    jobPostEndDate: '',
    setJobPostEndDate: (jobPostEndDate: string) => set({ jobPostEndDate }),
  }),
);
