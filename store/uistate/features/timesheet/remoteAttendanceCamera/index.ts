import { create } from 'zustand';

export type RemoteAttendanceAction = {
  isSignIn: boolean;
  breakTypeId?: string;
  /** After photo is captured, open break check-out sidebar instead of submitting immediately */
  openBreakCheckOutSidebarAfterCapture?: boolean;
};

export type ConfirmAnchorRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type RemoteAttendanceCameraState = {
  pendingAction: RemoteAttendanceAction | null;
  showCameraConfirm: boolean;
  showCameraCapture: boolean;
  pendingCoords: { latitude: number; longitude: number } | null;
  capturedAttendancePhotoUrl: string | null;
  confirmAnchorRect: ConfirmAnchorRect | null;
};

type RemoteAttendanceCameraActions = {
  setPendingAction: (action: RemoteAttendanceAction | null) => void;
  setShowCameraConfirm: (show: boolean) => void;
  setShowCameraCapture: (show: boolean) => void;
  setPendingCoords: (
    coords: { latitude: number; longitude: number } | null,
  ) => void;
  setCapturedAttendancePhotoUrl: (url: string | null) => void;
  setConfirmAnchorFromElement: (element: HTMLElement) => void;
  clearConfirmAnchor: () => void;
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
  confirmAnchorRect: null,

  setPendingAction: (pendingAction) => set({ pendingAction }),
  setShowCameraConfirm: (showCameraConfirm) => set({ showCameraConfirm }),
  setShowCameraCapture: (showCameraCapture) => set({ showCameraCapture }),
  setPendingCoords: (pendingCoords) => set({ pendingCoords }),
  setCapturedAttendancePhotoUrl: (capturedAttendancePhotoUrl) =>
    set({ capturedAttendancePhotoUrl }),
  setConfirmAnchorFromElement: (element) => {
    const rect = element.getBoundingClientRect();
    set({
      confirmAnchorRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
    });
  },
  clearConfirmAnchor: () => set({ confirmAnchorRect: null }),
  resetCameraFlow: () =>
    set({
      pendingAction: null,
      showCameraConfirm: false,
      showCameraCapture: false,
      pendingCoords: null,
      confirmAnchorRect: null,
    }),
}));
