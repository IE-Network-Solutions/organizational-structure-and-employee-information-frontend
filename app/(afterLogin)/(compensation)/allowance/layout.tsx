'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import SidebarMenu from '@/components/sidebarMenu';
import { useFetchAllowances } from '@/store/server/features/compensation/allowance/queries';
import { SidebarMenuItem } from '@/types/sidebarMenu';

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const AllowanceLayout: FC<TimesheetSettingsLayoutProps> = ({ children }) => {
  const { data } = useFetchAllowances();
  const [menuItems, setMenuItems] = useState<any>([]);

  useEffect(() => {
    if (data) {
      const filteredData = data.filter(
        (item: any) => item.type === 'ALLOWANCE',
      );
      const dynamicMenuItems =
        filteredData?.map((allowance: any) => ({
          item: {
            key: allowance.id,
            label: (
              <p title={allowance.name} className="menu-item-label">
                {allowance.name?.length > 15
                  ? allowance.name?.slice(0, 15) + '...'
                  : allowance.name || 'Unnamed Allowance'}
              </p>
            ),
            className: 'px-1',
          },
          link: `/allowance/${allowance.id}`,
        })) || [];

      const allAllowanceItem = {
        item: {
          key: 'allAllowance',
          label: <p className="menu-item-label">All Allowances</p>,
          className: 'px-1',
        },
        link: '/allowance/allAllowance',
      };

      setMenuItems([allAllowanceItem, ...dynamicMenuItems]);
    }
  }, [data]);

  const sidebarMenuItems = new SidebarMenuItem(menuItems);

  return (
    <div className="min-h-screen bg-[#fafafa] p-2">
      <div className="h-auto w-auto">
        <PageHeader title="Allowance" description="Allowance" />

        <div className="flex flex-col lg:flex-row gap-6 mt-3">
          <SidebarMenu menuItems={sidebarMenuItems} />

          <BlockWrapper className="flex-1 h-max overflow-x-auto p-0">
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default AllowanceLayout;
