'use client';
import {
  Col,
  Row,
  Select,
  Table,
  TableColumnsType,
  DatePicker,
  Input,
  Modal,
  Button,
} from 'antd';
import { Option } from 'antd/es/mentions';
import { TableRowSelection } from 'antd/es/table/interface';
import { VscSettings } from 'react-icons/vsc';
import { useGetTalentRoaster } from '@/store/server/features/recruitment/talent-roaster/query';
import { useDeleteTalentRoaster } from '@/store/server/features/recruitment/talent-roaster/mutation';
import dayjs from 'dayjs';
import { LoadingOutlined } from '@ant-design/icons';
import { useGetDepartmentByID } from '@/store/server/features/recruitment/job/queries';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import { useTalentRoasterStore } from '@/store/uistate/features/recruitment/talent-resource/talent-roaster';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useEmployeeDepartments } from '@/store/server/features/employees/employeeManagment/queries';
import { useRouter } from 'next/navigation';

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
    showMobileFilter,
    setShowMobileFilter,
    selectedRowKeys,
    setSelectedRowKeys,
    clearSelectedRowKeys,
    setSelectedTalentRoaster,
  } = useTalentRoasterStore();
  const { RangePicker } = DatePicker;
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
    setPageSize(pageSize ?? 10);
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
    },
    {
      title: 'Department',
      dataIndex: 'departmentId',
      sorter: (a, b) => {
        const aText = typeof a.departmentId === 'string' ? a.departmentId : '';
        const bText = typeof b.departmentId === 'string' ? b.departmentId : '';
        return aText.localeCompare(bText);
      },
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

  const data: TableDataItem[] =
    talentRoaster?.items?.map((item: TalentRoasterItem) => {
      const fileName = item?.resumeUrl?.split('/')?.pop();

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
          <div className="flex gap-2 items-center">{<div>{depName}</div>}</div>
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
                  id={`inputTalentRoasterNames`}
                  placeholder="Search talent roaster"
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
            <Row gutter={[8, 16]}>
              <Col lg={14} sm={12} xs={24}>
                <RangePicker
                  id={`inputDateRange`}
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
                  onChange={handleDepartmentChange}
                  value={searchParams.selectedDepartment || undefined}
                  allowClear
                  className="w-full h-12"
                >
                  {EmployeeDepartment?.map((item: DepartmentData) => (
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
          title="Filter Talent Roaster"
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
            value={searchParams.selectedDepartment || undefined}
            allowClear
            className="w-full mb-4"
          >
            {EmployeeDepartment?.map((item: DepartmentData) => (
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
        scroll={{ x: 1000 }}
        pagination={false}
        rowSelection={rowSelection}
        onRow={(record) => ({
          onClick: (event) => {
            // Only navigate if the click is not on a checkbox, button, or link
            const target = event.target as HTMLElement;
            const isInteractiveElement = target.closest(
              'input[type="checkbox"], button, a, .ant-btn, .ant-checkbox',
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
        <CustomMobilePagination
          totalResults={talentRoaster?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      ) : (
        <CustomPagination
          current={currentPage}
          total={talentRoaster?.meta?.totalItems ?? 0}
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

export default TalentRoasterTable;
