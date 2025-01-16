import CustomBreadcrumb from '@/components/common/breadCramp';
import { Card, Col, Divider, Row, Typography } from 'antd';
import React from 'react';
import GenerateModal from './generateModal';

const { Title } = Typography;
const PayRoleView: React.FC = () => {
  return (
    <div className="m-3">
      <CustomBreadcrumb
        title="Incentive"
        subtitle="Generated Incentive Report"
      />
      <div>
        <Row gutter={[16, 10]}>
          <Col xs={24} sm={24} md={24} lg={8} xl={8}>
            <Card className="bg-[#FAFAFA]" bordered={false}>
              <div className="flex flex-wrap items-center justify-between ">
                <Title level={4}>FY 2016 Q4</Title>
                {}
                <div className="rounded-xl bg-[#FFEDEC] py-2 px-8 ">
                  <span className="text-[#E03137] font-semibold text-md">
                    Not Paid
                  </span>
                </div>
                <div className="rounded-xl bg-[#55C79033] py-2 px-8 m-2">
                  <span className="text-[#0CAF60] font-semibold text-md">
                    Paid
                  </span>
                </div>
              </div>
              <Divider />
              <div className="flex flex-wrap items-center justify-start">
                <div className="bg-[#D3E4F0] rounded-xl my-3 py-2 px-6">
                  <span className="text-[#1D9BF0] text-md font-semibold">
                    Projects
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between">
                <span className="text-[16px] font-semibold text-[#687588]">
                  20,000,000 Birr
                </span>
                <span className="text-[16px] font-normal text-[#687588]">
                  100 Employees
                </span>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      <GenerateModal />
    </div>
  );
};

export default PayRoleView;
