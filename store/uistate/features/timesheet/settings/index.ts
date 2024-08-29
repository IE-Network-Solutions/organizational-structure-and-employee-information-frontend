import { create, StateCreator } from 'zustand';

type TimesheetSettingsState = {
  isShowLocationSidebar: boolean;
  isShowRulesAddTypeSidebar: boolean;
  isShowCreateRule: boolean;
};

type TimesheetSettingsStateAction = {
  setIsShowLocationSidebar: (isShowLocationSidebar: boolean) => void;
  setIsShowRulesAddTypeSidebar: (isShowRulesAddTypeSidebar: boolean) => void;
  setIsShowCreateRule: (isShowCreateRule: boolean) => void;
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

  isShowCreateRule: false,
  setIsShowCreateRule: (isShowCreateRule: boolean) => {
    set({ isShowCreateRule });
  },
});

export const useTimesheetSettingsStore = create<
  TimesheetSettingsState & TimesheetSettingsStateAction
>(timesheetSettingsSlice);
