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
        <span className="flex gap-2 mt-4" data-cy="org-settings-branches-label" id="org-settings-branches-label">
          <PiBuildingsLight className="mt-1" data-cy="org-settings-branches-icon" id="org-settings-branches-icon" />{' '}
          <p className="font-semibold" data-cy="org-settings-branches-title" id="org-settings-branches-title">Branches </p>
        </span>
      ),
      children: <Branches data-cy="org-settings-branches" />,
    },
    {
      key: '2',
      label: (
        <span className="flex gap-2 mt-4" data-cy="org-settings-fiscal-year-label" id="org-settings-fiscal-year-label">
          <BsSafe className="mt-1" data-cy="org-settings-fiscal-year-icon" id="org-settings-fiscal-year-icon" />{' '}
          <p className="font-semibold" data-cy="org-settings-fiscal-year-title" id="org-settings-fiscal-year-title">Fiscal Year </p>
        </span>
      ),
      children: <FiscalYearListCard data-cy="org-settings-fiscal-year" />,
    },
    {
      key: '3',
      label: (
        <span className="flex gap-2 mt-4" data-cy="org-settings-work-schedule-label" id="org-settings-work-schedule-label">
          <PiCalendar className="mt-1" data-cy="org-settings-work-schedule-icon" id="org-settings-work-schedule-icon" />
          <p className="font-semibold" data-cy="org-settings-work-schedule-title" id="org-settings-work-schedule-title">Work Schedule </p>
        </span>
      ),
      children: <WorkScheduleTab data-cy="org-settings-work-schedule-tab" />,
    },
  ];
  return (
    <>
      <div className="flex justify-start  -mt-2 -ml-2">
        <Card className="shadow-none" bordered={false} data-cy="org-settings-branches-card" id="org-settings-branches-card">
          <p className="font-bold text-xl" data-cy="org-settings-branches-title" id="org-settings-branches-title">Branches</p>
          <p className="text-gray-400" data-cy="org-settings-branches-description" id="org-settings-branches-description">Branch</p>
        </Card>
      </div>
      <hr className="py-2 " data-cy="org-settings-branches-hr" id="org-settings-branches-hr"></hr>
      <Tabs
        defaultActiveKey="1"
        moreIcon={false}
        className="bg-white min-w-full"
        items={items}
        tabPosition={tabPosition}
        data-cy="org-settings-tabs"
        id="org-settings-tabs"
      />
      <CustomWorkingScheduleDrawer data-cy="org-settings-work-schedule-drawer" />
      <CustomWorFiscalYearDrawer
        form={form}
        handleNextStep={handleStepChange}
        data-cy="org-settings-fiscal-year-drawer"
      />
      <CustomDeleteWorkingSchduel data-cy="org-settings-work-schedule-delete-modal" />
      <CustomDeleteFiscalYears data-cy="org-settings-fiscal-year-delete-modal" />
    </>
  );
}

export default SettingsPage;
