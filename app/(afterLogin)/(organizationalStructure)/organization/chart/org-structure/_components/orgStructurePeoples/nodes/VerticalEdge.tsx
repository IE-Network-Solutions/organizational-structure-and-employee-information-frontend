'use client';

import React from 'react';
import { BaseEdge, type EdgeProps } from '@xyflow/react';

/**
 * Renders a strictly vertical line so top-level connector lines are
 * straight downward with no slant. Uses one X for the whole path.
 */
export function VerticalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  ...rest
}: EdgeProps) {
  const x = (sourceX + targetX) / 2;
  const path = `M ${x} ${sourceY} L ${x} ${targetY}`;

  return <BaseEdge id={id} path={path} {...rest} />;
}
