'use client';

import React, { useEffect } from 'react';
import { useReactFlow, useViewport } from '@xyflow/react';
import useDepartmentStore from '@/store/uistate/features/organizationStructure/orgState/departmentStates';

/**
 * Must be rendered inside <ReactFlow>. When the department users modal is open,
 * converts the stored flow position to screen position using the current viewport
 * so the modal card sticks to the department node when the chart is panned or zoomed.
 */
export function DepartmentUsersModalPositionBridge() {
  const { flowToScreenPosition } = useReactFlow();
  const viewport = useViewport();
  const usersModalOpen = useDepartmentStore((s) => s.usersModalOpen);
  const usersModalFlowPosition = useDepartmentStore(
    (s) => s.usersModalFlowPosition,
  );
  const setUsersModalScreenPosition = useDepartmentStore(
    (s) => s.setUsersModalScreenPosition,
  );

  useEffect(() => {
    if (!usersModalOpen || !usersModalFlowPosition) return;
    const screen = flowToScreenPosition(usersModalFlowPosition);
    setUsersModalScreenPosition({ top: screen.y, left: screen.x });
  }, [
    usersModalOpen,
    usersModalFlowPosition,
    viewport.x,
    viewport.y,
    viewport.zoom,
    flowToScreenPosition,
    setUsersModalScreenPosition,
  ]);

  return null;
}
