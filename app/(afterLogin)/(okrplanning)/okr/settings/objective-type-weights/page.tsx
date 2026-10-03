'use client';

/* eslint-disable local-rules/data-cy-required */

import React, { useEffect, useMemo, useState } from 'react';
import { Button, InputNumber, Segmented, Select, Skeleton, Tag } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { useGetOkrObjectiveTypes } from '@/store/server/features/okrplanning/okr-objective-type/queries';
import { useGetObjectiveTypeWeightAssignments } from '@/store/server/features/okrplanning/okr-objective-type-weight/queries';
import { useUpsertObjectiveTypeWeights } from '@/store/server/features/okrplanning/okr-objective-type-weight/mutations';
import { OkrWeightScopeType } from '@/store/server/features/okrplanning/okr-objective-type-weight/interface';
import { calculateTotalWeight } from './weightUtils';

const MANAGE_OKR_SETTINGS = 'manage_okr_settings';

const getPersonName = (person: any) =>
  person?.fullName ||
  [person?.firstName, person?.middleName, person?.lastName]
    .filter(Boolean)
    .join(' ') ||
  person?.email ||
  'Unnamed employee';

const ObjectiveTypeWeightsPage = () => {
  const [scopeType, setScopeType] = useState<OkrWeightScopeType>('TENANT');
  const [scopeId, setScopeId] = useState<string | null>(null);
  const [weights, setWeights] = useState<Record<string, number | undefined>>(
    {},
  );
  const { data: objectiveTypes = [], isLoading: isTypesLoading } =
    useGetOkrObjectiveTypes({ activeOnly: true });
  const { data: assignments = [], isLoading: isAssignmentsLoading } =
    useGetObjectiveTypeWeightAssignments({ scopeType, scopeId });
  const { data: departmentsData } = useGetDepartments();
  const { data: usersData } = useGetAllUsers();
  const { mutate: saveWeights, isLoading: isSaving } =
    useUpsertObjectiveTypeWeights();

  const departments = useMemo(
    () =>
      Array.isArray(departmentsData)
        ? departmentsData
        : (departmentsData?.items ?? departmentsData?.data ?? []),
    [departmentsData],
  );
  const users = useMemo(
    () =>
      Array.isArray(usersData)
        ? usersData
        : (usersData?.items ?? usersData?.data ?? []),
    [usersData],
  );
  const assignment = assignments[0];
  const total = calculateTotalWeight(
    objectiveTypes.map((type) => weights[type.id]),
  );
  const isScopeSelected = scopeType === 'TENANT' || Boolean(scopeId);
  const canSave =
    isScopeSelected && objectiveTypes.length > 0 && total === 100 && !isSaving;

  useEffect(() => {
    const savedWeights = new Map(
      assignment?.lines.map((line) => [
        line.objectiveTypeId,
        line.weightPercent,
      ]) ?? [],
    );
    setWeights(
      Object.fromEntries(
        objectiveTypes.map((type) => [type.id, savedWeights.get(type.id)]),
      ),
    );
  }, [assignment, objectiveTypes]);

  const changeScope = (nextScope: OkrWeightScopeType) => {
    setScopeType(nextScope);
    setScopeId(null);
  };

  const save = () => {
    if (!canSave) return;

    saveWeights({
      scopeType,
      scopeId: scopeType === 'TENANT' ? null : scopeId,
      lines: objectiveTypes.map((type) => ({
        objectiveTypeId: type.id,
        weightPercent: weights[type.id] ?? 0,
      })),
    });
  };

  return (
    <AccessGuard permissions={[MANAGE_OKR_SETTINGS]}>
      <div className="rounded-xl bg-white p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="mb-1 text-xl font-semibold text-[#262626]">
            Objective Type Weights
          </h2>
          <p className="m-0 text-sm text-[#595959]">
            Configure how each active objective type contributes to the final
            OKR score.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Segmented<OkrWeightScopeType>
            value={scopeType}
            options={[
              { label: 'Tenant default', value: 'TENANT' },
              { label: 'Department', value: 'DEPARTMENT' },
              { label: 'User', value: 'USER' },
            ]}
            onChange={changeScope}
          />
          {scopeType === 'DEPARTMENT' && (
            <Select
              className="min-w-[260px]"
              placeholder="Select a department"
              value={scopeId ?? undefined}
              onChange={setScopeId}
              options={departments.map((department: any) => ({
                value: department.id,
                label: department.name || department.departmentName,
              }))}
              showSearch
              optionFilterProp="label"
            />
          )}
          {scopeType === 'USER' && (
            <Select
              className="min-w-[260px]"
              placeholder="Select an employee"
              value={scopeId ?? undefined}
              onChange={setScopeId}
              options={users.map((user: any) => ({
                value: user.id,
                label: getPersonName(user),
              }))}
              showSearch
              optionFilterProp="label"
            />
          )}
        </div>

        <p className="mb-5 text-sm text-[#595959]">
          Resolution order: a user setting overrides a department setting, which
          overrides the tenant default.
        </p>

        {!isScopeSelected ? (
          <div className="rounded-lg border border-dashed border-[#d9d9d9] p-8 text-center text-sm text-[#8c8c8c]">
            Select a {scopeType === 'DEPARTMENT' ? 'department' : 'user'} to
            configure an override.
          </div>
        ) : isTypesLoading || isAssignmentsLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : objectiveTypes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#d9d9d9] p-8 text-center text-sm text-[#8c8c8c]">
            Add an active objective type before configuring weights.
          </div>
        ) : (
          <div className="max-w-2xl">
            <div className="divide-y divide-[#f0f0f0] rounded-lg border border-[#f0f0f0]">
              {objectiveTypes.map((type) => (
                <div
                  className="flex items-center justify-between gap-4 p-4"
                  key={type.id}
                >
                  <div>
                    <div className="font-medium text-[#262626]">
                      {type.name}
                    </div>
                    {type.description && (
                      <div className="mt-1 text-xs text-[#8c8c8c]">
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
                        [type.id]:
                          typeof value === 'number' ? value : undefined,
                      }))
                    }
                    addonAfter="%"
                    className="w-32"
                    aria-label={`${type.name} weight`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm">
                Total:{' '}
                <Tag color={total === 100 ? 'green' : 'red'} className="m-0">
                  {total}%
                </Tag>
                {total !== 100 && (
                  <span className="ml-2 text-[#ff4d4f]">
                    Weights must total 100%.
                  </span>
                )}
              </div>
              <Button
                type="primary"
                disabled={!canSave}
                loading={isSaving}
                onClick={save}
              >
                Save weights
              </Button>
            </div>
          </div>
        )}
      </div>
    </AccessGuard>
  );
};

export default ObjectiveTypeWeightsPage;
