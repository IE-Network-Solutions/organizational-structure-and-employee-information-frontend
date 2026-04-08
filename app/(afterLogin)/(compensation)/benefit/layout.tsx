'use client';
import { FC, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { Button, Breadcrumb } from 'antd';
import { MdOutlinePayments } from 'react-icons/md';
import { FaUserPlus } from 'react-icons/fa';
import CustomBreadcrumb from '@/components/common/breadCramp';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { useFetchBenefit } from '@/store/server/features/compensation/benefit/queries';
import BenefitypeSideBar from '../compensationSetting/benefitType/_components/benefitTypeSidebar';

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const BenefitDetailHeader = () => {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { data: benefitData } = useFetchBenefit(id ?? '');
  const { setIsBenefitEntitlementSidebarOpen } = useBenefitEntitlementStore();

  if (!id) return null;

  const benefitName = benefitData?.name ?? 'Benefit';
  const isGlobal = benefitData?.applicableTo === 'GLOBAL';

  return (
    <div
      id="compensation-benefit-detail-header"
      data-cy="compensation-benefit-detail-header"
    >
      <div
        className="min-w-0 flex-1 w-full"
        data-cy="compensation-benefit-detail-header-main"
      >
        <div
          className="min-w-0 w-full"
          data-cy="compensation-benefit-detail-header-breadcrumb-wrap"
        >
          <CustomBreadcrumb
            href="/benefit"
            backControlDataCy="compensation-benefit-detail-back"
            showBottomSeparator={true}
            title={
              <span data-cy="compensation-benefit-detail-title">
                {benefitName}
              </span>
            }
            subtitle={
              <Breadcrumb
                separator="/"
                className="text-sm"
                items={[
                  {
                    title: (
                      <span
                        className="text-sm font-medium text-slate-500"
                        data-cy="compensation-benefit-detail-crumb-compensation"
                      >
                        Compensation and Benefit
                      </span>
                    ),
                  },
                  {
                    title: (
                      <span
                        className="text-sm font-bold text-black/70"
                        data-cy="compensation-benefit-detail-crumb-benefit"
                      >
                        Benefit
                      </span>
                    ),
                  },
                ]}
              />
            }
            titleExtra={
              <div
                className="flex flex-shrink-0 flex-wrap justify-end items-center gap-2 sm:gap-4 mr-3"
                data-cy="compensation-benefit-detail-header-actions"
              >
                <AccessGuard
                  permissions={[Permissions.CreateBenefitEntitlement]}
                >
                  <Button
                    type="primary"
                    icon={<FaUserPlus className="text-base sm:text-lg" />}
                    className="h-9 w-9 min-w-9 sm:h-10 sm:w-auto sm:min-w-0 sm:px-4 text-xs sm:text-base font-normal"
                    onClick={() => setIsBenefitEntitlementSidebarOpen(true)}
                    disabled={isGlobal}
                    data-cy="compensation-benefit-detail-all-employee-button"
                  >
                    <span
                      className="hidden sm:inline"
                      data-cy="compensation-benefit-detail-add-employee-label"
                    >
                      Add Employee
                    </span>
                  </Button>
                </AccessGuard>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

const BenefitLayout: FC<TimesheetSettingsLayoutProps> = ({ children }) => {
  const params = useParams();
  const benefitId = params?.id;
  const { setIsBenefitOpen, setSelectedBenefitRecord } =
    useCompensationSettingStore();

  const handleAddBenefitType = () => {
    setSelectedBenefitRecord(null);
    setIsBenefitOpen(true);
  };

  const isDetailPage = Boolean(benefitId);

  return (
    <div
      className="min-h-screen w-full min-w-0 bg-white"
      id="compensation-benefit-layout-wrapper"
      data-cy="compensation-benefit-layout-wrapper"
    >
      <div
        className="h-auto w-full min-w-0 bg-white"
        id="compensation-benefit-layout-body"
        data-cy="compensation-benefit-layout-body"
      >
        {isDetailPage ? (
          <>
            <BenefitDetailHeader />
          </>
        ) : (
          <>
            {/* Mobile page header */}
            <div
              className="block sm:hidden px-3 pt-4 pb-3"
              id="compensation-benefit-layout-page-header"
              data-cy="compensation-benefit-layout-page-header"
            >
              <div
                className="flex items-center justify-between gap-3"
                data-cy="compensation-benefit-layout-mobile-header-row"
              >
                <div
                  className="min-w-0 flex-1"
                  data-cy="compensation-benefit-layout-mobile-breadcrumb-wrap"
                >
                  <CustomBreadcrumb
                    title="Benefit"
                    titleClassName="!text-[#000000]"
                    rootClassName="!py-0 gap-1.5"
                    subtitle={
                      <Breadcrumb
                        separator="/"
                        className="text-sm"
                        items={[
                          {
                            title: (
                              <span
                                className="text-sm font-medium text-slate-500"
                                data-cy="compensation-benefit-breadcrumb-parent"
                              >
                                Compensation and Benefit
                              </span>
                            ),
                          },
                          {
                            title: (
                              <span
                                className="text-sm font-bold text-slate-500"
                                data-cy="compensation-benefit-breadcrumb-benefit"
                              >
                                Benefit
                              </span>
                            ),
                          },
                        ]}
                      />
                    }
                    data-cy="compensation-benefit-layout-breadcrumb"
                  />
                </div>
                <AccessGuard permissions={[Permissions.CreateBenefitType]}>
                  <Button
                    type="primary"
                    icon={<MdOutlinePayments className="text-base" />}
                    className="h-10 w-10 min-w-10 rounded-md"
                    onClick={handleAddBenefitType}
                    data-cy="compensation-benefit-add-benefit-type-button"
                  />
                </AccessGuard>
              </div>
            </div>

            {/* Desktop page header */}
            <BlockWrapper className="h-auto w-full min-w-0 bg-white hidden sm:block">
              <div
                id="compensation-benefit-layout-page-header-desktop"
                data-cy="compensation-benefit-layout-page-header-desktop"
              >
                <div
                  className="min-w-0 flex-1"
                  data-cy="compensation-benefit-layout-desktop-breadcrumb-wrap"
                >
                  <CustomBreadcrumb
                    title="Benefit"
                    titleClassName="!text-[#000000]"
                    rootClassName="!py-0 gap-1.5"
                    titleExtra={
                      <div
                        className="flex flex-shrink-0 flex-wrap items-center justify-end gap-4 mr-3"
                        id="compensation-benefit-layout-actions"
                        data-cy="compensation-benefit-layout-actions"
                      >
                        <AccessGuard
                          permissions={[Permissions.CreateBenefitType]}
                        >
                          <Button
                            type="primary"
                            icon={<MdOutlinePayments className="text-lg" />}
                            className="h-10 font-normal"
                            onClick={handleAddBenefitType}
                            data-cy="compensation-benefit-add-benefit-type-button"
                          >
                            Add Benefit Type
                          </Button>
                        </AccessGuard>
                      </div>
                    }
                    subtitle={
                      <Breadcrumb
                        separator="/"
                        className="text-sm"
                        items={[
                          {
                            title: (
                              <span
                                className="text-sm font-medium text-slate-500"
                                data-cy="compensation-benefit-breadcrumb-parent"
                              >
                                Compensation and Benefit
                              </span>
                            ),
                          },
                          {
                            title: (
                              <span
                                className="text-sm font-bold text-slate-500"
                                data-cy="compensation-benefit-breadcrumb-benefit"
                              >
                                Benefit
                              </span>
                            ),
                          },
                        ]}
                      />
                    }
                    data-cy="compensation-benefit-layout-breadcrumb"
                  />
                </div>
              </div>
            </BlockWrapper>
          </>
        )}
        <div
          id="compensation-benefit-layout-content"
          data-cy="compensation-benefit-layout-content"
        >
          <BlockWrapper
            data-cy="compensation-benefit-layout-block-wrapper-content"
            withBackground={false}
            className="h-max w-full overflow-x-auto bg-white"
          >
            {children}
          </BlockWrapper>
        </div>
        <BenefitypeSideBar data-cy="compensation-benefit-add-benefit-type-sidebar" />
      </div>
    </div>
  );
};

export default BenefitLayout;
