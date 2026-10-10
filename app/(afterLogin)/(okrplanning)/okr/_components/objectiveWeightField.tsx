'use client';
import React from 'react';
import { Form, InputNumber } from 'antd';
import { useGetObjectiveTypeWeightAllocation } from '@/store/server/features/okrplanning/okr/objective/queries';

interface ObjectiveWeightFieldProps {
  /** Owner of the objective (allocation is per user and session). */
  userId?: string;
  objectiveTypeId?: string | null;
  /** Weight of the selected objective type (e.g. Strategic 20). */
  typeWeight?: number;
  /** When editing: the objective as saved, so its own weight is not counted twice. */
  editing?: {
    objectiveTypeId?: string | null;
    weight?: number | string | null;
  };
  onChange: (value: number | null) => void;
}

/**
 * Type-weighted objective weight: this objective's share of its type weight.
 * Objectives of one type may not exceed that type's weight together
 * (e.g. Strategic 20% split 15 + 5); the backend enforces the same rule.
 */
const ObjectiveWeightField: React.FC<ObjectiveWeightFieldProps> = ({
  userId,
  objectiveTypeId,
  typeWeight,
  editing,
  onChange,
}) => {
  const { data: allocation } = useGetObjectiveTypeWeightAllocation(userId);

  const line = allocation?.find(
    (item) => item.objectiveTypeId === objectiveTypeId,
  );
  // Editing within the same type: this objective's saved weight is already
  // counted as allocated, so give it back to the available amount.
  const ownWeight =
    editing && editing.objectiveTypeId === objectiveTypeId
      ? Number(editing.weight) || 0
      : 0;
  // Total follows the Type weight field shown above (same source); only what
  // is already allocated comes from the allocation endpoint.
  const totalTypeWeight = typeWeight ?? line?.typeWeight;
  const available =
    line != null && totalTypeWeight !== undefined
      ? Math.max(
          0,
          Math.round((totalTypeWeight - line.allocated + ownWeight) * 100) /
            100,
        )
      : undefined;

  const helper = !objectiveTypeId
    ? 'Select an objective type first.'
    : available === undefined
      ? undefined
      : `Available: ${available}% of ${line?.name ?? 'this type'} (${totalTypeWeight}% total)`;

  return (
    <Form.Item
      id="okr-objective-weight"
      data-cy="okr-objective-weight"
      name="weight"
      label="Objective weight"
      extra={helper}
      className="mb-2"
      rules={[
        { required: true, message: 'Please enter the objective weight' },
        {
          validator: (rule, value) => {
            if (value === undefined || value === null || value === '') {
              return Promise.resolve();
            }
            const weight = Number(value);
            if (!(weight > 0)) {
              return Promise.reject(
                new Error('Objective weight must be greater than 0'),
              );
            }
            if (available !== undefined && weight > available) {
              return Promise.reject(
                new Error(`Only ${available}% of this objective type is left`),
              );
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      <InputNumber
        data-cy="okr-objective-weight-input"
        className="w-full"
        min={0.01}
        max={100}
        step={1}
        precision={2}
        addonAfter="%"
        disabled={!objectiveTypeId}
        placeholder={available !== undefined ? `Up to ${available}` : 'Weight'}
        onChange={(value) => onChange(value === null ? null : Number(value))}
      />
    </Form.Item>
  );
};

export default ObjectiveWeightField;
