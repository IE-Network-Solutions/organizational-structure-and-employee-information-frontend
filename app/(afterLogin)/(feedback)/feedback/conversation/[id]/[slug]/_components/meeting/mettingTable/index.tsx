import React from 'react';
import { Table, Button } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import dayjs from 'dayjs';

interface DataProp {
  data: ConversationMeetingData | undefined;
}

const MettingDataTable: React.FC<DataProp> = ({ data }) => {
  const { data: usersData } = useGetAllUsers();
  const { data: departmentData } = useGetDepartments();

  const getEmployeeData = (id: string) => {
    const employeeDataDetail = usersData?.items?.find(
      (emp: any) => emp?.id === id
    );
    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };

  const getDepartmentId = (selectedDepartmentId: string) => {
    const department = (departmentData ?? []).find(
      (dep: any) => dep.id === selectedDepartmentId
    );
    return department?.name ?? '-'; // Return an empty object if no matching department is found
  };

  const columns: TableColumnsType<ConversationMeetingItem> = [
    {
      title: 'Held Date',
      dataIndex: 'createdAt',
      render: (_, record) => 
        record.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD') : '-',
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Department',
      dataIndex: 'departmentId',
      render: (_, record) =>
        (record.departmentId?.map((id) => getDepartmentId(id)).join(', ') ?? '-'),
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      render: (_, record) =>
        record.createdBy ? getEmployeeData(record.createdBy)?.firstName : '-',
    },
    {
      title: 'Attendees',
      dataIndex: 'userId',
      render: (_, record) => (
        <div>
          {record.userId?.map((id) => getEmployeeData(id)?.firstName).join(', ') ?? '-'}
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 100,
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button type="primary" onClick={() => handleEdit(record.id)}>
            Edit
          </Button>
          <Button type="primary" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleEdit = (key: React.Key) => {
    console.log('Edit:', key);
    // Implement your edit logic here
  };

  const handleDelete = (key: React.Key) => {
    console.log('Delete:', key);
    // Implement your delete logic here
  };

  const onChange: TableProps<ConversationMeetingItem>['onChange'] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log({ pagination, filters, sorter, extra });
    // Implement your logic to handle table change here
  };

  return (
    <div className="overflow-x-auto">
      <Table<ConversationMeetingItem>
        columns={columns}
        dataSource={data?.items ?? []}
        onChange={onChange}
        pagination={{ pageSize: 5 }} // Set the number of rows per page
        scroll={{ x: 800 }} // Enable horizontal scrolling for responsive design
      />
    </div>
  );
};

export default MettingDataTable;
