'use client';

import AttendancePhotoCaptureModal from '@/components/common/attendancePhotoCaptureModal';
import CameraAttendanceConfirmationModal from '@/components/common/cameraAttendanceConfirmationModal';
import { useRemoteAttendanceCamera } from '@/hooks/useRemoteAttendanceCamera';
import { useRemoteAttendanceCameraStore } from '@/store/uistate/features/timesheet/remoteAttendanceCamera';

/** Single confirmation + capture modals for all remote attendance actions in my-timesheet */
const RemoteAttendanceCameraModals = () => {
  const confirmAnchorRect = useRemoteAttendanceCameraStore(
    (s) => s.confirmAnchorRect,
  );
  const {
    showCameraConfirm,
    showCameraCapture,
    handleCameraConfirm,
    handleCameraConfirmCancel,
    handlePhotoCaptured,
    handlePhotoCaptureClose,
  } = useRemoteAttendanceCamera();

  return (
    <>
      <CameraAttendanceConfirmationModal
        open={showCameraConfirm}
        anchorRect={confirmAnchorRect}
        onConfirm={handleCameraConfirm}
        onCancel={handleCameraConfirmCancel}
      />
      <AttendancePhotoCaptureModal
        open={showCameraCapture}
        onClose={handlePhotoCaptureClose}
        onCaptureComplete={handlePhotoCaptured}
      />
    </>
  );
};

export default RemoteAttendanceCameraModals;
