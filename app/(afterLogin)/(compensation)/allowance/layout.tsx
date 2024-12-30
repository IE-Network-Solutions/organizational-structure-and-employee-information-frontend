'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import { CiCalendarDate } from 'react-icons/ci';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import SidebarMenu from '@/components/sidebarMenu';
import { useFetchAllowances } from '@/store/server/features/compensation/allowance/queries';
import { SidebarMenuItem } from '@/types/sidebarMenu';

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const AllowanceLayout: FC<TimesheetSettingsLayoutProps> = ({
  children,
}) => {
  const { data } = useFetchAllowances();
  const [menuItems, setMenuItems] = useState<any>([]);

  useEffect(() => {
    if (data) {
      const filteredData = data.filter((item: any) => item.type === 'ALLOWANCE');
      const dynamicMenuItems = filteredData?.map((allowance: any) => ({
        item: {
          key: allowance.id,
          icon: <CiCalendarDate />,
          label: (
            <p className="menu-item-label">{allowance.name || 'Unnamed Allowance'}</p>
          ),
          className: 'px-1',
        },
        link: `/allowance/${allowance.id}`,
      })) || [];

      const allAllowanceItem = {
        item: {
          key: 'allAllowance',
          icon: <CiCalendarDate />,
          label: <p className="menu-item-label">All Allowances</p>,
          className: 'px-1',
        },
        link: '/allowance/allAllowance',
      };

      setMenuItems([
        allAllowanceItem,
        ...dynamicMenuItems,
      ]);
    }
  }, [data]);

  const sidebarMenuItems = new SidebarMenuItem(menuItems);

  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <PageHeader title="Allowance" description="Allowance" />

      <div className="flex gap-6 mt-8">
        <SidebarMenu menuItems={sidebarMenuItems} />

        <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
      </div>
    </div>
  );
};

export default AllowanceLayout;