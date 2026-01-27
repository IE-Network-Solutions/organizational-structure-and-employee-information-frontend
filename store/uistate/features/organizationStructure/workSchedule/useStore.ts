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
    day: day,
    startTime: '',
    endTime: '',
    duration: 0,
    workDay: false,
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

  currentPage: 1,
  pageSize: 5,
  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size }),

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

  setDetail: (day, data) =>
    set((state) => ({
      detail: state.detail.map((dayItem) =>
        dayItem.day === day
          ? {
              ...dayItem,
              ...data,
              // Update duration if startTime or endTime is being updated
              duration:
                data.startTime !== undefined || data.endTime !== undefined
                  ? calculateHours(
                      data.startTime !== undefined
                        ? data.startTime
                        : dayItem.startTime,
                      data.endTime !== undefined
                        ? data.endTime
                        : dayItem.endTime,
                    )
                  : data.workDay !== undefined && !data.workDay
                    ? 0 // Set duration to 0 when workDay is disabled
                    : dayItem.duration,
            }
          : dayItem,
      ),
    })),

  createWorkSchedule: () =>
    set((state) => ({
      detail: state.detail.map((day) => ({
        ...day,
        duration: calculateHours(day.startTime, day.endTime),
      })),
    })),

  getSchedule: () => {
    const state = get();
    return {
      name: state.scheduleName,
      detail: state.detail,
    };
  },

  searchQuery: '',
  setSearchQuery: (query: string) => set({ searchQuery: query }),

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
