'use client';
import { Card, Form, Tabs } from 'antd';
import { TabsProps } from 'antd/lib';
import React, { useEffect, useState } from 'react';
import { PiBuildingOfficeLight } from 'react-icons/pi';
import { BsSafe } from 'react-icons/bs';
import { PiCalendarDot } from 'react-icons/pi';
import WorkScheduleTab from '../_components/workSchedule/workSchduleComponent';
import FiscalYearListCard from '../_components/fiscalYear/fiscalYearCard';
import Branches from '@/app/(afterLogin)/(onboarding)/onboarding/_components/steper/branches';
import CustomWorFiscalYearDrawer from '../_components/fiscalYear/customDrawer';
import CustomWorkingScheduleDrawer from '../_components/workSchedule/customDrawer';
import CustomDeleteWorkingSchduel from '../_components/workSchedule/deleteModal';
import CustomDeleteFiscalYear from '../_components/fiscalYear/deleteModal';

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
        <span className="flex gap-2 mt-4">
          <PiBuildingOfficeLight className="mt-1" />{' '}
          <p className="font-semibold">Branches </p>
        </span>
      ),
      children: <Branches />,
    },
    {
      key: '2',
      label: (
        <span className="flex gap-2 mt-4">
          <BsSafe className="mt-1" />{' '}
          <p className="font-semibold">Fiscal Year </p>
        </span>
      ),
      children: <FiscalYearListCard />,
    },
    {
      key: '3',
      label: (
        <span className="flex gap-2 mt-4">
          <PiCalendarDot className="mt-1" />
          <p className="font-semibold">Work Schedule </p>
        </span>
      ),
      children: <WorkScheduleTab />,
    },
  ];
  return (
    <>
      <div className="flex justify-start  -mt-2 -ml-2">
        <Card className="shadow-none" bordered={false}>
          <p className="font-bold text-xl">Branches</p>
          <p className="text-gray-400">Branch</p>
        </Card>
      </div>
      <hr className="py-2 "></hr>
      <Tabs
        defaultActiveKey="1"
        moreIcon={false}
        className="bg-white min-w-full"
        items={items}
        tabPosition={tabPosition}
      />
      <CustomWorkingScheduleDrawer />
      <CustomWorFiscalYearDrawer
        form={form}
        handleNextStep={handleStepChange}
      />
      <CustomDeleteWorkingSchduel />
      <CustomDeleteFiscalYear />
    </>
  );
}

export default SettingsPage;
