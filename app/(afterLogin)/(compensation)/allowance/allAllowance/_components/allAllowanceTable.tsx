import React from 'react';
import { Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { useFetchAllowances } from '@/store/server/features/compensation/allowance/queries';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useAllAllowanceStore } from '@/store/uistate/features/compensation/allowance';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';

// Component to handle allowance amount calculation
const AllowanceAmount = ({
  employeeId,
  allowance,
  allowanceType,
}: {
  employeeId: string;
  allowance: any;
  allowanceType: any;
}) => {
  const { data: basicSalaryData, error } = useGetBasicSalaryById(employeeId);

  if (error || !basicSalaryData) {
    return <span>-</span>;
  }

  const employeeBasicSalary =
    Number(basicSalaryData.find((item: any) => item.status)?.basicSalary) || 0;

  // If it's a rate-based allowance, calculate the amount
  if (allowanceType.isRate && allowanceType.defaultAmount) {
    const calculatedAmount =
      (employeeBasicSalary * Number(allowanceType.defaultAmount)) / 100;
    return <span>{calculatedAmount ? calculatedAmount : '-'}</span>;
  }

  // For fixed amounts, use the totalAmount
  return <span>{allowance.totalAmount ? allowance.totalAmount : '-'}</span>;
};

const AllAllowanceTable = ({ searchQuery }: { searchQuery: string }) => {
  const { data: allCompensationsData, isLoading } = useFetchAllowances();
  const { currentPage, pageSize, setCurrentPage, setPageSize } =
    useAllAllowanceStore();
  const { isMobile, isTablet } = useIsMobile();
  const allAllowanceEntitlementData = Array.isArray(allCompensationsData)
    ? allCompensationsData.filter(
        (allowanceEntitlement: any) =>
          allowanceEntitlement.type === 'ALLOWANCE',
      )
    : [];

  const allEntitlementData = Array.isArray(allAllowanceEntitlementData)
    ? allAllowanceEntitlementData.reduce(
        (acc: any, benefit: any) =>
          acc.concat(benefit.compensationItmeEntitlement || []),
        [],
      )
    : [];

  const groupByEmployeeId = allEntitlementData.reduce((acc: any, item: any) => {
    if (!acc[item.employeeId]) {
      acc[item.employeeId] = { employeeId: item.employeeId, allowance: [] };
    }
    acc[item.employeeId].allowance.push({
      compensationItemId: item?.compensationItemId,
      totalAmount: item?.totalAmount,
    });
    return acc;
  }, {});

  const result = Object.values(groupByEmployeeId ?? {});

  const dataSource = result.map((employee: any) => {
    const dataRow: any = {
      key: employee.employeeId,
      employeeId: employee.employeeId,
    };
    employee.allowance.forEach((allowance: any) => {
      // Find the corresponding allowance type to get the correct ID for the column
      const allowanceType = allAllowanceEntitlementData.find(
        (type: any) => type.id === allowance.compensationItemId,
      );
      if (allowanceType) {
        // Store both allowance and allowanceType for proper calculation
        dataRow[allowanceType.id] = {
          allowance,
          allowanceType,
          employeeId: employee.employeeId,
        };
      }
    });
    return dataRow;
  });

  const filteredDataSource = searchQuery
    ? dataSource.filter((employee: any) =>
        employee.employeeId.toLowerCase().includes(searchQuery?.toLowerCase()),
      )
    : dataSource;

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'dateNaming',
      sorter: true,
      render: (notused: any, record: any) => (
        <div data-testid={`allowance-employee-${record?.employeeId}`}>
          <EmployeeDetails empId={record?.employeeId} />
        </div>
      ),
    },
    ...(Array.isArray(allAllowanceEntitlementData)
      ? allAllowanceEntitlementData.map((item: any) => ({
          title: <span className="text-xs truncate">{item?.name}</span>,
          dataIndex: item?.id,
          key: item?.id,
          render: (text: string, record: any) => {
            const allowanceData = record[item?.id];

            if (!allowanceData) {
              return <div data-testid={`allowance-amount-${item?.id}`}>-</div>;
            }

            return (
              <div data-testid={`allowance-amount-${item?.id}`}>
                <AllowanceAmount
                  employeeId={allowanceData.employeeId}
                  allowance={allowanceData.allowance}
                  allowanceType={allowanceData.allowanceType}
                />
              </div>
            );
          },
        }))
      : []),
  ];

  const paginatedData = filteredDataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div data-testid="all-allowance-table-container">
      <Spin spinning={isLoading} data-testid="allowance-table-loading">
        <div className="overflow-x-auto">
          <Table
            className="mt-6"
            columns={columns}
            dataSource={paginatedData}
            pagination={false}
            data-testid="allowance-table"
          />
        </div>

        {isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={filteredDataSource.length}
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
            total={filteredDataSource.length}
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
      </Spin>
    </div>
  );
};

export default AllAllowanceTable;
