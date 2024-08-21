import { create } from 'zustand';

interface OffboardingState {
  isModalVisible: boolean;
  isTerminationModalVisible: boolean;
  newOption: string;
  newTerminationOption: string;
  customOptions: string[];
  customTerminationOptions: string[];
  employmentStatus: string | null;
  showTerminationFields: boolean;
  setIsModalVisible: (visible: boolean) => void;
  setIsTerminationModalVisible: (visible: boolean) => void;
  setNewOption: (option: string) => void;
  setNewTerminationOption: (option: string) => void;
  addCustomOption: (option: string) => void;
  addCustomTerminationOption: (option: string) => void;
  setEmploymentStatus: (status: string) => void;
  setShowTerminationFields: (show: boolean) => void;
}

export const useOffboardingStore = create<OffboardingState>((set) => ({
  isModalVisible: false,
  isTerminationModalVisible: false,
  newOption: '',
  newTerminationOption: '',
  customOptions: [],
  customTerminationOptions: [],
  employmentStatus: null,
  showTerminationFields: false,
  setIsModalVisible: (visible) => set({ isModalVisible: visible }),
  setIsTerminationModalVisible: (visible) =>
    set({ isTerminationModalVisible: visible }),
  setNewOption: (option) => set({ newOption: option }),
  setNewTerminationOption: (option) => set({ newTerminationOption: option }),
  addCustomOption: (option) =>
    set((state) => ({
      customOptions: [...state.customOptions, option],
      newOption: '',
      isModalVisible: false,
    })),
  addCustomTerminationOption: (option) =>
    set((state) => ({
      customTerminationOptions: [...state.customTerminationOptions, option],
      newTerminationOption: '',
      isTerminationModalVisible: false,
    })),
  setEmploymentStatus: (status) => set({ employmentStatus: status }),
  setShowTerminationFields: (show) => set({ showTerminationFields: show }),
}));
