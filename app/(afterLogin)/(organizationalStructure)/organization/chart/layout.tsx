'use client';
import { Card, Dropdown, Menu, Button } from 'antd';
import { FaDownload } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import CustomButton from '@/components/common/buttons/customButton';
import { exportToPDFOrJPEG } from '@/utils/exportOrgStructureToPdfAndPng';
import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';

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

  const items = [
    {
      key: 'structure',
      label: 'Structure',
    },
    {
      key: 'chart',
      label: 'Chart',
    },
  ];

  // Handling menu click and navigation
  const onMenuClick = (e: any) => {
    const key = e['key'] as string;
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
    <div className="flex flex-col w-full">
      {/* ORG Structure Section */}
      <div className="w-full overflow-x-auto">
        <Card
          className="w-full border-none"
          title={<div className="text-2xl font-bold">ORG Structure</div>}
          extra={
            <div className="py-4 flex justify-center items-center gap-4">
              <Dropdown
                overlay={exportOrgStrucutreMenu(chartRef, exportToPDFOrJPEG)}
                trigger={['click']}
              >
                <CustomButton
                  title="Download"
                  icon={<FaDownload size={16} />}
                  type="default"
                />
              </Dropdown>
              {selectedKey !== 'chart' && (
                <Dropdown
                  overlay={orgComposeAndMergeMenues}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button
                    type="primary"
                    className="w-16 h-14 px-6 py-6 rounded-lg flex items-center justify-center gap-2"
                  >
                    <BsThreeDotsVertical size={16} />
                  </Button>
                </Dropdown>
              )}
            </div>
          }
        >
          <div className="flex justify-end">
            <Menu
              className="w-[250px] rounded-2xl py-2 pl-10 h-max border-none"
              items={items}
              mode="horizontal"
              defaultActiveFirst
              onClick={onMenuClick}
            />
          </div>
          <CustomDrawer
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
                  transferDepartments(transferDepartment);
                }
              } else if (footerButtonText == 'Merge') {
                mergeDepartments(mergeData);
              } else {
                setIsDeleteConfirmVisible(true);
                closeDrawer();
              }
            }}
            title={drawTitle}
            form={form}
          />
        </Card>
      </div>

      {/* Page Content */}
      <main className="p-4">{children}</main>
    </div>
  );
  // return (
  //   <div className="h-auto w-auto pr-6 pb-6 pl-3">
  //     <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
  //   </div>
  // );
}
