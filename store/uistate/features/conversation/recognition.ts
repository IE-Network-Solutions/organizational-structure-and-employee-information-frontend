import { create } from 'zustand';
interface SearchFieldOption {
  key: string;
  value: string;
}

interface SearchField {
  key: string;
  placeholder: string;
  options: SearchFieldOption[];
  widthRatio: number;
}
export interface CategoriesUseState {
  open: boolean;
  current: number;
  pageSize: number;
  totalPages: number;

  searchField: SearchField[];
  setSearchField: (fields: SearchField[]) => void;

  updateFieldOptions: (key: string, name: any) => void;
}
const initialSearchField: SearchField[] = [
  {
    key: 'employee',
    placeholder: 'search by Employee',
    options: [], // Empty initially, will be updated dynamically
    widthRatio: 0.4,
  },
  {
    key: 'year',
    placeholder: 'Filter by year',
    options: [], // Empty initially, will be updated dynamically
    widthRatio: 0.2,
  },
  {
    key: 'session',
    placeholder: 'Select by session',
    options: [], // Empty initially, will be updated dynamically
    widthRatio: 0.2,
  },
  {
    key: 'month',
    placeholder: 'Filter by month',
    options: [], // Empty initially, will be updated dynamically
    widthRatio: 0.2,
  },
];

export const useRecongnitionStore = create<CategoriesUseState>((set) => ({
  open: false,
  current: 0,
  pageSize: 4,
  totalPages: 1,

  searchField: initialSearchField, // Initial value
  setSearchField: (fields) => set({ searchField: fields }),

  updateFieldOptions: (key: string, newOptions: any) =>
    set((state) => ({
      searchField: state.searchField.map((field) =>
        field.key === key ? { ...field, options: newOptions } : field,
      ),
    })),

  setTotalPages: (totalPages: number) => set({ totalPages }),
  setPageSize: (pageSize:number) => set({ pageSize }),
  setCurrent: (value:number) => set({ current: value }),
  setOpen: (open:boolean) => set({ open }),
}));
