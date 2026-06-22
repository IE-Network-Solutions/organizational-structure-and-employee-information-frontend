import { create } from 'zustand';
import { AllowedArea } from '@/types/timesheet/settings';

export type AttendanceLocationErrorCoords = {
  latitude: number;
  longitude: number;
};

type AttendanceLocationErrorState = {
  isOpen: boolean;
  errorMessage: string | null;
  userCoords: AttendanceLocationErrorCoords | null;
  allowedAreas: AllowedArea[];
  showModal: (payload: {
    message: string;
    userCoords: AttendanceLocationErrorCoords;
    allowedAreas: AllowedArea[];
  }) => void;
  closeModal: () => void;
};

export const useAttendanceLocationErrorStore = create<AttendanceLocationErrorState>(
  (set) => ({
    isOpen: false,
    errorMessage: null,
    userCoords: null,
    allowedAreas: [],
    showModal: ({ message, userCoords, allowedAreas }) =>
      set({
        isOpen: true,
        errorMessage: message,
        userCoords,
        allowedAreas,
      }),
    closeModal: () =>
      set({
        isOpen: false,
        errorMessage: null,
        userCoords: null,
        allowedAreas: [],
      }),
  }),
);
