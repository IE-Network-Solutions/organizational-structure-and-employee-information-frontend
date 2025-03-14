import create from 'zustand';
import { devtools } from 'zustand/middleware';

export type GraphType = 'pieChart' | 'barGraph';

interface StoreState {
  open: boolean;
  setOpen: (error: boolean) => void;
  openEdit: boolean;
  setOpenEdit: (error: boolean) => void;
  selectedAnswer: string[];

  currentStep: number;
  setCurrentStep: (value: number) => void;

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

  agendaItems: string[];
  setAgendaItems: (agendaItems: string[]) => void;

  selectedUser: string | null;
  setSelectedUser: (selectedUser: string) => void;

  selectedActionPlan: string | null;
  setSelectedActionPlan: (selectedActionPlan: string | null) => void;

  searchTitle: string | null;
  setSearchTitle: (questionTitle: string | null) => void;

  isEditModalOpen: boolean;
  setIsEditModalOpen: (value: boolean) => void;

  editItemId: string;
  setEditItemId: (itemId: string) => void;

  actionPlanId: string;
  setActionPlanId: (itemId: string) => void;

  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (value: boolean) => void;

  answeredAttendee: string[];
  setAnsweredAttendee: (value: string[]) => void;

  selectedUsers: string[];
  setSelectedUsers: (value: string[]) => void;

  selectedInstance: string | null;
  setSelectedInstances: (value: string | null) => void;

  selectedDepartments: string[];
  setSelectedDepartments: (value: string[]) => void;

  childrenDrawer: boolean;
  setChildrenDrawer: (value: boolean) => void;

  deleteItemId: string;
  setDeleteItemId: (itemId: string) => void;
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

    currentStep: 0,
    setCurrentStep: (currentStep: number) => set({ currentStep }),

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

    selectedInstance: null,
    setSelectedInstances: (selectedInstance: string | null) =>
      set({ selectedInstance }),

    agendaItems: [''],
    setAgendaItems: (agendaItems: string[]) => set({ agendaItems }),

    selectedDepartments: [],
    setSelectedDepartments: (selectedDepartments: string[]) =>
      set({ selectedDepartments }),
    open: false,
    setOpen: (open: boolean) => set({ open }),
    openEdit: false,
    setOpenEdit: (openEdit: boolean) => set({ openEdit }),
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

    isEditModalOpen: false,
    setIsEditModalOpen: (value: boolean) => set({ isEditModalOpen: value }),

    childrenDrawer: false,
    setChildrenDrawer: (value: boolean) => set({ childrenDrawer: value }),

    answeredAttendee: [],
    setAnsweredAttendee: (answeredAttendee: string[]) =>
      set({ answeredAttendee }),

    selectedUsers: [],
    setSelectedUsers: (selectedUsers: string[]) => set({ selectedUsers }),

    editItemId: '',
    setEditItemId: (itemId: string) => set({ editItemId: itemId }),

    actionPlanId: '',
    setActionPlanId: (itemId: string) => set({ actionPlanId: itemId }),

    isDeleteModalOpen: false,
    setIsDeleteModalOpen: (value) => set({ isDeleteModalOpen: value }),

    deleteItemId: '',
    setDeleteItemId: (itemId: string) => set({ deleteItemId: itemId }),
  })),
);
