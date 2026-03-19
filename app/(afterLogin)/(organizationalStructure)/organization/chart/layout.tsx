'use client';
import { Card, Dropdown, Button } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { exportToPDFOrJPEG } from '@/utils/exportOrgStructureToPdfAndPng';
import React, {
  RefObject,
  useRef,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { UseReactFlowExportApi } from '@/hooks/export';

type ChartLayoutContextValue = {
  chartRef: RefObject<HTMLDivElement>;
  exportActionsRef: React.MutableRefObject<UseReactFlowExportApi | null>;
};

const ChartRefContext = createContext<ChartLayoutContextValue | null>(null);

export const useChartRef = () => {
  const context = useContext(ChartRefContext);
  if (!context) {
    throw new Error('useChartRef must be used within a ChartRefProvider');
  }
  return context;
};

// import { exportOrgStrucutreMenu, orgComposeAndMergeMenues } from '../menues/inex';

import {
  exportOrgStrucutreMenu,
  orgComposeAndMergeMenues,
} from './org-structure/_components/menues/inex';
import CustomDrawer from './org-structure/_components/customDrawer';
import {
  useMergingDepartment,
  useTransferDepartment,
} from '@/store/server/features/organizationStructure/mergeDepartments/mutations';
import useOrganizationStore from '@/store/uistate/features/organizationStructure/orgState';
import { useTransferStore } from '@/store/uistate/features/organizationStructure/orgState/transferDepartmentsStore';
import { useMergeStore } from '@/store/uistate/features/organizationStructure/orgState/mergeDepartmentsStore';
import { Form } from 'antd';
import useDepartmentStore from '@/store/uistate/features/organizationStructure/orgState/departmentStates';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
// Layout component definition
export default function ChartLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const router = useRouter();
  const [form] = Form.useForm();

  const chartRef = useRef<HTMLDivElement>(null);
  const { setIsDeleteConfirmVisible } = useOrganizationStore();
  const { transferDepartment, resetStore } = useTransferStore();
  const { mergeData } = useMergeStore();
  const { mutate: transferDepartments, isLoading: isTransferLoading } =
    useTransferDepartment();
  const { mutate: mergeDepartments, isLoading } = useMergingDepartment();

  const {
    drawerVisible,
    drawerContent,
    footerButtonText,
    drawTitle,
    setDrawerVisible,
    setDepartmentTobeDeletedId,
    selectedKey,
    setSelectedKey,
  } = useOrganizationStore.getState();

  const { reset } = useDepartmentStore();

  const [canResetView, setCanResetView] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ canReset?: boolean }>;
      const canReset = !!custom.detail?.canReset;
      setCanResetView(canReset);
    };
    window.addEventListener(
      'org-structure-can-reset-view',
      handler as EventListener,
    );
    return () => {
      window.removeEventListener(
        'org-structure-can-reset-view',
        handler as EventListener,
      );
    };
  }, []);

  const closeDrawer = () => {
    setDrawerVisible(false);
    form.resetFields();
    reset();
  };

  // Handling menu click and navigation
  const onMenuClick = (key: string) => {
    setSelectedKey(key);
    switch (key) {
      case 'structure':
        router.push('/organization/chart/org-structure');
        break;
      case 'chart':
        router.push('/organization/chart/org-chart');
        break;
      default:
        break;
    }
  };

  return (
    <ChartRefContext.Provider
      value={chartRef}
      data-cy="org-structure-layout-provider"
    >
      <div
        className="flex flex-col w-full max-sm:h-[100dvh] max-sm:min-h-0"
        data-cy="org-structure-layout"
        id="org-structure-layout"
      >
        {/* ORG Structure Section - sticky on mobile so Download/Reset stay visible */}
        <div
          className="w-full overflow-visible mt-6 max-sm:shrink-0 max-sm:flex-none"
          data-cy="org-structure-card-container"
          id="org-structure-card-container"
        >
          <Card
            data-cy="org-structure-card"
            id="org-structure-card"
            className="w-full border-none [&_.ant-card-head]:flex-wrap [&_.ant-card-head]:gap-2 [&_.ant-card-head]:px-0 [&_.ant-card-head]:py-1.5 [&_.ant-card-head]:min-h-0 [&_.ant-card-head-title]:w-full [&_.ant-card-body]:px-0"
            title={
              <div
                className="px-4 sm:px-6 py-0.5"
                data-cy="org-structure-breadcrumb-container"
              >
                <CustomBreadcrumb
                  compact
                  title={
                    <span
                      className="text-lg sm:text-2xl font-bold text-[#000000B2]"
                      data-cy="org-structure-breadcrumb-title"
                    >
                      Organization Structure
                    </span>
                  }
                  subtitle={
                    <>
                      <span
                        className="text-slate-500"
                        data-cy="org-structure-breadcrumb-prefix"
                      >
                        Organization Structure /{' '}
                      </span>
                      <span
                        className="text-[#000000B2]"
                        data-cy="org-structure-breadcrumb-current"
                      >
                        Org Structure
                      </span>
                    </>
                  }
                  data-cy="org-structure-breadcrumb"
                />
              </div>
            }
            extra={
              <div
                className="py-1.5 sm:py-2 px-6 sm:px-8 flex items-center gap-3 shrink-0"
                data-cy="org-structure-actions"
                id="org-structure-actions"
              >
                <Dropdown
                  overlay={exportOrgStrucutreMenu(
                    chartRef as RefObject<HTMLDivElement>,
                    exportToPDFOrJPEG,
                  )}
                  trigger={['click']}
                  placement="bottomRight"
                  data-cy="org-structure-export-dropdown"
                >
                  {/* <AccessGuard
                    permissions={[Permissions.DownloadOrganizationStructure]}
                  > */}
                  <Button
                    title="Download"
                    icon={
                      <FaDownload
                        size={16}
                        data-cy="org-structure-download-btn-icon"
                        id="org-structure-download-btn-icon"
                      />
                    }
                    type="default"
                    className="h-8 sm:h-10 w-10 sm:w-[104px] rounded-lg border border-gray-300 text-[#000000B2] hover:border-[#4096FF] hover:text-[#4096FF] font-normal flex items-center justify-center gap-2"
                    style={{ boxShadow: 'none', color: '#000000B2' }}
                    data-cy="org-structure-download-btn"
                    id="org-structure-download-btn"
                  >
                    <span
                      className="hidden sm:inline"
                      data-cy="org-structure-download-btn-span"
                      id="org-structure-download-btn-span"
                    >
                      Download
                    </span>
                  </Button>
                  {/* </AccessGuard> */}
                </Dropdown>
                {canResetView && (
                  <Button
                    title="Reset view"
                    icon={
                      <ReloadOutlined
                        style={{ fontSize: 16, color: '#1E40AF' }}
                      />
                    }
                    type="default"
                    className="h-8 sm:h-10 px-3 rounded-lg border border-[#1E40AF] text-[#1E40AF] hover:border-[#1E40AF] hover:bg-[#4096FF] hover:text-white font-normal flex items-center justify-center gap-2"
                    style={{ boxShadow: 'none' }}
                    data-cy="org-structure-reset-view-btn"
                    id="org-structure-reset-view-btn"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                          new CustomEvent('org-structure-reset-view'),
                        );
                      }
                    }}
                  >
                    <span
                      className="font-normal hidden sm:inline"
                      data-cy="org-structure-reset-view-btn-span"
                    >
                      Reset View
                    </span>
                  </Button>
                )}
              </div>
            }
          >
            <div
              className="flex justify-end"
              data-cy="org-structure-tabs-menu-container"
              id="org-structure-tabs-menu-container"
            >
              <div
                data-cy="org-structure-tabs-menu-container"
                id="org-structure-tabs-menu-container"
                className="flex justify-end bg-[#f5f5f5] shadow-md rounded-lg w-fit h-10 sm:h-12 py-[5px] px-[6px] gap-[14px] border-1"
              >
                <button
                  data-cy="org-structure-tabs-menu-button"
                  id="org-structure-tabs-menu-button"
                  onClick={() => onMenuClick('structure')}
                  className={`px-4 h-full text-black text-sm transition-all duration-300 ${
                    selectedKey === 'structure'
                      ? 'bg-white rounded-md shadow-sm border-1'
                      : 'bg-transparent'
                  }`}
                >
                  Org Chart
                </button>
                <button
                  data-cy="org-structure-tabs-menu-button"
                  id="org-structure-tabs-menu-button"
                  onClick={() => onMenuClick('chart')}
                  className={`px-4 h-full text-black text-sm transition-all duration-300 ${
                    selectedKey === 'chart'
                      ? 'bg-white rounded-md shadow-sm border-1'
                      : 'bg-transparent'
                  }`}
                >
                  Team View
                </button>
              </div>
            </div>
            <CustomDrawer
              data-cy="org-structure-custom-drawer"
              loading={transferDepartment ? isTransferLoading : isLoading}
              visible={drawerVisible}
              onClose={() => {
                closeDrawer();
                resetStore();
                setDepartmentTobeDeletedId('');
              }}
              drawerContent={drawerContent}
              footerButtonText={footerButtonText}
              onSubmit={() => {
                if (footerButtonText == 'Transfer') {
                  if (transferDepartment) {
                    transferDepartments(transferDepartment, {
                      onSuccess: () => {
                        closeDrawer();
                        reset();
                      },
                    });
                  }
                } else if (footerButtonText == 'Merge') {
                  mergeDepartments(mergeData, {
                    onSuccess: () => {
                      closeDrawer();
                      reset();
                    },
                  });
                } else {
                  setIsDeleteConfirmVisible(true);
                  closeDrawer();
                }
              }}
              title={drawTitle}
              form={form}
            />
          </Card>
          {/* <OrgChartComponent /> */}
        </div>

        {/* Page Content - on mobile this area scrolls, header stays visible */}
        <main
          className="pt-0 pb-4 overflow-visible max-sm:flex-1 max-sm:min-h-0 max-sm:overflow-y-auto"
          data-cy="org-structure-main-content"
          id="org-structure-main-content"
        >
          {children}
        </main>
      </div>
    </ChartRefContext.Provider>
  );
  // return (
  //   <div className="h-auto w-auto pr-6 pb-6 pl-3">
  //     <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
  //   </div>
  // );
}
