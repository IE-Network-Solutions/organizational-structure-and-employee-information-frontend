'use client';
import TabLandingLayout from '@/components/tabLanding';
import { Card, Col, Row, Table, TableColumnsType } from 'antd';
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
                <Row gutter={[16, 16]} style={{ width: 'auto' }}>
                  <Col xs={24} sm={10} md={10} lg={10} xl={10} >
                    Brown
                  </Col>
                  <Col xs={24} sm={14} md={14} lg={14} xl={14}>
                    97
                  </Col>
                </Row>
                <Row gutter={[16, 16]} style={{ width: 'auto' }}>
                  <Col xs={24} sm={10} md={10} lg={10} xl={10} ></Col>
                  <Col xs={24} sm={14} md={14} lg={14} xl={14}></Col>
                </Row>
                {/* Additional rows */}
                {[...Array(4)].map((_, index) => (
                  <Row gutter={[16, 16]} style={{ width: 'auto' }} key={index}>
                    <Col xs={24} sm={10} md={10} lg={10} xl={10} ></Col>
                    <Col xs={24} sm={14} md={14} lg={14} xl={14}></Col>
                  </Row>
                ))}
          </Card>
            {/* <Table
              showHeader={false}
              columns={columns}
              bordered={false}
              pagination={false}
              dataSource={data}
              style={{
                border: 'none',
                borderCollapse: 'collapse',
              }}
            /> */}
        </TabLandingLayout>
      </>
    </div>
  );
}

export default Page;
