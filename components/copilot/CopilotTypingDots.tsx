'use client';

import React from 'react';

export type CopilotTypingDotsProps = {
  /** `dark` — black dots (generating pill next to AI avatar). */
  variant?: 'muted' | 'dark';
};

/** Three-dot “generating” indicator (no spinner). */
const CopilotTypingDots: React.FC<CopilotTypingDotsProps> = ({
  variant = 'muted',
}) => (
  <span
    className={`copilot-typing-dots${variant === 'dark' ? ' copilot-typing-dots--dark' : ''}`}
    role="status"
    aria-live="polite"
    aria-label="Generating response"
    id="copilot-typing-dots"
    data-cy="copilot-typing-dots"
  >
    <span className="copilot-typing-dots__dot" />
    <span className="copilot-typing-dots__dot" />
    <span className="copilot-typing-dots__dot" />
  </span>
);

export default CopilotTypingDots;
