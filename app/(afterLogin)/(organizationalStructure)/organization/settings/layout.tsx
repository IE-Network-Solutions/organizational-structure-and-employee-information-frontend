'use client';
import { FC, ReactNode, useEffect } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetActiveFiscalYearsData } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { Skeleton, Tabs, Breadcrumb, Button } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import type { TabsProps } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { useBranchStore } from '@/store/uistate/features/organizationStructure/branchStore';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  }, [token]);

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

  const items: TabsProps['items'] = [
    {
      key: 'branches',
      label: 'Branches',
      disabled: hasEndedFiscalYear,
    },
    {
      key: 'fiscalYear',
      label: 'Fiscal Year',
    },
    {
      key: 'transfer',
      label: 'Transfer',
    },
    {
      key: 'merge',
      label: 'Merge',
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
            className="min-h-screen bg-white mr-6"
            data-cy="org-settings-layout-div"
            id="org-settings-layout-div"
          >
        <div className="px-4 pt-4">
          <h2
            className="text-gray-900 text-2xl font-bold mb-0"
            data-cy="org-settings-page-header-title"
            id="org-settings-page-header-title"
          >
            Setting
          </h2>
          <Breadcrumb
            className="mt-2 mb-4"
            items={[
              {
                title: (
                  <a
                    href="/organization/chart"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/organization/chart');
                    }}
                  >
                    Organization
                  </a>
                ),
              },
              {
                title: 'Setting',
              },
            ]}
            data-cy="org-settings-breadcrumb"
          />
        </div>
        <div
          className="bg-white mb-4"
          data-cy="org-settings-tabs-container"
          id="org-settings-tabs-container"
        >
          <div className="px-4 pr-6">
            <Tabs
              activeKey={getActiveKey()}
              onChange={handleTabChange}
              items={items}
              tabBarStyle={{
                marginBottom: 0,
                marginLeft: 0,
                paddingLeft: 0,
                paddingRight: 0,
              }}
              tabBarExtraContent={
              getActiveKey() === 'branches' ? (
                <AccessGuard
                  permissions={[Permissions.CreateBranch]}
                  data-cy="org-settings-branches-add-btn-guard"
                  id="org-settings-branches-add-btn-guard"
                >
                  <Button
                    className={`h-10 ${isMobile ? 'ml-4' : ''}`}
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
              ) : getActiveKey() === 'fiscalYear' ? (
                <AccessGuard
                  permissions={[Permissions.CreateCalendar]}
                  data-cy="org-settings-fiscal-year-create-btn-guard"
                  id="org-settings-fiscal-year-create-btn-guard"
                >
                  <Button
                    className={`h-10 ${isMobile ? 'ml-4' : ''}`}
                    icon={
                      <FaPlus
                        data-cy="org-settings-fiscal-year-create-btn-icon"
                        id="org-settings-fiscal-year-create-btn-icon"
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
              className="[&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab-btn]:py-2 [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-nav-wrap]:before:!left-0 [&_.ant-tabs-nav-wrap]:after:!right-0"
              data-cy="org-settings-tabs"
              id="org-settings-tabs"
            />
          </div>
        </div>
            <div
              className="px-4 pr-6 mb-4"
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
