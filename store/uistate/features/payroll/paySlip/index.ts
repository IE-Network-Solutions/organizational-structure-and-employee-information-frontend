import create from 'zustand';

interface FilterState {
  searchValue: { [key: string]: string };
  fiscalYears: any[];
  sessions: any[];
  months: any[];
  setSearchValue: (value: { [key: string]: string }) => void;
  setFiscalYears: (fiscalYears: any[]) => void;
  setSessions: (sessions: any[]) => void;
  setMonths: (months: any[]) => void;
}

interface FiltersState {
  searchValue: { [key: string]: string };
  setSearchValue: (key: string, value: string) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchValue: {},
  fiscalYears: [],
  sessions: [],
  months: [],
  setSearchValue: (value) => set(() => ({ searchValue: value })),
  setFiscalYears: (fiscalYears) => set(() => ({ fiscalYears })),
  setSessions: (sessions) => set(() => ({ sessions })),
  setMonths: (months) => set(() => ({ months })),
}));


export const useFiltersStore = create<FiltersState>((set) => ({
  searchValue: {},
  setSearchValue: (key, value) => set((state) => ({
    searchValue: { ...state.searchValue, [key]: value },
  })),
}));
