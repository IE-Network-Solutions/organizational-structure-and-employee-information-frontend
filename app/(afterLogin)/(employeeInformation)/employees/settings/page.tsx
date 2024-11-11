'use client';
import { Card, Tabs } from 'antd';
import { TabsProps } from 'antd/lib';
import React, { useState, useEffect } from 'react';
import SettingsPage from './_components/rolePermission';
import { IoMdSettings } from 'react-icons/io';
import { FaUser } from 'react-icons/fa';
import EmploymentType from './_components/employementType';
import Positions from './_components/positions';

function Settings() {
  const [tabPosition, setTabPosition] = useState<'left' | 'top'>('left');

  // Update tab position based on screen width
  useEffect(() => {
    const updateTabPosition = () => {
      if (window.innerWidth < 768) {
        setTabPosition('top');
      } else {
        setTabPosition('left');
      }
    };

    // Initial check
    updateTabPosition();

    // Add resize listener
    window.addEventListener('resize', updateTabPosition);

    // Clean up listener on component unmount
    return () => {
      window.removeEventListener('resize', updateTabPosition);
    };
  }, []);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span className="flex gap-2 mt-4">
          <FaUser className="mt-1" />{' '}
          <p className="font-semibold">Employment Type</p>
        </span>
      ),
      children: <EmploymentType />,
    },
    {
      key: '2',
      label: (
        <span className="flex gap-2 mt-4">
          <IoMdSettings className="mt-1" />{' '}
          <p className="font-semibold">Role Permission</p>
        </span>
      ),
      children: <SettingsPage />,
    },
    {
      key: '3',
      label: (
        <span className="flex gap-2 mt-4">
          <IoMdSettings className="mt-1" />{' '}
          <p className="font-semibold">Position</p>
        </span>
      ),
      children: <Positions />,
    },
  ];

  return (
    <>
      <div className="flex justify-start bg-[#F5F5F5] -mt-2 -ml-2">
        <Card className="shadow-none bg-[#F5F5F5]" bordered={false}>
          <p className="font-bold text-xl">Setting</p>
          <p className="text-gray-400">Setting Your Attendance</p>
        </Card>
      </div>
      <Tabs
        defaultActiveKey="1"
        moreIcon={false}
        className="bg-white min-w-full"
        items={items}
        tabPosition={tabPosition}
      />
    </>
  );
}

export default Settings;
