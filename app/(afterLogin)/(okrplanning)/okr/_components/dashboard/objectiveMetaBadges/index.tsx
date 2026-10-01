'use client';

import React from 'react';

const metaBadgeClass =
  'inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border border-gray-200 text-gray-600 bg-white whitespace-nowrap';

interface ObjectiveMetaBadgesProps {
  objective?: {
    id?: string;
    title?: string;
    objectiveTypeId?: string | null;
    bscPillarId?: string | null;
  };
}

/** Prototype: always show mock Type + BSC badges on objective cards. */
const ObjectiveMetaBadges: React.FC<ObjectiveMetaBadgesProps> = ({
  objective,
}) => {
  const id = objective?.id ?? 'mock';

  return (
    <>
      <span
        className={metaBadgeClass}
        title="Objective type"
        data-cy={`okr-objective-type-badge-${id}`}
      >
        Business
      </span>
      <span
        className={metaBadgeClass}
        title="BSC pillar"
        data-cy={`okr-objective-bsc-badge-${id}`}
      >
        Financial
      </span>
    </>
  );
};

export default ObjectiveMetaBadges;
