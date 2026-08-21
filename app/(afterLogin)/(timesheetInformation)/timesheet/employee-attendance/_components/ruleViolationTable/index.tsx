import React, { FC, useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Dropdown, Table, message } from 'antd';
import TableFilter from './tableFilter';
import {
  ExportWarningLetterFormat,
  RuleViolationQueryParams,
} from '@/store/server/features/timesheet/attendance/interface';
import { useExportWarningLetter } from '@/store/server/features/timesheet/attendance/mutation';
import { useGetRuleViolations } from '@/store/server/features/timesheet/attendance/queries';
import { TableColumnsType } from '@/types/table/table';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import {
  AttendanceRuleType,
  AttendanceRuleTypes,
  AttendanceRuleViolation,
  AttendanceActionType,
} from '@/types/timesheet/attendance';
import { useGetAttendanceRuleTypes } from '@/store/server/features/timesheet/attendanceNotificationRule/queries';
import { buildRuleViolationQueryParams } from '@/store/server/features/timesheet/attendance/ruleViolationParams';
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
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import statusType from '../statusType';
import EditRuleViolationModal from './editModal';
import DeleteRuleViolationModal, {
  hasRemovableViolationActions,
} from './deleteRuleViolation';
import MoveToDeductionModal, {
  DeductionViolation,
} from './moveToDeductionModal';

const resolveViolationRuleType = (
  item: AttendanceRuleViolation,
  ruleTypes?: AttendanceRuleTypes[],
): string | undefined => {
  if (item.attendanceRuleTypes?.ruleType) {
    return String(item.attendanceRuleTypes.ruleType);
  }

  const ruleType = item.attendanceRule?.ruleType;
  if (
    typeof ruleType === 'object' &&
    ruleType !== null &&
    'ruleType' in ruleType
  ) {
    return String(ruleType.ruleType);
  }
  if (
    typeof ruleType === 'string' &&
    Object.values(AttendanceRuleType).includes(ruleType as AttendanceRuleType)
  ) {
    return ruleType;
  }

  const typeId =
    item.attendanceRule?.attendanceRuleTypeId ??
    (typeof ruleType === 'string' ? ruleType : undefined);
  if (typeId && ruleTypes?.length) {
    const match = ruleTypes.find((type) => type.id === typeId);
    if (match?.ruleType) return String(match.ruleType);
  }

  return undefined;
};

interface RuleViolationTableRow {
  key: string;
  userId: string;
  ruleName: string;
  actionTypes: string[];
  createdAt: string;
  ruleAppliedDays: number | undefined;
  violationRuleType: string | undefined;
  record: AttendanceRuleViolation;
}

interface RuleViolationTableProps {
  isImport: boolean;
  selectedRowKeys?: Key[];
  setSelectedRowKeys?: (keys: Key[]) => void;
  onSelectedViolationsChange?: (violations: DeductionViolation[]) => void;
}

