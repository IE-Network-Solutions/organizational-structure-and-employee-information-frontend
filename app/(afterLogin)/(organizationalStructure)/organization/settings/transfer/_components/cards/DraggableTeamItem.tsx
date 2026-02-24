'use client';
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Department } from './TeamCard';

interface DraggableTeamItemProps {
  department: Department;
  index: number;
  getTeamColor: (index: number) => string;
}

const DraggableTeamItem: React.FC<DraggableTeamItemProps> = ({
  department,
  index,
  getTeamColor,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: department.id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 mb-2 rounded-lg border cursor-grab active:cursor-grabbing ${getTeamColor(
        index,
      )} ${isDragging ? 'shadow-lg' : 'shadow-sm'}`}
      data-cy={`transfer-available-team-${department.id}`}
    >
      <p className="font-medium text-xs text-gray-900 m-0 truncate"
      id="transfer-draggable-team-item-p"
      data-cy="transfer-draggable-team-item-p"
      >
        {department.name}
      </p>
    </div>
  );
};

export default DraggableTeamItem;
