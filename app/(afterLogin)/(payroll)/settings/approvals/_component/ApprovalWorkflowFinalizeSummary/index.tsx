'use client';

import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import type { FormInstance } from 'antd/es/form';
import React, { useMemo } from 'react';

interface User {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

function formatUserLabel(user: User) {
  return `${user.firstName ?? ''} ${user.middleName ?? ''} ${user.lastName ?? ''}`.trim();
}

export interface ApprovalWorkflowFinalizeSummaryProps {
  form: FormInstance;
  approverType: string | null;
  level: number;
  selections: { SectionItemType: Array<Record<string, unknown>> };
  appliedToLabel?: string;
}

export const ApprovalWorkflowFinalizeSummary: React.FC<
  ApprovalWorkflowFinalizeSummaryProps
> = ({ form, approverType, level, selections, appliedToLabel }) => {
  const { data: users } = useGetAllUsers();

  const userMap = useMemo(() => {
    const m = new Map<string, string>();
    users?.items?.forEach((u: User) => {
      m.set(u.id, formatUserLabel(u) || u.id);
    });
    return m;
  }, [users]);

  const workflowName = form.getFieldValue('workFlownName') as string | undefined;
  const description = form.getFieldValue('description') as string | undefined;

  const approvalTypeLabel =
    approverType === 'Sequential'
      ? 'Sequential Approval'
      : approverType === 'Parallel'
        ? 'Parallel Approval'
        : approverType === 'Conditional'
          ? 'Conditional Approval'
          : approverType ?? '—';

  const assignedByLevel = useMemo(() => {
    return selections.SectionItemType.slice(0, level).map((sel, idx) => {
      const raw = sel?.user as string | string[] | null | undefined;
      const ids = Array.isArray(raw) ? raw : raw ? [raw] : [];
      const names = ids
        .map((id) => userMap.get(id as string) ?? (id as string))
        .filter(Boolean);
      return { level: idx + 1, names };
    });
  }, [selections, level, userMap]);

  const allAssignedNames = assignedByLevel.flatMap((r) => r.names);

  return (
    <div
      id="approval-payroll-workflow-finalize-summary"
      data-cy="approval-payroll-workflow-finalize-summary"
      className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div
        id="approval-payroll-workflow-finalize-header-row"
        data-cy="approval-payroll-workflow-finalize-header-row"
        className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4"
      >
        <div>
          <div
            id="approval-payroll-workflow-finalize-workflow-name"
            data-cy="approval-payroll-workflow-finalize-workflow-name"
            className="text-base font-semibold text-gray-900"
          >
            {workflowName || '—'}
          </div>
          <div
            id="approval-payroll-workflow-finalize-approval-type"
            data-cy="approval-payroll-workflow-finalize-approval-type"
            className="mt-1 text-sm text-gray-500"
          >
            {approvalTypeLabel}
          </div>
        </div>
        <div
          id="approval-payroll-workflow-finalize-level-badge"
          data-cy="approval-payroll-workflow-finalize-level-badge"
          className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600"
        >
          Level: {level}
        </div>
      </div>

      {description ? (
        <div
          id="approval-payroll-workflow-finalize-description"
          data-cy="approval-payroll-workflow-finalize-description"
          className="mb-4 text-sm text-gray-600"
        >
          {description}
        </div>
      ) : null}

      {appliedToLabel ? (
        <div
          id="approval-payroll-workflow-finalize-applied-block"
          data-cy="approval-payroll-workflow-finalize-applied-block"
          className="mb-4"
        >
          <div className="mb-2 text-xs font-medium text-gray-500">Applied to</div>
          <span
            id="approval-payroll-workflow-finalize-applied-pill"
            data-cy="approval-payroll-workflow-finalize-applied-pill"
            className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-800"
          >
            {appliedToLabel}
          </span>
        </div>
      ) : null}

      <div
        id="approval-payroll-workflow-finalize-assigned-block"
        data-cy="approval-payroll-workflow-finalize-assigned-block"
        className="border-t border-gray-100 pt-4"
      >
        <div className="mb-2 text-xs font-medium text-gray-500">Assigned to</div>
        <div
          className="flex flex-wrap gap-2"
          id="approval-payroll-workflow-finalize-assigned-pills"
          data-cy="approval-payroll-workflow-finalize-assigned-pills"
        >
          {allAssignedNames.length === 0 ? (
            <span className="text-sm text-gray-400">—</span>
          ) : (
            allAssignedNames.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-800"
                data-cy={`approval-payroll-workflow-finalize-assigned-pill-${i}`}
              >
                {name}
              </span>
            ))
          )}
        </div>
        {assignedByLevel.length > 1 && (
          <ul className="mt-3 list-inside list-disc text-xs text-gray-500">
            {assignedByLevel.map((row) => (
              <li key={row.level}>
                Level {row.level}:{' '}
                {row.names.length ? row.names.join(', ') : '—'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
