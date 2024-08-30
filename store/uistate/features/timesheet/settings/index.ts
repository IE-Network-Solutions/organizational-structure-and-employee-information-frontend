import { create, StateCreator } from 'zustand';

type TimesheetSettingsState = {
  isShowLocationSidebar: boolean;
  isShowRulesAddTypeSidebar: boolean;
  isShowCreateRuleSidebar: boolean;
  isShowNewAccrualRuleSidebar: boolean;
  isShowCarryOverRuleSidebar: boolean;
  isShowTypeAndPoliciesSidebar: boolean;
  isShowClosedDateSidebar: boolean;
};

type TimesheetSettingsStateAction = {
  setIsShowLocationSidebar: (isShowLocationSidebar: boolean) => void;
  setIsShowRulesAddTypeSidebar: (isShowRulesAddTypeSidebar: boolean) => void;
  setIsShowCreateRuleSidebar: (isShowCreateRuleSidebar: boolean) => void;
  setIsShowNewAccrualRuleSidebar: (
    isShowNewAccrualRuleSidebar: boolean,
  ) => void;
  setIsShowCarryOverRuleSidebar: (isShowCarryOverRuleSidebar: boolean) => void;
  setIsShowTypeAndPoliciesSidebar: (
    isShowTypeAndPoliciesSidebar: boolean,
  ) => void;
  setIsShowClosedDateSidebar: (isShowClosedDateSidebar: boolean) => void;
};

const timesheetSettingsSlice: StateCreator<
  TimesheetSettingsState & TimesheetSettingsStateAction
> = (set) => ({
  isShowLocationSidebar: false,
  setIsShowLocationSidebar: (isShowLocationSidebar: boolean) => {
    set({ isShowLocationSidebar });
  },

  isShowRulesAddTypeSidebar: false,
  setIsShowRulesAddTypeSidebar: (isShowRulesAddTypeSidebar: boolean) => {
    set({ isShowRulesAddTypeSidebar });
  },

  isShowCreateRuleSidebar: false,
  setIsShowCreateRuleSidebar: (isShowCreateRuleSidebar: boolean) => {
    set({ isShowCreateRuleSidebar });
  },

  isShowNewAccrualRuleSidebar: false,
  setIsShowNewAccrualRuleSidebar: (isShowNewAccrualRuleSidebar: boolean) => {
    set({ isShowNewAccrualRuleSidebar });
  },

  isShowCarryOverRuleSidebar: false,
  setIsShowCarryOverRuleSidebar: (isShowCarryOverRuleSidebar: boolean) => {
    set({ isShowCarryOverRuleSidebar });
  },

  isShowTypeAndPoliciesSidebar: false,
  setIsShowTypeAndPoliciesSidebar: (isShowTypeAndPoliciesSidebar: boolean) => {
    set({ isShowTypeAndPoliciesSidebar });
  },

  isShowClosedDateSidebar: false,
  setIsShowClosedDateSidebar: (isShowClosedDateSidebar: boolean) => {
    set({ isShowClosedDateSidebar });
  },
});

export const useTimesheetSettingsStore = create<
  TimesheetSettingsState & TimesheetSettingsStateAction
>(timesheetSettingsSlice);
