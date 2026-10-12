'use client';

import React from 'react';
import { Avatar, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { BscEvaluatorStep } from '@/types/bsc';
import {
  useGetAllUsers,
  useGetAllUsersData,
} from '@/store/server/features/employees/employeeManagment/queries';
import { buildOrgEmployees } from '@/utils/bsc/orgUsers';

type EmployeeLookup = {
  label: string;
  initials?: string;
  profileImage?: string | null;
};

/**
 * One org-employee lookup shared by every row: the flow renders once per KPI,
 * so rebuild only when the cached user payloads change.
 */
let cachedSources: [unknown, unknown] | null = null;
let cachedLookup = new Map<string, EmployeeLookup>();

function orgEmployeeLookup(
  allUsersData: unknown,
  allUsers: unknown,
): Map<string, EmployeeLookup> {
  if (
    cachedSources &&
    cachedSources[0] === allUsersData &&
    cachedSources[1] === allUsers
  ) {
    return cachedLookup;
  }
  const map = new Map<string, EmployeeLookup>();
  for (const employee of buildOrgEmployees(allUsersData, allUsers)) {
    map.set(employee.id, {
      label: employee.name,
      profileImage: employee.profileImage,
    });
  }
  cachedSources = [allUsersData, allUsers];
  cachedLookup = map;
  return map;
}

function initialsOf(label: string): string {
  return (
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '?'
  );
}

function firstName(label: string): string {
  return label.split(/\s+/).filter(Boolean)[0] || label;
}

type Props = {
  flow?: BscEvaluatorStep[] | null;
  /** Optional caller-provided lookup; falls back to the org user list. */
  employeeById?: Map<string, EmployeeLookup>;
  /** Scorecard owner — names the "Self" step. */
  ownerUserId?: string | null;
  /** Owner's manager — names the "Manager" step. */
  managerUserId?: string | null;
  dataCy?: string;
};

/** Read-only compact evaluator chain for KPI rows. */
export default function KpiEvaluationFlowCompact({
  flow,
  employeeById,
  ownerUserId,
  managerUserId,
  dataCy = 'bsc-kpi-eval-compact',
}: Props) {
  const { data: allUsersData } = useGetAllUsersData();
  const { data: allUsers } = useGetAllUsers();
  const orgLookup = orgEmployeeLookup(allUsersData, allUsers);

  const findPerson = (id?: string | null): EmployeeLookup | undefined => {
    if (!id) return undefined;
    return employeeById?.get(id) || orgLookup.get(id);
  };

  const steps = flow?.length
    ? flow
    : ([{ kind: 'self' }, { kind: 'directManager' }] as BscEvaluatorStep[]);

  return (
    <div
      className="flex max-w-full flex-wrap items-center gap-0.5"
      data-cy={dataCy}
    >
      {steps.map((step, index) => {
        const role =
          step.kind === 'self'
            ? 'Self'
            : step.kind === 'directManager'
              ? 'Manager'
              : 'Evaluator';
        const person =
          step.kind === 'self'
            ? findPerson(ownerUserId)
            : step.kind === 'directManager'
              ? findPerson(managerUserId)
              : findPerson(step.userId);
        // Tooltip always names the approver when known: "Manager: Abebe Kebede".
        const tooltip = person?.label ? `${role}: ${person.label}` : role;
        const badgeText =
          step.kind === 'self'
            ? 'Self'
            : step.kind === 'directManager'
              ? 'Mgr'
              : person?.label
                ? firstName(person.label)
                : 'Evaluator';

        return (
          <React.Fragment key={`${step.kind}-${step.userId || ''}-${index}`}>
            {index > 0 ? (
              <span
                className="px-0.5 text-[10px] font-semibold text-[#5B67D9]"
                data-cy={`${dataCy}-connector-${index}`}
              >
                →
              </span>
            ) : null}
            <Tooltip title={tooltip}>
              <span
                className="inline-flex items-center gap-0.5"
                data-cy={`${dataCy}-step-${index}`}
                aria-label={tooltip}
              >
                {person?.profileImage ? (
                  <Avatar
                    size={16}
                    src={person.profileImage}
                    data-cy={`${dataCy}-step-${index}-avatar`}
                  />
                ) : (
                  <Avatar
                    size={16}
                    icon={
                      step.kind === 'user' && person?.label ? undefined : (
                        <UserOutlined />
                      )
                    }
                    className={
                      step.kind === 'self'
                        ? 'bg-[#E6F4FF] text-[8px] text-[#1677ff]'
                        : step.kind === 'directManager'
                          ? 'bg-[#F0F5FF] text-[8px] text-[#5B67D9]'
                          : 'bg-[#EFF6FF] text-[8px] text-[#1D4ED8]'
                    }
                    data-cy={`${dataCy}-step-${index}-avatar`}
                  >
                    {step.kind === 'user' && person?.label
                      ? person.initials || initialsOf(person.label)
                      : null}
                  </Avatar>
                )}
                <span
                  data-cy="kpievaluationflowcompact-span-110"
                  className="max-w-[88px] truncate text-[10px] font-medium text-[#595959]"
                >
                  {badgeText}
                </span>
              </span>
            </Tooltip>
          </React.Fragment>
        );
      })}
    </div>
  );
}
