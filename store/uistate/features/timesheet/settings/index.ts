import { create, StateCreator } from 'zustand';

type TimesheetSettingsState = {
  isShowLocationSidebar: boolean;
};

type TimesheetSettingsStateAction = {
  setIsShowLocationSidebar: (isShowLocationSidebar: boolean) => void;
};

const timesheetSettingsSlice: StateCreator<
  TimesheetSettingsState & TimesheetSettingsStateAction
> = (set) => ({
  isShowLocationSidebar: false,
  setIsShowLocationSidebar: (isShowLocationSidebar: boolean) => {
    set({ isShowLocationSidebar });
  },
});

export const useTimesheetSettingsStore = create<
  TimesheetSettingsState & TimesheetSettingsStateAction
>(timesheetSettingsSlice);
