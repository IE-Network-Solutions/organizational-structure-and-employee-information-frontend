'use client';

import React, { useState } from 'react';
import {
  Table,
  Select,
  Button,
  Avatar,
  Popconfirm,
  Popover,
  Tag,
  Dropdown,
  Input,
} from 'antd';
import {
  LoadingOutlined,
  UserOutlined,
  EllipsisOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  useGetActiveEmployee,
  useGetEmployee,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllMonth } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { EmployeeSurveyStore } from '@/store/uistate/features/conversation/survey';
import { useGetEmployeeSurvey } from '@/store/server/features/conversation/survey/queries';
import { useGetActiveMonth } from '@/store/server/features/payroll/payroll/queries';
import { MdDeleteOutline } from 'react-icons/md';
import { Edit2Icon } from 'lucide-react';
import EmployeeSurveyModal from './EmployeeSurveyModal';
import { useDeleteEmployeeSurvey } from '@/store/server/features/conversation/survey/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import CustomPagination from '@/components/customPagination';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Option } = Select;
const EmployeeDetails = ({ empId, type }: { empId: string; type: string }) => {
  const { data: userDetails, isLoading, error } = useGetEmployee(empId);

  if (isLoading)
    return (
      <>
        <LoadingOutlined />
      </>
    );

  if (error || !userDetails) return '-';

  const userName =
    `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName} ` ||
    '-';
  const email = `${userDetails?.email} ` || '-';
  const profileImage = userDetails?.profileImage;
  const jobPosition =
    `${userDetails?.employeeJobInformation[0]?.position?.name} ` || '-';
  const department =
    `${userDetails?.employeeJobInformation[0]?.department?.name} ` || '-';
  return (
    <>
      {type === 'user' ? (
        <div
          className="flex gap-2"
          data-cy="employee-survey-table-user-container"
        >
          <Avatar src={profileImage} icon={<UserOutlined />} />
          <div data-cy="employee-survey-table-user-details">
            <span data-cy="employee-survey-table-user-name">{userName}</span>
            <div
              className="text-xs text-gray-500"
              data-cy="employee-survey-table-user-email"
            >
              {email}
            </div>
          </div>
        </div>
      ) : (
        <span
          className="text-xs text-gray-500"
          data-cy="employee-survey-table-type-info"
        >
          {type == 'job' ? jobPosition : department}
        </span>
      )}
    </>
  );
};
const getScoreTag = (score: number): JSX.Element => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-lg border px-4 py-1.5 text-sm font-medium';
  const scoreText = score != null ? `${Number(score).toFixed(2)}%` : '—';

  if (score >= 10)
    return (
      <span
        className={`${baseClasses} border-green-300 bg-green-50 text-green-600`}
        data-cy={`employee-survey-table-score-tag-green-${score}`}
      >
        {scoreText}
      </span>
    );
  if (score >= 7.5)
    return (
      <span
        className={`${baseClasses} border-yellow-300 bg-yellow-50 text-yellow-700`}
        data-cy={`employee-survey-table-score-tag-yellow-${score}`}
      >
        {scoreText}
      </span>
    );
  return (
    <span
      className={`${baseClasses} border-red-300 bg-red-50 text-red-600`}
      data-cy={`employee-survey-table-score-tag-red-${score}`}
    >
      {scoreText}
    </span>
  );
};
const EmployeeSurveyTable: React.FC = () => {
  const { data: employeeData, isLoading: empLoading } = useGetActiveEmployee();
  const { data: departmentData, isLoading: depLoading } =
    useGetDepartmentsWithUsers();
  const { data: months, isLoading: monthsLoading } = useGetAllMonth();
  const { data: activeMonth } = useGetActiveMonth();
  const [isMobileFilterVisible, setIsMobileFilterVisible] = useState(false);
  const {
    openEmployeeSurvey,
    setOpenEmployeeSurvey,
    userId,
    openModal,
    setOpenModal,
    setUserId,
    departmentId,
    setDepartmentId,
    monthId,
    setMonthId,
    page,
    setPage,
    currentPage,
    setCurrentPage,
    setSurvey,
  } = EmployeeSurveyStore();
  const { data: employeeSurvey, isLoading: employeeSurveyLoading } =
    useGetEmployeeSurvey(userId, monthId, departmentId, page, currentPage);

  const normalizeNullableId = (value: unknown) =>
    value ? String(value) : (null as any);

  const getEmployeeNameById = (id: string | null) => {
    if (!id) return '';
    const item = employeeData?.items?.find(
      (emp: any) => String(emp?.id) === String(id),
    );
    if (!item) return '';
    return `${item?.firstName ?? ''} ${item?.middleName ?? ''} ${
      item?.lastName ?? ''
    }`
      .replace(/\s+/g, ' ')
      .trim();
  };

  const getDepartmentNameById = (id: string | null) => {
    if (!id) return '';
    const dept = departmentData?.find((d: any) => String(d?.id) === String(id));
    return dept?.name ?? '';
  };

  const getMonthLabelById = (id: string | null) => {
    if (!id) return '';
    const m = months?.items?.find((mm: any) => String(mm?.id) === String(id));
    if (!m) return '';
    return `${m?.session?.name}-${m?.name}`;
  };
  const { isMobile } = useIsMobile();

  const getActiveFilters = () => {
    const activeFilters: Array<{ key: string; label: string }> = [];

    if (userId != null) {
      activeFilters.push({
        key: 'userId',
        label: getEmployeeNameById(userId) || String(userId),
      });
    }

    if (departmentId != null) {
      activeFilters.push({
        key: 'departmentId',
        label: getDepartmentNameById(departmentId) || String(departmentId),
      });
    }

    if (monthId != null) {
      activeFilters.push({
        key: 'monthId',
        label: getMonthLabelById(monthId) || String(monthId),
      });
    }

    return activeFilters;
  };

  const removeFilter = (key: string) => {
    switch (key) {
      case 'userId':
        setUserId(null as any);
        break;
      case 'departmentId':
        setDepartmentId(null as any);
        break;
      case 'monthId':
        setMonthId(null as any);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  function handleVisibilityEdit(record: any) {
    setOpenModal(true);
    setSurvey(record);
  }
  const { mutate: deleteEmployeeSurvey, isLoading: deleteLoading } =
    useDeleteEmployeeSurvey();

  function handleSurveyScore(id: any) {
    deleteEmployeeSurvey(id, {
      onSuccess: () => {
        NotificationMessage.success({
          message: 'Successfully deleted',
          description: 'Employee Survey Deleted Successfully',
        });
      },
    });
  }

  const columns = [
    {
      title: 'Employees',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId: string) => (
        <EmployeeDetails
          type="user"
          empId={userId}
          data-cy="employee-survey-table-employees-details"
        />
      ),
    },
    {
      title: 'Month',
      dataIndex: 'date',
      key: 'date',
      render: (notused: any, render: any) => (
        <div
          className="text-xs text-gray-500"
          data-cy="employee-survey-table-month"
          id="employeeSurveyTableMonth"
        >
          {' '}
          {render?.month?.session?.name}-{render?.month?.name}
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (notused: any, render: any) => (
        <EmployeeDetails
          type="department"
          empId={render?.userId}
          data-cy="employee-survey-table-department"
        />
      ),
    },
    {
      title: 'Achievement Score',
      key: 'score',
      dataIndex: 'score',
      render: (score: number) => getScoreTag(score),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (ruleData: any, record: any) =>
        record?.monthId == activeMonth?.id ? (
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'edit',
                  label: 'Edit',
                  icon: <Edit2Icon className="w-4 h-4 text-xs" />,
                  onClick: () => handleVisibilityEdit(record),
                },
                {
                  key: 'delete',
                  label: (
                    <Popconfirm
                      title="Are you sure you want to remove survey score?"
                      onConfirm={() => handleSurveyScore(record?.id)}
                      okText="Yes"
                      cancelText="No"
                      placement="top"
                      data-cy="employee-survey-table-delete-popconfirm"
                      id="employeeSurveyTableDeletePopconfirm"
                    >
                      <span
                        className="flex items-center gap-2"
                        data-cy="employee-survey-table-delete-menu-item"
                      >
                        <MdDeleteOutline className="w-4 h-4" />
                        Delete
                      </span>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <Button
              size="small"
              icon={<EllipsisOutlined />}
              className="border-gray-400"
              data-cy="employee-survey-table-action-button"
              id="employeeSurveyTableActionButton"
            />
          </Dropdown>
        ) : null,
    },
  ];
  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPage(pageSize);
    }
  };
  return (
    <div
      className="py-2 rounded-lg border-[1px]"
      data-cy="employee-survey-table-page"
      id="employeeSurveyTablePage"
    >
      <div
        className="flex flex-col gap-4 mb-6 p-3 md:flex-row md:justify-between"
        data-cy="employee-survey-table-filters"
        id="employeeSurveyTableFilters"
      >
        <div className="flex items-center gap-3 w-full">
          <Select
            showSearch
            placeholder="Search Employee"
            className="h-8 rounded-lg border border-gray-400 p-0 m-0 w-full md:w-[300px]"
            allowClear
            loading={empLoading}
            suffixIcon={
              <SearchOutlined className="text-gray-400 border-l border-gray-400 p-2" />
            }
            value={userId ?? undefined}
            onChange={(value) => {
              setUserId(normalizeNullableId(value));
              setCurrentPage(1);
            }}
            filterOption={(input: any, option: any) =>
              (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
            }
            options={employeeData?.items?.map((item: any) => ({
              ...item,
              value: item?.id,
              label:
                item?.firstName + ' ' + item?.middleName + ' ' + item?.lastName,
            }))}
            data-cy="employee-survey-table-employee-filter"
            id="employeeSurveyTableEmployeeFilter"
          />

          <Popover
            placement="bottomRight"
            trigger="click"
            open={isMobileFilterVisible}
            onOpenChange={(visible) => setIsMobileFilterVisible(visible)}
            content={
              <div className="space-y-4 p-2 min-w-[260px]">
                <Select
                  loading={depLoading}
                  placeholder="Filter by Department"
                  className="w-full h-10 rounded-lg border-gray-200"
                  allowClear
                  showSearch
                  value={departmentId ?? undefined}
                  onChange={(value) => {
                    setDepartmentId(normalizeNullableId(value));
                    setCurrentPage(1);
                  }}
                  filterOption={(input, option) =>
                    (option?.children as any)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  data-cy="employee-survey-table-department-filter"
                  id="employeeSurveyTableDepartmentFilter"
                >
                  {departmentData?.map((dept: any) => (
                    <Option
                      key={dept.id}
                      value={dept.id}
                      data-cy={`employee-survey-table-department-option-${dept.id}`}
                    >
                      {dept.name}
                    </Option>
                  ))}
                </Select>

                <Select
                  placeholder="Filter by Month"
                  className="w-full h-10 rounded-lg border-gray-200"
                  allowClear
                  showSearch
                  value={monthId ?? undefined}
                  onChange={(value) => {
                    setMonthId(normalizeNullableId(value));
                    setCurrentPage(1);
                  }}
                  filterOption={(input, option) =>
                    (option?.children as any)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  loading={monthsLoading}
                  data-cy="employee-survey-table-month-filter"
                  id="employeeSurveyTableMonthFilter"
                >
                  {months?.items
                    ?.sort((a: any, b: any) => a.createdAt - b.createdAt)
                    ?.map((month: any) => (
                      <Option
                        key={month.id}
                        value={month.id}
                        data-cy={`employee-survey-table-month-option-${month.id}`}
                      >
                        {month?.session?.name}-{month.name}
                      </Option>
                    ))}
                </Select>
              </div>
            }
          >
            <Button
              type="default"
              size="large"
              className="h-8 px-6 rounded-lg bg-blue-600 border-gray-300 flex items-center gap-2 shrink-0"
              id="employee-survey-table-filter-toggle-btn"
              data-cy="employee-survey-table-filter-toggle-btn"
              icon={
                <FilterAltOutlinedIcon
                  className="text-gray-600"
                  fontSize="small"
                />
              }
            >
              {isMobile ? (
                ''
              ) : (
                <span
                  id="employee-survey-table-filter-toggle-btn-text"
                  data-cy="employee-survey-table-filter-toggle-btn-text"
                  className="text-gray-600 text-sm"
                >
                  Filter
                </span>
              )}
            </Button>
          </Popover>
        </div>

        <div
          className="flex items-center gap-2 flex-wrap bg-blue-600 w-full"
          id="employee-survey-table-active-filters"
          data-cy="employee-survey-table-active-filters"
        >
          {getActiveFilters().map((filter) => (
            <Tag
              key={filter.key}
              closable
              onClose={() => removeFilter(filter.key)}
              className="bg-white text-blue border-blue rounded-lg px-3 py-1 flex items-center text-sm font-medium"
              id={`employee-survey-table-filter-tag-${filter.key}`}
              data-cy={`employee-survey-table-filter-tag-${filter.key}`}
              closeIcon={
                <span
                  className="text-blue hover:!text-[#FF8787] ml-2 text-base"
                  id={`employee-survey-table-filter-tag-close-icon-${filter.key}`}
                  data-cy={`employee-survey-table-filter-tag-close-icon-${filter.key}`}
                >
                  ×
                </span>
              }
            >
              {filter.label}
            </Tag>
          ))}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={employeeSurvey?.items}
        pagination={false}
        loading={employeeSurveyLoading}
        className="overflow-x-auto scrollbar-none"
        data-cy="employee-survey-table"
        id="employeeSurveyTable"
      />
      <CustomPagination
        total={employeeSurvey?.meta?.totalItems || 0}
        current={employeeSurvey?.meta?.currentPage || 1}
        pageSize={page}
        onChange={onPageChange}
        onShowSizeChange={(size) => {
          onPageChange(1, size);
        }}
        data-cy="employee-survey-table-pagination"
      />

      <EmployeeSurveyModal
        open={openEmployeeSurvey || openModal}
        onClose={() => {
          setOpenEmployeeSurvey(false);
          setOpenModal(false);
        }}
        data-cy="employee-survey-modal"
      />
    </div>
  );
};

export default EmployeeSurveyTable;
