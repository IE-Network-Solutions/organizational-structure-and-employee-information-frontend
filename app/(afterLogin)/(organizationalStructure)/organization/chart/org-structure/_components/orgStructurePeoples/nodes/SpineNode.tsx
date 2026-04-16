'use client';

import React from 'react';
import { type NodeProps, Handle, Position } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import type { SpineNodeData } from '../layout';

type SpineNode = Node<SpineNodeData, 'spine'>;

/**
 * Spine node at the "bend" where parent curves into the vertical stack.
 * Parent connects to top; spine connects to each stacked leaf from bottom.
 * Renders as a tiny transparent circle so only the edges are visible.
 */
export function SpineNode(props: NodeProps<SpineNode>) {
  void props;
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !border-2 !border-[#cbd5e0] !bg-white"
      />
      <div
        className="w-1 h-1 rounded-full bg-transparent"
        data-cy="org-structure-spine-node"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !border-2 !border-[#cbd5e0] !bg-white"
      />
    </>
  );
}
