'use client';
import { Card, Form, Tabs } from 'antd';
import { TabsProps } from 'antd/lib';
import React, { useEffect, useState } from 'react';
import { PiBuildingsLight } from 'react-icons/pi';
import { BsSafe } from 'react-icons/bs';
import { PiCalendar } from 'react-icons/pi';
import WorkScheduleTab from '../_components/workSchedule/workSchduleComponent';
import FiscalYearListCard from '../_components/fiscalYear/fiscalYearCard';
import Branches from '@/app/(afterLogin)/(onboarding)/onboarding/_components/steper/branches';
import CustomWorFiscalYearDrawer from '../_components/fiscalYear/customDrawer';
import CustomWorkingScheduleDrawer from '../_components/workSchedule/customDrawer';
import CustomDeleteWorkingSchduel from '../_components/workSchedule/deleteModal';
import CustomDeleteFiscalYears from '../fiscalYear/deleteModal';

function SettingsPage() {
  const [tabPosition, setTabPosition] = useState<'left' | 'top'>('left');
  const [form] = Form.useForm();
  useEffect(() => {
    const updateTabPosition = () => {
      if (window.innerWidth < 768) {
        setTabPosition('top');
      } else {
        setTabPosition('left');
      }
    };

    updateTabPosition();

    window.addEventListener('resize', updateTabPosition);

    return () => {
      window.removeEventListener('resize', updateTabPosition);
    };
  }, []);

  const handleStepChange = () => {};

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span className="flex gap-2 mt-4" data-cy="org-settings-page-branches-tab-label" id="org-settings-page-branches-tab-label">
          <PiBuildingsLight className="mt-1" data-cy="org-settings-page-branches-tab-icon" id="org-settings-page-branches-tab-icon" />{' '}
          <p className="font-semibold" data-cy="org-settings-page-branches-tab-title" id="org-settings-page-branches-tab-title">Branches </p>
        </span>
      ),
      children: <Branches data-cy="org-settings-page-branches-content" />,
    },
    {
      key: '2',
      label: (
        <span className="flex gap-2 mt-4" data-cy="org-settings-page-fiscal-year-tab-label" id="org-settings-page-fiscal-year-tab-label">
          <BsSafe className="mt-1" data-cy="org-settings-page-fiscal-year-tab-icon" id="org-settings-page-fiscal-year-tab-icon" />{' '}
          <p className="font-semibold" data-cy="org-settings-page-fiscal-year-tab-title" id="org-settings-page-fiscal-year-tab-title">Fiscal Year </p>
        </span>
      ),
      children: <FiscalYearListCard data-cy="org-settings-page-fiscal-year-content" />,
    },
    {
      key: '3',
      label: (
        <span className="flex gap-2 mt-4" data-cy="org-settings-page-work-schedule-tab-label" id="org-settings-page-work-schedule-tab-label">
          <PiCalendar className="mt-1" data-cy="org-settings-page-work-schedule-tab-icon" id="org-settings-page-work-schedule-tab-icon" />
          <p className="font-semibold" data-cy="org-settings-page-work-schedule-tab-title" id="org-settings-page-work-schedule-tab-title">Work Schedule </p>
        </span>
      ),
      children: <WorkScheduleTab data-cy="org-settings-page-work-schedule-content" />,
    },
  ];
  return (
    <>
      <div className="flex justify-start  -mt-2 -ml-2" data-cy="auto-organization-settings-settingspage-index-tsx-div-l73">
        <Card className="shadow-none" bordered={false} data-cy="org-settings-page-branches-card" id="org-settings-page-branches-card">
          <p className="font-bold text-xl" data-cy="org-settings-page-branches-card-title" id="org-settings-page-branches-card-title">Branches</p>
          <p className="text-gray-400" data-cy="org-settings-page-branches-card-description" id="org-settings-page-branches-card-description">Branch</p>
        </Card>
      </div>
      <hr className="py-2 " data-cy="org-settings-page-branches-divider" id="org-settings-page-branches-divider"></hr>
      <Tabs
        defaultActiveKey="1"
        moreIcon={false}
        className="bg-white min-w-full"
        items={items}
        tabPosition={tabPosition}
        data-cy="org-settings-page-tabs"
        id="org-settings-page-tabs"
      />
      <CustomWorkingScheduleDrawer data-cy="org-settings-page-work-schedule-drawer" />
      <CustomWorFiscalYearDrawer
        form={form}
        handleNextStep={handleStepChange}
        data-cy="org-settings-page-fiscal-year-drawer"
      />
      <CustomDeleteWorkingSchduel data-cy="org-settings-page-work-schedule-delete-modal" />
      <CustomDeleteFiscalYears data-cy="org-settings-page-fiscal-year-delete-modal" />
    </>
  );
}

export default SettingsPage;
