'use client';

import { useRef, useCallback } from 'react';
import { useSetCurrentAttendance } from '@/store/server/features/timesheet/attendance/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  RemoteAttendanceAction,
  useRemoteAttendanceCameraStore,
} from '@/store/uistate/features/timesheet/remoteAttendanceCamera';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import NotificationMessage from '@/components/common/notification/notificationMessage';

export function useRemoteAttendanceCamera() {
  const isConfirmingCameraRef = useRef(false);
  const { userId } = useAuthenticationStore();
  const { mutate: setCurrentAttendanceMutation, isLoading } =
    useSetCurrentAttendance();
  const { setIsShowCheckOutSidebar } = useMyTimesheetStore();

  const {
    pendingAction,
    showCameraConfirm,
    showCameraCapture,
    pendingCoords,
    setPendingAction,
    setShowCameraConfirm,
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
    (
      action: RemoteAttendanceAction,
      file: string,
      position: GeolocationPosition,
    ) => {
      setCurrentAttendanceMutation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        isSignIn: action.isSignIn,
        userId: userId ?? '',
        file,
        ...(action.breakTypeId ? { breakTypeId: action.breakTypeId } : {}),
      });
      resetCameraFlow();
      setCapturedAttendancePhotoUrl(null);
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
      setShowCameraConfirm(true);
    },
    [setPendingAction, setShowCameraConfirm],
  );

  const handleCameraConfirm = useCallback(() => {
    isConfirmingCameraRef.current = true;
    setShowCameraConfirm(false);
    setShowCameraCapture(true);
    setPendingCoords(null);
    getCoords((pos) =>
      setPendingCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }),
    );
  }, [
    getCoords,
    setShowCameraConfirm,
    setShowCameraCapture,
    setPendingCoords,
  ]);

  const handleCameraConfirmCancel = useCallback(() => {
    if (isConfirmingCameraRef.current) {
      isConfirmingCameraRef.current = false;
      return;
    }
    setShowCameraConfirm(false);
    setPendingAction(null);
  }, [setShowCameraConfirm, setPendingAction]);

  const handlePhotoCaptured = useCallback(
    (fileUrl: string) => {
      setShowCameraCapture(false);

      const action = useRemoteAttendanceCameraStore.getState().pendingAction;
      if (!action) {
        resetCameraFlow();
        return;
      }

      const submit = (coords: { latitude: number; longitude: number }) => {
        const position = {
          coords: { latitude: coords.latitude, longitude: coords.longitude },
        } as GeolocationPosition;

        if (action.openBreakCheckOutSidebarAfterCapture) {
          setCapturedAttendancePhotoUrl(fileUrl);
          setIsShowCheckOutSidebar(true);
          resetCameraFlow();
          return;
        }

        submitAttendance(action, fileUrl, position);
      };

      const coords =
        useRemoteAttendanceCameraStore.getState().pendingCoords;
      if (coords) {
        submit(coords);
        return;
      }

      getCoords((pos) =>
        submit({
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
    showCameraConfirm,
    showCameraCapture,
    isLoading,
    startAttendanceWithCamera,
    handleCameraConfirm,
    handleCameraConfirmCancel,
    handlePhotoCaptured,
    handlePhotoCaptureClose,
  };
}
