import { create } from 'zustand';

export interface Criteria {
  id: string;
  responsibility: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

interface CriticalPositionState {
  name: string;
  description: string;
  jobTitleId: string;
  criticalPositionId: string;
  requiredSkills: string[];
  requiredExperience: number;
  responsibilities: string[];
  criterias: Criteria[];
  current: number;
  open: boolean;
  showDetails: boolean;
  showDelete: boolean;

  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setJobTitleId: (jobTitleId: string) => void;
  setRequiredSkills: (skills: string[]) => void;
  setRequiredExperience: (experience: number) => void;
  addResponsibility: (responsibility: string) => void;
  removeResponsibility: (responsibility: string) => void;
  addCriteria: (criteria: Criteria) => void;
  removeCriteria: (id: string) => void;
  resetCriticalPositionData: () => void;
  setCurrent: (current: number) => void;
  setOpen: (open: boolean) => void;
  setShowDetails: (showDetails: boolean) => void;
  setShowDelete: (showDelete: boolean) => void;
  setCriticalPositionId: (criticalPositionId: string) => void;
  setCriterias: (criterias: Criteria[]) => void;
}

export const useCriticalPositionStore = create<CriticalPositionState>(
  (set) => ({
    name: '',
    description: '',
    criticalPositionId: '',
    jobTitleId: '',
    requiredSkills: [],
    requiredExperience: 0,
    responsibilities: [],
    criterias: [],
    current: 0,
    open: false,
    showDetails: false,
    showDelete: false,

    setName: (name: string) => set({ name }),
    setDescription: (description: string) => set({ description }),
    setJobTitleId: (jobTitleId: string) => set({ jobTitleId }),
    setRequiredSkills: (skills: string[]) => set({ requiredSkills: skills }),
    setRequiredExperience: (experience: number) =>
      set({ requiredExperience: experience }),

    addResponsibility: (responsibility: string) =>
      set((state) => ({
        responsibilities: [...state.responsibilities, responsibility],
      })),

    removeResponsibility: (responsibility: string) =>
      set((state) => ({
        responsibilities: state.responsibilities.filter(
          (r) => r !== responsibility,
        ),
      })),

    addCriteria: (criteria: Criteria) =>
      set((state) => ({
        criterias: [...state.criterias, criteria],
      })),

    removeCriteria: (id: string) =>
      set((state) => ({
        criterias: state.criterias.filter((criteria) => criteria.id !== id),
      })),

    setCurrent: (current: number) => set({ current }),

    setOpen: (open: boolean) => set({ open }),

    setShowDetails: (showDetails: boolean) => set({ showDetails }),

    setShowDelete: (showDelete: boolean) => set({ showDelete }),

    setCriticalPositionId: (criticalPositionId: string) =>
      set({ criticalPositionId }),

    setCriterias: (criterias: Criteria[]) => set({ criterias }),

    resetCriticalPositionData: () =>
      set(() => ({
        name: '',
        description: '',
        jobTitleId: '',
        requiredSkills: [],
        requiredExperience: 0,
        responsibilities: [],
        criterias: [],
        current: 0,
        open: false,
        showDetails: false,
        showDelete: false,
      })),
  }),
);

interface SuccessionPlanState {
  successor: string;
  open: boolean;

  setSuccessorId: (successor: string) => void;
  setOpen: (successionOpen: boolean) => void;
}

export const useSuccessionPlanStore = create<SuccessionPlanState>((set) => ({
  successor: '',
  open: false,

  setOpen: (open: boolean) => set({ open }),
  setSuccessorId: (successor: string) => set({ successor }),
}));

interface SuccessionEvaluationState {
  open: boolean;

  setOpen: (successionOpen: boolean) => void;
}

export const useSuccessionEvaluationStore = create<SuccessionEvaluationState>(
  (set) => ({
    open: false,

    setOpen: (open: boolean) => set({ open }),
  }),
);
