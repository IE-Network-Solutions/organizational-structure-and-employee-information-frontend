'use client';
import {
  Select,
  Col,
  Row,
  Table,
  DatePicker,
  TableColumnsType,
  Button,
  Input,
  Dropdown,
  Form,
} from 'antd';
import { Option } from 'antd/es/mentions';
import dayjs from 'dayjs';
import { useGetIntern } from '@/store/server/features/recruitment/intern/query';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetDepartmentByID } from '@/store/server/features/recruitment/job/queries';
import { CloseOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { useInternStore } from '@/store/uistate/features/recruitment/talent-resource/intern';
import { useDeleteIntern } from '@/store/server/features/recruitment/intern/mutation';
import CustomPagination from '@/components/customPagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useEmployeeDepartments } from '@/store/server/features/employees/employeeManagment/queries';
import { useRouter } from 'next/navigation';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useState, useEffect } from 'react';
import { DATE_FORMAT } from '@/utils/constants';

// Type definitions
interface Department {
  id: string;
  name: string;
  description?: string;
}

interface InternRecord {
  id: string;
  fullName: string;
  phone: string;
  CGPA: number;
  departmentId: string;
  createdAt: string;
  resumeUrl: string;
  documentName?: string;
  graduateYear: string;
}

interface InternApiResponse {
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  items: InternRecord[];
}

interface InternTableData {
  key: number;
  id: string;
  fullName: string;
  phone: string;
  CGPA: number;
  departmentId: React.ReactNode;
  createdAt: string;
  resumeUrl: React.ReactNode;
  graduateYear: string;
  action: React.ReactNode;
}

interface InternTableProps {
  onEdit?: (data: InternRecord) => void;
}

interface QueryParams {
  fullName?: string;
  dateRange?: string;
  selectedDepartment?: string;
  page: number;
  pageSize: number;
}

