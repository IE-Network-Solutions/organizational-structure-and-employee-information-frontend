import { create } from 'zustand';

interface CriticalPositionState {
  name: string;
  search: string;
  select: string;
  description: string;
  jobTitleId: string;
  criticalPositionId: string;
  requiredSkills: string[];
  requiredExperience: number;
  criteria: string[];
  current: number;
  open: boolean;
  showDetails: boolean;
  showDelete: boolean;

  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setJobTitleId: (jobTitleId: string) => void;
  setRequiredSkills: (skills: string[]) => void;
  setRequiredExperience: (experience: number) => void;
  addCriteria: (criteria: string) => void;
  removeCriteria: (criteria: string) => void;
  resetCriticalPositionData: () => void;
  setCurrent: (current: number) => void;
  setOpen: (open: boolean) => void;
  setShowDetails: (showDetails: boolean) => void;
  setShowDelete: (showDelete: boolean) => void;
  setCriticalPositionId: (criticalPositionId: string) => void;
  setCriteria: (criteria: string[]) => void;
  setSearch: (search: string) => void;
  setSelect: (select: string) => void;
}

export const useCriticalPositionStore = create<CriticalPositionState>(
  (set) => ({
    name: '',
    search: '',
    select: '',
    description: '',
    criticalPositionId: '',
    jobTitleId: '',
    requiredSkills: [],
    requiredExperience: 0,
    criteria: [],
    current: 0,
    open: false,
    showDetails: false,
    showDelete: false,

    setName: (name) => set({ name }),
    setDescription: (description) => set({ description }),
    setJobTitleId: (jobTitleId) => set({ jobTitleId }),
    setRequiredSkills: (skills) => set({ requiredSkills: skills }),
    setRequiredExperience: (experience) =>
      set({ requiredExperience: experience }),

    addCriteria: (criteria) =>
      set((state) => ({ criteria: [...state.criteria, criteria] })),

    removeCriteria: (criteria) =>
      set((state) => ({
        criteria: state.criteria.filter((item) => item !== criteria),
      })),

    setCurrent: (current) => set({ current }),
    setOpen: (open) => set({ open }),
    setShowDetails: (showDetails) => set({ showDetails }),
    setShowDelete: (showDelete) => set({ showDelete }),
    setCriticalPositionId: (criticalPositionId) => set({ criticalPositionId }),
    setCriteria: (criteria) => set({ criteria }),
    setSearch: (search) => set({ search }),
    setSelect: (select: string) => set({ select }),

    resetCriticalPositionData: () =>
      set({
        name: '',
        description: '',
        criticalPositionId: '',
        jobTitleId: '',
        requiredSkills: [],
        requiredExperience: 0,
        criteria: [],
        current: 0,
        open: false,
        showDetails: false,
        showDelete: false,
      }),
  }),
);

interface SuccessionPlanState {
  successor: string;
  successionPlanId: string;
  open: boolean;

  setSuccessorId: (successor: string) => void;
  setOpen: (successionOpen: boolean) => void;
  setSuccessionPlanId: (successionPlanId: string) => void;
}

export const useSuccessionPlanStore = create<SuccessionPlanState>((set) => ({
  successor: '',
  successionPlanId: '',
  open: false,

  setOpen: (open: boolean) => set({ open }),
  setSuccessorId: (successor: string) => set({ successor }),
  setSuccessionPlanId: (successionPlanId: string) => set({ successionPlanId }),
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

interface FlattenedCriticalPositionRecord {
  id: string;
  description: string;
  criteria: string[];
  name: string;
  jobTitleId: string;
  requiredSkills: string[];
  requiredExperience: number;
  userId: string;
  successorId: string | null;
  successionPlanId: string | null;
  averageScore: number | null;
  status: string | null;
  successorProfileImage: string | null;
}

interface RecordState {
  record: FlattenedCriticalPositionRecord | null;
  isEditing: boolean;
  setRecord: (record: FlattenedCriticalPositionRecord | null) => void;
  clearRecord: () => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const useCriticalPositionRecordStore = create<RecordState>((set) => ({
  record: null,
  isEditing: false,
  setRecord: (record) => set({ record }),
  clearRecord: () => set({ record: null }),
  setIsEditing: (isEditing: boolean) => set({ isEditing }),
}));
