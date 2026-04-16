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
      className={`p-2 mb-2 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing ${getTeamColor(
        index,
      )} ${isDragging ? 'shadow-lg' : 'shadow-sm'}`}
      data-cy={`merge-available-team-${department.id}`}
    >
      <p
        className="text-sm text-gray-500 m-0 truncate"
        data-cy={`merge-available-team-name-${department.id}`}
      >
        {department.name}
      </p>
    </div>
  );
};

export default DraggableTeamItem;
