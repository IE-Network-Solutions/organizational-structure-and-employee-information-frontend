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
              <div title={deduction?.name} className=" font-bold">
                {deduction?.name?.length > 15
                  ? deduction.name?.slice(0, 15) + '...'
                  : deduction.name || 'Unnamed Allowance'}
              </div>
            ),
          },
          link: `/deduction/${deduction.id}`,
        })) || [];

      const allAllowanceItem = {
        item: {
          key: 'allDeduction',
          label: <div className=" font-bold">All Deductions</div>,
        },
        link: '/deduction/allDeduction',
      };

      setMenuItems([allAllowanceItem, ...dynamicMenuItems]);
    }
  }, [data]);

  const sidebarMenuItems = new SidebarMenuItem(menuItems);

  return (
    <div
      className="min-h-screen bg-[#f5f5f5]"
      id="compensation-deduction-layout-wrapper"
      data-cy="compensation-deduction-layout-wrapper"
    >
      <div
        className="h-auto w-auto bg-[#f5f5f5]"
        id="compensation-deduction-layout-body"
        data-cy="compensation-deduction-layout-body"
      >
        <PageHeader
          title="Deduction"
          description="Deduction"
          className="hidden sm:block"
          horizontalPadding="0px"
          data-cy="compensation-deduction-layout-header-title"
        />

        <div
          className="flex flex-col lg:flex-row gap-3 sm:gap-6"
          id="compensation-deduction-layout-content"
          data-cy="compensation-deduction-layout-content"
        >
          <SidebarMenu
            menuItems={sidebarMenuItems}
            data-cy="compensation-deduction-layout-sidebar-menu"
          />

          <BlockWrapper
            className="flex-1 h-max overflow-x-auto sm:mr-4"
            data-cy="compensation-deduction-layout-block-wrapper-content"
          >
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default BenefitLayout;
