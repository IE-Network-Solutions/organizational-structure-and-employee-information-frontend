'use client';

/* eslint-disable local-rules/data-cy-required */

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, InputNumber, Modal, Select, Tag } from 'antd';
import {
  calculateTotalWeight,
  distributeEvenly,
  roundWeight,
} from '../weightUtils';
import { useGetOkrObjectiveTypes } from '@/store/server/features/okrplanning/okr-objective-type/queries';
import { useUpsertObjectiveTypeWeights } from '@/store/server/features/okrplanning/okr-objective-type-weight/mutations';
import {
  OkrObjectiveTypeWeightAssignment,
  OkrWeightScopeType,
} from '@/store/server/features/okrplanning/okr-objective-type-weight/interface';

type ScopeOption = {
  value: string;
  label: string;
};

type WeightAssignmentModalProps = {
  open: boolean;
  assignment: OkrObjectiveTypeWeightAssignment | null;
  departmentOptions: ScopeOption[];
  userOptions: ScopeOption[];
  hasCompanyDefault: boolean;
  onClose: () => void;
};

const SCOPE_OPTIONS: Array<{ value: OkrWeightScopeType; label: string }> = [
  { value: 'TENANT', label: 'Company' },
  { value: 'DEPARTMENT', label: 'Department' },
  { value: 'USER', label: 'User' },
];

const WeightAssignmentModal: React.FC<WeightAssignmentModalProps> = ({
  open,
  assignment,
  departmentOptions,
  userOptions,
  hasCompanyDefault,
  onClose,
}) => {
  const [form] = Form.useForm<{
    scopeType: OkrWeightScopeType;
    scopeId?: string;
  }>();
  const [weights, setWeights] = useState<Record<string, number | undefined>>(
    {},
  );
  const isEditMode = Boolean(assignment);
  const scopeType = Form.useWatch('scopeType', form) as
    | OkrWeightScopeType
    | undefined;

  const { data: objectiveTypes = [], isLoading: isTypesLoading } =
    useGetOkrObjectiveTypes({ activeOnly: true });
  const { mutate: saveWeights, isLoading: isSaving } =
    useUpsertObjectiveTypeWeights();

  const total = roundWeight(
    calculateTotalWeight(objectiveTypes.map((type) => weights[type.id])),
  );
  const isTotalValid = total === 100;

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setWeights({});
      return;
    }

    if (assignment) {
      form.setFieldsValue({
        scopeType: assignment.scopeType,
        scopeId: assignment.scopeId ?? undefined,
      });
      const saved = new Map(
        assignment.lines.map((line) => [
          line.objectiveTypeId,
          Number(line.weightPercent),
        ]),
      );
      setWeights(
        Object.fromEntries(
          objectiveTypes.map((type) => [type.id, saved.get(type.id)]),
        ),
      );
      return;
    }

    form.setFieldsValue({
      scopeType: hasCompanyDefault ? 'DEPARTMENT' : 'TENANT',
      scopeId: undefined,
    });
    setWeights(
      Object.fromEntries(objectiveTypes.map((type) => [type.id, undefined])),
    );
  }, [assignment, form, hasCompanyDefault, objectiveTypes, open]);

  const scopeSelectOptions = useMemo(() => {
    if (isEditMode) {
      return SCOPE_OPTIONS;
    }
    return SCOPE_OPTIONS.map((option) =>
      option.value === 'TENANT' && hasCompanyDefault
        ? {
            ...option,
            label: 'Company (already configured — edit the card instead)',
            disabled: true,
          }
        : option,
    );
  }, [hasCompanyDefault, isEditMode]);

  const distribute = () => {
    const shares = distributeEvenly(objectiveTypes.length);
    setWeights(
      Object.fromEntries(
        objectiveTypes.map((type, index) => [type.id, shares[index]]),
      ),
    );
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (!isTotalValid || objectiveTypes.length === 0) return;

    saveWeights(
      {
        scopeType: values.scopeType,
        scopeId: values.scopeType === 'TENANT' ? null : values.scopeId,
        lines: objectiveTypes.map((type) => ({
          objectiveTypeId: type.id,
          weightPercent: weights[type.id] ?? 0,
        })),
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      title={isEditMode ? 'Edit weight assignment' : 'Assign type weights'}
      open={open}
      onCancel={onClose}
      destroyOnClose
      width={560}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={`text-sm ${
              isTotalValid ? 'text-[#15803d]' : 'text-[#dc2626]'
            }`}
          >
            Total {total}%{!isTotalValid ? ' — must equal 100%' : ''}
          </span>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              loading={isSaving}
              disabled={
                !isTotalValid || isTypesLoading || objectiveTypes.length === 0
              }
              onClick={handleSubmit}
            >
              {isEditMode ? 'Save changes' : 'Assign weights'}
            </Button>
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item
          name="scopeType"
          label="Apply to"
          rules={[
            { required: true, message: 'Select where these weights apply.' },
          ]}
        >
          <Select
            options={scopeSelectOptions}
            disabled={isEditMode}
            placeholder="Select scope"
          />
        </Form.Item>

        {scopeType === 'DEPARTMENT' && (
          <Form.Item
            name="scopeId"
            label="Department"
            rules={[{ required: true, message: 'Select a department.' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Select a department"
              options={departmentOptions}
              disabled={isEditMode}
            />
          </Form.Item>
        )}

        {scopeType === 'USER' && (
          <Form.Item
            name="scopeId"
            label="Employee"
            rules={[{ required: true, message: 'Select an employee.' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Search for an employee"
              options={userOptions}
              disabled={isEditMode}
            />
          </Form.Item>
        )}

        {scopeType === 'TENANT' && (
          <p className="mb-4 text-sm text-[#64748b]">
            Company weights are the default for everyone. Department and user
            assignments override them when present.
          </p>
        )}
      </Form>

      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="m-0 text-sm font-semibold text-[#0f172a]">
          Objective type weights
        </h4>
        <Button
          type="link"
          className="px-0"
          onClick={distribute}
          disabled={objectiveTypes.length === 0}
        >
          Distribute evenly
        </Button>
      </div>

      {objectiveTypes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#d9d9d9] px-4 py-6 text-center text-sm text-[#8c8c8c]">
          Add an active objective type before assigning weights.
        </div>
      ) : (
        <div className="divide-y divide-[#f0f0f0] rounded-lg border border-[#f0f0f0]">
          {objectiveTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-[#262626]">
                  {type.name}
                </div>
                {type.description && (
                  <div className="mt-0.5 line-clamp-1 text-xs text-[#8c8c8c]">
                    {type.description}
                  </div>
                )}
              </div>
              <InputNumber
                min={0}
                max={100}
                precision={2}
                value={weights[type.id]}
                onChange={(value) =>
                  setWeights((current) => ({
                    ...current,
                    [type.id]: typeof value === 'number' ? value : undefined,
                  }))
                }
                addonAfter="%"
                className="w-32"
                aria-label={`${type.name} weight`}
              />
            </div>
          ))}
        </div>
      )}

      {!isTotalValid && objectiveTypes.length > 0 && (
        <Tag color="error" className="mt-3">
          Weights must total exactly 100%.
        </Tag>
      )}
    </Modal>
  );
};

export default WeightAssignmentModal;
