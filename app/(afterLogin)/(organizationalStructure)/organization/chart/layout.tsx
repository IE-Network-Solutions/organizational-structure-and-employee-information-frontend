'use client';
import { Card, Dropdown, Button } from 'antd';
import { FaDownload } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { exportToPDFOrJPEG } from '@/utils/exportOrgStructureToPdfAndPng';
import { useRouter } from 'next/navigation';
import React, { RefObject, useRef, createContext, useContext } from 'react';

// Create context for chart ref
const ChartRefContext = createContext<RefObject<HTMLDivElement> | null>(null);

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
        className="flex flex-col w-full"
        data-cy="org-structure-layout"
        id="org-structure-layout"
      >
        {/* ORG Structure Section */}
        <div
          className="w-full overflow-x-auto"
          data-cy="org-structure-card-container"
          id="org-structure-card-container"
        >
          <Card
            data-cy="org-structure-card"
            id="org-structure-card"
            className="w-full border-none"
            title={
              <div
                className="text-2xl font-bold"
                data-cy="org-structure-title"
                id="org-structure-title"
              >
                ORG Structure
              </div>
            }
            extra={
              <div
                className="py-4 flex justify-center items-center gap-4"
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
                    className="h-10 sm:h-14 w-10 sm:w-auto"
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
                {selectedKey !== 'chart' && (
                  <AccessGuard
                    permissions={[Permissions.MergeDepartment]}
                    data-cy="org-structure-actions-guard"
                    id="org-structure-actions-guard"
                  >
                    <Dropdown
                      overlay={orgComposeAndMergeMenues}
                      trigger={['click']}
                      placement="bottomRight"
                      data-cy="org-structure-actions-dropdown"
                    >
                      <Button
                        type="primary"
                        className="w-10 sm:w-[68px] h-10 sm:h-14  rounded-lg flex items-center justify-center gap-2"
                        data-cy="org-structure-actions-btn"
                        id="org-structure-actions-btn"
                      >
                        <BsThreeDotsVertical
                          size={24}
                          data-cy="org-structure-actions-btn-icon"
                          id="org-structure-actions-btn-icon"
                        />
                      </Button>
                    </Dropdown>
                  </AccessGuard>
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

        {/* Page Content */}
        <main
          className="p-4"
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
