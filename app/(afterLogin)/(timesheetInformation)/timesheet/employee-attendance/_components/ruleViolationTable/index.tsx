import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { Avatar, Button, Dropdown, Table } from 'antd';
import TableFilter from './tableFilter';
import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';
import { useGetRuleViolations } from '@/store/server/features/timesheet/attendance/queries';
import { TableColumnsType } from '@/types/table/table';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { AttendanceRuleViolation } from '@/types/timesheet/attendance';
import { CommonObject } from '@/types/commons/commonObject';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import CustomPagination from '@/components/customPagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { usePathname } from 'next/navigation';
import usePagination from '@/utils/usePagination';
import { Key } from 'react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import statusType from '../statusType';

interface RuleViolationTableRow {
  key: string;
  userId: string;
  ruleName: string;
  actionTypes: string[];
  createdAt: string;
  ruleAppliedDays: number | undefined;
  record: AttendanceRuleViolation;
}

interface RuleViolationTableProps {
  setBodyRequest: Dispatch<SetStateAction<AttendanceRequestBody>>;
  isImport: boolean;
  selectedRowKeys?: Key[];
  setSelectedRowKeys?: (keys: Key[]) => void;
}

const RuleViolationTable: FC<RuleViolationTableProps> = ({
  setBodyRequest,
  isImport,
  selectedRowKeys,
  setSelectedRowKeys,
}) => {
  const [tableData, setTableData] = useState<RuleViolationTableRow[]>([]);
  const pathname = usePathname();
  const {  setOrderBy, setOrderDirection } =
    usePagination(1, 10);

  const {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    resetPagination,
  } = useMyTimesheetStore();

  useEffect(() => {
    resetPagination();
  }, [pathname]);

  const {
    setEmployeeId,
    setIsShowEmployeeAttendanceSidebar,
    setEmployeeAttendanceId,
  } = useEmployeeAttendanceStore();
  const { setFilter } = useEmployeeAttendanceStore();

  const {
    data: ruleViolationsData,
    isFetching,
    refetch,
  } = useGetRuleViolations({
    page: currentPage,
    limit: pageSize,
  });

  const { isMobile, isTablet } = useIsMobile();

  const EmpRender = ({ userId }: { userId: string }) => {
    const {
      isLoading,
      data: employeeData,
      isError,
    } = useGetSimpleEmployee(userId);

    if (isLoading)
      return (
        <div
          id={`time-attendance-rule-violation-row-employee-name-div-${userId}-loading-div`}
          data-cy={`time-attendance-rule-violation-row-employee-name-div-${userId}-loading-div`}
        >
          ...
        </div>
      );
    if (isError) return <>-</>;

    return employeeData ? (
      <div
        id={`time-attendance-rule-violation-row-employee-name-div-${userId}`}
        data-cy={`time-attendance-rule-violation-row-employee-name-div-${userId}`}
        className="flex items-center gap-1.5"
      >
        <Avatar
          data-cy={`time-attendance-rule-violation-row-employee-name-div-${userId}-avatar`}
          size={24}
          icon={<UserOutlined />}
        />
        <div className="flex-1">
          <div className="text-sm font-normal text-[#4d4d4d] flex gap-2">
            {employeeData?.firstName || '-'} {employeeData?.middleName || '-'}{' '}
            {employeeData?.lastName || '-'}
          </div>
        </div>
      </div>
    ) : (
      '-'
    );
  };

  const columns: TableColumnsType<RuleViolationTableRow> = [
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          data-cy="time-attendance-rule-violation-table-employee-name-span"
        >
          Employee Name
        </span>
      ),
      dataIndex: 'userId',
      key: 'userId',
      render: (userId: string) => <EmpRender userId={userId} />,
      width: 250,
    },
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          data-cy="time-attendance-rule-violation-table-rule-span"
        >
          Rule Violated
        </span>
      ),
      dataIndex: 'ruleName',
      key: 'ruleName',
      render: (ruleName: string) => (
        <div className="text-sm font-normal text-[#4d4d4d]">{ruleName || '-'}</div>
      ),
    },
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          data-cy="time-attendance-rule-violation-table-action-span"
        >
          Action
        </span>
      ),
      dataIndex: 'actionTypes',
      key: 'actionTypes',
      render: (actionTypes: string[]) => (
        <div
          className="flex flex-col gap-1"
          data-cy="time-attendance-rule-violation-table-action-tags"
        >
          {actionTypes?.length
            ? actionTypes.map((type) => (
                <div key={type}>{statusType(type)}</div>
              ))
            : '-'}
        </div>
      ),
    },
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          data-cy="time-attendance-rule-violation-table-action-given-span"
        >
          Action given on
        </span>
      ),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string | null) => (
        <div className="text-sm font-normal text-[#4d4d4d]">
          {createdAt ? dayjs(createdAt).format(DATE_FORMAT) : '-'}
        </div>
      ),
    },
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          data-cy="time-attendance-rule-violation-table-violation-span"
        >
          Violation
        </span>
      ),
      dataIndex: 'ruleAppliedDays',
      key: 'ruleAppliedDays',
      render: (ruleAppliedDays: number) => (
        <div className="text-sm font-normal text-[#4d4d4d]">
          {ruleAppliedDays != null ? `${ruleAppliedDays} days` : '-'}
        </div>
      ),
    },
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          data-cy="time-attendance-rule-violation-table-actions-span"
        >
          Actions
        </span>
      ),
      dataIndex: 'record',
      key: 'actions',
      render: (record: AttendanceRuleViolation) => (
        <Dropdown
            trigger={['click']}
            getPopupContainer={() => document.body}
            // open={actionOpenId === item.id}
            // onOpenChange={(open) => {
            //   if (open) {
            //     setActionOpenId(item.id);
            //   } else if (actionOpenId === item.id) {
            //     setActionOpenId(null);
            //     setDeleteConfirmOpenId(null);
            //   }
            // }}
            dropdownRender={() => (
              <div
                data-cy="talent-acquisition-talent-roaster-table-button-delete-confirm-dropdown"
                className="min-w-[145px] rounded-lg bg-white border border-[#D9D9D9] p-1 shadow-md"
              >
                 
                  <>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#F5F5F5] rounded flex items-center gap-2"
                    //   onClick={(e) => {
                    //     e.stopPropagation();
                    //     handleEdit(item);
                    //     setActionOpenId(null);
                    //   }}
                      data-cy="talent-acquisition-talent-roaster-table-button-edit"
                    >
                      <EditOutlinedIcon fontSize="small" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#F5F5F5] rounded flex items-center gap-2"
                    //   onClick={(e) => {
                    //     e.stopPropagation();
                    //     setDeleteConfirmOpenId(item.id);
                    //   }}
                      data-cy="talent-acquisition-talent-roaster-table-button-delete"
                    >
                      <SaveAltIcon fontSize="small" />
                      Export
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#F5F5F5] rounded flex items-center gap-2"
                    //   onClick={(e) => {
                    //     e.stopPropagation();
                    //     setDeleteConfirmOpenId(item.id);
                    //   }}
                      data-cy="talent-acquisition-talent-roaster-table-button-delete"
                    >
                      <RemoveCircleOutlineOutlinedIcon fontSize="small" />
                      Remove Action
                    </button>
                  </>
                
              </div>
            )}
          >
            <Button
              onClick={(e: any) => e.stopPropagation()}
              type="default"
              className="border-[1px] border-[#D9D9D9] rounded-md p-1 h-8"
              data-cy="talent-acquisition-talent-roaster-table-button-action"
            >
              <MoreHorizIcon />
            </Button>
          </Dropdown>
      ),
    },
  ];

  useEffect(() => {
    if (isImport) {
      refetch();
    }
  }, [isImport, refetch]);

  useEffect(() => {
    if (!ruleViolationsData?.items) {
      setTableData([]);
      return;
    }

    const sortedItems = [...ruleViolationsData.items].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    setTableData(
      sortedItems.map((item) => ({
        key: item.id,
        userId: item.userId,
        ruleName: item.attendanceRule?.name ?? '-',
        actionTypes: item.actionTypes ?? [],
        createdAt: item.createdAt,
        ruleAppliedDays: item.attendanceRule?.ruleAppliedDays,
        record: item,
      })),
    );
  }, [ruleViolationsData]);

  const onFilterChange = (val: CommonObject) => {
    const nFilter: Partial<AttendanceRequestBody['filter']> = {};
    if (val.date) {
      nFilter['date'] = {
        from: val.date[0]
          ? dayjs(val.date[0]).format('YYYY-MM-DD')
          : val.date[0],
        to: val.date[1] ? dayjs(val.date[1]).format('YYYY-MM-DD') : val.date[1],
      };
    }

    if (val.type) {
      nFilter['type'] = val.type;
    }

    if (val.type === 'clockedOut') {
      nFilter['type'] = null as any;
      nFilter.clockedOut = false;
    }

    if (val.breakTypeId) {
      nFilter['breakTypeId'] = val.breakTypeId;
    }

    if (val.checkInSource) {
      nFilter['checkInSource'] = val.checkInSource;
    }

    if (val.checkOutSource) {
      nFilter['checkOutSource'] = val.checkOutSource;
    }

    if (val.employeeId) {
      nFilter['userIds'] = Array.isArray(val.employeeId)
        ? val.employeeId
        : [val.employeeId];
    }

    setFilter(nFilter);
    setBodyRequest((prev) => ({
      ...prev,
      filter: nFilter,
    }));
  };

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    setCurrentPage(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? 10);
    setOrderDirection(sorter['order']);
    setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowSelection = (selectedKeys: Key[]) => {
    const currentPageKeys = tableData.map((row) => row.key);
    const previousSelectedKeys =
      selectedRowKeys?.filter(
        (key) => !currentPageKeys.includes(String(key)),
      ) || [];
    const allSelectedKeys = [...previousSelectedKeys, ...selectedKeys];
    setSelectedRowKeys?.(allSelectedKeys);
  };

  const getCurrentPageSelectedKeys = () => {
    const currentPageKeys = tableData.map((row) => row.key);
    return (
      selectedRowKeys?.filter((key) => currentPageKeys.includes(String(key))) ||
      []
    );
  };

  return (
    <div
      id="time-attendance-rule-violation-table-card"
      data-cy="time-attendance-rule-violation-table-card"
      className="border-[1px] border-[#D9D9D9] rounded-lg"
    >
      <div className="mb-4 px-5 pt-4">
        <TableFilter
          data-cy="time-attendance-rule-violation-table-filter"
          onChange={onFilterChange}
        />
      </div>
      <div>
        <div className="flex min-w-0 w-full overflow-x-auto scrollbar-none">
          {isFetching ? (
            <TableSkeleton
              columns={columns}
              scroll={{ x: 'max-content' }}
              className="[&_.ant-table]:w-full"
              data-cy="time-attendance-rule-violation-table-skeleton-wrapper"
            />
          ) : (
            <Table
              columns={columns}
              dataSource={tableData}
              rowSelection={{
                checkStrictly: false,
                selectedRowKeys: getCurrentPageSelectedKeys(),
                onChange: handleRowSelection,
              }}
              pagination={false}
              scroll={{ x: 'max-content' }}
              className="w-full [&_.ant-table-tbody>tr.ant-table-row:nth-child(odd):hover>td]:!bg-[#FAFAFA] [&_.ant-table-tbody>tr.ant-table-row:nth-child(even):hover>td]:!bg-white"
              onChange={handleTableChange}
              id="time-attendance-rule-violation-table"
              data-cy="time-attendance-rule-violation-table"
              rowClassName={(record, index) => {
                const base = index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]';
                const selected = getCurrentPageSelectedKeys().includes(
                  record.key,
                );
                return selected ? `${base} [&>td]:!bg-white` : base;
              }}
            />
          )}
        </div>
        {isMobile || isTablet ? (
          <CustomMobilePagination
            data-cy="time-attendance-rule-violation-mobile-pagination"
            totalResults={ruleViolationsData?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
          />
        ) : (
          <CustomPagination
            data-cy="time-attendance-rule-violation-desktop-pagination"
            current={currentPage}
            total={ruleViolationsData?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default RuleViolationTable;
