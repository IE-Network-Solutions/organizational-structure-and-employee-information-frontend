import { create } from 'zustand';

interface CriticalPositionState {
  name: string;
  description: string;
  jobTitleId: string;
  requiredSkills: string[];
  requiredExperience: number;
  responsibilities: string[];
  current: number;
  open: boolean;

  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setJobTitleId: (jobTitleId: string) => void;
  setRequiredSkills: (skills: string[]) => void;
  setRequiredExperience: (experience: number) => void;
  addResponsibility: (responsibility: string) => void;
  removeResponsibility: (responsibility: string) => void;
  resetCriticalPositionData: () => void;
  setCurrent: (current: number) => void;
  setOpen: (open: boolean) => void;
}

export const useCriticalPositionStore = create<CriticalPositionState>((set) => ({
  name: '',
  description: '',
  jobTitleId: '',
  requiredSkills: [],
  requiredExperience: 0,
  responsibilities: [],
  current: 0,
  open: false,

  setName: (name: string) => set({ name }),
  setDescription: (description: string) => set({ description }),
  setJobTitleId: (jobTitleId: string) => set({ jobTitleId }),
  setRequiredSkills: (skills: string[]) => set({ requiredSkills: skills }),
  setRequiredExperience: (experience: number) => set({ requiredExperience: experience }),

  addResponsibility: (responsibility: string) => set((state) => ({
    responsibilities: [...state.responsibilities, responsibility],
  })),
  
  removeResponsibility: (responsibility: string) => set((state) => ({
    responsibilities: state.responsibilities.filter((r) => r !== responsibility),
  })),

  setCurrent: (current: number) => set({ current }),

  setOpen: (open: boolean) => set({ open }),

  resetCriticalPositionData: () =>
    set(() => ({
      name: '',
      description: '',
      jobTitleId: '',
      requiredSkills: [],
      requiredExperience: 0,
      responsibilities: [],
    })),
}));