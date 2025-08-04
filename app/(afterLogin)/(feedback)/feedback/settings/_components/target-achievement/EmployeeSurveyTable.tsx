'use client';

import React, { useEffect } from 'react';
import { Table, Select, Button, Avatar, Tooltip, Popconfirm } from 'antd';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import {
  useGetAllUsers,
  useGetEmployee,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllMonth } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { HiPlus } from 'react-icons/hi';
import EmployeeSurveyDrawer from './EmployeeSurveyDrawer';
import { EmployeeSurveyStore } from '@/store/uistate/features/conversation/survey';
import { useGetEmployeeSurvey } from '@/store/server/features/conversation/survey/queries';
import { useGetActiveMonth } from '@/store/server/features/payroll/payroll/queries';
import { MdDelete, MdEdit } from 'react-icons/md';
import EmployeeSurveyModal from './EmployeeSurveyModal';
import { useDeleteEmployeeSurvey } from '@/store/server/features/conversation/survey/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import CustomPagination from '@/components/customPagination';

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
        <div className="flex gap-2">
          <Avatar src={profileImage} icon={<UserOutlined />} />
          <div>
            {userName}
            <div className="text-xs text-gray-500">{email}</div>
          </div>
        </div>
      ) : (
        <span className="text-xs text-gray-500">
          {type == 'job' ? jobPosition : department}
        </span>
      )}
    </>
  );
};
const getScoreTag = (score: number): JSX.Element => {
  if (score >= 10)
    return (
      <span className="block w-24 text-center bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
        {score?.toLocaleString()}%
      </span>
    );
  if (score >= 7.5)
    return (
      <span className="block w-24 text-center bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
        {score?.toLocaleString()}%
      </span>
    );
  return (
    <span className="block w-24 text-center bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
      {score?.toLocaleString()}%
    </span>
  );
};
const EmployeeSurveyTable: React.FC = () => {
  const { data: employeeData, isLoading: empLoading } = useGetAllUsers();
  const { data: departmentData, isLoading: depLoading } =
    useGetDepartmentsWithUsers();
  const { data: months, isLoading: monthsLoading } = useGetAllMonth();
  const { data: month, isLoading: monthLoading } = useGetActiveMonth();
  const {
    open,
    setOpen,
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
  useEffect(() => {
    setMonthId(month?.id);
  }, [month?.id, monthLoading]);
  const { data: employeeSurvey, isLoading: employeeSurveyLoading } =
    useGetEmployeeSurvey(userId, monthId, departmentId, page, currentPage);

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
        <EmployeeDetails type="user" empId={userId} />
      ),
    },
    {
      title: 'Month',
      dataIndex: 'date',
      key: 'date',
      render: (notused: any, render: any) => (
        <div className="text-xs text-gray-500">
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
        <EmployeeDetails type="department" empId={render?.userId} />
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
        record?.monthId == month?.id && (
          <div className="flex gap-2">
            <Tooltip title="Edit">
              <Button
                onClick={() => handleVisibilityEdit(record)}
                type="primary"
                icon={<MdEdit />}
              ></Button>
            </Tooltip>

            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to remove survey score?"
                onConfirm={() => handleSurveyScore(record?.id)}
                okText={'Yes'}
                cancelText="No"
                placement="top"
              >
                <Button
                  loading={deleteLoading}
                  className="text-red-100 bg-red-600 border-none"
                  icon={<MdDelete />}
                ></Button>
              </Popconfirm>
            </Tooltip>
          </div>
        ),
    },
  ];
  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPage(pageSize);
    }
  };
  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setOpen(true)} type="primary" icon={<HiPlus />}>
          <span className="text-xs">Add Employee Survey</span>
        </Button>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <Select
          showSearch
          placeholder="Search Employee"
          className="w-full h-10"
          allowClear
          loading={empLoading}
          onChange={(value) => setUserId(value)}
          filterOption={(input: any, option: any) =>
            (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
          }
          options={employeeData?.items?.map((item: any) => ({
            ...item,
            value: item?.id,
            label:
              item?.firstName + ' ' + item?.middleName + ' ' + item?.lastName,
          }))}
        />
        <Select
          loading={depLoading}
          placeholder="Filter by Department"
          className="w-full h-10"
          allowClear
          showSearch
          onChange={(value) => setDepartmentId(value)}
          filterOption={(input, option) =>
            (option?.children as any)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {departmentData?.map((dept: any) => (
            <Option key={dept.id} value={dept.id}>
              {dept.name}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Filter by Month"
          className="w-full h-10"
          allowClear
          showSearch
          onChange={(value) => setMonthId(value)}
          filterOption={(input, option) =>
            (option?.children as any)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          loading={monthsLoading}
        >
          {months?.items
            ?.sort((a: any, b: any) => a.createdAt - b.createdAt)
            ?.map((month: any) => (
              <Option key={month.id} value={month.id}>
                {month?.session?.name}-{month.name}
              </Option>
            ))}
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={employeeSurvey?.items}
        pagination={false}
        loading={employeeSurveyLoading}
        className="overflow-x-auto"
      />
      <CustomPagination
        total={employeeSurvey?.meta?.totalItems || 0}
        current={employeeSurvey?.meta?.currentPage || 1}
        pageSize={page}
        onChange={onPageChange}
        onShowSizeChange={(size) => {
          onPageChange(1, size);
        }}
      />

      <EmployeeSurveyDrawer onClose={() => setOpen(false)} open={open} />
      <EmployeeSurveyModal
        onClose={() => setOpenModal(false)}
        open={openModal}
      />
    </div>
  );
};

export default EmployeeSurveyTable;
