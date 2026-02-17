'use client';
import { Card, Dropdown, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { exportToPDFOrJPEG } from '@/utils/exportOrgStructureToPdfAndPng';
import React, { RefObject, useRef, createContext, useContext } from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';

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

import { exportOrgStrucutreMenu } from './org-structure/_components/menues';
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
// Layout component definition
export default function ChartLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
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
  } = useOrganizationStore.getState();

  const { reset } = useDepartmentStore();

  const closeDrawer = () => {
    setDrawerVisible(false);
    form.resetFields();
    reset();
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
          className="w-full overflow-visible"
          data-cy="org-structure-card-container"
          id="org-structure-card-container"
        >
          <Card
            data-cy="org-structure-card"
            id="org-structure-card"
            className="w-full border-none"
            title={
              <CustomBreadcrumb
                title="Organization structure"
                subtitle="Organization / Org Structure"
                data-cy="org-structure-breadcrumb"
              />
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
                      <DownloadOutlined
                        style={{ fontSize: 16 }}
                        data-cy="org-structure-download-btn-icon"
                        id="org-structure-download-btn-icon"
                      />
                    }
                    type="default"
                    className="h-10 w-[104px] rounded-lg border border-gray-300 text-gray-700 font-normal"
                    data-cy="org-structure-download-btn"
                    id="org-structure-download-btn"
                  >
                    <span
                      className="font-normal"
                      data-cy="org-structure-download-btn-span"
                      id="org-structure-download-btn-span"
                    >
                      Download
                    </span>
                  </Button>
                  {/* </AccessGuard> */}
                </Dropdown>
              </div>
            }
          >
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

        {/* Page Content - minimal top padding so chart sits close to header */}
        <main
          className="pt-0 px-4 pb-4 overflow-visible"
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
