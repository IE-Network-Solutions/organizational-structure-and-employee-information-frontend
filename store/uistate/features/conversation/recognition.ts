import { create } from 'zustand';
interface SearchFieldOption {
  key: string;
  value: string;
}
interface DateRange {
  startDate: string;
  endDate: string;
}
interface Employee {
  id: string;
  name: string;
  criteria: string[];
  value: number;
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
interface CriteriaScore {
  name: string;
  id: string;
  score: string;
}

interface EmployeeEvaluation {
  recipientId: string;
  totalPoints: string;
  criteriaScore: CriteriaScore[];
}

type EmployeeEvaluations = EmployeeEvaluation[];

export interface CategoriesUseState {
  open: boolean;
  current: number;
  pageSize: number;
  setCurrent: (current: number) => void;
  setPageSize: (current: number) => void;
  totalPages: number;
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
  searchField: SearchField[];
  setSearchField: (fields: SearchField[]) => void;

  activeMonthId: string;
  setActiveMonthId: (activeMonthId: string) => void;

  activeSessionId: string;
  setActiveSession: (activeSessionId: string) => void;

  fiscalActiveYearId: string;
  setFiscalActiveYearId: (fiscalActiveYearId: string) => void;

  selectedRecognitionType: string;
  setSelectedRecognitionType: (selectedRecognitionType: string) => void;

  updateFieldOptions: (key: string, name: any) => void;

  searchValue: Record<string, string | undefined>; // Dynamic object to store selected values
  updateSearchValue: (key: string, value: string) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  visibleEmployee: boolean;
  setVisibleEmployee: (visibleEmployee: boolean) => void;
  recognitionTypeId: string;
  setRecognitionTypeId: (recognitionTypeId: string) => void;
  selectedEmployees: Employee[];
  setSelectedEmployees: (employees: Employee[]) => void;
  employeesList: EmployeeEvaluations[];
  setEmployeesList: (employeesList: EmployeeEvaluations[]) => void;
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (selectedEmployeeId: string) => void;
  filterOption: string;
  setFilterOption: (filterOption: string) => void;
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: (keys: React.Key[]) => void;
  resetSelection: () => void;
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
  visible: false,
  visibleEmployee: false,
  recognitionTypeId: '',
  selectedEmployees: [],
  employeesList: [],
  selectedEmployeeId: null,
  filterOption: 'all',
  dateRange: { startDate: '', endDate: '' },
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

  activeMonthId: '',
  setActiveMonthId: (activeMonthId: string) => set({ activeMonthId }),

  activeSessionId: '',
  setActiveSession: (activeSessionId: string) => set({ activeSessionId }),

  fiscalActiveYearId: '',
  setFiscalActiveYearId: (fiscalActiveYearId: string) =>
    set({ fiscalActiveYearId }),

  setTotalPages: (totalPages: number) => set({ totalPages }),
  setPageSize: (pageSize: number) => set({ pageSize }),
  setCurrent: (value: number) => set({ current: value }),
  setOpen: (open: boolean) => set({ open }),
  setVisible: (visible: boolean) => set({ visible }),
  setVisibleEmployee: (visibleEmployee: boolean) => set({ visibleEmployee }),
  setRecognitionTypeId: (recognitionTypeId: string) =>
    set({ recognitionTypeId }),
  setSelectedEmployees: (employees) => set({ selectedEmployees: employees }),
  setEmployeesList: (employees) => set({ employeesList: employees }),
  setFilterOption: (filterOption: string) => set({ filterOption }),
  setSelectedEmployeeId: (selectedEmployeeId: string) =>
    set({ selectedEmployeeId }),
  setDateRange: (dateRange: DateRange) => set({ dateRange }),
  selectedRowKeys: [],
  setSelectedRowKeys: (keys) => set({ selectedRowKeys: keys }),

  resetSelection: () => set({ selectedRowKeys: [], selectedEmployees: [] }),
}));
