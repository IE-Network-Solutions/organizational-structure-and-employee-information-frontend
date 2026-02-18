'use client';
import React from 'react';
import { useWeeklyPriorityStore } from '@/store/uistate/features/weeklyPriority/useStore';
import Department from './_components/department-team/department';
import { Button, Tabs, ConfigProvider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import FilterPopover from './_components/FilterPopover';

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
        token: {
          colorPrimary: '#254ec2',
        },
        components: {
          Tabs: {
            titleFontSize: 14,
            horizontalItemPadding: '12px 16px',
            itemHoverColor: '#254ec2',
            itemSelectedColor: '#254ec2',
            inkBarColor: '#254ec2',
          },
        },
      }}
    >
      <div data-cy="weekly-priority-page" className="min-h-screen bg-white font-sans">
        <div className="px-4 md:pl-4 md:pr-8 py-4 md:py-6" data-cy="weekly-priority-content">
          {/* Header */}
          <div className="flex justify-between items-start md:items-center mb-4 md:mb-6" data-cy="weekly-priority-header">
            <div data-cy="weekly-priority-header-title">
              <h1 className="text-[24px] md:text-[28px] font-bold text-gray-900 mb-0.5 md:mb-1 leading-tight" data-cy="weekly-priority-title">Weekly priority</h1>
              <div className="flex items-center gap-1 text-[12px] md:text-[13px] text-gray-400" data-cy="weekly-priority-breadcrumb">
                <span data-cy="weekly-priority-breadcrumb-okr">OKR</span>
                <span data-cy="weekly-priority-breadcrumb-separator">/</span>
                <span className="text-gray-400" data-cy="weekly-priority-breadcrumb-current">Weekly Priority</span>
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
              className="bg-[#254ec2] hover:bg-[#1e3e9a] h-[40px] md:h-[44px] px-3 md:px-6 rounded-[8px] flex items-center justify-center text-sm font-semibold border-none"
              data-cy="weekly-priority-create-button"
            >
              <span className="hidden md:inline ml-1" data-cy="weekly-priority-create-button-text">Create Priority</span>
            </Button>
          </div>

          {/* Header Divider */}
          <div className="h-[1px] bg-gray-100 -mx-4 md:-ml-4 md:-mr-8 mb-4 md:mb-6" data-cy="weekly-priority-header-divider" />

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
