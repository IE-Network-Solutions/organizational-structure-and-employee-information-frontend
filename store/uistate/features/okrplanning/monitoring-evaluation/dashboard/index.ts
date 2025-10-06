import { create } from 'zustand';
import { Dayjs } from 'dayjs';

export interface OKRDashboardUseState {
  activeTab: string;
  setActiveTab: (activeTab: string) => void;
  currentPage: number;
  setCurrentPage: (currentPage: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  selectedFilter: string;
  setSelectedFilter: (selectedFilter: string) => void;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  setDateRange: (dateRange: [Dayjs | null, Dayjs | null] | null) => void;
  personalFilter: string;
  setPersonalFilter: (personalFilter: string) => void;
  personalDateRange: [Dayjs | null, Dayjs | null] | null;
  setPersonalDateRange: (
    personalDateRange: [Dayjs | null, Dayjs | null] | null,
  ) => void;
}

export const OKRDashboardStore = create<OKRDashboardUseState>((set) => ({
  activeTab: 'admin',
  setActiveTab: (activeTab: string) => set({ activeTab }),
  currentPage: 1,
  setCurrentPage: (currentPage: number) => set({ currentPage }),
  pageSize: 5,
  setPageSize: (pageSize: number) => set({ pageSize }),
  selectedFilter: 'All',
  setSelectedFilter: (selectedFilter: string) => set({ selectedFilter }),
  searchTerm: '',
  setSearchTerm: (searchTerm: string) => set({ searchTerm }),
  dateRange: null,
  setDateRange: (dateRange: [Dayjs | null, Dayjs | null] | null) =>
    set({ dateRange }),
  personalFilter: 'All',
  setPersonalFilter: (personalFilter: string) => set({ personalFilter }),
  personalDateRange: null,
  setPersonalDateRange: (
    personalDateRange: [Dayjs | null, Dayjs | null] | null,
  ) => set({ personalDateRange }),
}));
