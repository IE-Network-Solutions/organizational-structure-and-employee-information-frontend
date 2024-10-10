import { create } from 'zustand';
import { DrawerState } from './interface';

export const useWorkScheduleDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  workingHour: 40,
  selectedSchedule: null, // Add selected schedule data
  isEditMode: false, // Add edit mode flag
  scheduleName: '',
  isDeleteMode: false,
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  closeDrawer: () =>
    set({ isOpen: false, isEditMode: false, selectedSchedule: null }), // Reset on close
  openDrawer: () => set({ isOpen: true }),
  setWorkingHour: (hours) => set({ workingHour: hours }),
  setSelectedSchedule: (schedule) =>
    set({ scheduleName: schedule?.name, selectedSchedule: schedule }), // Set selected schedule
  setEditMode: (isEdit) => set({ isEditMode: isEdit }), // Set edit mode
  setDeleteMode: (isDelete) => set({ isDeleteMode: isDelete }),
}));
