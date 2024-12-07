'use client';
import TabLandingLayout from '@/components/tabLanding';
import { Card, Table, TableColumnsType } from 'antd';
import React from 'react';

function Page() {
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

  const data = [
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

  return (
    <div>
      <>
        <TabLandingLayout
          id="conversationLayoutId"
          onClickHandler={() => {}}
          title="  ← Best Employee"
          buttonTitle="print Certification"
          buttonIcon={''}
        >
          <Card>
            <Table
              showHeader={false}
              columns={columns}
              bordered={false}
              pagination={false}
              dataSource={data}
              style={{
                border: 'none',
                borderCollapse: 'collapse',
              }}
            />
          </Card>
        </TabLandingLayout>
      </>
    </div>
  );
}

export default Page;
