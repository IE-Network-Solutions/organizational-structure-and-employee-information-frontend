'use client';

import { useCallback } from 'react';
import { useSetCurrentAttendance } from '@/store/server/features/timesheet/attendance/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  RemoteAttendanceAction,
  useRemoteAttendanceCameraStore,
} from '@/store/uistate/features/timesheet/remoteAttendanceCamera';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import NotificationMessage from '@/components/common/notification/notificationMessage';

export function useRemoteAttendanceCamera() {
  const { userId } = useAuthenticationStore();
  const { mutateAsync: setCurrentAttendanceMutation } =
    useSetCurrentAttendance();
  const { setIsShowCheckOutSidebar } = useMyTimesheetStore();

  const {
    pendingAction,
    showCameraCapture,
    setPendingAction,
    setShowCameraCapture,
    setPendingCoords,
    setCapturedAttendancePhotoUrl,
    resetCameraFlow,
  } = useRemoteAttendanceCameraStore();

  const getCoords = useCallback(
    (callback: (position: GeolocationPosition) => void) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback, () => {
          NotificationMessage.error({
            message: 'No access to geolocation',
            description:
              'To check-in/check-out we need to have access to geolocation.',
          });
        });
      } else {
        NotificationMessage.error({
          message: 'No access to geolocation',
          description:
            'To check-in/check-out we need to have access to geolocation.',
        });
      }
    },
    [],
  );

  const submitAttendance = useCallback(
    async (
      action: RemoteAttendanceAction,
      file: string,
      position: GeolocationPosition,
    ) => {
      if (!userId) {
        NotificationMessage.error({
          message: 'Unable to submit attendance',
          description:
            'Your session is missing user information. Please log in and try again.',
        });
        return;
      }

      try {
        await setCurrentAttendanceMutation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isSignIn: action.isSignIn,
          userId,
          file,
          ...(action.breakTypeId ? { breakTypeId: action.breakTypeId } : {}),
        });
        resetCameraFlow();
        setCapturedAttendancePhotoUrl(null);
      } catch {
        // Keep pendingAction / pendingCoords so the user can retry after failure.
      }
    },
    [
      setCurrentAttendanceMutation,
      userId,
      resetCameraFlow,
      setCapturedAttendancePhotoUrl,
    ],
  );

  const startAttendanceWithCamera = useCallback(
    (action: RemoteAttendanceAction) => {
      setPendingAction(action);
      setShowCameraCapture(true);
      setPendingCoords(null);
      getCoords((pos) =>
        setPendingCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      );
    },
    [getCoords, setPendingAction, setShowCameraCapture, setPendingCoords],
  );

  const handlePhotoCaptured = useCallback(
    (fileUrl: string) => {
      setShowCameraCapture(false);

      const action = useRemoteAttendanceCameraStore.getState().pendingAction;
      if (!action) {
        resetCameraFlow();
        return;
      }

      const submit = async (coords: {
        latitude: number;
        longitude: number;
      }) => {
        const position = {
          coords: { latitude: coords.latitude, longitude: coords.longitude },
        } as GeolocationPosition;

        if (action.openBreakCheckOutSidebarAfterCapture) {
          setCapturedAttendancePhotoUrl(fileUrl);
          setIsShowCheckOutSidebar(true);
          resetCameraFlow();
          return;
        }

        await submitAttendance(action, fileUrl, position);
      };

      const coords = useRemoteAttendanceCameraStore.getState().pendingCoords;
      if (coords) {
        void submit(coords);
        return;
      }

      getCoords(
        (pos) =>
          void submit({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
      );
    },
    [
      setShowCameraCapture,
      getCoords,
      submitAttendance,
      setCapturedAttendancePhotoUrl,
      setIsShowCheckOutSidebar,
      resetCameraFlow,
    ],
  );

  const handlePhotoCaptureClose = useCallback(() => {
    setShowCameraCapture(false);
    setPendingCoords(null);
    setPendingAction(null);
  }, [setShowCameraCapture, setPendingCoords, setPendingAction]);

  return {
    pendingAction,
    showCameraCapture,
    startAttendanceWithCamera,
    handlePhotoCaptured,
    handlePhotoCaptureClose,
  };
}
