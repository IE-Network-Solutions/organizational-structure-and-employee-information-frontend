'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';
import CustomButton from '@/components/common/buttons/customButton';
import { Col, Input, Row, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import CreateCriticalPosition from './_components/createCriticalPostion';
import { useCriticalPositionStore } from '@/store/uistate/features/organizationalDevelopment/SuccessionPlan';
import { IoSearchOutline } from 'react-icons/io5';
import SuccessionPlanTable from './_components/successionPlanTable';
import SuccessionDetails from './_components/successionDetails';

const { Title } = Typography;
const { Option } = Select;

function SuccessionPlan() {
  const { setOpen, showDetails, search, setSearch, setSelect } =
    useCriticalPositionStore();

  const showDrawer = () => {
    setOpen(true);
  };

  return (
    <div>
      {showDetails ? (
        <SuccessionDetails />
      ) : (
        <>
          <CustomBreadcrumb
            title="Successeion Plan"
            subtitle="Successeion Plan Managment"
            items={[
              { title: 'Home', href: '/' },
              {
                title: 'Tenants',
                href: '/tenant-manuser_typem"098765445676"/tenants',
              },
            ]}
          />
          <div className="flex flex-wrap justify-between items-center my-4 gap-4 md:gap-8">
            <Title level={5}>Critical Positions</Title>
            <CustomButton
              title="Add Critical Position"
              id="createUserButton"
              icon={<PlusOutlined className="mr-2" />}
              onClick={showDrawer}
              className="bg-blue-600 hover:bg-blue-700"
            />
          </div>
          <CreateCriticalPosition />

          <Row
            justify="center"
            className="flex justify-between"
            style={{ width: '100%' }}
          >
            <Col span={24} lg={10}>
              <Input
                className="w-full h-[48px] my-4"
                placeholder="Search by critical positions's name"
                suffix={
                  <IoSearchOutline style={{ color: 'rgba(0,0,0,.45)' }} />
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
            <Col span={24} lg={10}>
              <Select
                id={`selectStatusChartType`}
                placeholder="All Status"
                allowClear
                className="w-full h-[48px] my-4"
                onChange={(e) => setSelect(e)}
              >
                <Option key="active" value={'On Review'}>
                  On Review
                </Option>
                <Option key="active" value={'Passed'}>
                  Passed
                </Option>
                <Option key="active" value={'Failed'}>
                  Failed
                </Option>
              </Select>
            </Col>
          </Row>
          <SuccessionPlanTable />
        </>
      )}
    </div>
  );
}

export default SuccessionPlan;
