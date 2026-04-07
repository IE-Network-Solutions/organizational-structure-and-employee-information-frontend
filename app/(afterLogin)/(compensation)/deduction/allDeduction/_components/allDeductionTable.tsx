import React from 'react';
import { Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { useFetchAllowances } from '@/store/server/features/compensation/allowance/queries';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useAllAllowanceStore } from '@/store/uistate/features/compensation/allowance';
import CustomPagination from '@/components/customPagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const AllDeductionTable = () => {
  const { data: allCompensationsData, isLoading } = useFetchAllowances();
  const { currentPage, pageSize, setCurrentPage, setPageSize } =
    useAllAllowanceStore();
  const { isMobile, isTablet } = useIsMobile();

  const allDeductionEntitlementData = Array.isArray(allCompensationsData)
    ? allCompensationsData.filter(
        (allowanceEntitlement: any) =>
          allowanceEntitlement.type === 'DEDUCTION',
      )
    : [];

  const allEntitlementData = Array.isArray(allDeductionEntitlementData)
    ? allDeductionEntitlementData.reduce(
        (acc: any, benefit: any) =>
          acc.concat(benefit.compensationItmeEntitlement),
        [],
      )
    : [];

  const groupByEmployeeId =
    allEntitlementData?.reduce((acc: any, item: any) => {
      if (!acc[item.employeeId]) {
        acc[item.employeeId] = { employeeId: item.employeeId, allowance: [] };
      }
      acc[item.employeeId].allowance.push(item);
      return acc;
    }, {}) || {};

  const dataSource = Object.values(groupByEmployeeId).map((employee: any) => {
    const dataRow: any = {
      key: employee.employeeId,
      employeeId: employee.employeeId,
    };

    // Group allowances by compensationItemId to handle duplicates
    const allowancesByItem = employee.allowance.reduce(
      (acc: any, allowance: any) => {
        if (!acc[allowance.compensationItemId]) {
          acc[allowance.compensationItemId] = [];
        }
        // Convert to number to ensure proper addition instead of string concatenation
        acc[allowance.compensationItemId].push(Number(allowance.totalAmount));
        return acc;
      },
      {},
    );

    // For each compensation item, show the sum of all amounts (including duplicates)
    Object.keys(allowancesByItem).forEach((compensationItemId: string) => {
      const amounts = allowancesByItem[compensationItemId];
      const total = amounts.reduce(
        (sum: number, amount: number) => sum + amount,
        0,
      );
      dataRow[compensationItemId] = total;
    });

    return dataRow;
  });

  const createDeductionColumns = () => {
    if (!Array.isArray(allDeductionEntitlementData)) return [];

    return allDeductionEntitlementData.map((item: any) => ({
      title: (
        <span
          className="text-xs truncate"
          id={`compensation-deduction-all-column-title-${item?.id}`}
          data-cy={`compensation-deduction-all-column-title-${item?.id}`}
        >
          {item?.name}
        </span>
      ),
      dataIndex: item?.id,
      key: item?.id,
      render: (text: string) => (
        <div
          data-testid={`deduction-amount-${item?.id}`}
          id={`compensation-deduction-all-amount-${item?.id}`}
          data-cy={`compensation-deduction-all-amount-${item?.id}`}
        >
          {text || '-'}
        </div>
      ),
    }));
  };

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'dateNaming',
      sorter: true,
      render: (notused: any, record: any) => (
        <div
          data-testid={`deduction-employee-${record?.employeeId}`}
          id={`compensation-deduction-all-employee-${record?.employeeId}`}
          data-cy={`compensation-deduction-all-employee-${record?.employeeId}`}
        >
          <EmployeeDetails
            empId={record?.employeeId}
            data-cy={`compensation-deduction-all-employee-details-${record?.employeeId}`}
          />
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      sorter: true,
      render: (text: string) => (
        <div
          data-testid="deduction-role"
          id="compensation-deduction-all-role"
          data-cy="compensation-deduction-all-role"
        >
          {text || '-'}
        </div>
      ),
    },
    ...createDeductionColumns(),
  ];
  const paginatedData = dataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div
      data-testid="all-deduction-table-container"
      id="compensation-deduction-all-table-container"
      data-cy="compensation-deduction-all-table-container"
    >
      <Spin
        spinning={isLoading}
        data-testid="deduction-table-loading"
        data-cy="compensation-deduction-all-table-loading"
      >
        <div
          className="overflow-x-auto scrollbar-hide"
          id="compensation-deduction-all-table-scroll"
          data-cy="compensation-deduction-all-table-scroll"
        >
          {isLoading ? (
            <TableSkeleton columns={columns} />
          ) : (
            <Table
              className="mt-6"
              columns={columns}
              dataSource={paginatedData}
              pagination={false}
              data-testid="deduction-table"
              id="compensation-deduction-all-table"
              data-cy="compensation-deduction-all-table"
            />
          )}
        </div>

        {isMobile || isTablet ? (
          <CustomMobilePagination
            data-cy="compensation-deduction-all-mobile-pagination"
            totalResults={dataSource.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        ) : (
          <CustomPagination
            data-cy="compensation-deduction-all-pagination"
            current={currentPage}
            total={dataSource.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            onShowSizeChange={handleSizeChange}
          />
        )}
      </Spin>
    </div>
  );
};

export default AllDeductionTable;
