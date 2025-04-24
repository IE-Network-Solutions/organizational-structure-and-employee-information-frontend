import React, { useState } from 'react';
import { Select, Space, Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { Button } from 'antd';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import AllowanceEntitlementSideBar from './allowanceEntitlementSidebar';
import { useFetchAllowanceEntitlements } from '@/store/server/features/compensation/allowance/queries';
import { useParams } from 'next/navigation';
import { useDeleteAllowanceEntitlement } from '@/store/server/features/compensation/allowance/mutations';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';

const AllowanceEntitlementTable = () => {
  const {
    setIsAllowanceEntitlementSidebarOpen,
    isAllowanceGlobal,
    currentPage,
    pageSize,
    setCurrentPage,
    searchQuery,
    setPageSize,
  } = useAllowanceEntitlementStore();
  const { mutate: deleteAllowanceEntitlement } =
    useDeleteAllowanceEntitlement();
  const { id } = useParams();
  const {
    data: allowanceEntitlementData,
    isLoading: fiscalActiveYearFetchLoading,
  } = useFetchAllowanceEntitlements(id);
  const { data: employeeData } = useGetAllUsers();
  const EmployeeBasicSalary = ({
    id,
    amount,
  }: {
    id: string;
    amount: string;
  }) => {
    const { data, error } = useGetBasicSalaryById(id);
    if (error || !data) {
      return '--';
    }
    const employeeBasicSalary =
      Number(data.find((item: any) => item.status)?.basicSalary) || '--';
    const calculatedSalary =
      typeof employeeBasicSalary === 'number'
        ? (employeeBasicSalary * Number(amount)) / 100
        : '--';
    return calculatedSalary;
  };

  const transformedData =
    allowanceEntitlementData?.map((item: any) => ({
      id: item.id,
      userId: item.employeeId,
      isRate: item.compensationItem.isRate,
      Amount: item.totalAmount,
      defaultAmount: item.compensationItem?.defaultAmount,
      ApplicableTo: item.compensationItem.applicableTo,
    })) || [];

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleDelete = (id: string) => {
    deleteAllowanceEntitlement(id);
  };

  const columns: TableColumnsType<any> = [
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      sorter: true,
      render: (userId: string) => <EmployeeDetails empId={userId} />,
    },
    {
      title: 'Type',
      dataIndex: 'isRate',
      key: 'isRate',
      sorter: true,
      render: (isRate: string) => <div>{isRate ? 'Rate' : 'Fixed'}</div>,
    },
    {
      title: 'Amount',
      dataIndex: 'Amount',
      key: 'Amount',
      sorter: true,
      render: (text: string, record: any) =>
        !record.isRate ? (
          <div>{text ? `${text} ETB` : '-'}</div>
        ) : (
          <EmployeeBasicSalary
            id={record?.userId}
            amount={record?.defaultAmount}
          />
        ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (rule: any, record: any) => (
        <AccessGuard
          permissions={[
            Permissions.UpdateAllowanceEntitlement,
            Permissions.DeleteAllowanceEntitlement,
          ]}
        >
          <ActionButtons
            id={record?.id ?? null}
            onEdit={() => {}}
            disableEdit
            onDelete={() => handleDelete(record.id)}
          />
        </AccessGuard>
      ),
    },
  ];

 
  const options =
    employeeData?.items?.map((emp: any) => ({
      value: emp.id,
      label: `${emp.firstName || ''}  ${emp?.middleName} ${emp.lastName}`, // Full name as label
      employeeData: emp,
    })) || [];

  const filteredDataSource = searchQuery
    ? transformedData.filter(
        (employee: any) =>
          employee.userId?.toLowerCase() === searchQuery?.toLowerCase(),
      )
    : transformedData;

  return (
    <Spin spinning={fiscalActiveYearFetchLoading}>
      
      <Table
        className="mt-6"
        columns={columns}
        dataSource={filteredDataSource}
        pagination={{
          current: currentPage,
          pageSize,
          total: transformedData?.length,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />
      <AllowanceEntitlementSideBar />
    </Spin>
  );
};

export default AllowanceEntitlementTable;
