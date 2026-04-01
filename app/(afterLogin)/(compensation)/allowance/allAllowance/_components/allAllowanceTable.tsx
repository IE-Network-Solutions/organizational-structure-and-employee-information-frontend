import React, { useEffect, useMemo } from 'react';
import { Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { useFetchAllowances } from '@/store/server/features/compensation/allowance/queries';
import { useAllAllowanceStore } from '@/store/uistate/features/compensation/allowance';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

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
    return (
      <span
        id={`compensation-allowance-amount-error-${employeeId}`}
        data-cy={`compensation-allowance-amount-error-${employeeId}`}
      >
        -
      </span>
    );
  }

  const employeeBasicSalary =
    Number(basicSalaryData.find((item: any) => item.status)?.basicSalary) || 0;

  // If it's a rate-based allowance, calculate the amount
  if (allowanceType.isRate && allowanceType.defaultAmount) {
    const calculatedAmount =
      (employeeBasicSalary * Number(allowanceType.defaultAmount)) / 100;
    return (
      <span
        id={`compensation-allowance-amount-rate-${employeeId}`}
        data-cy={`compensation-allowance-amount-rate-${employeeId}`}
      >
        {calculatedAmount ? calculatedAmount : '-'}
      </span>
    );
  }

  // For fixed amounts, use the totalAmount
  return (
    <span
      id={`compensation-allowance-amount-fixed-${employeeId}`}
      data-cy={`compensation-allowance-amount-fixed-${employeeId}`}
    >
      {allowance.totalAmount ? allowance.totalAmount : '-'}
    </span>
  );
};

