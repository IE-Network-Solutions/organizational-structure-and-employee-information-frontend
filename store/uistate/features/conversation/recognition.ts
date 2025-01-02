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
export type SearchValue = {
  calendarId?: string;
  monthId?: string;
  sessionId?: string;
  employeeId?: string;
};
export interface CategoriesUseState {
  open: boolean;
  current: number;
  pageSize: number;
  totalPages: number;

  searchField: SearchField[];
  setSearchField: (fields: SearchField[]) => void;

  activeMonthId:string,
  setActiveMonthId:(activeMonthId:string)=>void,

  activeSessionId:string,
  setActiveSession:(activeSessionId:string)=>void,

  fiscalActiveYearId:string,
  setFiscalActiveYearId:(fiscalActiveYearId:string)=>void,


  selectedRecognitionType: string;
  setSelectedRecognitionType: (selectedRecognitionType: string) => void;

  updateFieldOptions: (key: string, name: any) => void;

  searchValue: Record<string, string | undefined>; // Dynamic object to store selected values
  updateSearchValue: (key: string, value: string) => void;
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
  current: 1,
  pageSize: 10,
  totalPages: 1,

  searchValue: {},
  updateSearchValue: (key, value) =>
    set((state) => ({
      searchValue: {
        ...state.searchValue,
        [key]: value, // Dynamically update or add the value for the given key
      },
    })),
  searchField: initialSearchField, // Initial value
  setSearchField: (fields) => set({ searchField: fields }),

  selectedRecognitionType: '1',
  setSelectedRecognitionType: (selectedRecognitionType: string) =>
    set({ selectedRecognitionType }),

  updateFieldOptions: (key: string, newOptions: any) =>
    set((state) => ({
      searchField: state.searchField.map((field) =>
        field.key === key ? { ...field, options: newOptions } : field,
      ),
    })),

  activeMonthId:'',
  setActiveMonthId:(activeMonthId:string)=>set({activeMonthId}),

  activeSessionId:'',
  setActiveSession:(activeSessionId:string)=>set({activeSessionId}),

  fiscalActiveYearId:'',
  setFiscalActiveYearId:(fiscalActiveYearId:string)=>set({fiscalActiveYearId}),
  
  setTotalPages: (totalPages: number) => set({ totalPages }),
  setPageSize: (pageSize: number) => set({ pageSize }),
  setCurrent: (value: number) => set({ current: value }),
  setOpen: (open: boolean) => set({ open }),
}));
