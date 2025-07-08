import React from 'react';
import { Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { useFetchAllowances } from '@/store/server/features/compensation/allowance/queries';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useAllAllowanceStore } from '@/store/uistate/features/compensation/allowance';
import CustomPagination from '@/components/customPagination';

const AllDeductionTable = () => {
  const { data: allCompensationsData, isLoading } = useFetchAllowances();
  const { currentPage, pageSize, setCurrentPage, setPageSize } =
    useAllAllowanceStore();

  const allAllowanceEntitlementData = Array.isArray(allCompensationsData)
    ? allCompensationsData.filter(
        (allowanceEntitlement: any) => allowanceEntitlement.type == 'DEDUCTION',
      )
    : [];

  const allEntitlementData = Array.isArray(allAllowanceEntitlementData)
    ? allAllowanceEntitlementData.reduce(
        (acc: any, benefit: any) =>
          acc.concat(benefit.compensationItmeEntitlement),
        [],
      )
    : [];

  const groupByEmployeeId = allEntitlementData?.reduce(
    (acc: any, item: any) => {
      if (!acc[item.employeeId]) {
        acc[item.employeeId] = { employeeId: item.employeeId, allowance: [] };
      }
      acc[item.employeeId].allowance.push({
        compensationItemId: item?.compensationItemId,
        totalAmount: item?.totalAmount,
      });

      return acc;
    },
    {},
  );

  const result = Object.values(groupByEmployeeId ?? {});

  const dataSource = result.map((employee: any) => {
    const dataRow: any = {
      key: employee.employeeId,
      employeeId: employee.employeeId,
    };
    employee.allowance.forEach((allowance: any) => {
      dataRow[allowance.compensationItemId] = allowance.totalAmount;
    });
    return dataRow;
  });

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'dateNaming',
      sorter: true,
      render: (notused: any, record: any) => (
        <EmployeeDetails empId={record?.employeeId} />
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      sorter: true,
      render: (text: string) => <div>{text || '-'}</div>,
    },

    ...(Array.isArray(allAllowanceEntitlementData)
      ? allAllowanceEntitlementData.map((item: any) => ({
          title: item?.name,
          dataIndex: item?.id,
          key: item?.id,
          render: (text: string) => <div>{text || '-'}</div>,
        }))
      : []),
  ];
  const paginatedData = dataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <Spin spinning={isLoading}>
      <Table
        className="mt-6"
        columns={columns}
        dataSource={paginatedData}
        pagination={false}
      />

      <CustomPagination
        current={currentPage}
        total={dataSource.length}
        pageSize={pageSize}
        onChange={(page, size) => {
          setCurrentPage(page);
          setPageSize(size);
        }}
        onShowSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </Spin>
  );
};

export default AllDeductionTable;
