import { create, StateCreator } from 'zustand';

type TimesheetSettingsState = {
  isShowLocationSidebar: boolean;
  isShowRulesAddTypeSidebar: boolean;
  isShowCreateRuleSidebar: boolean;
  isShowNewAccrualRuleSidebar: boolean;
};

type TimesheetSettingsStateAction = {
  setIsShowLocationSidebar: (isShowLocationSidebar: boolean) => void;
  setIsShowRulesAddTypeSidebar: (isShowRulesAddTypeSidebar: boolean) => void;
  setIsShowCreateRuleSidebar: (isShowCreateRuleSidebar: boolean) => void;
  setIsShowNewAccrualRuleSidebar: (
    isShowNewAccrualRuleSidebar: boolean,
  ) => void;
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
});

export const useTimesheetSettingsStore = create<
  TimesheetSettingsState & TimesheetSettingsStateAction
>(timesheetSettingsSlice);
