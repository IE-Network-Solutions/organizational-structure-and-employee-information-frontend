import { create } from 'zustand';

export type RemoteAttendanceAction = {
  isSignIn: boolean;
  breakTypeId?: string;
  /** After photo is captured, open break check-out sidebar instead of submitting immediately */
  openBreakCheckOutSidebarAfterCapture?: boolean;
};

type RemoteAttendanceCameraState = {
  pendingAction: RemoteAttendanceAction | null;
  showCameraCapture: boolean;
  pendingCoords: { latitude: number; longitude: number } | null;
  capturedAttendancePhotoUrl: string | null;
  /** Shared across my-timesheet UI; true while setCurrentAttendance mutation is in flight */
  isSubmitInProgress: boolean;
};

type RemoteAttendanceCameraActions = {
  setPendingAction: (action: RemoteAttendanceAction | null) => void;
  setShowCameraCapture: (show: boolean) => void;
  setPendingCoords: (
    coords: { latitude: number; longitude: number } | null,
  ) => void;
  setCapturedAttendancePhotoUrl: (url: string | null) => void;
  resetCameraFlow: () => void;
  setIsSubmitInProgress: (isSubmitInProgress: boolean) => void;
};

export const useRemoteAttendanceCameraStore = create<
  RemoteAttendanceCameraState & RemoteAttendanceCameraActions
>((set) => ({
  pendingAction: null,
  showCameraCapture: false,
  pendingCoords: null,
  capturedAttendancePhotoUrl: null,
  isSubmitInProgress: false,

  setPendingAction: (pendingAction) => set({ pendingAction }),
  setIsSubmitInProgress: (isSubmitInProgress) => set({ isSubmitInProgress }),
  setShowCameraCapture: (showCameraCapture) => set({ showCameraCapture }),
  setPendingCoords: (pendingCoords) => set({ pendingCoords }),
  setCapturedAttendancePhotoUrl: (capturedAttendancePhotoUrl) =>
    set({ capturedAttendancePhotoUrl }),
  resetCameraFlow: () =>
    set({
      pendingAction: null,
      showCameraCapture: false,
      pendingCoords: null,
    }),
}));
