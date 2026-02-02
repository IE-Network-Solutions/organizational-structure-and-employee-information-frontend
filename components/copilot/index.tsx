'use client';

import React from 'react';
import CopilotButton from './CopilotButton';
import { useCopilotStore } from '@/store/uistate/features/copilot';

/**
 * Copilot - Header button that opens the full Copilot module overlay
 *
 * On click, opens Copilot as a full-width overlay (replaces main content).
 * No route change; sidebar remains visible.
 */
const Copilot: React.FC = () => {
  const { isOpen, setIsOpen } = useCopilotStore();

  return (
    <CopilotButton onClick={() => setIsOpen(true)} isActive={isOpen} />
  );
};

export default Copilot;
