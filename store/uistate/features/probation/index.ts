import { create } from 'zustand';
import { Dayjs } from 'dayjs';

export interface ProbationTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  approverId?: string;
  completedDate?: string;
  dueDate?: string;
  createdDate?: string;
  weight?: number;
  score?: number;
  approver?: {
    id?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    avatar?: string;
  };
}

interface ProbationTaskForm {
  title: string;
  description: string;
  assignedTo: string | null;
  dueDate: Dayjs | null;
  category: string | null;
  weight: number | null;
}

const initialTaskForm: ProbationTaskForm = {
  title: '',
  description: '',
  assignedTo: null,
  dueDate: null,
  category: null,
  weight: null,
};

interface ProbationState {
  // Task management
  tasks: ProbationTask[];
  taskForm: ProbationTaskForm;

  // Modal states
  isAddTaskModalVisible: boolean;
  isTaskTemplateVisible: boolean;
  isDeleteModalVisible: boolean;
  isEditTaskModalVisible: boolean;

  // Selected task for operations
  taskToDelete: ProbationTask | null;
  taskToEdit: ProbationTask | null;

  // Template tasks
  selectedTemplateTasks: ProbationTask[];

  // Form actions
  setTaskForm: (updates: Partial<ProbationTaskForm>) => void;
  resetTaskForm: () => void;

  // Task CRUD operations
  addTask: (task: ProbationTask) => void;
  updateTask: (id: string, updates: Partial<ProbationTask>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // Modal controls
  setIsAddTaskModalVisible: (visible: boolean) => void;
  setIsTaskTemplateVisible: (visible: boolean) => void;
  setIsDeleteModalVisible: (visible: boolean) => void;
  setIsEditTaskModalVisible: (visible: boolean) => void;

  // Task selection for operations
  setTaskToDelete: (task: ProbationTask | null) => void;
  setTaskToEdit: (task: ProbationTask | null) => void;

  // Template management
  setSelectedTemplateTasks: (tasks: ProbationTask[]) => void;
  addTemplateTasks: (tasks: ProbationTask[]) => void;

  // Bulk operations
  markAllTasksComplete: () => void;
  clearCompletedTasks: () => void;

  // Score calculations
  getTotalScore: () => number;
  getCompletedTasksScore: () => number;
  updateTaskScore: (id: string, score: number | undefined) => void;
}

export const useProbationStore = create<ProbationState>((set, get) => ({
  // Initial state with mock data
  tasks: [
    {
      id: '1939e6ff-ffa6-4c2e-aa7d-b7f9f0189508',
      title: 'Complete orientation program',
      description:
        'Attend company orientation and complete all required training modules',
      isCompleted: false,
      dueDate: '2024-02-15',
      approverId: '1939e6ff-ffa6-4c2e-aa7d-b7f9f0189508',
      createdDate: '2024-01-15',
      weight: 25,
      approver: {
        id: '1939e6ff-ffa6-4c2e-aa7d-b7f9f0189508',
        firstName: 'John',
        lastName: 'Manager',
        avatar: '/userIcon.png',
      },
    },
    {
      id: '2',
      title: 'Submit required documents',
      description:
        'Submit all required employment documents including ID, tax forms, and emergency contacts',
      isCompleted: true,
      completedDate: '2024-01-20',
      approverId: '1939e6ff-ffa6-4c2e-aa7d-b7f9f0189508',
      createdDate: '2024-01-15',
      weight: 15,
      approver: {
        id: '1939e6ff-ffa6-4c2e-aa7d-b7f9f0189508',
        firstName: 'Jane',
        lastName: 'HR',
        avatar: '/userIcon.png',
      },
    },
    {
      id: '3',
      title: 'Complete probation review meeting',
      description:
        'Schedule and attend probation review meeting with direct supervisor',
      isCompleted: false,
      dueDate: '2024-03-01',
      approverId: '1939e6ff-ffa6-4c2e-aa7d-b7f9f0189508',
      createdDate: '2024-01-15',
      weight: 30,
      approver: {
        id: '1939e6ff-ffa6-4c2e-aa7d-b7f9f0189508',
        firstName: 'John',
        lastName: 'Manager',
        avatar: '/userIcon.png',
      },
    },
  ],
  taskForm: initialTaskForm,
  isAddTaskModalVisible: false,
  isTaskTemplateVisible: false,
  isDeleteModalVisible: false,
  isEditTaskModalVisible: false,
  taskToDelete: null,
  taskToEdit: null,
  selectedTemplateTasks: [],

  // Form actions
  setTaskForm: (updates) =>
    set((state) => ({
      taskForm: { ...state.taskForm, ...updates },
    })),

  resetTaskForm: () => set({ taskForm: initialTaskForm }),

  // Task CRUD operations
  addTask: (task) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        { ...task, createdDate: new Date().toISOString() },
      ],
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task,
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              isCompleted: !task.isCompleted,
              completedDate: !task.isCompleted
                ? new Date().toISOString()
                : undefined,
              score: !task.isCompleted ? undefined : undefined, // Set to undefined for manual input
            }
          : task,
      ),
    })),

  // Modal controls
  setIsAddTaskModalVisible: (visible) =>
    set({ isAddTaskModalVisible: visible }),

  setIsTaskTemplateVisible: (visible) =>
    set({ isTaskTemplateVisible: visible }),

  setIsDeleteModalVisible: (visible) => set({ isDeleteModalVisible: visible }),

  setIsEditTaskModalVisible: (visible) =>
    set({ isEditTaskModalVisible: visible }),

  // Task selection for operations
  setTaskToDelete: (task) => set({ taskToDelete: task }),

  setTaskToEdit: (task) => set({ taskToEdit: task }),

  // Template management
  setSelectedTemplateTasks: (tasks) => set({ selectedTemplateTasks: tasks }),

  addTemplateTasks: (tasks) =>
    set((state) => ({
      tasks: [...state.tasks, ...tasks],
      selectedTemplateTasks: [],
    })),

  // Bulk operations
  markAllTasksComplete: () =>
    set((state) => ({
      tasks: state.tasks.map((task) => ({
        ...task,
        isCompleted: true,
        completedDate: task.completedDate || new Date().toISOString(),
      })),
    })),

  clearCompletedTasks: () =>
    set((state) => ({
      tasks: state.tasks.filter((task) => !task.isCompleted),
    })),

  // Score calculations
  getTotalScore: () => {
    const state = get();
    return state.tasks.reduce((total, task) => total + (task.weight || 0), 0);
  },

  getCompletedTasksScore: () => {
    const state = get();
    return state.tasks
      .filter((task) => task.isCompleted)
      .reduce((total, task) => total + (task.score || 0), 0);
  },

  updateTaskScore: (id, score) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              score: score,
            }
          : task,
      ),
    })),
}));
