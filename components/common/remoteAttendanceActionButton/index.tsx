'use client';

import React from 'react';
import { RemoteAttendanceAction } from '@/store/uistate/features/timesheet/remoteAttendanceCamera';
import { useRemoteAttendanceCameraStore } from '@/store/uistate/features/timesheet/remoteAttendanceCamera';
import { useRemoteAttendanceCamera } from '@/hooks/useRemoteAttendanceCamera';

interface RemoteAttendanceActionButtonProps {
  action: RemoteAttendanceAction;
  children: React.ReactElement;
}

/**
 * Wraps a check-in/check-out trigger. Confirmation + capture modals render once
 * in my-timesheet layout via RemoteAttendanceCameraModals, anchored to this button.
 */
const RemoteAttendanceActionButton: React.FC<
  RemoteAttendanceActionButtonProps
> = ({ action, children }) => {
  const { startAttendanceWithCamera } = useRemoteAttendanceCamera();
  const setConfirmAnchorFromElement = useRemoteAttendanceCameraStore(
    (s) => s.setConfirmAnchorFromElement,
  );

  const child = React.Children.only(children);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const anchor =
      (e.currentTarget as HTMLElement).closest('button') ??
      (e.currentTarget as HTMLElement);
    setConfirmAnchorFromElement(anchor);
    startAttendanceWithCamera(action);
    child.props.onClick?.(e);
  };

  return React.cloneElement(child, { onClick: handleClick });
};

export default RemoteAttendanceActionButton;
