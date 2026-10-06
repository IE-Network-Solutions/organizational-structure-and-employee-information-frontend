'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ApprovalTable from '@/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/_components/approvalTable';
import {
  MOCK_TNA_ROWS,
  MOCK_TRAINING_ROWS,
  type ApprovalModuleKey,
} from '@/config/homeApprovalsMock';
import MockApprovalInboxTable from './_components/MockApprovalInboxTable';
import PayrollApprovalsPanel from './_components/PayrollApprovalsPanel';
import { approvalPillClass } from './_components/approvalSegmentedClassName';

type LearningSubtype = 'tna' | 'training';

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

// Older links name the request type instead of the inbox (`?type=leave`).
function moduleFromTypeParam(value: string | null): ApprovalModuleKey | null {
  const type = (value ?? '').replace(/[-_]/g, '');
  if (/^(workfromhome|wfh|shiftswap|swap|leave)$/i.test(type)) {
    return 'timesheet';
  }
  if (/^(tna|training)$/i.test(type)) return 'learning';
  if (/^payroll$/i.test(type)) return 'payroll';
  return null;
}

export default function HomeApprovalsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The inbox is the banner's tab (`?module=`), so the URL decides it.
  const activeModule: ApprovalModuleKey =
    parseModuleParam(searchParams.get('module')) ?? 'timesheet';
  const [learningSubtype, setLearningSubtype] =
    useState<LearningSubtype>('tna');

  useEffect(() => {
    // Name the inbox in the URL the way the banner's tabs do (`?type=leave`
    // or `?module=tna` → `?module=…`) so the right tab is marked.
    const moduleParam = searchParams.get('module');
    const canonicalModule = moduleParam
      ? parseModuleParam(moduleParam)
      : moduleFromTypeParam(searchParams.get('type'));
    if (canonicalModule && canonicalModule !== moduleParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('module', canonicalModule);
      router.replace(`${pathname}?${params.toString()}`);
    }

    const typeParam = (searchParams.get('type') ?? '').toLowerCase();
    const subtypeParam = searchParams.get('subtype');
    if (subtypeParam) {
      setLearningSubtype(parseLearningSubtype(subtypeParam));
    } else if (typeParam === 'tna' || typeParam === 'training') {
      setLearningSubtype(typeParam);
    }
  }, [searchParams, pathname, router]);

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
          className="min-w-0 max-w-full w-full"
          data-cy="home-approvals-content-area"
        >
          {moduleContent}
        </div>
      </div>
    </div>
  );
}
