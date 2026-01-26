'use client';

import React from 'react';

/**
 * CopilotIcon - Colorful gradient ribbon/loop icon
 * 
 * Represents the AI/Copilot concept with a fluid, connected ribbon design.
 * Uses a gradient from blue/teal through green, yellow, orange to pink/purple.
 * Creates a continuous, looping ribbon effect that suggests intelligence and connection.
 */
const CopilotIcon: React.FC<{ size?: number }> = ({ size = 20 }) => {
  // Generate unique gradient ID to avoid conflicts if multiple instances
  const gradientId = `copilot-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" /> {/* Blue */}
          <stop offset="20%" stopColor="#06B6D4" /> {/* Teal/Cyan */}
          <stop offset="40%" stopColor="#10B981" /> {/* Green */}
          <stop offset="60%" stopColor="#F59E0B" /> {/* Yellow/Orange */}
          <stop offset="80%" stopColor="#F97316" /> {/* Orange */}
          <stop offset="100%" stopColor="#EC4899" /> {/* Pink */}
        </linearGradient>
      </defs>
      {/* Continuous flowing ribbon - smooth curves */}
      <path
        d="M4 8C4 6 6 4 8 4C10 4 12 6 12 8C12 10 14 12 16 12C18 12 20 14 20 16C20 18 18 20 16 20C14 20 12 18 12 16"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12 8C12 10 10 12 8 12C6 12 4 14 4 16C4 18 6 20 8 20C10 20 12 18 12 16"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.75"
      />
      <path
        d="M20 16C20 18 18 20 16 20C14 20 12 18 12 16C12 14 14 12 16 12C18 12 20 14 20 16Z"
        fill={`url(#${gradientId})`}
        opacity="0.25"
      />
    </svg>
  );
};

export default CopilotIcon;
