'use client';

import React, { FC, ReactNode, useEffect } from 'react';
import { TbCalendar } from 'react-icons/tb';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import SidebarMenu from '@/components/sidebarMenu';
import { usePathname } from 'next/navigation';
import { useAllChildrenRecognition } from '@/store/server/features/incentive/other/queries';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { CiCalendarDate } from 'react-icons/ci';
import { Skeleton } from 'antd';
import { useMediaQuery } from 'react-responsive';

interface IncentiveSettingsLayoutProps {
  children: ReactNode;
}

const IncentiveSettingsLayout: FC<IncentiveSettingsLayoutProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const { menuItems, setMenuItems, currentItem, setCurrentItem } =
    useIncentiveStore();
  const { data: recognitionData, isLoading: responseLoading } =
    useAllChildrenRecognition();
  const isMobile = useMediaQuery({ maxWidth: 1024 });

  useEffect(() => {
    if (recognitionData && recognitionData?.length > 0) {
      // Extract the first item separately
      const firstItem = recognitionData[0];

      const defaultIncentiveSettings = {
        item: {
          key: 'IncentiveSettings',
          icon: !isMobile ? (
            <CiCalendarDate
              size={16}
              className={
                currentItem === 'defaultIncentiveCard' || firstItem?.id
                  ? 'text-[#4DAEF0]'
                  : 'text-gray-500'
              }
            />
          ) : null,
          label: (
            <p className="menu-item-label">
              {firstItem?.name ?? 'Default Incentive '}
            </p>
          ),
          className:
            currentItem === 'defaultIncentiveCard' || firstItem?.id
              ? 'px-6'
              : 'px-1',
        },
        link: `/incentives/settings/${firstItem?.id ?? 'defaultIncentiveCard'}`,
      };

      // Map remaining items (excluding the first item)
      const dynamicMenuItems =
        recognitionData?.slice(1).map((item: any) => ({
          item: {
            key: item?.id,
            icon: !isMobile ? (
              <TbCalendar
                size={16}
                className={
                  currentItem === item?.id ? 'text-[#4DAEF0]' : 'text-gray-500'
                }
              />
            ) : null,
            label: <p className="menu-item-label">{item?.name || '-'}</p>,
            className: currentItem === item?.id ? 'px-6' : 'px-1',
          },
          link: `/incentives/settings/${item?.id}`,
        })) || [];

      setMenuItems([defaultIncentiveSettings, ...dynamicMenuItems]);
    }
  }, [recognitionData, currentItem]);

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastKey = pathSegments[pathSegments.length - 1];

    setCurrentItem(lastKey);
  }, [pathname]);

  const incentiveSidebarMenuItems = new SidebarMenuItem(menuItems);

  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3 bg-gray-100 p-0 rounded-lg  ">
      <PageHeader title="Settings" description="Incentive Settings" />

      <div className="flex flex-col lg:flex-row gap-6 mt-8 ">
        {responseLoading ? (
          <div className="w-64">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : (
          <SidebarMenu menuItems={incentiveSidebarMenuItems} />
        )}
        <BlockWrapper className="flex-1 h-full">{children}</BlockWrapper>
      </div>
    </div>
  );
};

export default IncentiveSettingsLayout;
