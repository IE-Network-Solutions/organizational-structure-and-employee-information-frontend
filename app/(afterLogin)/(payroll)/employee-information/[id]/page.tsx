'use client';
import { Card, Tabs, Typography, Row, Col, Space, Button, Divider } from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  PrinterOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const EmployeeProfile = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <Card>
              <Space
                direction="vertical"
                size="small"
                align="center"
                style={{ width: '100%' }}
              >
                <img
                  src="https://via.placeholder.com/150"
                  alt="Profile"
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: 12,
                  }}
                />

                <Title level={3} style={{ margin: 0 }}>
                  Abraham Dulla
                </Title>
                <Text type="secondary">Product Design Lead</Text>
                <Button
                  size="small"
                  type="primary"
                  style={{ backgroundColor: '#635BFF' }}
                >
                  Permanent
                </Button>

                <Divider />

                <Space direction="vertical" size="small">
                  <Text>
                    <MailOutlined /> lincoln@gmail.com
                  </Text>
                  <Text>
                    <PhoneOutlined /> 09318298493
                  </Text>
                </Space>

                <Divider />

                <Space direction="vertical" size="small">
                  <Text>
                    <strong>Department:</strong> Saas
                  </Text>
                  <Text>
                    <strong>Office:</strong> Head Office
                  </Text>
                </Space>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Information" key="1">
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: '100%' }}
                >
                  <div>
                    <Title level={4}>Payroll Information</Title>
                    <div className=" flex gap-6">
                      <div className="flex flex-col gap-4">
                        <Text>Base Salary:</Text>
                        <Text>Bank Information:</Text>
                        <Text>Branch:</Text>
                        <Text>Account Number:</Text>
                      </div>
                      <div className="flex flex-col gap-4">
                        <Text className="font-bold">10,000</Text>
                        <Text className="font-bold">Enat Bank</Text>
                        <Text className="font-bold">Mexico, Addis Ababa</Text>
                        <Text className="font-bold">100000000000000</Text>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  <div>
                    <Title level={4}>Entitled Allowances</Title>

                    <div className="flex gap-6">
                      <div className="flex flex-col gap-4">
                        <Text>Allowance</Text>
                        <Text>Transport</Text>
                        <Text>Housing</Text>
                      </div>
                      <div className="flex flex-col gap-4">
                        <Text>Type</Text>
                        <Text>Variable</Text>
                        <Text>Fixed</Text>
                      </div>
                      <div className="flex flex-col gap-4">
                        <Text>Amount</Text>
                        <Text>2000ETB (20% of the base salary)</Text>
                        <Text>3000ETB</Text>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  <div>
                    <div className="flex justify-between">
                      <Title level={4}>December Pay Slip</Title>
                      <Button
                        type="primary"
                        style={{ marginTop: 12, backgroundColor: '#635BFF' }}
                        icon={<PrinterOutlined />}
                      >
                        Print
                      </Button>
                    </div>

                    <div className=" flex gap-6">
                      <div className="flex flex-col gap-4">
                        <Text>Salary Period</Text>
                        <Text>Pay Date</Text>
                        <Text>Total Allowance</Text>
                      </div>
                      <div className="flex flex-col gap-4">
                        <Text className="font-bold">Nov-2024</Text>
                        <Text className="font-bold">Nov-2024</Text>
                        <Text className="font-bold">5,0000</Text>
                      </div>
                    </div>
                  </div>
                </Space>
              </TabPane>

              <TabPane tab="Payroll History" key="2">
                <Text>No Payroll History Available</Text>
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EmployeeProfile;
