'use client';
import EmployeeSearchComponent from '@/components/common/search/searchComponent';
import TabLandingLayout from '@/components/tabLanding';
import { useGetAllRecognition, useGetAllRecognitionType } from '@/store/server/features/CFR/recognition/queries';
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
  const {data:recognitionType}=useGetAllRecognitionType();
  const {data:getAllRecognition}=useGetAllRecognition({});

console.log(getAllRecognition,"getAllRecognition")

  const getEmployeeData = (employeeId: string) => {
    const employeeDataDetail = allUserData?.items?.find(
      (emp: any) => emp?.id === employeeId,
    );
    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };

//   {
//     "id": "3daceafd-6908-455e-85aa-76c97b05e318",
//     "createdAt": "2024-12-05T08:32:05.571Z",
//     "updatedAt": "2024-12-05T08:32:05.571Z",
//     "deletedAt": null,
//     "createdBy": null,
//     "updatedBy": null,
//     "recognitionTypeId": "e70b8e72-9ad3-481b-b044-02f6f78a3b14",
//     "recipientId": "a3baf08b-9dc1-478c-b4d4-847963d1d771",
//     "issuerId": "2d0987dc-435d-4c5d-9422-019a8bf9aedd",
//     "dataImportId": "847a3fbc-9f22-41da-8301-1fb3d13f5bba",
//     "dateIssued": "2024-11-29T11:30:00.000Z",
//     "status": "pending",
//     "criteriaVerified": false,
//     "isAutomated": true,
//     "certificateDetails": {
//         "issuedBy": "Admin",
//         "template": "Default Template",
//         "certificateId": "12345"
//     },
//     "monetizedValue": {
//         "amount": 150,
//         "currency": "USD"
//     },
//     "calendarId": null,
//     "monthId": null,
//     "sessionId": null,
//     "tenantId": "3c7e1c6f-fc6c-4f89-8437-5749b8e6dd2b",
//     "recognitionType": {
//         "id": "e70b8e72-9ad3-481b-b044-02f6f78a3b14",
//         "createdAt": "2024-12-04T14:18:00.844Z",
//         "updatedAt": "2024-12-04T14:18:00.844Z",
//         "deletedAt": null,
//         "createdBy": null,
//         "updatedBy": null,
//         "name": "recognition tw",
//         "description": "lkjhgfdsx",
//         "isMonetized": true,
//         "requiresCertification": false,
//         "certificationData": null,
//         "frequency": "monthly",
//         "parentTypeId": null,
//         "departmentId": "0d407f09-71ac-4439-8e66-3eaa0dc964ee"
//     }
// },
  const columns: TableColumnsType<any> = [

    {
      title: 'Recognition',
      dataIndex: 'recognition',
       render: (notused, record) =>
          record.recognitionType?.name ?? '-',
    },
    {
      title: 'Employees',
      dataIndex: 'employee',
        render: (notused, record) =>
          record.recipientId ? getEmployeeData(record.recipientId)?.firstName ?? '-':'-',
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
      dataIndex: 'dateIssued',
      render: (notused, record) =>
        record?.dateIssued ? dayjs(record?.dateIssued).format('YYYY-MM-DD') ?? '-':'-',
    },
    {
      title: 'Issued By',
      dataIndex: 'createdBy',
      render: (notused, record) =>
        record?.issuerId ? getEmployeeData(record?.issuerId)?.firstName ?? '-':'-',
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              className="bg-gray-200 font-bold"
              key={`all-card-${index}`}
              style={{ width: '100%' }} // Full width in grid cells
            >
              <p className="flex justify-start items-center text-green-600 font-extrabold text-xl">
                <CiMedal />
              </p>
              <p>Total number of recognized employees</p>
              <p>010</p>
            </Card>
          ))}
        </div>
      ),
    },
    ...(recognitionType?.items?.map((item: any) => ({
      key: item.id,
      label: item.name,
    })) || []), // Fallback to an empty array if recognitionType?.items is undefined
  ];
  
  const handleSearchChange=()=>{
  }
  const handleRowClick=(record:any)=>{
    console.log(record);
  }
  return <div>
    
    <Tabs className='ml-[3%]' defaultActiveKey="1" items={items}  />

    <>
      <TabLandingLayout
        id="conversationLayoutId"
        onClickHandler={() => {}}
        title="Recognition"
        subtitle="Manage Recognition"
      >
      <EmployeeSearchComponent
        fields={searchField}
        onChange={handleSearchChange}
      />
      <Table<any>
        columns={columns}
        dataSource={getAllRecognition?.items ?? []}
        pagination={{
          total: getAllRecognition?.meta?.total ?? 0, // Total number of items
          current: getAllRecognition?.meta?.currentPage ?? 1, // Current page
          pageSize: getAllRecognition?.meta?.itemsPerPage ?? 10, // Items per page
        }}
        scroll={{ x: 800 }} // Enable horizontal scrolling
        className="cursor-pointer"
        onRow={(record) => ({
          onClick: () => handleRowClick(record), // Add click handler
        })}
      />
      </TabLandingLayout>
    </>
 
     
    </div>;
}

export default Page;
