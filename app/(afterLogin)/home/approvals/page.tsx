'use client';

import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Badge, ConfigProvider, Segmented } from 'antd';
import { useSearchParams } from 'next/navigation';
import ApprovalTable from '@/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/_components/approvalTable';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  MOCK_APPROVAL_PENDING_BY_MODULE,
  MOCK_TNA_ROWS,
  MOCK_TRAINING_ROWS,
  type ApprovalModuleKey,
} from '@/config/homeApprovalsMock';
import MockApprovalInboxTable from './_components/MockApprovalInboxTable';
import PayrollApprovalsPanel from './_components/PayrollApprovalsPanel';
import {
  approvalPillClass,
  approvalToolbarSegmentedClassName,
} from './_components/approvalSegmentedClassName';

type LearningSubtype = 'tna' | 'training';

const MODULE_OPTIONS: { label: React.ReactNode; value: ApprovalModuleKey }[] = [
  {
    label: (
      <span
        className="inline-flex items-center gap-2"
        data-cy="home-approvals-module-label-timesheet"
      >
        Timesheet
        <Badge count={MOCK_APPROVAL_PENDING_BY_MODULE.timesheet} size="small" />
      </span>
    ),
    value: 'timesheet',
  },
  {
    label: (
      <span
        className="inline-flex items-center gap-2"
        data-cy="home-approvals-module-label-learning"
      >
        Learning
        <Badge count={MOCK_APPROVAL_PENDING_BY_MODULE.learning} size="small" />
      </span>
    ),
    value: 'learning',
  },
  {
    label: (
      <span
        className="inline-flex items-center gap-2"
        data-cy="home-approvals-module-label-payroll"
      >
        Payroll
        <Badge count={MOCK_APPROVAL_PENDING_BY_MODULE.payroll} size="small" />
      </span>
    ),
    value: 'payroll',
  },
];

function parseModuleParam(value: string | null): ApprovalModuleKey | null {
  const normalized = (value ?? '').toLowerCase();
  if (normalized === 'timesheet' || normalized === 'time') return 'timesheet';
  if (
    normalized === 'learning' ||
    normalized === 'tna' ||
    normalized === 'training'
  )
    return 'learning';
  if (normalized === 'payroll') return 'payroll';
  return null;
}

function parseLearningSubtype(value: string | null): LearningSubtype {
  const normalized = (value ?? '').toLowerCase();
  if (normalized === 'training') return 'training';
  return 'tna';
}

export default function HomeApprovalsPage() {
  const { isMobile } = useIsMobile();
  const searchParams = useSearchParams();
  const [activeModule, setActiveModule] =
    useState<ApprovalModuleKey>('timesheet');
  const [learningSubtype, setLearningSubtype] =
    useState<LearningSubtype>('tna');

  useEffect(() => {
    const moduleFromUrl = parseModuleParam(searchParams.get('module'));
    const typeParam = (searchParams.get('type') ?? '').replace(/[-_]/g, '');
    const subtypeParam = searchParams.get('subtype');

    if (moduleFromUrl) {
      setActiveModule(moduleFromUrl);
    } else if (/^workfromhome$/i.test(typeParam) || /^wfh$/i.test(typeParam)) {
      setActiveModule('timesheet');
    } else if (/^shiftswap$/i.test(typeParam) || /^swap$/i.test(typeParam)) {
      setActiveModule('timesheet');
    } else if (/^leave$/i.test(typeParam)) {
      setActiveModule('timesheet');
    } else if (/^tna$/i.test(typeParam)) {
      setActiveModule('learning');
      setLearningSubtype('tna');
    } else if (/^training$/i.test(typeParam)) {
      setActiveModule('learning');
      setLearningSubtype('training');
    } else if (/^payroll$/i.test(typeParam)) {
      setActiveModule('payroll');
    }

    if (subtypeParam) {
      setLearningSubtype(parseLearningSubtype(subtypeParam));
    }
  }, [searchParams]);

  const moduleContent = useMemo(() => {
    switch (activeModule) {
      case 'timesheet':
        return (
          <div data-cy="home-approvals-timesheet-content">
            <ApprovalTable />
          </div>
        );
      case 'learning':
        return (
          <div
            className="flex min-w-0 flex-col gap-3"
            data-cy="home-approvals-learning-content"
          >
            <div
              role="tablist"
              aria-label="Learning approval type"
              className="flex w-max max-w-full flex-wrap items-center gap-1"
              data-cy="home-approvals-learning-subtype-pills"
            >
              {(
                [
                  { key: 'tna' as const, label: 'TNA' },
                  { key: 'training' as const, label: 'Training' },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  role="tab"
                  aria-selected={learningSubtype === pill.key}
                  onClick={() => setLearningSubtype(pill.key)}
                  className={approvalPillClass(learningSubtype === pill.key)}
                  data-cy={`home-approvals-learning-pill-${pill.key}`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
            <MockApprovalInboxTable
              rows={
                learningSubtype === 'tna' ? MOCK_TNA_ROWS : MOCK_TRAINING_ROWS
              }
              inboxLabel={
                learningSubtype === 'tna'
                  ? 'TNA review approvals'
                  : 'Training request approvals'
              }
              dataCyPrefix={`home-approvals-learning-${learningSubtype}`}
            />
          </div>
        );
      case 'payroll':
        return <PayrollApprovalsPanel />;
      default:
        return null;
    }
  }, [activeModule, learningSubtype]);

  return (
    <div
      className="h-auto min-w-0 w-full max-w-full bg-white rounded-md"
      data-cy="home-approvals-page"
    >
      <div
        className="home-embed-main flex min-w-0 max-w-full w-full flex-col gap-3 p-0 sm:gap-4 sm:rounded-xl sm:p-4"
        data-cy="home-approvals-main-card"
      >
        <div
          className={classNames(
            'sticky top-0 z-20 flex w-full min-w-0 max-w-full flex-col items-stretch gap-2 border-b border-shell-line bg-white pb-2 pt-1',
            'sm:flex-row sm:items-end sm:gap-3 sm:pb-0 lg:gap-x-8 sm:[&>*:not(:first-child)]:pb-2',
          )}
          data-cy="home-approvals-toolbar-row"
        >
          <div
            className="flex w-full shrink-0 items-center sm:w-auto sm:justify-center"
            data-cy="home-approvals-module-segmented-wrap"
          >
            <ConfigProvider
              theme={{
                components: {
                  Segmented: {
                    trackBg: '#f1f5f9',
                    itemSelectedBg: '#ffffff',
                    itemSelectedColor: '#0f172a',
                  },
                },
              }}
            >
              <Segmented
                size={isMobile ? 'middle' : 'large'}
                value={activeModule}
                onChange={(value) =>
                  setActiveModule(value as ApprovalModuleKey)
                }
                options={MODULE_OPTIONS}
                className={approvalToolbarSegmentedClassName}
                data-cy="home-approvals-module-segmented"
              />
            </ConfigProvider>
          </div>
        </div>

        <div
          className="min-w-0 max-w-full w-full"
          data-cy="home-approvals-content-area"
        >
          {moduleContent}
        </div>
      </div>
    </div>
  );
}
