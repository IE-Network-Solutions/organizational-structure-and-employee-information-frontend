import create from 'zustand';

export interface Task {
  id?: string;
  title: string;
  status: string;
  isEdit?: boolean;
  departmentId: string;
  session: string;
  month: string;
  createdAt?: string;
  createdBy?: string;
}

export interface DataItem {
  weeklyPriorityWeekId?: string;
  tasks: Task[];
  departmentId: string;
}

interface WeeklyPriorityState {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  data: DataItem[];
  setData: (newData: DataItem[]) => void;
  addNewCard: (userId: string, departmentId: string) => void;
  addNewTask: (itemIndex: number) => void;
  removeTask: (itemIndex: number, taskIndex: number) => void;
  departmentId?: string;
  setDepartmentId: (departmentId: string) => void;
  weekIds?: string[];
  setWeekIds: (weekIds: string[]) => void;
}

export const useWeeklyPriorityStore = create<WeeklyPriorityState>((set) => ({
  activeTab: 1,
  setActiveTab: (tab) => set({ activeTab: tab }),
  departmentId: '',
  setDepartmentId: (id) => set({ departmentId: id }),
  weekIds: [],
  setWeekIds: (id) => set({ weekIds: id }),
  data: [],
  setData: (newData) => set({ data: newData }),
  addNewCard: (userId, departmentId) =>
    set((state) => ({
      data: [
        {
          tasks: [
            {
              title: '',
              status: 'PENDING',
              isEdit: true,
              month: '',
              session: '',
              createdBy: userId,
              departmentId: departmentId,
            },
          ],
          date: new Date().toISOString().split('T')[0],
          createdBy: userId,
          departmentId: departmentId,
          status: 'PENDING',
        },
        ...state.data,
      ],
    })),
  addNewTask: (itemIndex) =>
    set((state) => {
      const newData = [...state.data];
      newData[itemIndex].tasks.push({
        title: '',
        status: 'PENDING',
        isEdit: true,
        month: '',
        session: '',
        departmentId: '',
      });
      return { data: newData };
    }),

  removeTask: (itemIndex: number, taskIndex: number) =>
    set((state) => {
      const newData = [...state.data];

      // Remove the task at the given taskIndex
      newData[itemIndex].tasks = newData[itemIndex].tasks.filter(
        (notused, index) => index !== taskIndex,
      );

      // If no tasks remain, remove the entire card
      if (newData[itemIndex].tasks.length === 0) {
        newData.splice(itemIndex, 1);
      }

      return { data: newData };
    }),
}));
