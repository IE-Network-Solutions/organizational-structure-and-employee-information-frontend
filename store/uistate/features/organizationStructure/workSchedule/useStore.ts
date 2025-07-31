import { create } from 'zustand';
import { ScheduleState } from './interface';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

const initializeDetail = () =>
  [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ].map((day) => ({
    id: uuidv4(),
    dayOfWeek: day,
    startTime: '',
    endTime: '',
    hours: 0,
    status: false,
  }));

const calculateHours = (startTime: any, endTime: any) =>
  startTime && endTime
    ? dayjs(endTime, 'h:mm A').diff(dayjs(startTime, 'h:mm A'), 'hour', true)
    : 0;

const useScheduleStore = create<ScheduleState>((set, get) => ({
  isOpen: false,
  isEditMode: false,
  scheduleName: '',
  isDeleteMode: false,
  id: '',
  standardHours: 0,
  validationError: '',
  detail: initializeDetail(),

  setStandardHours: (standardHours) => set({ standardHours }),
  setId: (id) => set({ id }),
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  closeDrawer: () => set({ isOpen: false, isEditMode: false }),
  openDrawer: () => set({ isOpen: true }),
  setEditMode: (isEdit) => set({ isEditMode: isEdit }),
  setScheduleName: (scheduleName) => set({ scheduleName }),
  setDeleteMode: (isDelete) => set({ isDeleteMode: isDelete }),
  setValidationError: (error: string) => set({ validationError: error }),
  clearValidationError: () => set({ validationError: '' }),

  setDetail: (dayOfWeek, data) =>
    set((state) => ({
      detail: state.detail.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...data } : day,
      ),
    })),

  createWorkSchedule: () =>
    set((state) => ({
      detail: state.detail.map((day) => ({
        ...day,
        hours: calculateHours(day.startTime, day.endTime),
      })),
    })),

  getSchedule: () => {
    const state = get();
    return {
      name: state.scheduleName,
      detail: state.detail,
    };
  },

  clearState: () =>
    set(() => ({
      scheduleName: '',
      id: '',
      standardHours: 0,
      validationError: '',
      detail: initializeDetail(),
    })),
}));

export default useScheduleStore;