const AllAllowanceTable = ({ searchText }: { searchText: string }) => {
  const { data: allCompensationsData, isLoading } = useFetchAllowances();
  const { currentPage, pageSize, setCurrentPage, setPageSize } =
    useAllAllowanceStore();
  const { isMobile, isTablet } = useIsMobile();
  const { data: employeeData } = useGetAllUsers();
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

  const employeeMap = useMemo(() => {
    const items = employeeData?.items ?? [];
    const map = new Map<string, string>();
    items.forEach((e: any) => {
      const id = String(e?.id ?? '');
      if (!id) return;
      const label =
        `${e?.firstName ?? ''} ${e?.middleName ?? ''} ${e?.lastName ?? ''}`
          .replace(/\s+/g, ' ')
          .trim();
      map.set(id, label || 'Unknown');
    });
    return map;
  }, [employeeData?.items]);

  const dataSource = result.map((employee: any) => {
    const dataRow: any = {
      key: employee.employeeId,
      employeeId: employee.employeeId,
      employeeName: employeeMap.get(String(employee.employeeId)) || 'Unknown',
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, setCurrentPage]);

  const filteredDataSource = useMemo(() => {
    const q = searchText?.trim().toLowerCase();
    if (!q) return dataSource;
    const items = employeeData?.items ?? [];
    const matchingIds = new Set(
      items
        .filter((e: any) =>
          `${e?.firstName ?? ''} ${e?.middleName ?? ''} ${e?.lastName ?? ''}`
            .toLowerCase()
            .includes(q),
        )
        .map((e: any) => e.id),
    );
    return dataSource.filter((row: any) => matchingIds.has(row.employeeId));
  }, [dataSource, employeeData?.items, searchText]);

  const nameColumnWidth = isMobile ? 118 : isTablet ? 168 : 200;

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'employeeName',
      key: 'dateNaming',
      fixed: 'left',
      width: nameColumnWidth,
      ellipsis: true,
      render: (text: string) => (
        <span
          className={`text-[#434343] ${isMobile ? 'text-xs leading-snug' : 'text-[13px]'}`}
          data-cy="compensation-allowance-all-table-name-cell"
          title={text}
        >
          {text}
        </span>
      ),
    },
    ...(Array.isArray(allAllowanceEntitlementData)
      ? allAllowanceEntitlementData.map((item: any) => ({
          title: (
            <span
              className="text-xs truncate"
              id={`compensation-allowance-column-title-${item?.id}`}
              data-cy={`compensation-allowance-column-title-${item?.id}`}
            >
              {item?.name}
            </span>
          ),
          dataIndex: item?.id,
          key: item?.id,
          render: (text: string, record: any) => {
            const allowanceData = record[item?.id];

            if (!allowanceData) {
              return (
                <div
                  data-testid={`allowance-amount-${item?.id}`}
                  id={`compensation-allowance-amount-empty-${item?.id}`}
                  data-cy={`compensation-allowance-amount-empty-${item?.id}`}
                >
                  -
                </div>
              );
            }

            return (
              <div
                data-testid={`allowance-amount-${item?.id}`}
                id={`compensation-allowance-amount-value-${item?.id}`}
                data-cy={`compensation-allowance-amount-value-${item?.id}`}
              >
                <AllowanceAmount
                  data-cy="compensation-allowance-amount"
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
    <div
      data-testid="all-allowance-table-container"
      id="compensation-allowance-all-table-container"
      data-cy="compensation-allowance-all-table-container"
    >
      <Spin
        data-cy="compensation-allowance-all-table-loading"
        spinning={isLoading}
        data-testid="allowance-table-loading"
      >
        <div
          className="w-full min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_.ant-table-wrapper]:!rounded-none [&_.ant-table-wrapper]:!shadow-none [&_.ant-table]:!shadow-none [&_.ant-table-container]:!rounded-none [&_.ant-table-container]:!rounded-ss-none [&_.ant-table-container]:!rounded-se-none [&_.ant-table-container]:!rounded-es-none [&_.ant-table-container]:!rounded-ee-none [&_.ant-table-title]:!rounded-none [&_.ant-table-header]:!rounded-none [&_.ant-table-footer]:!rounded-none [&_.ant-table-footer]:!rounded-es-none [&_.ant-table-footer]:!rounded-ee-none [&_.ant-table-thead>tr:first-child>th:first-child]:!rounded-none [&_.ant-table-thead>tr:first-child>th:first-child]:!rounded-ss-none [&_.ant-table-thead>tr:first-child>th:last-child]:!rounded-none [&_.ant-table-thead>tr:first-child>th:last-child]:!rounded-se-none [&_.ant-table-tbody>tr:last-child>td:first-child]:!rounded-none [&_.ant-table-tbody>tr:last-child>td:first-child]:!rounded-es-none [&_.ant-table-tbody>tr:last-child>td:last-child]:!rounded-none [&_.ant-table-tbody>tr:last-child>td:last-child]:!rounded-ee-none [&_.ant-table-content]:[-ms-overflow-style:none] [&_.ant-table-content]:[scrollbar-width:none] [&_.ant-table-content::-webkit-scrollbar]:hidden [&_.ant-table-body]:[-ms-overflow-style:none] [&_.ant-table-body]:[scrollbar-width:none] [&_.ant-table-body::-webkit-scrollbar]:hidden"
          id="compensation-allowance-all-table-scroll"
          data-cy="compensation-allowance-all-table-scroll"
        >
          <Table
            className="mt-6 [&_.ant-table]:text-sm [&_.ant-table]:!rounded-none [&_.ant-table-container]:!rounded-none [&_.ant-table-header]:!rounded-none [&_.ant-table-content]:!rounded-none [&_.ant-table-thead>tr>th]:bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-[#262626] [&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-gray-200 [&_.ant-table-tbody>tr.benefit-row-even>td]:!bg-[#FFFFFF] [&_.ant-table-tbody>tr.benefit-row-odd>td]:!bg-[#FAFAFA] [&_.ant-table-tbody>tr>td]:border-0 [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-gray-100 [&_.ant-table-tbody>tr:hover>td]:!bg-[#f5f5f5]"
            columns={columns}
            dataSource={paginatedData}
            pagination={false}
            data-testid="allowance-table"
            id="compensation-allowance-all-table-display"
            data-cy="compensation-allowance-all-table-display"
            scroll={{ x: 'max-content' }}
            rowHoverable={false}
            rowKey="employeeId"
            rowClassName={(unusedRow, rowIndex) => {
              void unusedRow;
              return rowIndex % 2 === 0
                ? 'benefit-row-even'
                : 'benefit-row-odd';
            }}
            // Ensure fixed-left cells match stripe colors and avoid overlay shadow.
            rootClassName="[&_.ant-table-cell-fix-left]:shadow-none [&_.ant-table-cell-fix-left-last]:shadow-none [&_.benefit-row-even_.ant-table-cell-fix-left]:!bg-[#FFFFFF] [&_.benefit-row-odd_.ant-table-cell-fix-left]:!bg-[#FAFAFA] [&_.ant-table-thead>tr>th.ant-table-cell-fix-left]:!bg-[#FAFAFA]"
          />
        </div>

        {isMobile || isTablet ? (
          <CustomMobilePagination
            data-cy="compensation-allowance-all-table-mobile-pagination"
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
            data-cy="compensation-allowance-all-table-pagination"
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
