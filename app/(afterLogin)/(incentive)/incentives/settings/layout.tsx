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
import { useIsMobile } from '@/hooks/useIsMobile';

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

  const { isMobile } = useIsMobile();

  useEffect(() => {
    if (recognitionData && recognitionData?.length > 0) {
      // Extract the first item separately
      const firstItem = recognitionData[0];

      const defaultIncentiveSettings = {
        item: {
          key: 'IncentiveSettings',
          icon: !isMobile ? (
            <CiCalendarDate
              id="incentive-settings-layout-default-icon"
              data-cy="incentive-settings-layout-default-icon"
              size={16}
              className={
                currentItem === 'defaultIncentiveCard' ||
                currentItem === firstItem?.id
                  ? 'text-[#4DAEF0]'
                  : 'text-gray-500'
              }
            />
          ) : null,

          label: (
            <p id="incentive-settings-layout-default-label" data-cy="incentive-settings-layout-default-label" className="menu-item-label">
              {firstItem?.name ?? 'Default Incentive '}
            </p>
          ),
          className:
            currentItem === 'defaultIncentiveCard' ||
            currentItem === firstItem?.id
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
                id={`incentive-settings-layout-dynamic-icon-${item?.id}`}
                data-cy={`incentive-settings-layout-dynamic-icon-${item?.id}`}
                size={16}
                className={
                  currentItem === item?.id ? 'text-[#4DAEF0]' : 'text-gray-500'
                }
              />
            ) : null,
            label: <p id={`incentive-settings-layout-dynamic-label-${item?.id}`} data-cy={`incentive-settings-layout-dynamic-label-${item?.id}`} className="menu-item-label">{item?.name || '-'}</p>,
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
    <div id="incentive-settings-layout-container" data-cy="incentive-settings-layout-container" className="min-h-screen bg-[#fafafa] p-3">
      <PageHeader data-cy="incentive-settings-layout-header" title="Settings" description="Incentive Settings" />

      <div id="incentive-settings-layout-content" data-cy="incentive-settings-layout-content" className="flex flex-col lg:flex-row gap-6 mt-3 ">
        {responseLoading ? (
          <div id="incentive-settings-layout-skeleton-container" data-cy="incentive-settings-layout-skeleton-container" className="w-64">
            <Skeleton data-cy="incentive-settings-layout-skeleton" active paragraph={{ rows: 6 }} />
          </div>
        ) : (
          <SidebarMenu data-cy="incentive-settings-layout-sidebar" menuItems={incentiveSidebarMenuItems} />
        )}
        <BlockWrapper data-cy="incentive-settings-layout-block-wrapper" className="flex-1 h-full bg-[#fafafa] p-0 ">
          {children}
        </BlockWrapper>
      </div>
    </div>
  );
};

export default IncentiveSettingsLayout;
