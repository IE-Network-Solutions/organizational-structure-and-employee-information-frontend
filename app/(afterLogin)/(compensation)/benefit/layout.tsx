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
      const filteredData = data.filter((item: any) => item.type === 'MERIT');
      const dynamicMenuItems =
        filteredData?.map((allowance: any) => ({
          item: {
            key: allowance.id,
            label: (
              <div
                className=" font-bold"
                title={allowance.name}
                data-cy={`benefit-menu-item-${allowance.id}`}
              >
                <span data-cy={`benefit-menu-item-label-${allowance.id}`}>
                  {allowance.name?.length > 15
                    ? allowance.name?.slice(0, 15) + '...'
                    : allowance.name || 'Unnamed Allowance'}
                </span>
              </div>
            ),
          },
          link: `/benefit/${allowance.id}`,
        })) || [];

      const allAllowanceItem = {
        item: {
          key: 'variablePay',
          label: (
            <div
              className=" font-bold"
              data-cy="benefit-menu-item-variable-pay"
            >
              <span data-cy="benefit-menu-item-variable-pay-label">
                Variable Pay
              </span>
            </div>
          ),
        },
        link: '/benefit/variablePay',
      };

      setMenuItems([allAllowanceItem, ...dynamicMenuItems]);
    }
  }, [data]);

  const sidebarMenuItems = new SidebarMenuItem(menuItems);

  return (
    <div
      className="min-h-screen bg-[#f5f5f5]"
      id="compensation-benefit-layout-wrapper"
      data-cy="compensation-benefit-layout-wrapper"
    >
      <div
        className="h-auto w-auto bg-[#f5f5f5]"
        id="compensation-benefit-layout-body"
        data-cy="compensation-benefit-layout-body"
      >
        <div
          id="compensation-benefit-layout-page-header"
          data-cy="compensation-benefit-layout-page-header"
        >
          <PageHeader
            title="Benefit"
            data-cy="compensation-benefit-layout-page-header-title"
            description="Benefit"
            className="hidden sm:block"
            horizontalPadding="0px"
          />
        </div>
        <div
          className="flex flex-col lg:flex-row gap-3 sm:gap-6"
          id="compensation-benefit-layout-content"
          data-cy="compensation-benefit-layout-content"
        >
          <div
            id="compensation-benefit-layout-sidebar"
            data-cy="compensation-benefit-layout-sidebar"
          >
            <SidebarMenu
              data-cy="compensation-benefit-layout-sidebar-menu"
              menuItems={sidebarMenuItems}
            />
          </div>

          <div
            id="compensation-benefit-layout-block-wrapper"
            data-cy="compensation-benefit-layout-block-wrapper"
          >
            <BlockWrapper
              data-cy="compensation-benefit-layout-block-wrapper-content"
              className="flex-1 h-max overflow-x-auto"
            >
              {children}
            </BlockWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitLayout;
