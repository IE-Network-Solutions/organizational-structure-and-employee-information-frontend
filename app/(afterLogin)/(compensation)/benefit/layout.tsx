'use client';
import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button, Breadcrumb } from 'antd';
import { MdOutlinePayments } from 'react-icons/md';
import { FaUserPlus } from 'react-icons/fa';
import { LeftOutlined } from '@ant-design/icons';
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

/** Full-bleed horizontal rule so the line always spans the header block edge-to-edge */
const BreadcrumbRule = () => (
  <div
    className="w-full min-w-0 shrink-0 border-0 border-t border-solid border-gray-200"
    aria-hidden
    data-cy="compensation-benefit-breadcrumb-rule"
  />
);

const BenefitDetailHeader = () => {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { data: benefitData } = useFetchBenefit(id ?? '');
  const { setIsBenefitEntitlementSidebarOpen } = useBenefitEntitlementStore();

  if (!id) return null;

  const benefitName = benefitData?.name ?? 'Benefit';
  const isGlobal = benefitData?.applicableTo === 'GLOBAL';

  return (
    <>
      <div
        className="flex flex-wrap justify-between items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 sm:border-b sm:border-gray-200"
        id="compensation-benefit-detail-header"
        data-cy="compensation-benefit-detail-header"
      >
        <div
          className="min-w-0 flex-1 flex items-center gap-2 sm:gap-3"
          data-cy="compensation-benefit-detail-header-main"
        >
          <Link
            href="/benefit"
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 shrink-0"
            data-cy="compensation-benefit-detail-back"
          >
            <LeftOutlined style={{ fontSize: 14 }} />
          </Link>
          <div
            className="min-w-0 flex-1"
            data-cy="compensation-benefit-detail-header-breadcrumb-wrap"
          >
            <CustomBreadcrumb
              title={
                <span
                  className="text-lg sm:text-2xl font-bold text-gray-900 truncate block"
                  data-cy="compensation-benefit-detail-title"
                >
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
            />
          </div>
        </div>
        <div
          className="flex flex-shrink-0 flex-wrap justify-end items-center gap-2 sm:gap-4 mr-3"
          data-cy="compensation-benefit-detail-header-actions"
        >
          <AccessGuard permissions={[Permissions.CreateBenefitEntitlement]}>
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
      </div>
    </>
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
            <BreadcrumbRule />
            <BenefitDetailHeader />
            <BreadcrumbRule />
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
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 pt-5 pb-3 sm:px-6"
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
                <div
                  className="flex flex-shrink-0 flex-wrap items-center justify-end gap-4 mr-3"
                  id="compensation-benefit-layout-actions"
                  data-cy="compensation-benefit-layout-actions"
                >
                  <AccessGuard permissions={[Permissions.CreateBenefitType]}>
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
              </div>
            </BlockWrapper>
            <BreadcrumbRule />
          </>
        )}
        <div
          id="compensation-benefit-layout-content"
          data-cy="compensation-benefit-layout-content"
        >
          <BlockWrapper
            data-cy="compensation-benefit-layout-block-wrapper-content"
            withBackground={false}
            className="w-full h-max overflow-x-auto bg-white pr-0 sm:pr-2"
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
