import { create, StateCreator } from 'zustand';
import { LeaveType } from '@/types/timesheet/settings';

type LeaveManagementState = {
  isShowLeaveRequestManagementSidebar: boolean;
  leaveTypes: LeaveType[];
  leaveRequestId: string | null;
  selectedUserId: string | null;
};

type LeaveManagementAction = {
  setIsShowLeaveRequestManagementSidebar: (
    isShowLeaveRequestManagementSidebar: boolean,
  ) => void;
  setLeaveTypes: (leaveTypes: LeaveType[]) => void;
  setLeaveRequestId: (leaveRequestId: string | null) => void;
  setSelectedUserId: (selectedUserId: string | null) => void;
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

  leaveRequestId: null,
  setLeaveRequestId: (leaveRequestId: string | null) => {
    set({ leaveRequestId });
  },

  selectedUserId: null,
  setSelectedUserId: (selectedUserId: string | null) => {
    set({ selectedUserId });
  },
});

export const useLeaveManagementStore = create<
  LeaveManagementState & LeaveManagementAction
>(leaveManagementSlice);
