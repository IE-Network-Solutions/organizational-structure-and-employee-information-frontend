'use client';

import AttendancePhotoCaptureModal from '@/components/common/attendancePhotoCaptureModal';
import { useRemoteAttendanceCamera } from '@/hooks/useRemoteAttendanceCamera';

/** Single camera capture modal for all remote attendance actions in my-timesheet */
const RemoteAttendanceCameraModals = () => {
  const {
    showCameraCapture,
    handlePhotoCaptured,
    handlePhotoCaptureClose,
  } = useRemoteAttendanceCamera();

  return (
    <AttendancePhotoCaptureModal
      open={showCameraCapture}
      onClose={handlePhotoCaptureClose}
      onCaptureComplete={handlePhotoCaptured}
    />
  );
};

export default RemoteAttendanceCameraModals;
