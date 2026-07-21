'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import CopilotButton from './CopilotButton';

/**
 * Copilot - Header button that routes to the Copilot page
 *
 * On click, navigates to `/copilot` inside the authenticated app shell.
 */
const Copilot: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === '/copilot';

  return (
    <CopilotButton
      onClick={() => {
        if (!isActive) router.push('/copilot');
      }}
      isActive={isActive}
    />
  );
};

export default Copilot;
