'use client';

import React from 'react';
import { Avatar, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { BscEvaluatorStep } from '@/types/bsc';

type EmployeeLookup = {
  label: string;
  initials?: string;
  profileImage?: string | null;
};

function stepLabel(
  step: BscEvaluatorStep,
  employeeById?: Map<string, EmployeeLookup>,
): string {
  if (step.kind === 'self') return 'Self';
  if (step.kind === 'directManager') return 'Manager';
  if (step.userId) {
    return employeeById?.get(step.userId)?.label || 'Person';
  }
  return 'Person';
}

function stepShort(
  step: BscEvaluatorStep,
  employeeById?: Map<string, EmployeeLookup>,
): string {
  if (step.kind === 'self') return 'Self';
  if (step.kind === 'directManager') return 'Mgr';
  if (step.userId) {
    const emp = employeeById?.get(step.userId);
    if (emp?.initials) return emp.initials;
    const label = emp?.label || 'Person';
    return label.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('')
      .toUpperCase() || '?';
  }
  return '?';
}

type Props = {
  flow?: BscEvaluatorStep[] | null;
  employeeById?: Map<string, EmployeeLookup>;
  dataCy?: string;
};

/** Read-only compact evaluator chain for KPI rows. */
export default function KpiEvaluationFlowCompact({
  flow,
  employeeById,
  dataCy = 'bsc-kpi-eval-compact',
}: Props) {
  const steps =
    flow?.length
      ? flow
      : ([{ kind: 'self' }, { kind: 'directManager' }] as BscEvaluatorStep[]);

  return (
    <div
      className="flex max-w-full flex-wrap items-center gap-0.5"
      data-cy={dataCy}
    >
      {steps.map((step, index) => {
        const label = stepLabel(step, employeeById);
        const employee =
          step.kind === 'user' && step.userId
            ? employeeById?.get(step.userId)
            : undefined;
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
            <Tooltip title={label}>
              <span
                className="inline-flex items-center gap-0.5"
                data-cy={`${dataCy}-step-${index}`}
              >
                {employee?.profileImage ? (
                  <Avatar size={16} src={employee.profileImage} />
                ) : (
                  <Avatar
                    size={16}
                    icon={
                      step.kind === 'user' ? undefined : <UserOutlined />
                    }
                    className={
                      step.kind === 'self'
                        ? 'bg-[#E6F4FF] text-[8px] text-[#1677ff]'
                        : step.kind === 'directManager'
                          ? 'bg-[#F0F5FF] text-[8px] text-[#5B67D9]'
                          : 'bg-[#EFF6FF] text-[8px] text-[#1D4ED8]'
                    }
                  >
                    {step.kind === 'user'
                      ? stepShort(step, employeeById)
                      : null}
                  </Avatar>
                )}
                <span className="text-[10px] font-medium text-[#595959]">
                  {step.kind === 'user'
                    ? stepShort(step, employeeById)
                    : step.kind === 'self'
                      ? 'Self'
                      : 'Mgr'}
                </span>
              </span>
            </Tooltip>
          </React.Fragment>
        );
      })}
    </div>
  );
}
