import create from 'zustand';

interface ApprovalsSettingsStore {
  isApprovalsAddDisabled: boolean;
  setApprovalsAddDisabled: (disabled: boolean) => void;
}

const useApprovalsSettingsStore = create<ApprovalsSettingsStore>((set) => ({
  isApprovalsAddDisabled: false,
  setApprovalsAddDisabled: (disabled: boolean) =>
    set({ isApprovalsAddDisabled: disabled }),
}));

export default useApprovalsSettingsStore;

