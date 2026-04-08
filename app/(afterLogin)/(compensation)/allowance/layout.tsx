'use client';
import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Breadcrumb, Button } from 'antd';
import { FaUserPlus } from 'react-icons/fa';
import { LeftOutlined } from '@ant-design/icons';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useFetchAllowance } from '@/store/server/features/compensation/allowance/queries';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import { MdOutlinePayments } from 'react-icons/md';
import AllowanceTypeSideBar from '../compensationSetting/allowanceType/_components/allowanceTypeSidebar';

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

/** Breaks out of Nav content padding (navBar `px-2` / `sm:px-6`) for a full-width rule. */
const BreadcrumbRule = () => (
  <div
    className="pointer-events-none box-border max-w-none shrink-0 border-0 border-t border-solid border-gray-200 -mx-2 w-[calc(100%+1rem)] sm:-mx-6 sm:w-[calc(100%+3rem)]"
    aria-hidden
    data-cy="compensation-allowance-breadcrumb-rule"
  />
);

const AllowanceDetailHeader = ({ allowanceId }: { allowanceId: string }) => {
  const { data: allowanceData } = useFetchAllowance(allowanceId);
  const { setIsAllowanceEntitlementSidebarOpen } =
    useAllowanceEntitlementStore();

  const allowanceName = allowanceData?.name ?? 'Allowance';
  const isGlobal = allowanceData?.applicableTo === 'GLOBAL';

  return (
    <div
      className="flex flex-wrap justify-between items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4"
      id="compensation-allowance-detail-header"
      data-cy="compensation-allowance-detail-header"
    >
      <div
        className="min-w-0 flex-1 flex items-center gap-2 sm:gap-3"
        data-cy="compensation-allowance-detail-header-main"
      >
        <Link
          href="/allowance"
          className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 shrink-0"
          data-cy="compensation-allowance-detail-back"
        >
          <LeftOutlined style={{ fontSize: 14 }} />
        </Link>
        <div
          className="min-w-0 flex-1 flex flex-col gap-1.5"
          data-cy="compensation-allowance-detail-header-breadcrumb-wrap"
        >
          <span
            className="block min-w-0 text-lg sm:text-2xl font-bold text-gray-900 truncate"
            data-cy="compensation-allowance-detail-title"
          >
            {allowanceName}
          </span>
          <Breadcrumb
            separator="/"
            className="text-sm"
            items={[
              {
                title: (
                  <span
                    className="text-sm font-medium text-slate-500"
                    data-cy="compensation-allowance-detail-crumb-compensation"
                  >
                    Compensation and Benefit
                  </span>
                ),
              },
              {
                title: (
                  <span
                    className="text-sm font-bold text-black/70"
                    data-cy="compensation-allowance-detail-crumb-allowance"
                  >
                    Allowance
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
      <div
        className="flex flex-shrink-0 flex-wrap justify-end items-center gap-2 sm:gap-4 mr-3"
        data-cy="compensation-allowance-detail-header-actions"
      >
        <AccessGuard permissions={[Permissions.CreateAllowanceEntitlement]}>
          <Button
            type="primary"
            icon={<FaUserPlus className="text-base sm:text-lg" />}
            className="h-9 w-9 min-w-9 sm:h-10 sm:w-auto sm:min-w-0 sm:px-4 text-xs sm:text-base font-normal"
            onClick={() => setIsAllowanceEntitlementSidebarOpen(true)}
            disabled={isGlobal}
            data-cy="compensation-allowance-detail-add-employee-button"
          >
            <span
              className="hidden sm:inline"
              data-cy="compensation-allowance-detail-add-employee-label"
            >
              Add Employee
            </span>
          </Button>
        </AccessGuard>
      </div>
    </div>
  );
};

const AllAllowancePageHeader = () => (
  <div
    className="flex flex-wrap justify-between items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4"
    id="compensation-allowance-all-layout-header"
    data-cy="compensation-allowance-all-layout-header"
  >
    <div
      className="min-w-0 flex-1 flex items-center gap-2 sm:gap-3"
      data-cy="compensation-allowance-all-layout-header-main"
    >
      <Link
        href="/allowance"
        className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 shrink-0"
        data-cy="compensation-allowance-all-layout-back"
      >
        <LeftOutlined style={{ fontSize: 14 }} />
      </Link>
      <div
        className="min-w-0 flex-1 flex flex-col gap-1.5"
        data-cy="compensation-allowance-all-layout-title-wrap"
      >
        <span
          className="text-lg sm:text-2xl font-bold text-gray-900 truncate"
          data-cy="compensation-allowance-all-layout-title"
        >
          All Allowance
        </span>
        <Breadcrumb
          separator="/"
          className="text-sm"
          items={[
            {
              title: (
                <span
                  className="text-sm font-medium text-slate-500"
                  data-cy="compensation-allowance-all-crumb-compensation"
                >
                  Compensation and Benefit
                </span>
              ),
            },
            {
              title: (
                <span
                  className="text-sm font-bold text-black/70"
                  data-cy="compensation-allowance-all-crumb-allowance"
                >
                  Allowance
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  </div>
);

const AllowanceLayout: FC<TimesheetSettingsLayoutProps> = ({ children }) => {
  const params = useParams();
  const pathname = usePathname();
  const allowanceId = params?.id;
  const isAllAllowancePage = Boolean(pathname?.includes('allAllowance'));
  const isDetailPage = Boolean(allowanceId);
  const { setIsAllowanceOpen, setSelectedAllowanceRecord } =
    useCompensationSettingStore();

  const handleAddAllowanceType = () => {
    setSelectedAllowanceRecord(null);
    setIsAllowanceOpen(true);
  };

  return (
    <div
      className="min-h-screen w-full min-w-0 bg-white"
      id="compensation-allowance-layout-container"
      data-cy="compensation-allowance-layout-container"
    >
      <div
        className="h-auto w-full min-w-0 bg-white"
        id="compensation-allowance-layout-body"
        data-cy="compensation-allowance-layout-body"
      >
        {isDetailPage && allowanceId ? (
          <>
            <AllowanceDetailHeader allowanceId={allowanceId as string} />
            <BreadcrumbRule />
          </>
        ) : isAllAllowancePage ? (
          <>
            <AllAllowancePageHeader />
            <BreadcrumbRule />
          </>
        ) : (
          <>
            <div
              className="block sm:hidden px-4 pt-4 pb-3"
              id="compensation-allowance-layout-page-header"
              data-cy="compensation-allowance-layout-page-header"
            >
              <div
                className="flex items-center justify-between gap-3"
                data-cy="compensation-allowance-layout-mobile-header-row"
              >
                <div
                  className="min-w-0 flex-1"
                  data-cy="compensation-allowance-layout-mobile-title-col"
                >
                  <div
                    className="min-w-0 flex flex-col gap-1.5"
                    data-cy="compensation-allowance-layout-mobile-breadcrumb-wrap"
                  >
                    <div
                      className="min-w-0 text-lg font-bold text-gray-900 truncate"
                      data-cy="compensation-allowance-layout-mobile-title"
                    >
                      Allowance
                    </div>
                    <Breadcrumb
                      separator="/"
                      className="text-sm"
                      items={[
                        {
                          title: (
                            <span
                              className="text-sm font-medium text-slate-500"
                              data-cy="compensation-allowance-layout-mobile-crumb-compensation"
                            >
                              Compensation and Benefit
                            </span>
                          ),
                        },
                        {
                          title: (
                            <span
                              className="text-sm font-bold text-slate-500"
                              data-cy="compensation-allowance-layout-mobile-crumb-allowance"
                            >
                              Allowance
                            </span>
                          ),
                        },
                      ]}
                    />
                  </div>
                </div>
                <AccessGuard permissions={[Permissions.CreateAllowanceType]}>
                  <Button
                    type="primary"
                    icon={<MdOutlinePayments className="text-base" />}
                    className="h-10 w-10 min-w-10 rounded-md"
                    onClick={handleAddAllowanceType}
                    data-cy="compensation-allowance-add-allowance-type-button"
                  />
                </AccessGuard>
              </div>
            </div>

            <BlockWrapper className="h-auto w-full min-w-0 bg-white hidden sm:block">
              <div
                className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 pt-5 pb-3 sm:px-4"
                id="compensation-allowance-layout-page-header-desktop"
                data-cy="compensation-allowance-layout-page-header-desktop"
              >
                <div
                  className="min-w-0 flex-1 flex flex-col gap-1.5"
                  data-cy="compensation-allowance-layout-desktop-breadcrumb-wrap"
                >
                  <div
                    className="min-w-0 text-2xl font-bold leading-[31.20px] !text-[#000000] truncate"
                    data-cy="compensation-allowance-layout-desktop-title"
                  >
                    Allowance
                  </div>
                  <div
                    className="text-sm font-medium leading-snug"
                    data-cy="compensation-allowance-layout-desktop-subtitle"
                  >
                    <Breadcrumb
                      separator="/"
                      className="text-sm"
                      items={[
                        {
                          title: (
                            <span
                              className="text-sm font-medium text-slate-500"
                              data-cy="compensation-allowance-layout-desktop-crumb-compensation"
                            >
                              Compensation and Benefit
                            </span>
                          ),
                        },
                        {
                          title: (
                            <span
                              className="text-sm font-bold text-slate-500"
                              data-cy="compensation-allowance-layout-desktop-crumb-allowance"
                            >
                              Allowance
                            </span>
                          ),
                        },
                      ]}
                    />
                  </div>
                </div>
                <div
                  className="flex flex-shrink-0 flex-wrap items-center justify-end gap-4 mr-3"
                  data-cy="compensation-allowance-layout-desktop-actions"
                >
                  <AccessGuard permissions={[Permissions.CreateAllowanceType]}>
                    <Button
                      type="primary"
                      icon={<MdOutlinePayments className="text-lg" />}
                      className="h-10 font-normal"
                      onClick={handleAddAllowanceType}
                      data-cy="compensation-allowance-add-allowance-type-button-desktop"
                    >
                      Add Allowance Type
                    </Button>
                  </AccessGuard>
                </div>
              </div>
            </BlockWrapper>
            <BreadcrumbRule />
          </>
        )}

        <div
          id="compensation-allowance-layout-content"
          data-cy="compensation-allowance-layout-content"
        >
          <div
            className="w-full min-w-0"
            data-cy="compensation-allowance-layout-main-row"
          >
            <BlockWrapper
              data-cy="compensation-allowance-layout-block-wrapper-content"
              withBackground={false}
              className="h-max w-full min-w-0 overflow-x-auto bg-white"
            >
              {children}
            </BlockWrapper>
          </div>
        </div>
      </div>
      <AllowanceTypeSideBar data-cy="compensation-allowance-add-allowance-type-sidebar" />
    </div>
  );
};

export default AllowanceLayout;