const RuleViolationTable: FC<RuleViolationTableProps> = ({
  isImport,
  selectedRowKeys,
  setSelectedRowKeys,
  onSelectedViolationsChange,
}) => {
  const [tableData, setTableData] = useState<RuleViolationTableRow[]>([]);
  const [exportSubmenuOpenId, setExportSubmenuOpenId] = useState<string | null>(
    null,
  );
  const [isMoveToDeductionModalOpen, setIsMoveToDeductionModalOpen] =
    useState(false);
  const [deductionViolations, setDeductionViolations] = useState<
    DeductionViolation[]
  >([]);
  const pathname = usePathname();
  const {
    violationFilters,
    setViolationFilters,
    setIsShowEditRuleViolationModal,
    setIsShowDeleteRuleViolationModal,
    setSelectedViolation,
  } = useEmployeeAttendanceStore();
  const { orderBy, orderDirection, setOrderBy, setOrderDirection } =
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
    setViolationFilters({});
  }, [pathname, resetPagination, setViolationFilters]);

  const ruleViolationQuery = useMemo<RuleViolationQueryParams>(
    () => ({
      page: currentPage,
      limit: pageSize,
      orderBy,
      orderDirection,
      ...violationFilters,
    }),
    [currentPage, pageSize, orderBy, orderDirection, violationFilters],
  );

  const {
    data: ruleViolationsData,
    isFetching,
    refetch,
  } = useGetRuleViolations(ruleViolationQuery);
  const { data: attendanceRuleTypesData } = useGetAttendanceRuleTypes();
  const {
    mutate: exportWarningLetter,
    isLoading: isExportingWarningLetter,
    variables: exportingLetterVariables,
  } = useExportWarningLetter();

  const { isMobile, isTablet } = useIsMobile();

  const handleExportWarningLetter = (
    event: React.MouseEvent,
    violationId: string,
    format: ExportWarningLetterFormat,
  ) => {
    event.stopPropagation();
    exportWarningLetter(
      { violationId, format },
      {
        onSuccess: () => {
          setExportSubmenuOpenId(null);
          message.success('Download completed successfully!');
        },
        onError: () => {
          message.error('Failed to export warning letter. Please try again.');
        },
      },
    );
  };

  const isExportingLetterForRow = (
    violationId: string,
    format: ExportWarningLetterFormat,
  ) =>
    isExportingWarningLetter &&
    exportingLetterVariables?.violationId === violationId &&
    exportingLetterVariables?.format === format;

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
        <div
          data-cy="time-attendance-rule-violation-row-employee-name-div-${userId}-div"
          className="flex-1"
        >
          <div
            data-cy="time-attendance-rule-violation-row-employee-name-div-${userId}-text-div"
            className="text-sm font-normal text-[#4d4d4d] flex gap-2"
          >
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
        <div
          data-cy="time-attendance-rule-violation-table-rule-name-div"
          className="text-sm font-normal text-[#4d4d4d]"
        >
          {ruleName || '-'}
        </div>
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
      key: 'actionTypes',
      render: (_: unknown, row: RuleViolationTableRow) => {
        const actionTypes = row.actionTypes;
        const minutes = row.record.salaryDeductionMinutes;
        const amount = row.record.salaryDeductionAmount;
        const showSalaryDeductionDetail =
          actionTypes?.includes(AttendanceActionType.SALARY_DEDUCTION) &&
          (minutes != null || amount != null);

        return (
          <div
            className="flex flex-col gap-1"
            data-cy="time-attendance-rule-violation-table-action-tags"
          >
            {actionTypes?.length
              ? actionTypes.map((type) => (
                  <div
                    data-cy="time-attendance-rule-violation-table-action-tags-div"
                    key={type}
                  >
                    {statusType(type)}
                  </div>
                ))
              : '-'}
            {showSalaryDeductionDetail && (
              <div
                className="text-xs text-[#4d4d4d] whitespace-nowrap"
                data-cy="time-attendance-rule-violation-table-salary-deduction-detail"
              >
                {minutes != null ? `${minutes} min` : null}
                {minutes != null && amount != null ? ' · ' : null}
                {amount != null ? `${Number(amount).toFixed(2)}` : null}
              </div>
            )}
          </div>
        );
      },
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
        <div
          data-cy="time-attendance-rule-violation-table-action-given-on-div"
          className="text-sm font-normal text-[#4d4d4d]"
        >
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
      key: 'violation',
      render: (notUsed: unknown, row: RuleViolationTableRow) => {
        const hasDays = row.ruleAppliedDays != null;
        const hasRuleType = Boolean(row.violationRuleType);

        if (!hasDays && !hasRuleType) return '-';

        return (
          <div
            className="flex items-center gap-2 flex-wrap"
            data-cy="time-attendance-rule-violation-table-violation-cell"
          >
            {hasDays && (
              <span
                data-cy="time-attendance-rule-violation-table-violation-cell-days-span"
                className="text-sm font-normal text-[#4d4d4d] whitespace-nowrap"
              >
                {row.ruleAppliedDays} Days
              </span>
            )}
            {hasRuleType && statusType(row.violationRuleType)}
          </div>
        );
      },
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
          dropdownRender={() => (
            <div
              data-cy="time-attendance-rule-violation-table-actions-dropdown"
              className="min-w-[145px] overflow-visible rounded-lg border border-[#D9D9D9] bg-white p-1 shadow-md"
            >
              <>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[#F5F5F5] rounded flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedViolation(record.id, record.actionTypes ?? []);
                    setIsShowEditRuleViolationModal(true);
                  }}
                  data-cy="time-attendance-rule-violation-table-button-edit"
                >
                  <EditOutlinedIcon fontSize="small" />
                  Edit
                </button>
                <div
                  className="relative overflow-visible"
                  onMouseEnter={() => setExportSubmenuOpenId(record.id)}
                  onMouseLeave={() => setExportSubmenuOpenId(null)}
                  data-cy="time-attendance-rule-violation-table-button-export-submenu"
                >
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 ${
                      exportSubmenuOpenId === record.id
                        ? 'bg-[#F5F5F5]'
                        : 'hover:bg-[#F5F5F5]'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    data-cy="time-attendance-rule-violation-table-button-export"
                  >
                    <SaveAltIcon fontSize="small" />
                    Export
                  </button>
                  {exportSubmenuOpenId === record.id && (
                    <div
                      className="absolute right-full top-0 z-[1100] flex pl-1"
                      onClick={(e) => e.stopPropagation()}
                      data-cy="time-attendance-rule-violation-table-export-submenu"
                    >
                      <div
                        className="flex min-w-[100px] flex-col gap-2 rounded-lg border border-[#D9D9D9] bg-white p-2 shadow-md"
                        data-cy="time-attendance-rule-violation-table-export-submenu-dropdown"
                      >
                        <button
                          type="button"
                          className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2 text-center text-sm text-gray-900 hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-60"
                          id="time-attendance-rule-violation-export-docx-button"
                          data-cy="time-attendance-rule-violation-export-docx-button"
                          disabled={isExportingWarningLetter}
                          onClick={(e) =>
                            handleExportWarningLetter(e, record.id, 'DOCX')
                          }
                        >
                          {isExportingLetterForRow(record.id, 'DOCX')
                            ? 'Exporting...'
                            : 'DOCX'}
                        </button>
                        <button
                          type="button"
                          className="w-full rounded border border-[#D9D9D9] bg-white px-3 py-2 text-center text-sm text-gray-900 hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-60"
                          id="time-attendance-rule-violation-export-pdf-button"
                          data-cy="time-attendance-rule-violation-export-pdf-button"
                          disabled={isExportingWarningLetter}
                          onClick={(e) =>
                            handleExportWarningLetter(e, record.id, 'PDF')
                          }
                        >
                          {isExportingLetterForRow(record.id, 'PDF')
                            ? 'Exporting...'
                            : 'PDF'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[#F5F5F5] rounded flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenMoveToDeductionModal([record.id]);
                  }}
                  data-cy="time-attendance-rule-violation-table-button-move-to-deduction"
                >
                  <DriveFileMoveOutlinedIcon fontSize="small" />
                  Move to Deduction
                </button>
                {hasRemovableViolationActions(
                  record.actionTypes ?? [],
                  record.actionStatus,
                ) && (
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#F5F5F5] rounded flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedViolation(
                        record.id,
                        record.actionTypes ?? [],
                        record.actionStatus,
                      );
                      setIsShowDeleteRuleViolationModal(true);
                    }}
                    data-cy="time-attendance-rule-violation-table-button-delete"
                  >
                    <RemoveCircleOutlineOutlinedIcon fontSize="small" />
                    Remove Action
                  </button>
                )}
              </>
            </div>
          )}
        >
          <Button
            onClick={(e: any) => e.stopPropagation()}
            type="default"
            className="border-[1px] border-[#D9D9D9] rounded-md p-1 h-8"
            data-cy="time-attendance-rule-violation-table-button-action"
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
        violationRuleType: resolveViolationRuleType(
          item,
          attendanceRuleTypesData?.items,
        ),
        record: item,
      })),
    );
  }, [ruleViolationsData, attendanceRuleTypesData?.items]);

  const onFilterChange = (val: CommonObject) => {
    setViolationFilters(buildRuleViolationQueryParams(val));
    setCurrentPage(1);
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    void filters;
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

  const handleOpenMoveToDeductionModal = (violationIds: string[]) => {
    if (violationIds.length === 0) return;
    const selected = tableData
      .filter((row) => violationIds.includes(row.key))
      .map((row) => ({
        id: row.key,
        userId: row.userId,
        actionTypes: row.actionTypes,
      }));
    setDeductionViolations(selected);
    setIsMoveToDeductionModalOpen(true);
  };

  useEffect(() => {
    if (!onSelectedViolationsChange) return;

    if (!selectedRowKeys?.length) {
      onSelectedViolationsChange([]);
      return;
    }

    const selectedKeys = selectedRowKeys.map(String);
    const fromTable = tableData
      .filter((row) => selectedKeys.includes(row.key))
      .map((row) => ({
        id: row.key,
        userId: row.userId,
        actionTypes: row.actionTypes,
      }));
    const knownIds = new Set(fromTable.map((v) => v.id));
    const fromOtherPages = selectedKeys
      .filter((id) => !knownIds.has(id))
      .map((id) => ({
        id,
        userId: '',
        actionTypes: [AttendanceActionType.SALARY_DEDUCTION],
      }));

    onSelectedViolationsChange([...fromTable, ...fromOtherPages]);
  }, [tableData, selectedRowKeys, onSelectedViolationsChange]);

  return (
    <div
      id="time-attendance-rule-violation-table-card"
      data-cy="time-attendance-rule-violation-table-card"
      className="border-[1px] border-[#D9D9D9] rounded-lg"
    >
      <div
        className="mb-4 px-2 sm:px-5 pt-4"
        id="time-attendance-rule-violation-table-filter-section"
        data-cy="time-attendance-rule-violation-table-filter-section"
      >
        <TableFilter
          data-cy="time-attendance-rule-violation-table-filter"
          onChange={onFilterChange}
        />
      </div>
      <div
        id="time-attendance-rule-violation-table-wrapper"
        data-cy="time-attendance-rule-violation-table-wrapper"
      >
        <div
          className="flex min-w-0 w-full overflow-x-auto scrollbar-none"
          id="time-attendance-rule-violation-table-container"
          data-cy="time-attendance-rule-violation-table-container"
        >
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
        <EditRuleViolationModal
          setIsShowEditRuleViolationModal={setIsShowEditRuleViolationModal}
        />
        <DeleteRuleViolationModal
          setIsShowDeleteRuleViolationModal={setIsShowDeleteRuleViolationModal}
        />
        <MoveToDeductionModal
          open={isMoveToDeductionModalOpen}
          violations={deductionViolations}
          onClose={() => {
            setIsMoveToDeductionModalOpen(false);
            setDeductionViolations([]);
          }}
          onSuccess={() => {
            setIsMoveToDeductionModalOpen(false);
            setDeductionViolations([]);
            setSelectedRowKeys?.([]);
          }}
        />
      </div>
    </div>
  );
};

export default RuleViolationTable;
