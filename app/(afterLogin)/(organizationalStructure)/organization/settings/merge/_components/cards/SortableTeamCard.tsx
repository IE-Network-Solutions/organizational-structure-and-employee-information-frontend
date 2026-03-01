'use client';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TeamCard, { Department } from './TeamCard';

interface SortableTeamCardProps {
  department: Department;
  onRemove?: () => void;
}

const SortableTeamCard: React.FC<SortableTeamCardProps> = ({
  department,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: department.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-cy={`merge-sortable-team-card-${department.id}`}
    >
      <TeamCard
        department={department}
        isDragging={isDragging}
        onRemove={onRemove}
      />
    </div>
  );
};

export default SortableTeamCard;
