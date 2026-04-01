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
          colorPrimary: '#1E40AF',
        },
        components: {
          Tabs: {
            titleFontSize: 16,
            // Vertical padding only so the ink bar width matches the label text (not the padded hit area).
            horizontalItemPadding: '12px 0',
            itemHoverColor: '#1E40AF',
            itemSelectedColor: '#1E40AF',
            inkBarColor: '#1E40AF',
          },
        },
      }}
    >
      <div
        data-cy="weekly-priority-page"
        className="min-h-screen bg-white font-sans"
      >
        <div className="py-4 md:py-6" data-cy="weekly-priority-content">
          {/* Header */}
          <div
            className="flex justify-between items-start md:items-center mb-4 md:mb-6"
            data-cy="weekly-priority-header"
          >
            <div
              className="flex flex-col gap-2"
              data-cy="weekly-priority-header-title"
            >
              <h1
                className="text-[24px] font-bold text-gray-900 leading-tight m-0"
                data-cy="weekly-priority-title"
              >
                Weekly priority
              </h1>
              <div
                className="text-[14px] text-gray-400"
                data-cy="weekly-priority-breadcrumb"
              >
                OKR / objective
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
              className="!bg-[#1E40AF] hover:!bg-[#1b376e] h-[40px] md:h-[44px] w-[40px] md:w-auto px-0 md:px-6 rounded-[8px] flex items-center justify-center text-[16px] font-normal text-white border-none [&_.anticon]:text-white"
              data-cy="weekly-priority-create-button"
            >
              <span
                className="hidden md:inline ml-1"
                data-cy="weekly-priority-create-button-text"
              >
                Create Priority
              </span>
            </Button>
          </div>

          {/* Header Divider — cancel nav-content-inner horizontal padding so line meets sidebar edge */}
          <div
            className="h-px bg-gray-100 mb-4 md:mb-6 -mx-2 md:-mx-6"
            data-cy="weekly-priority-header-divider"
          />

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