const InternTable = ({ onEdit }: InternTableProps) => {
  const { RangePicker } = DatePicker;
  const {
    setItemToDelete,
    searchParams,
    setSearchParams,
    currentPage,
    pageSize,
  } = useInternStore();
  const router = useRouter();
  // Create query parameters from search params
  const queryParams: QueryParams = {
    fullName: searchParams.fullName || undefined,
    dateRange: searchParams.dateRange || undefined,
    selectedDepartment: searchParams.selectedDepartment || undefined,
    page: currentPage,
    pageSize: pageSize,
  };

  const { data: intern, isLoading: isInternLoading } = useGetIntern(
    queryParams,
  ) as { data: InternApiResponse | undefined; isLoading: boolean };
  const { isLoading: isDepartmentLoading } = useGetDepartments();
  const { mutate: deleteIntern } = useDeleteIntern();
  const { data: EmployeeDepartment } = useEmployeeDepartments();

  // Check if either query is still loading
  const isLoading = isInternLoading || isDepartmentLoading;
  const { isMobile, isTablet } = useIsMobile();
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const { setCurrentPage, setPageSize } = useInternStore();
  const [mobileStartDate, setMobileStartDate] = useState<dayjs.Dayjs | null>(
    null,
  );
  const [mobileEndDate, setMobileEndDate] = useState<dayjs.Dayjs | null>(null);

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

  const handleEdit = (data: InternRecord) => {
    onEdit?.(data);
  };

  const handleDelete = (item: InternRecord) => {
    setItemToDelete(item);
    deleteIntern(item.id, {
      onSuccess: () => {
        setItemToDelete(null);
      },
    });
  };

  const columns: TableColumnsType<InternTableData> = [
    {
      title: (
        <span
          id="talent-acquisition-intern-table-column-name"
          data-cy="talent-acquisition-intern-table-column-name"
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
          id="talent-acquisition-intern-table-column-phone-number"
          data-cy="talent-acquisition-intern-table-column-phone-number"
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
          id="talent-acquisition-intern-table-column-cgpa"
          data-cy="talent-acquisition-intern-table-column-cgpa"
          className="font-bold text-base text-[#4b4b4b]"
        >
          CGPA
        </span>
      ),
      dataIndex: 'CGPA',
      sorter: (a: InternTableData, b: InternTableData) => a.CGPA - b.CGPA,
      className: 'text-sm text-[#4b4b4b]',
      width: 150,
    },
    {
      title: (
        <span
          id="talent-acquisition-intern-table-column-department"
          data-cy="talent-acquisition-intern-table-column-department"
          className="font-bold text-base text-[#4b4b4b]"
        >
          Department
        </span>
      ),
      dataIndex: 'departmentId',
      sorter: false,
      width: 200,
      className: 'text-sm text-[#4b4b4b]',
    },

    {
      title: (
        <span
          id="talent-acquisition-intern-table-column-application-date"
          data-cy="talent-acquisition-intern-table-column-application-date"
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
          id="talent-acquisition-intern-table-column-cv"
          data-cy="talent-acquisition-intern-table-column-cv"
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
          id="talent-acquisition-intern-table-column-year-of-graduation"
          data-cy="talent-acquisition-intern-table-column-year-of-graduation"
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
          id="talent-acquisition-intern-table-column-action"
          data-cy="talent-acquisition-intern-table-column-action"
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

  const data = intern?.items?.map(
    (item: InternRecord, index: number): InternTableData => {
      const DepartmentDetail = ({ id }: { id: string }) => {
        const {
          data: getAllDepartment,
          isLoading: isDepartmentLoading,
          error,
        } = useGetDepartmentByID(id);

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
            id="talent-acquisition-intern-table-cell-department"
            data-cy={`talent-acquisition-intern-table-cell-department-${id}`}
            className="flex gap-2 items-center"
          >
            {
              <div data-cy="intern-components-table-index-tsx-index-div-213">
                {depName}
              </div>
            }
          </div>
        );
      };

      return {
        key: index,
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
            id={`talent-acquisition-intern-table-link-cv-${item.id}`}
            data-cy={`talent-acquisition-intern-table-link-cv-${item.id}`}
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
            />
          </Dropdown>
        ),
      };
    },
  );
  const handleSearchCandidate = async (
    value: string | boolean,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };

  const handleSearchByDateRange = (dates: any) => {
    if (dates && dates.length === 2) {
      const startDate = dayjs(dates[0]).format('YYYY-MM-DD');
      const endDate = dayjs(dates[1]).format('YYYY-MM-DD');
      const dateRange = `${startDate} to ${endDate}`;
      setSearchParams('dateRange', dateRange);
    } else {
      setSearchParams('dateRange', '');
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDepartmentChange = (value: string) => {
    setSearchParams('selectedDepartment', value || '');
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleResetFilters = () => {
    setSearchParams('dateRange', '');
    setSearchParams('selectedDepartment', '');
    setMobileStartDate(null);
    setMobileEndDate(null);
    setCurrentPage(1);
  };

  const labelClassName = 'text-sm font-medium text-gray-800 mb-2 block';
  const inputClassName = 'w-full h-10 rounded-md border-gray-300';

  // Keep mobile date pickers in sync with the stored dateRange string
  useEffect(() => {
    if (searchParams.dateRange) {
      const [start, end] = searchParams.dateRange
        .split(' to ')
        .map((date: string) => dayjs(date)) as [
        dayjs.Dayjs | null,
        dayjs.Dayjs | null,
      ];
      setMobileStartDate(start);
      setMobileEndDate(end);
    } else {
      setMobileStartDate(null);
      setMobileEndDate(null);
    }
  }, [searchParams.dateRange]);

  const filterInternContent = (
    <div
      data-cy="talent-acquisition-intern-table-filter-container"
      className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[360px] max-w-[420px] overflow-hidden"
    >
      {/* Header */}
      <div
        data-cy="talent-acquisition-intern-table-filter-header"
        className="px-6 pt-5 pb-1 relative"
      >
        <button
          data-cy="talent-acquisition-intern-table-filter-button-close"
          type="button"
          onClick={() => setFilterDropdownOpen(false)}
          className="absolute top-5 right-6 p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
          aria-label="Close filter"
        >
          <CloseOutlined className="text-base" />
        </button>
        <h3
          data-cy="talent-acquisition-intern-table-filter-title"
          className="text-xl font-semibold text-gray-900 pr-8"
        >
          Filter
        </h3>
        <p
          data-cy="talent-acquisition-intern-table-filter-description"
          className="text-sm text-gray-500 mt-1"
        >
          Select all filters that apply
        </p>
      </div>

      {/* Filter fields */}
      <div
        data-cy="talent-acquisition-intern-table-filter-fields"
        className="px-6 py-4"
      >
        <Row
          data-cy="talent-acquisition-talent-roaster-table-row-filters"
          gutter={[16, 16]}
        >
          <Col
            span={24}
            data-cy="talent-acquisition-talent-roaster-table-col-department"
          >
            <label
              data-cy="talent-acquisition-intern-table-filter-label-department"
              className={labelClassName}
            >
              Department
            </label>
            <Select
              id={`selectDepartment`}
              data-cy="talent-acquisition-intern-table-select-department"
              placeholder="Select Department"
              onChange={(value: string) => handleDepartmentChange(value)}
              value={searchParams.selectedDepartment || undefined}
              allowClear
              className={inputClassName}
            >
              {EmployeeDepartment?.map((item: Department) => (
                <Option
                  key={item?.id}
                  value={item?.id}
                  data-cy={`talent-acquisition-intern-table-option-department-${item?.id}`}
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
            {!isMobile && (
              <>
                <label
                  data-cy="talent-acquisition-intern-table-filter-label-date"
                  className={labelClassName}
                >
                  Date
                </label>
                <RangePicker
                  id={`inputDateRange`}
                  data-cy="talent-acquisition-intern-table-date-picker"
                  onChange={(dates) => handleSearchByDateRange(dates)}
                  value={
                    searchParams.dateRange
                      ? (searchParams.dateRange
                          .split(' to ')
                          .map((date: string) => dayjs(date)) as any)
                      : null
                  }
                  className={inputClassName}
                  allowClear
                />
              </>
            )}

            {isMobile && (
              <>
                <Form.Item
                  name="startDate"
                  id="talent-acquisition-intern-table-filter-mobile-start-date"
                  data-cy="talent-acquisition-intern-table-filter-mobile-start-date"
                >
                  <label
                    data-cy="talent-acquisition-intern-table-filter-label-start-date"
                    className={labelClassName}
                  >
                    Start Date
                  </label>
                  <DatePicker
                    className="w-full h-[40px]"
                    placeholder="Start Date"
                    format={DATE_FORMAT}
                    value={mobileStartDate}
                    onChange={(date) => {
                      setMobileStartDate(date);
                      const start = date;
                      const end = mobileEndDate;
                      handleSearchByDateRange(
                        start && end ? [start, end] : null,
                      );
                    }}
                    id="talent-acquisition-intern-table-filter-mobile-start-date-picker"
                    data-cy="talent-acquisition-intern-table-filter-mobile-start-date-picker"
                  />
                </Form.Item>

                <Form.Item
                  name="endDate"
                  id="talent-acquisition-intern-table-filter-mobile-end-date"
                  data-cy="talent-acquisition-intern-table-filter-mobile-end-date"
                >
                  <label
                    data-cy="talent-acquisition-intern-table-filter-label-end-date"
                    className={labelClassName}
                  >
                    End Date
                  </label>
                  <DatePicker
                    className="w-full h-[40px]"
                    placeholder="End Date"
                    format={DATE_FORMAT}
                    value={mobileEndDate}
                    onChange={(date) => {
                      setMobileEndDate(date);
                      const start = mobileStartDate;
                      const end = date;
                      handleSearchByDateRange(
                        start && end ? [start, end] : null,
                      );
                    }}
                    id="talent-acquisition-intern-table-filter-mobile-end-date-picker"
                    data-cy="talent-acquisition-intern-table-filter-mobile-end-date-picker"
                  />
                </Form.Item>
              </>
            )}
          </Col>
        </Row>
      </div>

      {/* Footer */}
      <div
        data-cy="talent-acquisition-intern-table-filter-footer"
        className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2"
      >
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
      id="talent-acquisition-intern-table-container"
      data-cy="talent-acquisition-intern-table-container"
      className="px-2 sm:px-4"
    >
      <div
        id="talent-acquisition-intern-table-filters"
        data-cy="talent-acquisition-intern-table-filters"
        className="flex justify-between items-center py-4"
      >
        <div
          data-cy="talent-acquisition-intern-table-input-search-container"
        >
          <Input
            id={`inputInternNames`}
            data-cy="talent-acquisition-intern-table-input-search"
            placeholder="Search intern"
            value={searchParams.fullName}
            onChange={(e) => handleSearchCandidate(e.target.value, 'fullName')}
            className="w-full h-8 max-w-[300px]"
            allowClear
            suffix={
              <div
                data-cy="talent-acquisition-talent-roaster-table-input-search-suffix-icon-div"
                className="text-gray-400 border-l p-2"
              >
                <SearchOutlined />
              </div>
            }
          />
        </div>
        <Dropdown
          trigger={['click']}
          open={filterDropdownOpen}
          onOpenChange={setFilterDropdownOpen}
          dropdownRender={() => filterInternContent}
        >
          <Button
            className="border border-[#d9d9d9] text-gray-600 text-sm"
            icon={
              <FilterAltOutlinedIcon className="text-[#374151] text-base" />
          }
          >
            {!isMobile && 'Filter'}
          </Button>
        </Dropdown>
      </div>
      <div
        data-cy="talent-acquisition-intern-table-container"
        className=" overflow-x-auto scrollbar-none"
      >
        {isLoading ? (
          <TableSkeleton columns={columns} />
        ) : (
          <Table
            data-cy="talent-acquisition-intern-table"
            className="w-full"
            columns={columns}
            dataSource={data}
            pagination={false}
            onRow={(record) => ({
              onClick: (event) => {
                // Only navigate if the click is not on a checkbox, button, link, or dropdown
                const target = event.target as HTMLElement;
                const isInteractiveElement = target.closest(
                  'input[type="checkbox"], button, a, .ant-btn, .ant-checkbox, .ant-dropdown, .ant-dropdown-menu',
                );

                if (!isInteractiveElement) {
                  router.push(
                    `/recruitment/talent-resource/intern/${record?.id}`,
                  );
                }
              },
            })}
            rowHoverable={false}
            rowClassName={(notUsed, index) => {
              const base = index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]';
              return base;
            }}
          />
        )}
      </div>
      {isMobile || isTablet ? (
        <div
          id="talent-acquisition-intern-table-pagination-mobile"
          data-cy="talent-acquisition-intern-table-pagination-mobile"
        >
          <CustomMobilePagination
            totalResults={intern?.meta?.totalItems ?? 1}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
          />
        </div>
      ) : (
        <div
          id="talent-acquisition-intern-table-pagination-desktop"
          data-cy="talent-acquisition-intern-table-pagination-desktop"
        >
          <CustomPagination
            current={currentPage}
            total={intern?.meta?.totalItems ?? 1}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onSizeChange}
          />
        </div>
      )}
    </div>
  );
};

export default InternTable;
