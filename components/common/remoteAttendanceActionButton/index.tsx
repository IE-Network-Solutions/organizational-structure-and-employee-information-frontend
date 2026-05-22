'use client';

import React from 'react';
import CameraAttendanceConfirmationModal from '@/components/common/cameraAttendanceConfirmationModal';
import { RemoteAttendanceAction } from '@/store/uistate/features/timesheet/remoteAttendanceCamera';
import { useRemoteAttendanceCamera } from '@/hooks/useRemoteAttendanceCamera';

interface RemoteAttendanceActionButtonProps {
  action: RemoteAttendanceAction;
  children: React.ReactElement;
}

/**
 * Wraps a check-in/check-out trigger with the camera confirmation popover.
 * Photo capture modal is rendered once in my-timesheet layout.
 */
const RemoteAttendanceActionButton: React.FC<
  RemoteAttendanceActionButtonProps
> = ({ action, children }) => {
  const {
    showCameraConfirm,
    startAttendanceWithCamera,
    handleCameraConfirm,
    handleCameraConfirmCancel,
  } = useRemoteAttendanceCamera();

  const child = React.Children.only(children);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    startAttendanceWithCamera(action);
    child.props.onClick?.(e);
  };

  return (
    <CameraAttendanceConfirmationModal
      open={showCameraConfirm}
      onConfirm={handleCameraConfirm}
      onCancel={handleCameraConfirmCancel}
    >
      {React.cloneElement(child, { onClick: handleClick })}
    </CameraAttendanceConfirmationModal>
  );
};

export default RemoteAttendanceActionButton;
