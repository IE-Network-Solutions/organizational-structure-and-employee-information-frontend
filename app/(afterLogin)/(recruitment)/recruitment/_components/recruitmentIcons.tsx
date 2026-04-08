/* eslint-disable local-rules/data-cy-required */
import React from 'react';

type IconProps = { className?: string; 'aria-hidden'?: boolean };

/** Thin grey chevron for TA selects (filter + change job status modals) */
export const TalentAcqSelectChevronSuffix = (
  <span
    className="inline-flex items-center justify-center pointer-events-none text-[#9CA3AF]"
    data-cy="talent-acquisition-select-chevron-suffix"
    aria-hidden
  >
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.5 1.5L6 6L10.5 1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

/** Add Job — document + corner plus (design SVG, white fill on blue button) */
export const AddJobButtonIcon: React.FC<IconProps> = ({
  className,
  'aria-hidden': ariaHidden = true,
}) => (
  <svg
    className={className}
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={ariaHidden}
  >
    <path
      d="M10.5 12.915H1.5V3.75H6.75V2.25H1.5C0.675 2.25 0 2.925 0 3.75V12.75C0 13.575 0.675 14.25 1.5 14.25H10.5C11.325 14.25 12 13.575 12 12.75V7.5H10.5V12.915Z"
      fill="white"
    />
    <path
      d="M12 0H10.5V2.25H8.25C8.2575 2.2575 8.25 3.75 8.25 3.75H10.5V5.9925C10.5075 6 12 5.9925 12 5.9925V3.75H14.25V2.25H12V0Z"
      fill="white"
    />
    <path d="M9 5.25H3V6.75H9V5.25Z" fill="white" />
    <path d="M3 7.5V9H9V7.5H6.75H3Z" fill="white" />
    <path d="M9 9.75H3V11.25H9V9.75Z" fill="white" />
  </svg>
);

/** Job card ⋮ menu — change status (circular sync + check, matches design) */
export const JobMenuChangeStatusIcon: React.FC<IconProps> = ({
  className,
  'aria-hidden': ariaHidden = true,
}) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={ariaHidden}
  >
    <path
      d="M10.2 2.55A6.1 6.1 0 0115.45 9"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
    />
    <path
      d="M14.85 3v4.2h-3.9"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.8 15.45A6.1 6.1 0 012.55 9"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
    />
    <path
      d="M3.15 15v-4.2h3.9"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.75 9.35L9 10.6l2.65-2.9"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Job card ⋮ menu — delete (outline trash) */
export const JobMenuDeleteIcon: React.FC<IconProps> = ({
  className,
  'aria-hidden': ariaHidden = true,
}) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={ariaHidden}
  >
    <path
      d="M6.75 3.75V2.25a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 011.5 1.5v1.5M3 4.5h12M13.5 4.5v9a1.5 1.5 0 01-1.5 1.5h-6a1.5 1.5 0 01-1.5-1.5v-9M7.5 8.25v4.5M10.5 8.25v4.5"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** TA Jobs filter button icon (design SVG) */
export const FunnelFilterIcon: React.FC<IconProps> = ({
  className,
  'aria-hidden': ariaHidden = true,
}) => (
  <svg
    className={className}
    width="11"
    height="11"
    viewBox="0 0 11 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={ariaHidden}
  >
    <path
      d="M1.9744 1.33333H8.64107L5.30107 5.53333L1.9744 1.33333ZM0.141069 1.07333C1.48774 2.8 3.9744 6 3.9744 6V10C3.9744 10.3667 4.2744 10.6667 4.64107 10.6667H5.9744C6.34107 10.6667 6.64107 10.3667 6.64107 10V6C6.64107 6 9.12107 2.8 10.4677 1.07333C10.8077 0.633333 10.4944 0 9.94107 0H0.667736C0.114403 0 -0.198931 0.633333 0.141069 1.07333Z"
      fill="#374151"
    />
  </svg>
);

/** Job card share control (design SVG) */
export const ShareNetworkIcon: React.FC<IconProps> = ({
  className,
  'aria-hidden': ariaHidden = true,
}) => (
  <svg
    className={className}
    width="12"
    height="14"
    viewBox="0 0 12 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={ariaHidden}
  >
    <path
      d="M10 9.38667C9.49333 9.38667 9.04 9.58667 8.69333 9.9L3.94 7.13333C3.97333 6.98 4 6.82667 4 6.66667C4 6.50667 3.97333 6.35333 3.94 6.2L8.64 3.46C9 3.79333 9.47333 4 10 4C11.1067 4 12 3.10667 12 2C12 0.893333 11.1067 0 10 0C8.89333 0 8 0.893333 8 2C8 2.16 8.02667 2.31333 8.06 2.46667L3.36 5.20667C3 4.87333 2.52667 4.66667 2 4.66667C0.893333 4.66667 0 5.56 0 6.66667C0 7.77333 0.893333 8.66667 2 8.66667C2.52667 8.66667 3 8.46 3.36 8.12667L8.10667 10.9C8.07333 11.04 8.05333 11.1867 8.05333 11.3333C8.05333 12.4067 8.92667 13.28 10 13.28C11.0733 13.28 11.9467 12.4067 11.9467 11.3333C11.9467 10.26 11.0733 9.38667 10 9.38667Z"
      fill="black"
    />
  </svg>
);

/** Simple analog clock for “Created …” row */
export const ClockAnalogIcon: React.FC<IconProps> = ({
  className,
  'aria-hidden': ariaHidden = true,
}) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={ariaHidden}
  >
    <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.25" />
    <path
      d="M8 4.75V8L10.25 10.25"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Calendar outline for footer deadline */
export const CalendarOutlineIcon: React.FC<IconProps> = ({
  className,
  'aria-hidden': ariaHidden = true,
}) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={ariaHidden}
  >
    <rect
      x="2.5"
      y="3.5"
      width="11"
      height="10"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.25"
    />
    <path
      d="M5 2V5M11 2V5"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path d="M2.5 6.5H13.5" stroke="currentColor" strokeWidth="1.25" />
  </svg>
);
