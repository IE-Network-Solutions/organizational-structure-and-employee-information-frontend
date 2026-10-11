'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import { scorecardTabHref } from '@/utils/bsc/scorecardTab';

const TABS = [
  {
    key: 'perspectives',
    label: 'Perspectives',
    href: '/bsc/settings/perspectives',
  },
] as const;

export default function BscSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { openCreatePerspective } = useBscUiStore();

  const activeTabKey =
    TABS.find((tab) => pathname.includes(tab.key))?.key ?? TABS[0].key;
  const isPerspectivesTab = activeTabKey === 'perspectives';

  return (
    <div className="min-h-screen w-full bg-white" data-cy="bsc-settings-layout">
      <CustomBreadcrumb
        titleClassName="!text-gray-900"
        title={
          <span
            data-cy="layout-span-38"
            className="text-2xl font-bold text-gray-900"
          >
            Settings
          </span>
        }
        subtitle={
          <nav
            aria-label="Breadcrumb"
            className="mt-1 flex text-sm font-medium text-gray-500"
            data-cy="bsc-settings-breadcrumb"
          >
            <Link
              href={scorecardTabHref('mine')}
              className="!text-gray-800"
              data-cy="bsc-settings-breadcrumb-bsc"
            >
              BSC
            </Link>
            <span data-cy="layout-span-53" className="mx-2 text-gray-400">
              /
            </span>
            <span
              className="text-gray-900"
              data-cy="bsc-settings-breadcrumb-current"
            >
              Settings
            </span>
          </nav>
        }
      />

      <div
        className="border-b border-[#D9D9D9] pt-3"
        data-cy="bsc-settings-tabs"
      >
        <div
          className="flex min-w-0 items-end gap-2 pb-0"
          data-cy="bsc-settings-tabs-row"
        >
          <div
            className="min-w-0 flex-1 overflow-x-auto scrollbar-thin"
            data-cy="bsc-settings-tabs-scroll"
          >
            <div
              className="flex w-max min-w-full items-end gap-0"
              data-cy="bsc-settings-tabs-inner"
            >
              {TABS.map((tab) => {
                const isActive = activeTabKey === tab.key;
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
                    data-cy={`bsc-settings-tab-${tab.key}`}
                  >
                    {tab.label}
                    {isActive ? (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1E40AF]"
                        aria-hidden="true"
                        data-cy={`bsc-settings-tab-indicator-${tab.key}`}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
          {isPerspectivesTab ? (
            <>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreatePerspective}
                className="mb-[6px] hidden h-8 shrink-0 rounded-md border-none bg-[#2b54ad] sm:inline-flex hover:bg-[#3d66c2]"
                data-cy="bsc-settings-add-perspective"
              >
                Add perspective
              </Button>
              <button
                type="button"
                aria-label="Add perspective"
                onClick={openCreatePerspective}
                className="mb-[6px] flex h-8 w-8 min-h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-[#2b54ad] text-white outline-none hover:opacity-90 sm:hidden"
                data-cy="bsc-settings-add-perspective-mobile"
              >
                <PlusOutlined className="text-sm" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="pb-8 pt-5" data-cy="bsc-settings-content">
        {children}
      </div>
    </div>
  );
}
