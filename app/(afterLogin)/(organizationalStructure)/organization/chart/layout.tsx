'use client';
import { Card, Dropdown, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { exportToPDFOrJPEG } from '@/utils/exportOrgStructureToPdfAndPng';
import React, { RefObject, useRef, createContext, useContext } from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
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
  return context.chartRef;
};

export const useChartExportActionsRef = () => {
  const context = useContext(ChartRefContext);
  if (!context) {
    throw new Error('useChartExportActionsRef must be used within a ChartRefProvider');
  }
  return context.exportActionsRef;
};

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
  const exportActionsRef = useRef<UseReactFlowExportApi | null>(null);
  const { setIsDeleteConfirmVisible } = useOrganizationStore();
  const chartDownloadLoading = useOrganizationStore(
    (s) => s.chartDownlaodLoading,
  );
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

  const handleDownloadPNG = () => {
    if (chartDownloadLoading) return;
    if (exportActionsRef.current?.downloadPNG) {
      exportActionsRef.current.downloadPNG();
    } else {
      exportToPDFOrJPEG(chartRef as RefObject<HTMLDivElement>, false);
    }
  };

  const handleDownloadPDF = () => {
    if (chartDownloadLoading) return;
    if (exportActionsRef.current?.downloadPDF) {
      exportActionsRef.current.downloadPDF();
    } else {
      exportToPDFOrJPEG(chartRef as RefObject<HTMLDivElement>, true);
    }
  };

  return (
    <ChartRefContext.Provider
      value={{ chartRef, exportActionsRef }}
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
                  menu={{
                    items: [
                      {
                        key: 'pdf',
                        label: 'PDF',
                        onClick: handleDownloadPDF,
                        disabled: chartDownloadLoading,
                      },
                      {
                        key: 'png',
                        label: 'PNG',
                        onClick: handleDownloadPNG,
                        disabled: chartDownloadLoading,
                      },
                    ],
                  }}
                  trigger={['click']}
                  placement="bottomRight"
                  data-cy="org-structure-export-dropdown"
                  disabled={chartDownloadLoading}
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
                    loading={chartDownloadLoading}
                    disabled={chartDownloadLoading}
                  >
                    <span
                      className="font-normal"
                      data-cy="org-structure-download-btn-span"
                      id="org-structure-download-btn-span"
                    >
                      {chartDownloadLoading ? 'Preparing…' : 'Download'}
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
