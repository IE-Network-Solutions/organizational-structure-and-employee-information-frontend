import { create } from 'zustand';

export interface TimeAndAttendanceDashboardUseState {
  activeTab: string;
  setActiveTab: (activeTab: string) => void;

  // handleSearchChange:(item:string,value:any)=>void;
}

export const TimeAndAttendaceDashboardStore =
  create<TimeAndAttendanceDashboardUseState>((set) => ({
    activeTab: 'admin',
    setActiveTab: (activeTab: string) => set({ activeTab }),
  }));
