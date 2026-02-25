'use client';
import React, { useState } from 'react';
import {
  Col,
  Row,
  Select,
  Table,
  TableColumnsType,
  DatePicker,
  Input,
  Button,
  Dropdown,
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { Option } from 'antd/es/mentions';
import { TableRowSelection } from 'antd/es/table/interface';
import { useGetTalentRoaster } from '@/store/server/features/recruitment/talent-roaster/query';
import { useDeleteTalentRoaster } from '@/store/server/features/recruitment/talent-roaster/mutation';
import dayjs from 'dayjs';
import { LoadingOutlined } from '@ant-design/icons';
import { useGetDepartmentByID } from '@/store/server/features/recruitment/job/queries';
import { useTalentRoasterStore } from '@/store/uistate/features/recruitment/talent-resource/talent-roaster';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useEmployeeDepartments } from '@/store/server/features/employees/employeeManagment/queries';
import { useRouter } from 'next/navigation';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

// Define proper interfaces for talent roaster data
interface TalentRoasterItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  CGPA: number;
  departmentId: string;
  createdAt: string;
  resumeUrl: string;
  documentName?: string;
  graduateYear: string;
  coverLetter?: string;
}

interface TalentRoasterResponse {
  items: TalentRoasterItem[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

interface DepartmentData {
  id: string;
  name: string;
  description?: string;
  branchId?: string;
}

interface TableDataItem {
  key: string;
  id: string;
  fullName: string;
  phone: string;
  CGPA: string | number;
  departmentId: React.ReactNode;
  createdAt: string;
  resumeUrl: React.ReactNode;
  graduateYear: string;
  action: React.ReactNode;
}

interface TalentRoasterTableProps {
  onEdit?: (data: TalentRoasterItem) => void;
}

const TalentRoasterTable = ({ onEdit }: TalentRoasterTableProps) => {
  const {
    setItemToDelete,
    searchParams,
    setSearchParams,
    currentPage,
    pageSize,
    selectedRowKeys,
    setSelectedRowKeys,
    clearSelectedRowKeys,
    setSelectedTalentRoaster,
  } = useTalentRoasterStore();
  const { RangePicker } = DatePicker;
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const router = useRouter();

  const { data: talentRoaster, isLoading: isTalentRoasterLoading } =
    useGetTalentRoaster({
      fullName: searchParams.fullName?.trim() || undefined,
      dateRange: searchParams.dateRange?.trim() || undefined,
      selectedDepartment: searchParams.selectedDepartment?.trim() || undefined,
      pageSize,
      page: currentPage,
    }) as { data: TalentRoasterResponse | undefined; isLoading: boolean };

  const { mutate: deleteTalentRoaster } = useDeleteTalentRoaster();
  const { data: EmployeeDepartment } = useEmployeeDepartments() as {
    data: DepartmentData[] | undefined;
  };

  // Check if either query is still loading
  const isLoading = isTalentRoasterLoading;
  const { isMobile, isTablet } = useIsMobile();
  const { setCurrentPage, setPageSize } = useTalentRoasterStore();

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const onSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleEdit = (data: TalentRoasterItem) => {
    onEdit?.(data);
  };

  const handleDelete = (item: TalentRoasterItem) => {
    setItemToDelete(item);
    deleteTalentRoaster(item?.id, {
      onSuccess: () => {
        setItemToDelete(null);
      },
    });
  };

  const columns: TableColumnsType<TableDataItem> = [
    {
      title: (
        <span
          id="talent-acquisition-talent-roaster-table-column-name"
          data-cy="talent-acquisition-talent-roaster-table-column-name"
          className="font-bold text-base text-[#4b4b4b]"
        >
          Name
        </span>
      ),
      dataIndex: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      className: 'text-sm text-[#4b4b4b]',
      width: 200,
    },

    {
      title: (
        <span
          id="talent-acquisition-talent-roaster-table-column-phone"
          data-cy="talent-acquisition-talent-roaster-table-column-phone"
          className="font-bold text-base text-[#4b4b4b]"
        >
          Phone Number
        </span>
      ),
      dataIndex: 'phone',
      ellipsis: true,
      className: 'text-sm text-[#4b4b4b]',
      width: 150,
    },
    {
      title: (
        <span
          id="talent-acquisition-talent-roaster-table-column-cgpa"
          data-cy="talent-acquisition-talent-roaster-table-column-cgpa"
          className="font-bold text-base text-[#4b4b4b]"
        >
          CGPA
        </span>
      ),
      dataIndex: 'CGPA',
      sorter: (a: TableDataItem, b: TableDataItem) => {
        const aVal =
          typeof a.CGPA === 'number'
            ? a.CGPA
            : parseFloat(a.CGPA as string) || 0;
        const bVal =
          typeof b.CGPA === 'number'
            ? b.CGPA
            : parseFloat(b.CGPA as string) || 0;
        return aVal - bVal;
      },
      width: 150,
    },
    {
      title: (
        <span
          id="talent-acquisition-talent-roaster-table-column-department"
          data-cy="talent-acquisition-talent-roaster-table-column-department"
          className="font-bold text-base text-[#4b4b4b]"
        >
          Department
        </span>
      ),
      dataIndex: 'departmentId',
      sorter: (a, b) => {
        const aText = typeof a.departmentId === 'string' ? a.departmentId : '';
        const bText = typeof b.departmentId === 'string' ? b.departmentId : '';
        return aText.localeCompare(bText);
      },
      width: 200,
      className: 'text-sm text-[#4b4b4b]',
    },

    {
      title: (
        <span
          id="talent-acquisition-talent-roaster-table-column-application-date"
          data-cy="talent-acquisition-talent-roaster-table-column-application-date"
          className="font-bold text-base text-[#4b4b4b]"
        >
          Application Date
        </span>
      ),
      dataIndex: 'createdAt',
      width: 150,
      className: 'text-sm text-[#4b4b4b]',
    },
    {
      title: (
        <span
          id="talent-acquisition-talent-roaster-table-column-cv"
          data-cy="talent-acquisition-talent-roaster-table-column-cv"
          className="font-bold text-base text-[#4b4b4b]"
        >
          CV
        </span>
      ),
      dataIndex: 'resumeUrl',
      className: 'text-sm text-[#4b4b4b]',
      width: 150,
    },
    {
      title: (
        <span
          id="talent-acquisition-talent-roaster-table-column-year-of-graduation"
          data-cy="talent-acquisition-talent-roaster-table-column-year-of-graduation"
          className="font-bold text-base text-[#4b4b4b]"
        >
          Year of Graduation
        </span>
      ),
      dataIndex: 'graduateYear',
      width: 200,
      className: 'text-sm text-[#4b4b4b]',
    },

    {
      title: (
        <span
          id="talent-acquisition-talent-roaster-table-column-action"
          data-cy="talent-acquisition-talent-roaster-table-column-action"
          className="font-bold text-base text-[#4b4b4b]"
        >
          Action
        </span>
      ),
      dataIndex: 'action',
      className: 'text-sm text-[#4b4b4b]',
      width: 150,
    },
  ];

  const data: TableDataItem[] =
    talentRoaster?.items?.map((item: TalentRoasterItem) => {
      const DepartmentDetail = ({ id }: { id: string }) => {
        const {
          data: getAllDepartment,
          isLoading: isDepartmentLoading,
          error,
        } = useGetDepartmentByID(id) as {
          data: DepartmentData | undefined;
          isLoading: boolean;
          error: unknown;
        };

        if (isDepartmentLoading)
          return (
            <>
              <LoadingOutlined />
            </>
          );

        if (error || !getAllDepartment) return '-';

        const depName = `${getAllDepartment?.name}` || '-';
        return (
          <div
            id="talent-acquisition-talent-roaster-table-cell-department"
            data-cy={`talent-acquisition-talent-roaster-table-cell-department-${id}`}
            className="flex gap-2 items-center"
          >
            {
              <div data-cy="talent-roaster-components-table-index-tsx-index-div-227">
                {depName}
              </div>
            }
          </div>
        );
      };

      return {
        key: item.id,
        id: item.id,
        fullName: item?.fullName ?? '--',
        phone: item?.phone ?? '--',
        CGPA: item?.CGPA ?? '--',
        departmentId: <DepartmentDetail id={item?.departmentId} />,
        createdAt: item?.createdAt
          ? dayjs(item.createdAt).format('DD MMMM YYYY')
          : '--',
        resumeUrl: (
          <a
            data-cy={`talent-acquisition-talent-roaster-table-link-cv-${item.id}`}
            href={item?.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold cursor-pointer flex items-center gap-2"
            title={item?.documentName ?? 'CV.pdf'}
          >
            <SaveAltIcon fontSize="small" className="text-[#1e40af]" />
          </a>
        ),

        graduateYear: item?.graduateYear
          ? dayjs(item.graduateYear).format('DD MMMM YYYY')
          : '--',

        action: (
          <Dropdown
            trigger={['click']}
            getPopupContainer={() => document.body}
            menu={{
              items: [
                {
                  label: 'Edit',
                  key: 'edit',
                  onClick: (e: any) => {
                    e?.domEvent?.stopPropagation?.();
                    e?.stopPropagation?.();
                    handleEdit(item);
                  },
                },
                {
                  label: 'Delete',
                  key: 'delete',
                  onClick: (e: any) => {
                    e?.domEvent?.stopPropagation?.();
                    e?.stopPropagation?.();
                    handleDelete(item);
                  },
                },
              ],
            }}
          >
            <Button
              onClick={(e: any) => e.stopPropagation()}
              type="text"
              icon={<MoreHorizIcon />}
              className="border-2 border-[#D9D9D9] rounded-md p-1"
              data-cy="talent-acquisition-talent-roaster-table-button-action"
            />
          </Dropdown>
        ),
      };
    }) || [];

  const rowSelection: TableRowSelection<TableDataItem> = {
    selectedRowKeys: selectedRowKeys,
    onChange: (newSelectedRowKeys, selectedRows) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedTalentRoaster(
        talentRoaster?.items?.filter((item: TalentRoasterItem) =>
          selectedRows.some((row: TableDataItem) => row.id === item.id),
        ) || [],
      );
    },
  };

  const handleSearchCandidate = async (
    value: string | boolean,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
    clearSelectedRowKeys(); // Clear selections when searching
  };

  const handleSearchByDateRange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
  ) => {
    if (dates && dates.length === 2) {
      const startDate = dayjs(dates[0]).format('YYYY-MM-DD');
      const endDate = dayjs(dates[1]).format('YYYY-MM-DD');
      const dateRange = `${startDate} to ${endDate}`;
      setSearchParams('dateRange', dateRange);
    } else {
      setSearchParams('dateRange', '');
    }
    setCurrentPage(1); // Reset to first page when filtering
    clearSelectedRowKeys(); // Clear selections when filtering
  };

  const handleDepartmentChange = (value: string) => {
    setSearchParams('selectedDepartment', value || '');
    setCurrentPage(1); // Reset to first page when filtering
    clearSelectedRowKeys(); // Clear selections when filtering
  };

  const handleResetFilters = () => {
    setSearchParams('dateRange', '');
    setSearchParams('selectedDepartment', '');
    setCurrentPage(1);
    clearSelectedRowKeys();
  };

  const labelClassName = 'text-sm font-medium text-gray-800 mb-2 block';
  const inputClassName = 'w-full h-10 rounded-md border-gray-300';

  const filterTalentRoasterContent = (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[360px] max-w-[420px] overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-1 relative">
        <button
          type="button"
          onClick={() => setFilterDropdownOpen(false)}
          className="absolute top-5 right-6 p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
          aria-label="Close filter"
        >
          <CloseOutlined className="text-base" />
        </button>
        <h3 className="text-xl font-semibold text-gray-900 pr-8">Filter</h3>
        <p className="text-sm text-gray-500 mt-1">
          Select all filters that apply
        </p>
      </div>

      {/* Filter fields */}
      <div className="px-6 py-4">
        <Row
          data-cy="talent-acquisition-talent-roaster-table-row-filters"
          gutter={[16, 16]}
        >
          <Col
            span={24}
            data-cy="talent-acquisition-talent-roaster-table-col-department"
          >
            <label className={labelClassName}>Department</label>
            <Select
              id="selectDepartment"
              data-cy="talent-acquisition-talent-roaster-table-select-department"
              placeholder="Select Department"
              onChange={handleDepartmentChange}
              value={searchParams.selectedDepartment || undefined}
              allowClear
              className={inputClassName}
              size="large"
            >
              {EmployeeDepartment?.map((item: DepartmentData) => (
                <Option
                  key={item?.id}
                  value={item?.id}
                  data-cy={`talent-acquisition-talent-roaster-table-option-department-${item?.id}`}
                >
                  {item?.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col
            span={24}
            data-cy="talent-acquisition-talent-roaster-table-col-date"
          >
            <label className={labelClassName}>Date</label>
            <RangePicker
              id="inputDateRange"
              data-cy="talent-acquisition-talent-roaster-table-date-picker"
              onChange={(dates) => handleSearchByDateRange(dates)}
              value={
                searchParams.dateRange
                  ? (searchParams.dateRange
                      .split(' to ')
                      .map((date: string) => dayjs(date)) as [
                      dayjs.Dayjs | null,
                      dayjs.Dayjs | null,
                    ])
                  : null
              }
              className={inputClassName}
              allowClear
              getPopupContainer={(triggerNode) =>
                triggerNode.parentElement || document.body
              }
            />
          </Col>
        </Row>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
        <Button
          onClick={handleResetFilters}
          className="h-10 px-4 rounded-md border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800"
          data-cy="talent-acquisition-talent-roaster-table-filter-reset"
        >
          Reset
        </Button>
        <Button
          type="primary"
          className="h-10 px-4 rounded-md"
          onClick={() => setFilterDropdownOpen(false)}
          data-cy="talent-acquisition-talent-roaster-table-filter-save"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  return (
    <div
      id="talent-acquisition-talent-roaster-table-container"
      data-cy="talent-acquisition-talent-roaster-table-container"
      className="px-2 sm:px-4"
    >
      <div
        id="talent-acquisition-talent-roaster-table-filters"
        data-cy="talent-acquisition-talent-roaster-table-filters"
        className="flex justify-between items-center py-4"
      >
        <div className="w-1/2">
          <Input
            id={`inputTalentRoasterNames`}
            data-cy="talent-acquisition-talent-roaster-table-input-search"
            placeholder="Search talent roster"
            value={searchParams.fullName}
            onChange={(e) => handleSearchCandidate(e.target.value, 'fullName')}
            className="w-full h-10 rounded-md"
            allowClear
          />
        </div>
        <Dropdown
          trigger={['click']}
          open={filterDropdownOpen}
          onOpenChange={setFilterDropdownOpen}
          dropdownRender={() => filterTalentRoasterContent}
        >
          <Button
            className="border border-[#d9d9d9] text-gray-600 text-sm"
            icon={<FilterAltIcon fontSize="small" className="text-gray-600" />}
          >
            {!isMobile && 'Filter'}
          </Button>
        </Dropdown>
      </div>

      <Table
        data-cy="talent-acquisition-talent-roaster-table"
        className="w-full"
        columns={columns}
        dataSource={data}
        loading={isLoading}
        scroll={{ x: 1000 }}
        pagination={false}
        rowSelection={rowSelection}
        onRow={(record) => ({
          onClick: (event) => {
            // Only navigate if the click is not on a checkbox, button, link, or dropdown
            const target = event.target as HTMLElement;
            const isInteractiveElement = target.closest(
              'input[type="checkbox"], button, a, .ant-btn, .ant-checkbox, .ant-dropdown, .ant-dropdown-menu',
            );

            if (!isInteractiveElement) {
              router.push(
                `/recruitment/talent-resource/talent-roaster/${record?.id}`,
              );
            }
          },
        })}
      />
      {isMobile || isTablet ? (
        <div
          id="talent-acquisition-talent-roaster-table-pagination-mobile"
          data-cy="talent-acquisition-talent-roaster-table-pagination-mobile"
        >
          <CustomMobilePagination
            totalResults={talentRoaster?.meta?.totalItems ?? 1}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
          />
        </div>
      ) : (
        <div
          id="talent-acquisition-talent-roaster-table-pagination-desktop"
          data-cy="talent-acquisition-talent-roaster-table-pagination-desktop"
        >
          <CustomPagination
            current={currentPage}
            total={talentRoaster?.meta?.totalItems ?? 1}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onSizeChange}
          />
        </div>
      )}
    </div>
  );
};

export default TalentRoasterTable;
