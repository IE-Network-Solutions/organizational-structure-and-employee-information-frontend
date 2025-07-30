import React from 'react';
import { Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { useFetchAllowances } from '@/store/server/features/compensation/allowance/queries';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useAllAllowanceStore } from '@/store/uistate/features/compensation/allowance';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const AllDeductionTable = () => {
  const { data: allCompensationsData, isLoading } = useFetchAllowances();
  const { currentPage, pageSize, setCurrentPage, setPageSize } =
    useAllAllowanceStore();
  const { isMobile, isTablet } = useIsMobile();

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
        <div data-testid={`deduction-employee-${record?.employeeId}`}>
          <EmployeeDetails empId={record?.employeeId} />
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      sorter: true,
      render: (text: string) => (
        <div data-testid="deduction-role">{text || '-'}</div>
      ),
    },

    ...(Array.isArray(allAllowanceEntitlementData)
      ? allAllowanceEntitlementData.map((item: any) => ({
          title: item?.name,
          dataIndex: item?.id,
          key: item?.id,
          render: (text: string) => (
            <div data-testid={`deduction-amount-${item?.id}`}>
              {text || '-'}
            </div>
          ),
        }))
      : []),
  ];
  const paginatedData = dataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div data-testid="all-deduction-table-container">
      <Spin spinning={isLoading} data-testid="deduction-table-loading">
        <div className="overflow-x-auto scrollbar-hide">
          <Table
            className="mt-6"
            columns={columns}
            dataSource={paginatedData}
            pagination={false}
            data-testid="deduction-table"
          />
        </div>

        {isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={dataSource.length}
            pageSize={pageSize}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onShowSizeChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
          />
        ) : (
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
        )}

        {/* <CustomPagination
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
          data-testid="deduction-pagination"
        /> */}
      </Spin>
    </div>
  );
};

export default AllDeductionTable;
