'use client';

import React from 'react';
import { useObjectiveTypesStore } from '@/store/uistate/features/okrplanning/okrSetting/objectiveTypesStore';
import { useObjectiveTypeAllocationStore } from '@/store/uistate/features/okrplanning/okrSetting/objectiveTypeAllocationStore';
import { BSC_PILLARS } from '../../../_constants/bscPillars';

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

/**
 * Prototype badges: prefer allocation + catalog type name / BSC pillar.
 * Falls back to mock labels only when no allocation or catalog match exists.
 */
const ObjectiveMetaBadges: React.FC<ObjectiveMetaBadgesProps> = ({
  objective,
}) => {
  const id = objective?.id ?? 'mock';
  const types = useObjectiveTypesStore((s) => s.types);
  const getAllocationForObjective = useObjectiveTypeAllocationStore(
    (s) => s.getAllocationForObjective,
  );
  const allocations = useObjectiveTypeAllocationStore((s) => s.allocations);
  void allocations;

  const allocation = getAllocationForObjective(objective?.id, objective?.title);

  const typeId =
    allocation?.objectiveTypeId || objective?.objectiveTypeId || null;
  const bscId = allocation?.bscPillarId || objective?.bscPillarId || null;

  const type = types.find((t) => t.id === typeId);
  const pillar = BSC_PILLARS.find((p) => p.id === bscId);

  const typeLabel = type?.name || (typeId ? 'Type' : 'Business');
  const bscLabel = pillar?.name || (bscId ? 'BSC' : 'Financial');
  const showStrategicBadge =
    Boolean(type?.isStrategic) && !/strategic/i.test(String(typeLabel));

  return (
    <>
      <span
        className={metaBadgeClass}
        title="Objective type"
        data-cy={`okr-objective-type-badge-${id}`}
      >
        {typeLabel}
      </span>
      {showStrategicBadge ? (
        <span
          className={metaBadgeClass}
          title="Strategic objective"
          data-cy={`okr-objective-strategic-badge-${id}`}
        >
          Strategic
        </span>
      ) : null}
      <span
        className={metaBadgeClass}
        title="BSC pillar"
        data-cy={`okr-objective-bsc-badge-${id}`}
      >
        {bscLabel}
      </span>
    </>
  );
};

export default ObjectiveMetaBadges;
