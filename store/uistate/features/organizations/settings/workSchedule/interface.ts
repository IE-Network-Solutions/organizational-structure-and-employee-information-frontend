import { DayOfWeekResponse } from '@/store/server/features/organizationStructure/workSchedule/interface';

export interface DrawerState {
  isOpen: boolean;
  workingHour: number;
  selectedSchedule: DayOfWeekResponse | null; // Holds the selected schedule data for editing
  isEditMode: boolean; // Flag to check if in edit mode
  scheduleName: string;
  isDeleteMode: boolean;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  openDrawer: () => void;
  setWorkingHour: (hours: number) => void;
  setSelectedSchedule: (schedule: any) => void; // Set the selected schedule
  setEditMode: (isEdit: boolean) => void; // Toggle edit mode
  setDeleteMode: (isDelete: boolean) => void;
}
