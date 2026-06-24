'use client';
import React from 'react';
import { useWeeklyPriorityStore } from '@/store/uistate/features/weeklyPriority/useStore';
import Department from './_components/department-team/department';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { Button, Tabs, ConfigProvider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import FilterPopover from './_components/FilterPopover';
import Link from 'next/link';

function Page(): JSX.Element {
  const { activeTab, setActiveTab, setModalOpen } = useWeeklyPriorityStore();

  const handleTabChange = (key: string) => {
    setActiveTab(Number(key));
  };

  const items = [
    {
      key: '1',
      label: 'Department',
    },
    {
      key: '2',
      label: 'Team',
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            titleFontSize: 14,
            horizontalItemPadding: '12px 16px',
          },
        },
      }}
    >
      <div
        data-cy="weekly-priority-page"
        className="min-h-screen bg-white font-sans"
      >
        <div data-cy="weekly-priority-content">
          {/* Header */}
          <div data-cy="weekly-priority-header">
            <div data-cy="weekly-priority-header-title">
              <CustomBreadcrumb
                title={
                  <span data-cy="weekly-priority-title">Weekly priority</span>
                }
                subtitle={
                  <div
                    className="flex items-center gap-1 text-[12px] md:text-[13px] text-gray-400"
                    data-cy="weekly-priority-breadcrumb"
                  >
                    <Link
                      className=" !text-gray-400"
                      data-cy="weekly-priority-breadcrumb-okr"
                      href="/okr"
                    >
                      OKR
                    </Link>
                    <span data-cy="weekly-priority-breadcrumb-separator">
                      /
                    </span>
                    <span
                      className=" !text-gray-800"
                      data-cy="weekly-priority-breadcrumb-current"
                    >
                      Weekly priority
                    </span>
                  </div>
                }
                titleExtra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalOpen(true)}
                    className="bg-[#254ec2] hover:bg-[#1e3e9a] h-[40px] md:h-[44px] w-[40px] md:w-auto px-0 md:px-6 rounded-[8px] flex items-center justify-center text-sm font-semibold border-none"
                    data-cy="weekly-priority-create-button"
                  >
                    <span
                      className="hidden md:inline ml-1"
                      data-cy="weekly-priority-create-button-text"
                    >
                      Create Priority
                    </span>
                  </Button>
                }
              />
            </div>
          </div>

          {/* Tabs and Filter */}
          <div className="relative" data-cy="weekly-priority-tabs-container">
            <Tabs
              activeKey={String(activeTab)}
              onChange={handleTabChange}
              items={items}
              tabBarExtraContent={<FilterPopover />}
              className="w-full"
              tabBarStyle={{
                marginBottom: 0,
                borderBottom: '1px solid #f0f0f0',
              }}
              data-cy="weekly-priority-tabs"
            />
          </div>

          {/* Content Area */}
          <div data-cy="weekly-priority-content-area">
            <Department />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default Page;
