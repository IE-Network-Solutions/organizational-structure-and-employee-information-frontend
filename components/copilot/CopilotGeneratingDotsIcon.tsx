'use client';

import React from 'react';

type CopilotGeneratingDotsIconProps = {
  className?: string;
};

const CopilotGeneratingDotsIcon: React.FC<CopilotGeneratingDotsIconProps> = ({
  className = '',
}) => {
  return (
    <span
      className={`copilot-generating-dots${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Generating response"
      data-cy="copilot-generating-dots"
    >
      <span
        className="copilot-generating-dots__dot"
        data-cy="copilot-generating-dots-dot-1"
      />
      <span
        className="copilot-generating-dots__dot"
        data-cy="copilot-generating-dots-dot-2"
      />
      <span
        className="copilot-generating-dots__dot"
        data-cy="copilot-generating-dots-dot-3"
      />
    </span>
  );
};

export default CopilotGeneratingDotsIcon;

