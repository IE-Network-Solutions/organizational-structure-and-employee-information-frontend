'use client';
import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Breadcrumb, Button } from 'antd';
import { MdOutlinePayments } from 'react-icons/md';
import { FaUserPlus } from 'react-icons/fa';
import { LeftOutlined } from '@ant-design/icons';
import CustomBreadcrumb from '@/components/common/breadCramp';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import DeductiontypeSideBar from '../compensationSetting/deductionType/_components/DeductiontypeSideBar';
import { useFetchAllowance } from '@/store/server/features/compensation/allowance/queries';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';

interface DeductionLayoutProps {
  children: ReactNode;
}

/** Breaks out of Nav content padding (navBar `px-2` / `sm:px-6`) for a full-width rule. */
const BreadcrumbRule = () => (
  <div
    className="pointer-events-none box-border max-w-none shrink-0 border-0 border-t border-solid border-gray-200 -mx-2 w-[calc(100%+1rem)] sm:-mx-6 sm:w-[calc(100%+3rem)]"
    aria-hidden
    data-cy="compensation-deduction-breadcrumb-rule"
  />
);

const DeductionDetailHeader = ({ deductionId }: { deductionId: string }) => {
  const { data: deductionData } = useFetchAllowance(deductionId);
  const { setIsAllowanceEntitlementSidebarOpen } =
    useAllowanceEntitlementStore();
  const { setIsBenefitEntitlementSidebarOpen } = useBenefitEntitlementStore();

  const deductionName = deductionData?.name ?? 'Deduction';
  const isGlobal = deductionData?.applicableTo === 'GLOBAL';
  const isRateBased = deductionData?.isRate === true;

  const handleAddEmployee = () => {
    if (isRateBased) {
      setIsAllowanceEntitlementSidebarOpen(true);
    } else {
      setIsBenefitEntitlementSidebarOpen(true);
    }
  };

  return (
    <>
      <div
        className="flex flex-wrap justify-between items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 sm:border-b sm:border-gray-200"
        id="compensation-deduction-detail-header"
        data-cy="compensation-deduction-detail-header"
      >
        <div
          className="min-w-0 flex-1 flex items-center gap-2 sm:gap-3"
          data-cy="compensation-deduction-detail-header-main"
        >
          <Link
            href="/deduction"
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 shrink-0"
            data-cy="compensation-deduction-detail-back"
          >
            <LeftOutlined style={{ fontSize: 14 }} />
          </Link>
          <div
            className="min-w-0 flex-1 flex flex-col gap-1.5"
            data-cy="compensation-deduction-detail-header-breadcrumb-wrap"
          >
            <span
              className="block min-w-0 text-lg sm:text-2xl font-bold text-gray-900 truncate"
              data-cy="compensation-deduction-detail-title"
            >
              {deductionName}
            </span>
            <Breadcrumb
              separator="/"
              className="text-sm"
              items={[
                {
                  title: (
                    <span
                      className="text-sm font-medium text-slate-500"
                      data-cy="compensation-deduction-detail-crumb-compensation"
                    >
                      Compensation and Benefit
                    </span>
                  ),
                },
                {
                  title: (
                    <span
                      className="text-sm font-bold text-black/70"
                      data-cy="compensation-deduction-detail-crumb-deduction"
                    >
                      Deduction
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </div>
        <div
          className="flex flex-shrink-0 flex-wrap justify-end items-center gap-2 sm:gap-4 mr-3"
          data-cy="compensation-deduction-detail-header-actions"
        >
          <AccessGuard permissions={[Permissions.CreateAllowanceEntitlement]}>
            <Button
              type="primary"
              icon={<FaUserPlus className="text-base sm:text-lg" />}
              className="h-9 w-9 min-w-9 sm:h-10 sm:w-auto sm:min-w-0 sm:px-4 text-xs sm:text-base font-normal"
              onClick={handleAddEmployee}
              disabled={isGlobal}
              data-cy="compensation-deduction-detail-add-employee-button"
            >
              <span
                className="hidden sm:inline"
                data-cy="compensation-deduction-detail-add-employee-label"
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

const AllDeductionPageHeader = () => (
  <>
    <div
      className="flex flex-wrap justify-between items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 sm:border-b sm:border-gray-200"
      id="compensation-deduction-all-layout-header"
      data-cy="compensation-deduction-all-layout-header"
    >
      <div
        className="min-w-0 flex-1 flex items-center gap-2 sm:gap-3"
        data-cy="compensation-deduction-all-layout-header-main"
      >
        <Link
          href="/deduction"
          className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 shrink-0"
          data-cy="compensation-deduction-all-layout-back"
        >
          <LeftOutlined style={{ fontSize: 14 }} />
        </Link>
        <div
          className="min-w-0 flex-1 flex flex-col gap-1.5"
          data-cy="compensation-deduction-all-layout-title-wrap"
        >
          <span
            className="text-lg sm:text-2xl font-bold text-gray-900 truncate"
            data-cy="compensation-deduction-all-layout-title"
          >
            All Deduction
          </span>
          <Breadcrumb
            separator="/"
            className="text-sm"
            items={[
              {
                title: (
                  <span
                    className="text-sm font-medium text-slate-500"
                    data-cy="compensation-deduction-all-crumb-compensation"
                  >
                    Compensation and Benefit
                  </span>
                ),
              },
              {
                title: (
                  <span
                    className="text-sm font-bold text-black/70"
                    data-cy="compensation-deduction-all-crumb-deduction"
                  >
                    Deduction
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  </>
);

const DeductionLayout: FC<DeductionLayoutProps> = ({ children }) => {
  const params = useParams();
  const pathname = usePathname();
  const deductionId = params?.id;
  const isAllDeductionPage = Boolean(pathname?.includes('allDeduction'));
  const { setIsDeductionOpen, setSelectedDeductionRecord } =
    useCompensationSettingStore();

  const handleAddDeductionType = () => {
    setSelectedDeductionRecord(null);
    setIsDeductionOpen(true);
  };

  const isDetailPage = Boolean(deductionId);

  return (
    <div
      className="min-h-screen w-full min-w-0 bg-white"
      id="compensation-deduction-layout-wrapper"
      data-cy="compensation-deduction-layout-wrapper"
    >
      <div
        className="h-auto w-full min-w-0 bg-white"
        id="compensation-deduction-layout-body"
        data-cy="compensation-deduction-layout-body"
      >
        {isDetailPage && deductionId ? (
          <>
            <BreadcrumbRule />
            <DeductionDetailHeader deductionId={deductionId as string} />
            <BreadcrumbRule />
          </>
        ) : isAllDeductionPage ? (
          <>
            <BreadcrumbRule />
            <AllDeductionPageHeader />
            <BreadcrumbRule />
          </>
        ) : (
          <>
            <div
              className="block sm:hidden px-4 pt-4 pb-3"
              id="compensation-deduction-layout-page-header"
              data-cy="compensation-deduction-layout-page-header"
            >
              <div
                className="flex items-center justify-between gap-3"
                data-cy="compensation-deduction-layout-mobile-header-row"
              >
                <div
                  className="min-w-0 flex-1"
                  data-cy="compensation-deduction-layout-mobile-breadcrumb-wrap"
                >
                  <CustomBreadcrumb
                    title="Deduction"
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
                                data-cy="compensation-deduction-breadcrumb-parent"
                              >
                                Compensation and Benefit
                              </span>
                            ),
                          },
                          {
                            title: (
                              <span
                                className="text-sm font-bold text-slate-500"
                                data-cy="compensation-deduction-breadcrumb-deduction"
                              >
                                Deduction
                              </span>
                            ),
                          },
                        ]}
                      />
                    }
                    data-cy="compensation-deduction-layout-breadcrumb"
                  />
                </div>
                <AccessGuard permissions={[Permissions.CreateBenefitType]}>
                  <Button
                    type="primary"
                    icon={<MdOutlinePayments className="text-base" />}
                    className="h-10 w-10 min-w-10 rounded-md"
                    onClick={handleAddDeductionType}
                    data-cy="compensation-deduction-add-deduction-type-button"
                  />
                </AccessGuard>
              </div>
            </div>

            <BlockWrapper className="h-auto w-full min-w-0 bg-white hidden sm:block">
              <div
                className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 pt-5 pb-3 sm:px-4"
                id="compensation-deduction-layout-page-header-desktop"
                data-cy="compensation-deduction-layout-page-header-desktop"
              >
                <div
                  className="min-w-0 flex-1 flex flex-col gap-1.5"
                  data-cy="compensation-deduction-layout-desktop-breadcrumb-wrap"
                >
                  <div
                    className="min-w-0 text-2xl font-bold leading-[31.20px] !text-[#000000] truncate"
                    data-cy="compensation-deduction-layout-desktop-title"
                  >
                    Deduction
                  </div>
                  <div
                    className="text-sm font-medium leading-snug"
                    data-cy="breadcrumb-subtitle"
                  >
                    <Breadcrumb
                      separator="/"
                      className="text-sm"
                      items={[
                        {
                          title: (
                            <span
                              className="text-sm font-medium text-slate-500"
                              data-cy="compensation-deduction-breadcrumb-parent"
                            >
                              Compensation and Benefit
                            </span>
                          ),
                        },
                        {
                          title: (
                            <span
                              className="text-sm font-bold text-slate-500"
                              data-cy="compensation-deduction-breadcrumb-deduction"
                            >
                              Deduction
                            </span>
                          ),
                        },
                      ]}
                    />
                  </div>
                </div>
                <div
                  className="flex flex-shrink-0 flex-wrap items-center justify-end gap-4 mr-3"
                  id="compensation-deduction-layout-actions"
                  data-cy="compensation-deduction-layout-actions"
                >
                  <AccessGuard permissions={[Permissions.CreateBenefitType]}>
                    <Button
                      type="primary"
                      icon={<MdOutlinePayments className="text-lg" />}
                      className="h-10 font-normal"
                      onClick={handleAddDeductionType}
                      data-cy="compensation-deduction-add-deduction-type-button-desktop"
                    >
                      Add Deduction Type
                    </Button>
                  </AccessGuard>
                </div>
              </div>
            </BlockWrapper>
            <BreadcrumbRule />
          </>
        )}
        <div
          id="compensation-deduction-layout-content"
          data-cy="compensation-deduction-layout-content"
        >
          <div
            className="w-full min-w-0"
            data-cy="compensation-deduction-layout-main-row"
          >
            <BlockWrapper
              data-cy="compensation-deduction-layout-block-wrapper-content"
              withBackground={false}
              className="h-max w-full min-w-0 overflow-x-auto bg-white pr-0 sm:pr-2"
            >
              {children}
            </BlockWrapper>
          </div>
        </div>
        <DeductiontypeSideBar data-cy="compensation-deduction-add-deduction-type-sidebar" />
      </div>
    </div>
  );
};

export default DeductionLayout;
