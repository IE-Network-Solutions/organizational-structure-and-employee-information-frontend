'use client';
import { Button, Card, Table, Spin } from 'antd'; // Added Spin for loading indicator
import React from 'react';
import { FaPlus, FaUser } from 'react-icons/fa';
import EmployementTypeSideDrawer from './_components/employementTypeSideDrawer';
import { EmployeTypeManagementStore } from '@/store/uistate/features/employees/settings/emplyeTypeDrawer';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { EmploymentTypeInfo } from '@/store/server/features/employees/employeeManagment/employmentType/interface';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const EmploymentType = () => {
  const { setOpen, pageSize, setPageSize, setPage, page } =
    EmployeTypeManagementStore();
  const { data: employeTypeData, isLoading } = useGetEmployementTypes(
    page,
    pageSize,
  );

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const reformattedData = employeTypeData?.items?.map(
    (item: EmploymentTypeInfo) => ({
      name: (
        <div className="flex space-x-2 font-semibold">
          <FaUser className="mt-3 text-gray-500" />
          <p className="flex flex-col">
            <span>{item.name}</span>
            <span className="text-gray-500 text-xs">
              {item.description || 'No description provided'}
            </span>
          </p>
        </div>
      ),
    }),
  );

  const columns: any = [
    {
      dataIndex: 'name',
      key: 'Name',
    },
  ];

  return (
    <>
      <Card className="border-b-0 py-4 px-4 sm:px-6 lg:px-8 border-none  bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <div className="text-black font-bold text-lg mb-2 sm:mb-0">
            Employment Type
          </div>
          <AccessGuard permissions={[Permissions.CreateEmploymentType]}>
            <Button
              className="flex items-center justify-center space-x-2 px-4 py-2 font-bold bg-[#3636F0] text-white hover:bg-[#2d2dbf] border-none"
              onClick={showDrawer}
            >
              <FaPlus className="text-white" />
              <span>Add New Type</span>
            </Button>
          </AccessGuard>
        </div>
      </Card>
      <EmployementTypeSideDrawer onClose={onClose} />

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            showHeader={false}
            dataSource={reformattedData}
            bordered={true}
            className="min-w-[320px]"
            pagination={{
              pageSize: pageSize,
              current: page,
              total: employeTypeData?.meta?.totalItems,
              showSizeChanger: true,
              onChange: (page, pageSize) => {
                setPageSize(pageSize);
                setPage(page);
              },
              // showTotal: (total, range) =>
              //   `Showing ${range[0]} to ${range[1]} of ${total} items`,
            }}
          />
        )}
      </div>
    </>
  );
};

export default EmploymentType;
