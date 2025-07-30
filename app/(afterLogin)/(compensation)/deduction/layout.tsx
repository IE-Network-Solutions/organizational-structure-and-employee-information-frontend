'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import SidebarMenu from '@/components/sidebarMenu';
import { useFetchBenefits } from '@/store/server/features/compensation/benefit/queries';
import { SidebarMenuItem } from '@/types/sidebarMenu';

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const BenefitLayout: FC<TimesheetSettingsLayoutProps> = ({ children }) => {
  const { data } = useFetchBenefits();
  const [menuItems, setMenuItems] = useState<any>([]);

  useEffect(() => {
    if (data) {
      const filteredData = data.filter(
        (item: any) => item.type === 'DEDUCTION',
      );
      const dynamicMenuItems =
        filteredData?.map((deduction: any) => ({
          item: {
            key: deduction.id,
            label: (
              <p title={deduction?.name} className="menu-item-label">
                {deduction?.name?.length > 15
                  ? deduction.name?.slice(0, 15) + '...'
                  : deduction.name || 'Unnamed Allowance'}
              </p>
            ),
            className: 'px-1',
          },
          link: `/deduction/${deduction.id}`,
        })) || [];

      const allAllowanceItem = {
        item: {
          key: 'allDeduction',
          label: <p className="menu-item-label">All Deductions</p>,
          className: 'px-1',
        },
        link: '/deduction/allDeduction',
      };

      setMenuItems([allAllowanceItem, ...dynamicMenuItems]);
    }
  }, [data]);

  const sidebarMenuItems = new SidebarMenuItem(menuItems);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="h-auto w-auto ">
        <PageHeader
          title="Deduction"
          description="Deduction"
          className="hidden sm:block"
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <SidebarMenu menuItems={sidebarMenuItems} />

          <BlockWrapper className="flex-1 h-max overflow-x-auto scrollbar-hide">
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default BenefitLayout;
