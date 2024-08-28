import { create, StateCreator } from 'zustand';

type LeaveManagementState = {
  isShowLeaveRequestManagementSidebar: boolean;
};

type LeaveManagementAction = {
  setIsShowLeaveRequestManagementSidebar: (
    isShowLeaveRequestManagementSidebar: boolean,
  ) => void;
};

const leaveManagementSlice: StateCreator<
  LeaveManagementState & LeaveManagementAction
> = (set) => ({
  isShowLeaveRequestManagementSidebar: false,
  setIsShowLeaveRequestManagementSidebar: (isShow) => {
    set({ isShowLeaveRequestManagementSidebar: isShow });
  },
});

export const useLeaveManagementStore = create<
  LeaveManagementState & LeaveManagementAction
>(leaveManagementSlice);
