import { create } from "zustand";
import { ScheduleState } from "./interface";
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";


const useScheduleStore = create<ScheduleState>((set, get) => ({
  name: '',
  detail: [
    { id: uuidv4(), dayOfWeek: 'Sunday', startTime: '', endTime: '', hours: 0, status: false },
    { id: uuidv4(), dayOfWeek: 'Monday', startTime: '', endTime: '', hours: 0, status: false },
    { id: uuidv4(), dayOfWeek: 'Tuesday', startTime: '', endTime: '', hours: 0, status: false },
    { id: uuidv4(), dayOfWeek: 'Wednesday', startTime: '', endTime: '', hours: 0, status: false },
    { id: uuidv4(), dayOfWeek: 'Thursday', startTime: '', endTime: '', hours: 0, status: false },
    { id: uuidv4(), dayOfWeek: 'Friday', startTime: '', endTime: '', hours: 0, status: false },
    { id: uuidv4(), dayOfWeek: 'Saturday', startTime: '', endTime: '', hours: 0, status: false },
  ],
  standardHours: 0,
  setName: (name) => set({ name }),
  setDetail: (dayOfWeek, data) =>
    set((state) => ({
      detail: state.detail.map((day) =>
        day.dayOfWeek == dayOfWeek ? { ...day, ...data } : day
      ),
    })),
  createWorkSchedule: () =>
    set((state) => {
      const updatedDetails = state.detail.map((day) => ({
        ...day,
        startTime: day.startTime ,
        endTime: day.endTime ,
        hours: day.startTime && day.endTime ? dayjs(day.endTime, 'h:mm A').diff(dayjs(day.startTime, 'h:mm A'), 'hour', true) : 0,

      }));
      return { ...state, detail: updatedDetails };
    }),
  getSchedule: () => {
    const state = get();
    return {
      name: state.name,
      detail: state.detail,
    };
  },
}));

export default useScheduleStore;