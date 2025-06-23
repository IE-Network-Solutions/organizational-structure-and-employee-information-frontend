'use client';
import {
  Select,
  Col,
  Row,
  Table,
  DatePicker,
  TableColumnsType,
  Modal,
  Button,
  Input,
} from 'antd';
import { Option } from 'antd/es/mentions';
import { VscSettings } from 'react-icons/vsc';
import dayjs from 'dayjs';
import { useGetIntern } from '@/store/server/features/recruitment/intern/query';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetDepartmentByID } from '@/store/server/features/recruitment/job/queries';
import { LoadingOutlined } from '@ant-design/icons';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import { useInternStore } from '@/store/uistate/features/recruitment/talent-resource/intern';
import { useDeleteIntern } from '@/store/server/features/recruitment/intern/mutation';

import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useEmployeeDepartments } from '@/store/server/features/employees/employeeManagment/queries';

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
    showMobileFilter,
    setShowMobileFilter,
  } = useInternStore();

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

  const { setCurrentPage, setPageSize } = useInternStore();

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    setPageSize(pageSize ?? 10);
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
      title: 'Name',
      dataIndex: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },

    {
      title: 'Phone Number',
      dataIndex: 'phone',
      ellipsis: true,
    },
    {
      title: 'CGPA',
      dataIndex: 'CGPA',
      sorter: (a: InternTableData, b: InternTableData) => a.CGPA - b.CGPA,
    },
    {
      title: 'Department',
      dataIndex: 'departmentId',
      sorter: false,
    },

    {
      title: 'Application Date',
      dataIndex: 'createdAt',
    },
    {
      title: 'CV',
      dataIndex: 'resumeUrl',
    },
    {
      title: 'Year of Graduation',
      dataIndex: 'graduateYear',
    },

    {
      title: 'Action',
      dataIndex: 'action',
    },
  ];

  const data = intern?.items?.map(
    (item: InternRecord, index: number): InternTableData => {
      const fileName = item?.resumeUrl?.split('/')?.pop();

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
          <div className="flex gap-2 items-center">{<div>{depName}</div>}</div>
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
            href={item?.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold cursor-pointer flex items-center gap-2"
            title={item?.documentName ?? 'CV.pdf'}
          >
            {item?.documentName && item.documentName.length > 8
              ? `${item.documentName.slice(0, 8)}...`
              : (fileName ?? 'CV.pdf')}
          </a>
        ),

        graduateYear: item?.graduateYear
          ? dayjs(item.graduateYear).format('DD MMMM YYYY')
          : '--',

        action: (
          <ActionButtons
            id={item?.id ?? null}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item)}
          />
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

  return (
    <div>
      <div>
        <Row
          gutter={[16, 24]}
          justify="space-between"
          align="middle"
          className="mb-5"
        >
          <Col xs={24} sm={24} lg={10}>
            <Row gutter={8} align="middle">
              <Col xs={20} sm={20} flex="auto">
                <Input
                  id={`inputInternNames`}
                  placeholder="Search intern"
                  value={searchParams.fullName}
                  onChange={(e) =>
                    handleSearchCandidate(e.target.value, 'fullName')
                  }
                  className="w-full h-12 rounded-lg"
                  allowClear
                />
              </Col>
              <Col xs={4} sm={4} className="block sm:hidden">
                <div className="flex items-center justify-center w-12 h-12 text-black border border-gray-300 rounded-lg">
                  <VscSettings
                    size={20}
                    onClick={() => setShowMobileFilter(true)}
                  />
                </div>
              </Col>
            </Row>
          </Col>

          <Col lg={14} className="hidden sm:block ">
            <Row gutter={[8, 16]} align="middle">
              <Col lg={14} sm={12} xs={24}>
                <RangePicker
                  id={`inputDateRange`}
                  onChange={(dates) => handleSearchByDateRange(dates)}
                  value={
                    searchParams.dateRange
                      ? (searchParams.dateRange
                          .split(' to ')
                          .map((date: string) => dayjs(date)) as any)
                      : null
                  }
                  className="w-full h-12"
                  allowClear
                  getPopupContainer={(triggerNode) =>
                    triggerNode.parentElement || document.body
                  }
                />
              </Col>
              <Col lg={10} sm={12} xs={24}>
                <Select
                  id={`selectDepartment`}
                  placeholder="Select Department"
                  onChange={(value: string) => handleDepartmentChange(value)}
                  value={searchParams.selectedDepartment || undefined}
                  allowClear
                  className="w-full h-12"
                >
                  {EmployeeDepartment?.map((item: Department) => (
                    <Option key={item?.id} value={item?.id}>
                      {item?.name}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Col>
        </Row>

        <Modal
          centered
          title="Filter Interns"
          open={showMobileFilter}
          width="85%"
          footer={
            <div className="flex justify-center items-center space-x-4">
              <Button
                type="default"
                className="px-3"
                onClick={() => setShowMobileFilter(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowMobileFilter(false)}
                type="primary"
                className="px-3"
              >
                Apply Filter
              </Button>
            </div>
          }
        >
          <RangePicker
            id={`inputDateRangeMobile`}
            onChange={(dates) => handleSearchByDateRange(dates)}
            className="w-full mb-4"
            allowClear
            getPopupContainer={(triggerNode) =>
              triggerNode.parentElement || document.body
            }
          />

          <Select
            id={`selectDepartmentMobile`}
            placeholder="Select Department"
            onChange={(value: string) => handleDepartmentChange(value)}
            allowClear
            className="w-full mb-4"
            value={searchParams.selectedDepartment || undefined}
          >
            {EmployeeDepartment?.map((item: Department) => (
              <Option key={item?.id} value={item?.id}>
                {item?.name}
              </Option>
            ))}
          </Select>
        </Modal>
      </div>
      <Table
        className="w-full"
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={false}
        scroll={{ x: 1000 }}
      />
      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={intern?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      ) : (
        <CustomPagination
          current={currentPage}
          total={intern?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={(pageSize) => {
            setPageSize(pageSize);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
};

export default InternTable;
