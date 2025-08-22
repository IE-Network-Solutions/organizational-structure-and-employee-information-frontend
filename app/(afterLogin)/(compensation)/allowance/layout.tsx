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
              <div title={allowance.name} className=" font-bold">
                {allowance.name?.length > 15
                  ? allowance.name?.slice(0, 15) + '...'
                  : allowance.name || 'Unnamed Allowance'}
              </div>
            ),
          },
          link: `/allowance/${allowance.id}`,
        })) || [];

      const allAllowanceItem = {
        item: {
          key: 'allAllowance',
          label: <div className=" font-bold">All Allowances</div>,
        },
        link: '/allowance/allAllowance',
      };

      setMenuItems([allAllowanceItem, ...dynamicMenuItems]);
    }
  }, [data]);

  const sidebarMenuItems = new SidebarMenuItem(menuItems);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="h-auto w-auto bg-[#f5f5f5]">
        <PageHeader
          title="Allowance"
          description="Allowance"
          className="hidden sm:block"
          horizontalPadding="0px"
        />

        <div className="flex flex-col lg:flex-row gap-3 sm:gap-6">
          <SidebarMenu menuItems={sidebarMenuItems} />

          <BlockWrapper className="flex-1 h-max overflow-x-auto">
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default AllowanceLayout;
