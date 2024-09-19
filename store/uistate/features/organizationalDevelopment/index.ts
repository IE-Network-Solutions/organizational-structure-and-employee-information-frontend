import create from 'zustand';
import { devtools } from 'zustand/middleware';

export type GraphType = 'pieChart' | 'barGraph';

interface StoreState {
  open: boolean;
  setOpen: (error: boolean) => void;
  selectedAnswer: string[];
  setSelectedAnswer: (selectedAnswer: string) => void;
  activeTab: string;
  setActiveTab: (error: string) => void;
  numberOfActionPlan: number;
  setNumberOfActionPlan: (numberOfActionPlan: number) => void;
  current: number;
  setCurrent: (current: number) => void;

  visibleItems: { [key: string]: boolean };
  setVisibleItems: (id: any) => void;

  pageSize: number;
  setPageSize: (pageSize: number) => void;

  numberOfRoleResponseblity: number;
  setNumberOfRoleResponseblity: (numberOfActionPlan: number) => void;

  selectedUser: string | null;
  setSelectedUser: (selectedUser: string) => void;

  selectedActionPlan: string | null;
  setSelectedActionPlan: (selectedActionPlan: string | null) => void;

  searchTitle: string | null;
  setSearchTitle: (questionTitle: string | null) => void;

  selectedEditActionPlan: string | null;
  setSelectedEditActionPlan: (selectedEditActionPlan: string | null) => void;

  graphType: GraphType;
  setGraphType: (graphType: GraphType) => void;
}

export const useOrganizationalDevelopment = create<StoreState>()(
  devtools((set) => ({
    visibleItems: {},
    setVisibleItems: (id) =>
      set((state) => ({
        visibleItems: {
          ...state.visibleItems,
          [id]:
            state.visibleItems[id] !== undefined
              ? !state.visibleItems[id]
              : true,
        },
      })),
    current: 1,
    setCurrent: (current: number) => set({ current }),
    pageSize: 10,
    setPageSize: (pageSize: number) => set({ pageSize }),

    graphType: 'pieChart',
    setGraphType: (graphType: GraphType) => set({ graphType }),

    selectedActionPlan: null,
    setSelectedActionPlan: (selectedActionPlan: string | null) =>
      set({ selectedActionPlan }),

    selectedEditActionPlan: null,
    setSelectedEditActionPlan: (selectedEditActionPlan: string | null) =>
      set({ selectedEditActionPlan }),

    searchTitle: '',
    setSearchTitle: (searchTitle: string | null) => set({ searchTitle }),

    selectedUser: null,
    setSelectedUser: (selectedUser: string | null) => set({ selectedUser }),
    open: false,
    setOpen: (open: boolean) => set({ open }),
    activeTab: '1',
    setActiveTab: (activeTab: string) => set({ activeTab }),
    selectedAnswer: [],
    setSelectedAnswer: (id: string) =>
      set((state) => {
        const isSelected = state.selectedAnswer.includes(id);
        const updatedSelectedAnswer = isSelected
          ? state.selectedAnswer.filter((answer) => answer !== id)
          : [...state.selectedAnswer, id];
        return { selectedAnswer: updatedSelectedAnswer };
      }),
    numberOfRoleResponseblity: 0,
    setNumberOfRoleResponseblity: (numberOfRoleResponseblity: number) =>
      set({ numberOfRoleResponseblity }),
    numberOfActionPlan: 1,
    setNumberOfActionPlan: (numberOfActionPlan: number) =>
      set({ numberOfActionPlan }),
  })),
);
