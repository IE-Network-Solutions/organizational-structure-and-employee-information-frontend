'use client';

import React, { useState } from 'react';
import CopilotButton from './CopilotButton';
import CopilotPanel from './CopilotPanel';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

/**
 * Copilot - Main entry component
 * 
 * Integrates the Copilot button and panel into the application.
 * Manages the open/close state and provides user context.
 * 
 * Usage:
 * <Copilot />
 */
const Copilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userId } = useAuthenticationStore();
  const { data: employeeData } = useGetEmployee(userId);

  const userInitials =
    employeeData?.firstName?.[0]?.toUpperCase() ||
    employeeData?.lastName?.[0]?.toUpperCase() ||
    'U';

  return (
    <>
      <CopilotButton onClick={() => setIsOpen(true)} />
      <CopilotPanel
        open={isOpen}
        onClose={() => setIsOpen(false)}
        userInitials={userInitials}
      />
    </>
  );
};

export default Copilot;
