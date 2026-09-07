'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  bscKpiAdminHref,
  parseBscKpiAdminTab,
  scorecardTabHref,
} from '@/utils/bsc/scorecardTab';

const TABS = [
  { key: 'kpis' as const, label: 'KPI', href: bscKpiAdminHref('kpis') },
  { key: 'bsc' as const, label: 'BSC', href: bscKpiAdminHref('bsc') },
];

export default function BscKpiAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { openCreateSetup, openCatalogKpiForm } = useBscUiStore();
  const activeTab = parseBscKpiAdminTab(pathname || '');

  const canManageBscAdmin =
    AccessGuard.checkAccess({
      permissions: [Permissions.ManageBscCycles],
    }) ||
    AccessGuard.checkAccess({
      permissions: [Permissions.ManageBscKpiLibrary],
    }) ||
    AccessGuard.checkAccess({
      permissions: [Permissions.ViewCompanyOkr],
    });

  useEffect(() => {
    if (!canManageBscAdmin) {
      router.replace(scorecardTabHref('mine'));
    }
  }, [canManageBscAdmin, router]);

  if (!canManageBscAdmin) {
    return (
      <div
        className="py-16 text-center text-gray-400"
        data-cy="bsc-kpi-admin-denied"
      >
        Redirecting…
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-white"
      data-cy="bsc-kpi-admin-layout"
    >
      <CustomBreadcrumb
        titleClassName="!text-gray-900"
        title={
          <span
            data-cy="layout-span-68"
            className="text-2xl font-bold text-gray-900"
          >
            KPI
          </span>
        }
        subtitle={
          <nav
            aria-label="Breadcrumb"
            className="mt-1 flex text-sm font-medium text-gray-500"
            data-cy="bsc-kpi-admin-breadcrumb"
          >
            <Link
              href={scorecardTabHref('mine')}
              className="!text-gray-800"
              data-cy="bsc-kpi-admin-breadcrumb-bsc"
            >
              BSC
            </Link>
            <span data-cy="layout-span-82" className="mx-2 text-gray-400">
              /
            </span>
            <span
              className="text-gray-900"
              data-cy="bsc-kpi-admin-breadcrumb-current"
            >
              KPI
            </span>
          </nav>
        }
      />

      <div
        className="border-b border-[#D9D9D9] pt-3"
        data-cy="bsc-kpi-admin-tabs"
      >
        <div
          data-cy="layout-div-97"
          className="flex min-w-0 items-end justify-between gap-2 pb-0"
        >
          <div
            data-cy="layout-div-98"
            className="min-w-0 flex-1 overflow-x-auto scrollbar-thin"
          >
            <div
              data-cy="layout-div-99"
              className="flex w-max min-w-full items-end gap-0"
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => router.push(tab.href)}
                    className={[
                      'relative shrink-0 cursor-pointer border-none bg-transparent px-3 pb-[10px] pt-0 outline-none',
                      'whitespace-nowrap text-[14px] transition-colors duration-150 lg:px-4 lg:text-[16px]',
                      isActive
                        ? 'font-bold text-[#1E40AF]'
                        : 'font-normal text-[rgba(0,0,0,0.7)] hover:text-[#1E40AF]',
                    ].join(' ')}
                    data-cy={`bsc-kpi-admin-tab-${tab.key}`}
                  >
                    {tab.label}
                    {isActive ? (
                      <span
                        data-cy="layout-span-118"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1E40AF]"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
          {activeTab === 'kpis' ? (
            <>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openCatalogKpiForm()}
                className="mb-[6px] hidden h-8 shrink-0 rounded-md border-none bg-[#2b54ad] sm:inline-flex hover:bg-[#3d66c2]"
                data-cy="bsc-kpi-add"
              >
                Add KPI
              </Button>
              <button
                type="button"
                aria-label="Add KPI"
                onClick={() => openCatalogKpiForm()}
                className="mb-[6px] flex h-8 w-8 min-h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-[#2b54ad] text-white outline-none hover:opacity-90 sm:hidden"
                data-cy="bsc-kpi-add-mobile"
              >
                <PlusOutlined className="text-sm" />
              </button>
            </>
          ) : activeTab === 'bsc' ? (
            <>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateSetup}
                className="mb-[6px] hidden h-8 shrink-0 rounded-md border-none bg-[#2b54ad] sm:inline-flex hover:bg-[#3d66c2]"
                data-cy="bsc-setup-add"
              >
                Add scorecard
              </Button>
              <button
                type="button"
                aria-label="Add scorecard"
                onClick={openCreateSetup}
                className="mb-[6px] flex h-8 w-8 min-h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-[#2b54ad] text-white outline-none hover:opacity-90 sm:hidden"
                data-cy="bsc-setup-add-mobile"
              >
                <PlusOutlined className="text-sm" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="pb-8 pt-5" data-cy="bsc-kpi-admin-content">
        {children}
      </div>
    </div>
  );
}
