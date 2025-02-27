'use client';

import React, { FC, ReactNode, useEffect } from 'react';
import { TbCalendar } from 'react-icons/tb';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import SidebarMenu from '@/components/sidebarMenu';
import { usePathname } from 'next/navigation';
import { useAllRecognition } from '@/store/server/features/incentive/other/queries';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { CiCalendarDate } from 'react-icons/ci';
import { Skeleton } from 'antd';

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
    useAllRecognition();

  useEffect(() => {
    if (recognitionData && recognitionData?.items?.length > 0) {
      const firstItemId =
        recognitionData.items[0]?.id ?? 'defaultIncentiveCard';
      if (!currentItem) {
        setCurrentItem(firstItemId);
      }
      const dynamicMenuItems =
        recognitionData.items.slice(1).map((item: any) => ({
          item: {
            key: item?.id,
            icon: (
              <TbCalendar
                size={16}
                className={
                  currentItem === item?.id ? 'text-[#4DAEF0]' : 'text-gray-500'
                }
              />
            ),
            label: (
              <p className="menu-item-label">{item?.recognitionType?.name}</p>
            ),
            className: currentItem === item.id ? 'px-6' : 'px-1',
          },
          link: `/incentive/settings/${item?.id}`,
        })) || [];

      const defaultIncentiveSettings = {
        item: {
          key: recognitionData?.items[0]?.id ?? 'defaultIncentiveCard',
          icon: (
            <CiCalendarDate
              size={16}
              className={
                currentItem ===
                (recognitionData?.items[0]?.id ?? 'defaultIncentiveCard')
                  ? 'text-[#4DAEF0]'
                  : 'text-gray-500'
              }
            />
          ),
          label: (
            <p className="menu-item-label">
              {recognitionData?.items[0]?.recognitionType?.name ??
                'Default Incentive'}
            </p>
          ),
          className:
            currentItem ===
            (recognitionData?.items[0]?.id ?? 'defaultIncentiveCard')
              ? 'px-6'
              : 'px-1',
        },
        link: `/incentive/settings/${recognitionData?.items[0]?.id ?? 'defaultIncentiveCard'}`,
      };

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
    <div className="h-auto w-auto pr-6 pb-6 pl-3 bg-[#f5f5f5] rounded-lg ">
      <PageHeader title="Settings" description="Incentive Settings" />

      <div className="flex gap-6 mt-8 ">
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
