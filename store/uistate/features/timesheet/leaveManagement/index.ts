import { create, StateCreator } from 'zustand';
import { LeaveType } from '@/types/timesheet/settings';

type LeaveManagementState = {
  isShowLeaveRequestManagementSidebar: boolean;
  leaveTypes: LeaveType[];
};

type LeaveManagementAction = {
  setIsShowLeaveRequestManagementSidebar: (
    isShowLeaveRequestManagementSidebar: boolean,
  ) => void;
  setLeaveTypes: (leaveTypes: LeaveType[]) => void;
};

const leaveManagementSlice: StateCreator<
  LeaveManagementState & LeaveManagementAction
> = (set) => ({
  isShowLeaveRequestManagementSidebar: false,
  setIsShowLeaveRequestManagementSidebar: (isShow) => {
    set({ isShowLeaveRequestManagementSidebar: isShow });
  },

  leaveTypes: [],
  setLeaveTypes: (leaveTypes: LeaveType[]) => {
    set({ leaveTypes });
  },
});

export const useLeaveManagementStore = create<
  LeaveManagementState & LeaveManagementAction
>(leaveManagementSlice);
