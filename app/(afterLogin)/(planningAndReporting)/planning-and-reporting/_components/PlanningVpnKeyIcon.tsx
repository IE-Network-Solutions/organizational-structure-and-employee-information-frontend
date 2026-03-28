'use client';

import VpnKey from '@mui/icons-material/VpnKey';
import { PR_PRIMARY } from './planningUiTokens';

/** Layout from design (Material `vpn_key`): width 18, height 10.5, top 3.75px, 0° rotation, opacity 1. */
const GLYPH_W = 18;
const GLYPH_H = 10.5;
const GLYPH_TOP = 3.75;

export type PlanningVpnKeyIconProps = {
  className?: string;
  'data-cy'?: string;
  /** MUI `color` on the SVG (default planning primary). Use `currentColor` with Tailwind `text-*` on `className`. */
  color?: string;
  /** Square box edge in px; glyph scales proportionally (default 18). */
  size?: number;
};

export function PlanningVpnKeyIcon({
  className = '',
  'data-cy': dataCy,
  color = PR_PRIMARY,
  size = 18,
}: PlanningVpnKeyIconProps) {
  const scale = size / GLYPH_W;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center leading-none ${className}`}
      data-cy={dataCy}
      aria-hidden
      style={{ width: size, height: size }}
    >
      <VpnKey
        sx={{
          width: GLYPH_W * scale,
          height: GLYPH_H * scale,
          position: 'relative',
          top: GLYPH_TOP * scale,
          opacity: 1,
          color,
          transform: 'none',
        }}
      />
    </span>
  );
}
