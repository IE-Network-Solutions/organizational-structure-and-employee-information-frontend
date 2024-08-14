'use client';
import React from 'react';
import { Card, Col, Row, Tabs } from 'antd';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import BasicInfo from './_components/basicInfo';
import General from './_components/general';
import Job from './_components/job';

interface Params {
  id: string;
}

interface EmployeeDetailsProps {
  params: Params;
}
function EmployeeDetails({ params: { id } }: EmployeeDetailsProps) {


  const items = [
    {
      key: '1',
      label: 'General',
      children: <General id={id}/>,
    },
    {
      key: '2',
      label: 'Job',
      children: <Job id={id}/>,
    },
    {
      key: '3',
      label: 'Documents',
      children: 'Content of Tab Pane 3',
    },
  ];
  return (
    <div className="bg-[#F5F5F5] px-2">
      <div className="flex gap-5">
        <MdKeyboardArrowLeft />
        <h4>Detail Employee</h4>
      </div>
      <Row gutter={[16, 24]}>
        <Col lg={8} md={10} xs={24}>
          <BasicInfo id={id}/>
        </Col>
        <Col lg={16} md={14} xs={24}>
          <Card>
            <Tabs
              items={items}
              tabBarGutter={48}
              indicator={{ size: 80, align: 'center' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default EmployeeDetails;
