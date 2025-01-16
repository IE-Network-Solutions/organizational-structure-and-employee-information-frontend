'use client';

import React, { FC, ReactNode, useEffect, useState } from 'react';
import { TbCalendar } from 'react-icons/tb';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import SidebarMenu from '@/components/sidebarMenu';
import { HiOutlineReceiptTax } from 'react-icons/hi';
import { GoShare } from 'react-icons/go';
import { PiShareFat } from 'react-icons/pi';
import { usePathname } from 'next/navigation';

interface IncentiveSettingsLayoutProps {
  children: ReactNode;
}

const IncentiveSettingsLayout: FC<IncentiveSettingsLayoutProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const [currentItem, setCurrentItem] = useState<string>('');

  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'project',
        icon: (
          <HiOutlineReceiptTax
            size={16}
            className={
              currentItem === 'project' ? 'text-[#4DAEF0]' : 'text-gray-500'
            }
          />
        ),
        label: <p className="menu-item-label">Project</p>,
        className: currentItem === 'tax-rule' ? 'px-6' : 'px-1',
      },
      link: '/incentive/settings/project',
    },
    {
      item: {
        key: 'sales',
        icon: (
          <GoShare
            size={16}
            className={
              currentItem === 'sales' ? 'text-[#4DAEF0]' : 'text-gray-500'
            }
          />
        ),
        label: <p className="menu-item-label">Sales</p>,
        className: 'px-1',
      },
      link: '/incentive/settings/sales',
    },
    {
      item: {
        key: 'management',
        icon: (
          <PiShareFat
            size={16}
            className={
              currentItem === 'management' ? 'text-[#4DAEF0]' : 'text-gray-500'
            }
          />
        ),
        label: <p className="menu-item-label">Management</p>,
        className: 'px-1',
      },
      link: '/incentive/settings/management',
    },
    {
      item: {
        key: 'other',
        icon: (
          <TbCalendar
            size={16}
            className={
              currentItem === 'other' ? 'text-[#4DAEF0]' : 'text-gray-500'
            }
          />
        ),
        label: <p className="menu-item-label">Other</p>,
        className: 'px-1',
      },
      link: '/incentive/settings/other',
    },
  ]);

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastKey = pathSegments[pathSegments.length - 1];

    setCurrentItem(lastKey);
  }, [pathname]);

  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3 bg-none">
      <PageHeader title="Settings" description="Incentive Settings" />

      <div className="flex gap-6 mt-8 ">
        <SidebarMenu menuItems={menuItems} />
        <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
      </div>
    </div>
  );
};

export default IncentiveSettingsLayout;
