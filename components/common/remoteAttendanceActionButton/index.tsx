'use client';

import React from 'react';
import { RemoteAttendanceAction } from '@/store/uistate/features/timesheet/remoteAttendanceCamera';
import { useRemoteAttendanceCamera } from '@/hooks/useRemoteAttendanceCamera';

interface RemoteAttendanceActionButtonProps {
  action: RemoteAttendanceAction;
  children: React.ReactElement;
}

/**
 * Wraps a check-in/check-out trigger. The capture modal renders once in
 * my-timesheet layout via RemoteAttendanceCameraModals.
 */
const RemoteAttendanceActionButton: React.FC<
  RemoteAttendanceActionButtonProps
> = ({ action, children }) => {
  const { startAttendanceWithCamera } = useRemoteAttendanceCamera();

  const child = React.Children.only(children);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    startAttendanceWithCamera(action);
    child.props.onClick?.(e);
  };

  return React.cloneElement(child, { onClick: handleClick });
};

export default RemoteAttendanceActionButton;
