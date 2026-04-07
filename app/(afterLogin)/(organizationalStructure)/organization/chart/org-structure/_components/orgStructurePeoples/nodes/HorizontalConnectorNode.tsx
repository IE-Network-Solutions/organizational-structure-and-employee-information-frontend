'use client';

import React from 'react';
import { type NodeProps, Handle, Position } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import type { HorizontalConnectorNodeData } from '../layout';

type HorizontalConnectorNode = Node<
  HorizontalConnectorNodeData,
  'horizontalConnector'
>;

/**
 * Renders a single horizontal line with one target (top center) and multiple
 * source handles (bottom) at child offsets. Parent connects to top; each
 * child connects from one of the bottom handles so the chart shows one
 * straight line per level, then verticals to each branch.
 */
export function HorizontalConnectorNode(
  props: NodeProps<HorizontalConnectorNode>,
) {
  const { data } = props;
  if (!data) return null;

  const { width, childOffsets, parentHandleOffset } = data;
  const safeWidth = Math.max(1, width ?? 0);
  const topHandleLeft =
    parentHandleOffset != null ? parentHandleOffset : safeWidth / 2;

  return (
    <div
      className="relative h-5"
      style={{ width: safeWidth }}
      data-cy="org-structure-horizontal-connector"
    >
      {/* Parent connects here (at parent's X) so vertical line stays straight */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-2 !h-2 !border-2 !border-[#CBD5E0] !bg-white"
        style={{ left: topHandleLeft, transform: 'translateX(-50%)' }}
      />

      {/* One straight horizontal line - light gray to match vertical connectors */}
      <div
        className="absolute left-0 right-0 top-1/2 -mt-px h-0.5 bg-[#E5E7EB]"
        data-cy="org-structure-horizontal-connector-line"
      />

      {/* Source handle per child - same X as each child for straight-down lines */}
      {childOffsets.map((offset, i) => (
        <Handle
          key={i}
          type="source"
          position={Position.Bottom}
          id={String(i)}
          className="!w-2 !h-2 !border-2 !border-[#CBD5E0] !bg-white"
          style={{ left: offset, transform: 'translateX(-50%)' }}
        />
      ))}
    </div>
  );
}
