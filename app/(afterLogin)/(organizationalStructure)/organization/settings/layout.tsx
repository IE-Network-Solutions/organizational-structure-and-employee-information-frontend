'use client';
import { FC, ReactNode, useEffect } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetActiveFiscalYearsData } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { Skeleton, Tabs, Button } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import type { TabsProps } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { useBranchStore } from '@/store/uistate/features/organizationStructure/branchStore';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomBreadcrumb from '@/components/common/breadCramp';

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout: FC<SettingsLayoutProps> = ({ children }) => {
  const { token } = useAuthenticationStore();
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const {
    data: activeFiscalYear,
    refetch,
    isLoading: isResponseLoading,
  } = useGetActiveFiscalYearsData();

  const { setFormOpen, setEditingBranch } = useBranchStore();
  const { setOpenFiscalYearDrawer, setEditMode, setSelectedFiscalYear } =
    useFiscalYearDrawerStore();

  useEffect(() => {
    refetch();
  }, [token, refetch]);

  const hasEndedFiscalYear =
    !!activeFiscalYear?.isActive &&
    !!activeFiscalYear?.endDate &&
    new Date(activeFiscalYear?.endDate) <= new Date();

  const getActiveKey = () => {
    if (pathname.includes('/branches')) return 'branches';
    if (pathname.includes('/fiscalYear')) return 'fiscalYear';
    if (pathname.includes('/transfer')) return 'transfer';
    if (pathname.includes('/merge')) return 'merge';
    return 'branches';
  };

  const handleBranchAdd = () => {
    setEditingBranch(null);
    setFormOpen(true);
  };

  const handleFiscalYearAdd = () => {
    setEditMode(false);
    setSelectedFiscalYear(null);
    setOpenFiscalYearDrawer(true);
  };

  const handleTabChange = (key: string) => {
    switch (key) {
      case 'branches':
        router.push('/organization/settings/branches');
        break;
      case 'fiscalYear':
        router.push('/organization/settings/fiscalYear/fiscalYearCard');
        break;
      case 'transfer':
        router.push('/organization/settings/transfer');
        break;
      case 'merge':
        router.push('/organization/settings/merge');
        break;
      default:
        router.push('/organization/settings/branches');
    }
  };

  const activeKey = getActiveKey();
  const items: TabsProps['items'] = [
    {
      key: 'branches',
      label: (
        <div
          className={`text-base m-0 ${activeKey === 'branches' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="org-settings-branches-tab-label"
          id="org-settings-branches-tab-label"
        >
          Branches
        </div>
      ),
      disabled: hasEndedFiscalYear,
    },
    {
      key: 'fiscalYear',
      label: (
        <div
          className={`text-base m-0 ${activeKey === 'fiscalYear' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="org-settings-fiscal-year-tab-label"
          id="org-settings-fiscal-year-tab-label"
        >
          Fiscal Year
        </div>
      ),
    },
    {
      key: 'transfer',
      label: (
        <div
          className={`text-base m-0 ${activeKey === 'transfer' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="org-settings-transfer-tab-label"
          id="org-settings-transfer-tab-label"
        >
          Transfer
        </div>
      ),
    },
    {
      key: 'merge',
      label: (
        <div
          className={`text-base m-0 ${activeKey === 'merge' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="org-settings-merge-tab-label"
          id="org-settings-merge-tab-label"
        >
          Merge
        </div>
      ),
    },
  ];

  return (
    <div
      className="min-h-screen"
      data-cy="org-settings-layout"
      id="org-settings-layout"
    >
      {isResponseLoading && (
        <Skeleton
          active
          paragraph={{ rows: 0 }}
          data-cy="org-organization-settings-layout-skeleton-1"
        />
      )}
      {hasEndedFiscalYear && (
        <div
          className="bg-[#323B49] h-12 flex items-center justify-start text-md p-2 rounded-lg shadow-none"
          data-cy="org-settings-fiscal-year-warning"
          id="org-settings-fiscal-year-warning"
        >
          <span
            className="text-[#FFDE65] px-2"
            data-cy="org-settings-fiscal-year-warning-text"
            id="org-settings-fiscal-year-warning-text"
          >
            Your Have Finished Your Fiscal Year
          </span>
          <span
            className="text-white"
            data-cy="org-settings-fiscal-year-warning-text-2"
            id="org-settings-fiscal-year-warning-text-2"
          >
            Please Create Your Next Fiscal Year To Continue
          </span>
        </div>
      )}
      <div
        className="min-h-screen bg-white"
        data-cy="org-settings-layout-div"
        id="org-settings-layout-div"
      >
        <div className="pt-4" data-cy="org-settings-header-container">
          <CustomBreadcrumb
            title={
              <span
                className="text-gray-900 text-2xl font-bold mb-0"
                data-cy="org-settings-page-header-title"
                id="org-settings-page-header-title"
              >
                Setting
              </span>
            }
            subtitle={
              <>
                <a
                  href="/organization/chart"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/organization/chart');
                  }}
                  data-cy="org-settings-breadcrumb-organization-link"
                >
                  Organization
                </a>
                <span data-cy="org-settings-breadcrumb-separator"> / </span>
                <span data-cy="org-settings-breadcrumb-current">Setting</span>
              </>
            }
            data-cy="org-settings-breadcrumb"
          />
        </div>
        <div
          className="bg-white mb-4"
          data-cy="org-settings-tabs-container"
          id="org-settings-tabs-container"
        >
          <div className="" data-cy="org-settings-tabs-wrapper">
            <Tabs
              activeKey={activeKey}
              onChange={handleTabChange}
              items={items}
              tabBarStyle={{
                marginBottom: 0,
                marginLeft: 0,
                paddingLeft: 0,
                paddingRight: 0,
              }}
              tabBarExtraContent={
                activeKey === 'branches' ? (
                  <AccessGuard
                    permissions={[Permissions.CreateBranch]}
                    data-cy="org-settings-branches-add-btn-guard"
                    id="org-settings-branches-add-btn-guard"
                  >
                    <Button
                      className={`h-8 font-normal ${isMobile ? 'ml-4' : ''}`}
                      icon={
                        <FaPlus
                          data-cy="org-settings-branches-add-btn-icon"
                          id="org-settings-branches-add-btn-icon"
                        />
                      }
                      type="primary"
                      onClick={handleBranchAdd}
                      data-cy="org-settings-branches-add-btn"
                      id="org-settings-branches-add-btn"
                    >
                      {!isMobile && 'Branch'}
                    </Button>
                  </AccessGuard>
                ) : activeKey === 'fiscalYear' ? (
                  <AccessGuard
                    permissions={[Permissions.CreateCalendar]}
                    data-cy="org-settings-fiscal-year-create-btn-guard"
                    id="org-settings-fiscal-year-create-btn-guard"
                  >
                    <Button
                      className={`h-10 font-normal ${isMobile ? 'ml-4' : ''}`}
                      icon={
                        <FaPlus
                          data-cy="org-settings-fiscal-year-create-btn-icon"
                          id="org-settings-fiscal-year-create-btn-icon"
                          className="font-normal"
                        />
                      }
                      type="primary"
                      onClick={handleFiscalYearAdd}
                      data-cy="org-settings-fiscal-year-create-btn"
                      id="org-settings-fiscal-year-create-btn"
                    >
                      {!isMobile && 'Fiscal Year'}
                    </Button>
                  </AccessGuard>
                ) : null
              }
              className="org-settings-tabs-foldfix [&_.ant-tabs-tab]:py-2 [&_.ant-tabs-tab-btn]:py-1 [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-nav-wrap]:before:!left-0 [&_.ant-tabs-nav-wrap]:after:!right-0"
              data-cy="org-settings-tabs"
              id="org-settings-tabs"
            />
          </div>
        </div>
        <div
          className="mb-4"
          data-cy="org-settings-content-wrapper"
          id="org-settings-content-wrapper"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
