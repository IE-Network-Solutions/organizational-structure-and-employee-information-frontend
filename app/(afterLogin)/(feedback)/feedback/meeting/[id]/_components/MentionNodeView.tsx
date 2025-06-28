// components/MentionNodeView.tsx
import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Avatar } from 'antd';

export default function MentionNodeView({ node }: any) {
  const { label, profileImage } = node.attrs;

  return (
    <NodeViewWrapper
      as="span"
      className="mention inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
    >
      <Avatar size={20} src={profileImage} alt={label} />
      <span>{label}</span>
    </NodeViewWrapper>
  );
}
