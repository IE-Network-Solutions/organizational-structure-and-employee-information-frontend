'use client';

import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useFetchAllowanceTypes } from '@/store/server/features/compensation/settings/queries';
import { fetchAllowanceEntitlements } from '@/store/server/features/compensation/allowance/queries';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { useQueries } from 'react-query';

type DeductionItem = { id: string; name: string; type?: string };

type EmployeeListItem = {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
};

type DataRow = {
  key: string;
  employeeId: string;
  employeeName: string;
  [compensationItemId: string]: string | number | undefined;
};

type AllDeductionTableProps = {
  searchText?: string;
};

const AllDeductionTable = ({ searchText = '' }: AllDeductionTableProps) => {
  const { data: allCompensationItems, isLoading: compensationItemsLoading } =
    useFetchAllowanceTypes();
  const { data: employeeData } = useGetAllUsers();
  const { isMobile, isTablet } = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  const deductionItems: DeductionItem[] = useMemo(
    () =>
      (Array.isArray(allCompensationItems) ? allCompensationItems : []).filter(
        (item: DeductionItem) => item.type === 'DEDUCTION',
      ),
    [allCompensationItems],
  );

  const deductionIds = useMemo(
    () => deductionItems.map((d) => d.id),
    [deductionItems],
  );

  const entitlementQueries = useQueries(
    deductionIds.map((id) => ({
      queryKey: ['compensation-item-entitlement', 'all-deduction-grid', id],
      queryFn: () => fetchAllowanceEntitlements(id),
      enabled: Boolean(id),
    })),
  );

  const entitlementsLoading = entitlementQueries.some((q) => q.isLoading);

  const dataSource: DataRow[] = useMemo(() => {
    if (!employeeData?.items) return [];

    const employeeMap = new Map<string, string>(
      employeeData.items.map((emp: EmployeeListItem) => [
        emp.id,
        `${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`.trim(),
      ]),
    );

    const employeeDeductions = new Map<string, Record<string, number>>();

    deductionIds.forEach((deductionId, index) => {
      const raw = entitlementQueries[index]?.data;
      const list = Array.isArray(raw) ? raw : [];
      list.forEach((item: { employeeId?: string; totalAmount?: number }) => {
        const empId = item.employeeId;
        if (!empId) return;
        const amt = Number(item.totalAmount ?? 0) || 0;
        if (!employeeDeductions.has(empId)) {
          employeeDeductions.set(empId, {});
        }
        const deductions = employeeDeductions.get(empId)!;
        deductions[deductionId] = (deductions[deductionId] || 0) + amt;
      });
    });

    return Array.from(employeeDeductions.entries()).map(
      ([employeeId, deductions]) => ({
        key: employeeId,
        employeeId,
        employeeName: employeeMap.get(employeeId) || 'Unknown',
        ...deductions,
      }),
    );
  }, [employeeData, deductionIds, entitlementQueries]);

  const filteredDataSource = useMemo(() => {
    const q = searchText?.trim().toLowerCase();
    if (!q) return dataSource;
    const items = employeeData?.items ?? [];
    const matchingIds = new Set(
      items
        .filter((e: EmployeeListItem) =>
          `${e?.firstName ?? ''} ${e?.middleName ?? ''} ${e?.lastName ?? ''}`
            .toLowerCase()
            .includes(q),
        )
        .map((e: EmployeeListItem) => e.id),
    );
    return dataSource.filter((row) => matchingIds.has(row.employeeId));
  }, [dataSource, searchText, employeeData?.items]);

  const nameColumnWidth = isMobile ? 118 : isTablet ? 168 : 200;

  const columns: ColumnsType<DataRow> = useMemo(() => {
    const baseColumns: ColumnsType<DataRow> = [
      {
        title: 'Name',
        dataIndex: 'employeeName',
        key: 'employeeName',
        ellipsis: true,
        fixed: 'left',
        width: nameColumnWidth,
        render: (text: string) => (
          <span
            className={`text-[#434343] ${isMobile ? 'text-xs leading-snug' : 'text-[13px]'}`}
            data-cy="compensation-deduction-all-table-name-cell"
          >
            {text}
          </span>
        ),
      },
    ];

    deductionItems.forEach((item) => {
      const label = item.name ?? '';
      baseColumns.push({
        title: (
          <span
            className="inline-block whitespace-nowrap text-left font-semibold"
            data-cy={`compensation-deduction-all-table-header-${item.id}`}
          >
            {label}
          </span>
        ),
        dataIndex: item.id,
        key: item.id,
        align: 'left',
        width: Math.max(152, Math.ceil(label.length * 7.5) + 32),
        render: (value: number | undefined) => (
          <span
            className="block whitespace-nowrap text-[13px] text-[#434343]"
            data-cy={`compensation-deduction-all-table-cell-${item.id}`}
          >
            {value != null ? value : '-'}
          </span>
        ),
      });
    });

    return baseColumns;
  }, [deductionItems, nameColumnWidth, isMobile]);

  const paginatedData = useMemo(
    () =>
      filteredDataSource.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      ),
    [filteredDataSource, currentPage, pageSize],
  );

  const tableLoading = compensationItemsLoading || entitlementsLoading;

  return (
    <div
      className="w-full"
      id="compensation-deduction-all-table-container"
      data-cy="compensation-deduction-all-table-container"
    >
      <Spin spinning={tableLoading}>
        <div
          className="w-full min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_.ant-table-wrapper]:!rounded-none [&_.ant-table-wrapper]:!shadow-none [&_.ant-table]:!shadow-none [&_.ant-table-content]:[-ms-overflow-style:none] [&_.ant-table-content]:[scrollbar-width:none] [&_.ant-table-content::-webkit-scrollbar]:hidden [&_.ant-table-body]:[-ms-overflow-style:none] [&_.ant-table-body]:[scrollbar-width:none] [&_.ant-table-body::-webkit-scrollbar]:hidden"
          id="compensation-deduction-all-table-scroll"
          data-cy="compensation-deduction-all-table-scroll"
        >
          <Table
            rowKey="employeeId"
            columns={columns}
            dataSource={paginatedData}
            pagination={false}
            scroll={{ x: 'max-content' }}
            rowHoverable={false}
            rowClassName={(unusedRow, rowIndex) => {
              void unusedRow;
              return rowIndex % 2 === 0
                ? 'benefit-row-even'
                : 'benefit-row-odd';
            }}
            className="[&_.ant-table]:text-sm [&_.ant-table]:!rounded-none [&_.ant-table-container]:!rounded-none [&_.ant-table-header]:!rounded-none [&_.ant-table-content]:!rounded-none [&_.ant-table-thead>tr>th]:bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-[#262626] [&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-gray-200 [&_.ant-table-tbody>tr.benefit-row-even>td]:!bg-[#FFFFFF] [&_.ant-table-tbody>tr.benefit-row-odd>td]:!bg-[#FAFAFA] [&_.ant-table-tbody>tr>td]:border-0 [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-gray-100 [&_.ant-table-tbody>tr:hover>td]:!bg-[#f5f5f5]"
            data-cy="compensation-deduction-all-table"
          />
        </div>

        {isMobile || isTablet ? (
          <div
            className="mt-3 px-0"
            data-cy="compensation-deduction-all-mobile-pagination"
          >
            <CustomMobilePagination
              data-cy="compensation-deduction-all-mobile-pagination"
              totalResults={filteredDataSource.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              onShowSizeChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
            />
          </div>
        ) : (
          <div data-cy="compensation-deduction-all-pagination">
            <CustomPagination
              data-cy="compensation-deduction-all-pagination"
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
          </div>
        )}
      </Spin>
    </div>
  );
};

export default AllDeductionTable;
