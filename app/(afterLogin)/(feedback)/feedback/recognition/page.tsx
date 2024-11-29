'use client';
import EmployeeSearchComponent from '@/components/common/search/searchComponent';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import { Card, Table, TableColumnsType, Tabs } from 'antd';
import { TabsProps } from 'antd/lib';
import dayjs from 'dayjs';
import React from 'react';
import { CiMedal } from 'react-icons/ci';

function Page() {
  const {searchField}=useRecongnitionStore();
  const { data: allUserData } = useGetAllUsers();

  const getEmployeeData = (employeeId: string) => {
    const employeeDataDetail = allUserData?.items?.find(
      (emp: any) => emp?.id === employeeId,
    );
    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };
  const columns: TableColumnsType<any> = [

    {
      title: 'Recognition',
      dataIndex: 'recognition',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Employees',
      dataIndex: 'employee',
        render: (notused, record) =>
          record.createdBy ? getEmployeeData(record.createdBy)?.firstName : '-',
    },
    {
      title: 'Criteria',
      dataIndex: 'criteria',
      render: (notused, record) =>
        record.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD') : '-',
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Date Issued',
      dataIndex: 'createdAt',
      render: (notused, record) =>
        record.createdBy ? getEmployeeData(record.createdBy)?.firstName : '-',
    },
    {
      title: 'Issued By',
      dataIndex: 'createdBy',
      render: (notused, record) => (
        <div>
          {record.userId
            ?.map((id: string) => getEmployeeData(id)?.firstName)
            .join(', ') ?? '-'}
        </div>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'description',
    },

  ];
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'All',
      children: (
        <div className="flex justify-between items-center">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card className='bg-gray-200 font-bold' key={index} style={{ width: 300 }}>
              <p className='flex justify-start items-centertext-green-600  font-extrabold text-xl'><CiMedal  /></p>
              <p>Total number of recognized employees</p>
              <p className=''>010</p>
            </Card>
          ))}
        </div>
      ),
    },
    {
      key: '2',
      label: 'Projects',
      children: 'Content of Tab Pane 2',
    },
    {
      key: '3',
      label: 'Sales',
      children: 'Content of Tab Pane 3',
    },
    {
      key: '4',
      label: 'Managment',
      children: 'Content of Tab Pane 2',
    },
    {
      key: '5',
      label: 'Others',
      children: 'Content of Tab Pane 3',
    },
  ];
  const handleSearchChange=()=>{
  }
  const handleRowClick=(record:any)=>{
    console.log(record);
  }
  return <div>

    <Tabs defaultActiveKey="1" items={items}  />
    <EmployeeSearchComponent
        fields={searchField}
        onChange={handleSearchChange}
      />
      <Table<any>
        columns={columns}
        dataSource={[]}
        // onChange={onChange}
        // pagination={{
        //   total: conversationInstances?.meta?.total ?? 0, // Total number of items
        //   current: conversationInstances?.meta?.currentPage ?? 1, // Current page
        //   pageSize: conversationInstances?.meta?.itemsPerPage ?? 10, // Items per page
        // }}
        scroll={{ x: 800 }} // Enable horizontal scrolling
        className="cursor-pointer"
        onRow={(record) => ({
          onClick: () => handleRowClick(record), // Add click handler
        })}
      />
    </div>;
}

export default Page;
