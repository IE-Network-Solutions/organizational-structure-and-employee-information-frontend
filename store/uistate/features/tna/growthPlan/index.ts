import { create } from 'zustand';

export interface WizardGoalDraft {
  key: string;
  skillId?: string | null;
  skillName: string;
  isCustom: boolean;
  measurableOutcome: string;
  targetDeadline: string | null;
  quarterId: string | null;
  quarterLabel?: string;
}

interface GrowthPlanUiState {
  isWizardOpen: boolean;
  setIsWizardOpen: (open: boolean) => void;
  wizardStep: number;
  setWizardStep: (step: number) => void;
  categoryId: string | null;
  setCategoryId: (id: string | null) => void;
  shortlistSkillIds: string[];
  setShortlistSkillIds: (ids: string[]) => void;
  goals: WizardGoalDraft[];
  setGoals: (goals: WizardGoalDraft[]) => void;
  editingPlanId: string | null;
  setEditingPlanId: (id: string | null) => void;
  resetWizard: () => void;
}

const initialWizard = {
  wizardStep: 0,
  categoryId: null as string | null,
  shortlistSkillIds: [] as string[],
  goals: [] as WizardGoalDraft[],
  editingPlanId: null as string | null,
};

export const useGrowthPlanStore = create<GrowthPlanUiState>((set) => ({
  isWizardOpen: false,
  setIsWizardOpen: (isWizardOpen) => set({ isWizardOpen }),
  ...initialWizard,
  setWizardStep: (wizardStep) => set({ wizardStep }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setShortlistSkillIds: (shortlistSkillIds) => set({ shortlistSkillIds }),
  setGoals: (goals) => set({ goals }),
  setEditingPlanId: (editingPlanId) => set({ editingPlanId }),
  resetWizard: () => set({ ...initialWizard, isWizardOpen: false }),
}));
