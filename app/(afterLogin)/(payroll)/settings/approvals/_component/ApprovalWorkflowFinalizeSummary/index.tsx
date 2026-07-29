'use client';

import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import type { FormInstance } from 'antd/es/form';
import Image from 'next/image';
import React, { useMemo } from 'react';
import Avatar from '@/public/gender_neutral_avatar.jpg';

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

  const workflowName = form.getFieldValue('workFlownName') as
    | string
    | undefined;
  void approverType;

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
      className="rounded-xl border border-gray-200 p-4"
    >
      <div
        className="flex justify-between items-start gap-3"
        data-cy="approval-payroll-workflow-final-card-header"
      >
        <div data-cy="approval-payroll-workflow-final-info">
          <p
            className="mb-2 text-sm font-semibold text-[#4d4d4d]"
            data-cy="approval-payroll-workflow-final-name"
            id="approval-payroll-workflow-final-name"
          >
            {workflowName || '-'}
          </p>
          <span
            className="inline-flex items-center rounded-lg border border-gray-200 bg-[#f7f7f7] px-2 py-0.5 text-sm text-[#4d4d4d]"
            data-cy="approval-payroll-workflow-final-applies"
            id="approval-payroll-workflow-final-applies"
          >
            Applied to: {appliedToLabel || '-'}
          </span>
        </div>
        <span
          className="inline-flex items-center rounded-lg border border-[#D9D9D9] bg-[rgba(0,0,0,0.02)] px-2 py-0.5 text-sm text-[rgba(0,0,0,0.7)]"
          data-cy="approval-payroll-workflow-final-level"
          id="approval-payroll-workflow-final-level"
        >
          Level: {level}
        </span>
      </div>

      <div
        className="mt-3 border-t border-gray-200 pt-3"
        data-cy="approval-payroll-workflow-final-assigned-section"
        id="approval-payroll-workflow-final-assigned-section"
      >
        <p
          className="mb-2 text-sm text-[#4d4d4d]"
          data-cy="approval-payroll-workflow-final-assigned-title"
          id="approval-payroll-workflow-final-assigned-title"
        >
          Assigned To:
        </p>
        <div
          className="flex flex-wrap gap-2"
          data-cy="approval-payroll-workflow-final-assigned-list"
          id="approval-payroll-workflow-final-assigned-list"
        >
          {allAssignedNames.length === 0 ? (
            <span
              className="text-sm text-gray-400"
              data-cy="approval-payroll-workflow-final-assigned-list-empty"
            >
              -
            </span>
          ) : (
            allAssignedNames.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="inline-flex items-center gap-2 rounded-lg border border-[#D9D9D9] bg-[rgba(0,0,0,0.02)] px-2 py-1 text-sm text-[rgba(0,0,0,0.7)]"
                data-cy={`approval-payroll-workflow-final-assigned-chip-${i}`}
                id={`approval-payroll-workflow-final-assigned-chip-${i}`}
              >
                <span
                  className="relative h-5 w-5 overflow-hidden rounded-full"
                  data-cy={`approval-payroll-workflow-final-assigned-avatar-wrap-${i}`}
                  id={`approval-payroll-workflow-final-assigned-avatar-wrap-${i}`}
                >
                  <Image unoptimized
                    src={Avatar}
                    alt="avatar"
                    fill
                    className="object-cover"
                    data-cy={`approval-payroll-workflow-final-assigned-avatar-${i}`}
                    id={`approval-payroll-workflow-final-assigned-avatar-${i}`}
                  />
                </span>
                {name}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
