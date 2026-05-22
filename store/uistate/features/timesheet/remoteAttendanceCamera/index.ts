import { create } from 'zustand';

export type RemoteAttendanceAction = {
  isSignIn: boolean;
  breakTypeId?: string;
  /** After photo is captured, open break check-out sidebar instead of submitting immediately */
  openBreakCheckOutSidebarAfterCapture?: boolean;
};

type RemoteAttendanceCameraState = {
  pendingAction: RemoteAttendanceAction | null;
  showCameraConfirm: boolean;
  showCameraCapture: boolean;
  pendingCoords: { latitude: number; longitude: number } | null;
  capturedAttendancePhotoUrl: string | null;
};

type RemoteAttendanceCameraActions = {
  setPendingAction: (action: RemoteAttendanceAction | null) => void;
  setShowCameraConfirm: (show: boolean) => void;
  setShowCameraCapture: (show: boolean) => void;
  setPendingCoords: (
    coords: { latitude: number; longitude: number } | null,
  ) => void;
  setCapturedAttendancePhotoUrl: (url: string | null) => void;
  resetCameraFlow: () => void;
};

export const useRemoteAttendanceCameraStore = create<
  RemoteAttendanceCameraState & RemoteAttendanceCameraActions
>((set) => ({
  pendingAction: null,
  showCameraConfirm: false,
  showCameraCapture: false,
  pendingCoords: null,
  capturedAttendancePhotoUrl: null,

  setPendingAction: (pendingAction) => set({ pendingAction }),
  setShowCameraConfirm: (showCameraConfirm) => set({ showCameraConfirm }),
  setShowCameraCapture: (showCameraCapture) => set({ showCameraCapture }),
  setPendingCoords: (pendingCoords) => set({ pendingCoords }),
  setCapturedAttendancePhotoUrl: (capturedAttendancePhotoUrl) =>
    set({ capturedAttendancePhotoUrl }),
  resetCameraFlow: () =>
    set({
      pendingAction: null,
      showCameraConfirm: false,
      showCameraCapture: false,
      pendingCoords: null,
    }),
}));
