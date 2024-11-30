'use client';
import EmployeeSearchComponent from '@/components/common/search/searchComponent';
import TabLandingLayout from '@/components/tabLanding';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import { Card, Table, TableColumnsType } from 'antd';
import { TableProps } from 'antd/lib';
import React from 'react';
import { FaBackward } from 'react-icons/fa';

function Page() {
  const {searchField}=useRecongnitionStore();
  const { data: allUserData } = useGetAllUsers();

 const handleSearchChange=()=>{
  }


  const columns: TableColumnsType = [
    {
      title: '',
      dataIndex: 'name',
      width: '30%',
    },
    {
      title: '',
      dataIndex: 'age',
    },

  ];
  
  const data= [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
    },
    {
      key: '4',
      name: 'Jim Red',
      age: 32,
    },
  ];
  
  return <div>
    <>
      <TabLandingLayout
        id="conversationLayoutId"
        onClickHandler={() => {}}
        title="  ← Best Employee"
        buttonTitle='print Certification'
        buttonIcon={""}
      >
        <Card>
        <Table
            showHeader={false}
            columns={columns}
            bordered={false}
            pagination={false}
            dataSource={data}
            style={{
                border: "none",
                borderCollapse: "collapse",
              }}
            />
        </Card>
      </TabLandingLayout>
    </>
 
     
    </div>;
}

export default Page;

