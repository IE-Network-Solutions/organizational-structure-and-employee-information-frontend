'use client';
import { Card, Tabs } from 'antd';
import { TabsProps } from 'antd/lib';
import React, { useEffect, useState } from 'react';
import { TbNotes } from 'react-icons/tb';
import WorkScheduleTab from './_components/workSchedule/workSchduleComponent';
import FiscalYearListCard from './_components/fiscalYear/fiscalYearCard';
import CustomWorkingScheduleDrawer from './_components/fiscalYear/customDrawer';
import Branches from '@/app/(afterLogin)/(onboarding)/onboarding/_components/steper/step5';

function Settings() {
  const [tabPosition, setTabPosition] = useState<'left' | 'top'>('left');

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

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span className="flex gap-2 mt-4">
          <TbNotes className="mt-1" /> <p className="font-semibold">Branchs </p>{' '}
        </span>
      ),
      children: <Branches />,
    },
    {
      key: '2',
      label: (
        <span className="flex gap-2 mt-4">
          <TbNotes className="mt-1" />{' '}
          <p className="font-semibold">Departments </p>{' '}
        </span>
      ),
      children: <Branches />,
    },
    {
      key: '3',
      label: (
        <span className="flex gap-2 mt-4">
          <TbNotes className="mt-1" />{' '}
          <p className="font-semibold">Fiscal Year </p>{' '}
        </span>
      ),
      children: <FiscalYearListCard />,
    },
    {
      key: '4',
      label: (
        <span className="flex gap-2 mt-4">
          <TbNotes className="mt-1" />{' '}
          <p className="font-semibold">Work Schedule </p>{' '}
        </span>
      ),
      children: <WorkScheduleTab />,
    },
  ];
  return (
    <>
      <div className="flex justify-start bg-[#F5F5F5] -mt-2 -ml-2">
        <Card className="shadow-none bg-[#F5F5F5]" bordered={false}>
          <p className="font-bold text-xl">Branchs</p>
          <p className="text-gray-400">Branchs</p>
        </Card>
      </div>
      <Tabs
        defaultActiveKey="1"
        moreIcon={false}
        className="bg-white min-w-full"
        items={items}
        tabPosition={tabPosition}
      />
      <CustomWorkingScheduleDrawer />
    </>
  );
}

export default Settings;
