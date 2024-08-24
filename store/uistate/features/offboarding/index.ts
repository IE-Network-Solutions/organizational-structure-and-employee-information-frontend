import { create } from 'zustand';
import { Dayjs } from 'dayjs';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedBy?: string;
  completedDate?: string;
  category: string;
  dueDate?: string;
  assignedTo?: string;
  description?: string;
}
interface TaskForm {
  taskName: string;
  assignedTo: string | null;
  dueDate: Dayjs | null;
  description: string;
  category: string | null;
}
const initialTaskForm: TaskForm = {
  taskName: '',
  assignedTo: null,
  dueDate: null,
  description: '',
  category: null,
};
interface OffboardingState {
  taskForm: TaskForm;
  newTaskList: string;
  isAddListVisible: boolean;
  setTaskForm: (updates: Partial<TaskForm>) => void;
  resetTaskForm: () => void;
  tasks: Task[];
  isModalVisible: boolean;
  isTerminationModalVisible: boolean;
  newOption: string;
  newTerminationOption: string;
  customOptions: string[];
  customTerminationOptions: string[];
  employmentStatus: string | null;
  showTerminationFields: boolean;
  isAddTaskModalVisible: boolean;
  newAssign: string;
  isTaskTemplateVisible: boolean;
  isDeleteModalVisible: boolean;
  isEmploymentFormVisible: boolean;
  setIsEmploymentFormVisible: (visible: boolean) => void;
  setIsDeleteModalVisible: (visible: boolean) => void;
  setIsTaskTemplateVisible: (visible: boolean) => void;
  setNewAssign: (option: string) => void;
  setIsAddTaskModalVisible: (visible: boolean) => void;
  setIsAddListVisible: (visible: boolean) => void;
  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  setIsModalVisible: (visible: boolean) => void;
  setIsTerminationModalVisible: (visible: boolean) => void;
  setNewOption: (option: string) => void;
  setNewTaskList: (option: string) => void;
  setNewTerminationOption: (option: string) => void;
  addCustomOption: (option: string) => void;
  addCustomTerminationOption: (option: string) => void;
  setEmploymentStatus: (status: string) => void;
  setShowTerminationFields: (show: boolean) => void;
}

export const useOffboardingStore = create<OffboardingState>((set) => ({
  tasks: [],
  isAddTaskModalVisible: false,
  isModalVisible: false,
  isTerminationModalVisible: false,
  isAddListVisible: false,
  newOption: '',
  newAssign: '',
  newTaskList: '',
  newTerminationOption: '',
  customOptions: [],
  customTerminationOptions: [],
  employmentStatus: null,
  showTerminationFields: false,
  isTaskTemplateVisible: false,
  isDeleteModalVisible: false,
  isEmploymentFormVisible: false,
  setIsEmploymentFormVisible: (visible) =>
    set({ isEmploymentFormVisible: visible }),
  setIsDeleteModalVisible: (visible) => set({ isDeleteModalVisible: visible }),
  setIsTaskTemplateVisible: (visible) =>
    set({ isTaskTemplateVisible: visible }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    })),
  setIsModalVisible: (visible) => set({ isModalVisible: visible }),
  setIsAddListVisible: (visible) => set({ isAddListVisible: visible }),
  setIsTerminationModalVisible: (visible) =>
    set({ isTerminationModalVisible: visible }),
  setIsAddTaskModalVisible: (visible) =>
    set({ isAddTaskModalVisible: visible }),
  setNewOption: (option) => set({ newOption: option }),
  setNewAssign: (option) => set({ newAssign: option }),
  setNewTaskList: (option) => set({ newTaskList: option }),
  setNewTerminationOption: (option) => set({ newTerminationOption: option }),
  addCustomOption: (option) =>
    set((state) => ({
      customOptions: [...state.customOptions, option],
      newOption: '',
      isModalVisible: false,
    })),
  addCustomTerminationOption: (option) =>
    set((state) => ({
      customTerminationOptions: [...state.customTerminationOptions, option],
      newTerminationOption: '',
      isTerminationModalVisible: false,
    })),
  setEmploymentStatus: (status) => set({ employmentStatus: status }),
  setShowTerminationFields: (show) => set({ showTerminationFields: show }),
  taskForm: initialTaskForm,
  setTaskForm: (updates) =>
    set((state) => ({
      taskForm: { ...state.taskForm, ...updates },
    })),
  resetTaskForm: () => set({ taskForm: initialTaskForm }),
}));
