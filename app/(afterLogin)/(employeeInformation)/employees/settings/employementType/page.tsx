'use client';
import { Button, Table, Spin } from 'antd';
import React from 'react';
import { FaPlus, FaUser } from 'react-icons/fa';
import EmployementTypeSideDrawer from './_components/employementTypeSideDrawer';
import { EmployeTypeManagementStore } from '@/store/uistate/features/employees/settings/emplyeTypeDrawer';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { EmploymentTypeInfo } from '@/store/server/features/employees/employeeManagment/employmentType/interface';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const EmploymentType = () => {
  const { setOpen, pageSize, setPageSize, setPage, page } =
    EmployeTypeManagementStore();
  const { data: employeTypeData, isLoading } = useGetEmployementTypes(
    page,
    pageSize,
  );
  const { isMobile, isTablet } = useIsMobile();
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const onPageChange = (page: number, pageSize?: number) => {
    setPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
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
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-black font-bold text-lg ">Employment Type</h1>

        <div className="flex items-center space-x-2">
          <AccessGuard permissions={[Permissions.CreateEmploymentType]}>
            {/* Desktop button */}
            <Button
              className="hidden sm:flex items-center justify-center space-x-2 px-4 py-2 font-bold bg-[#3636F0] text-white hover:bg-[#2d2dbf] border-none"
              onClick={showDrawer}
            >
              <FaPlus className="text-white" />
              <span>Add New Type</span>
            </Button>

            {/* Mobile button */}
            <Button
              className="flex sm:hidden h-10 w-10 sm:w-auto"
              onClick={showDrawer}
              type="primary"
              icon={<FaPlus />}
            />
          </AccessGuard>
        </div>
      </div>

      <EmployementTypeSideDrawer onClose={onClose} />

      <div className="overflow-x-auto w-full scrollbar-none">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <Spin size="large" />
          </div>
        ) : (
          <div>
          <Table
            columns={columns}
            showHeader={false}
            dataSource={reformattedData}
            bordered={true}
            className="min-w-[320px]"
            pagination={false}  
          />
           {isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={employeTypeData?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
          />
        ) : (
          <CustomPagination
            current={page}
            total={employeTypeData?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={(pageSize) => setPageSize(pageSize)}
          />
        )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmploymentType;
