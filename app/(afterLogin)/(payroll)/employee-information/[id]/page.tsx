'use client';
import {
  Card,
  Tabs,
  Typography,
  Row,
  Col,
  Space,
  Button,
  Divider,
  Avatar,
  Collapse,
} from 'antd';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import {
  useGetActivePayroll,
  useGetPayPeriod,
} from '@/store/server/features/payroll/payroll/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import PayrollDetails from './_components/PayrollDetails';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const EmployeeProfile = () => {
  const { data: payPeriodData } = useGetPayPeriod();
  // const openPayPeriods = payPeriodData?.filter(
  //   (period: any) => period.status === 'OPEN',
  // );
  const params = useParams();
  const empId = params?.id as string;

  const { data: employee } = useGetEmployee(empId);
  const { data: payroll } = useGetActivePayroll();
  const [mergedPayroll, setMergedPayroll] = useState<any>([]);

  useEffect(() => {
    if (payroll?.payrolls && employee) {
      const mergedData = payroll.payrolls
        .filter((pay: any) => pay.employeeId === employee.id)
        .map((pay: any) => ({
          ...pay,
          employeeInfo: employee || null,
        }));

      setMergedPayroll(mergedData[0]);
    }
  }, [payroll, employee, empId]);

  // console.log(
  //   '--mergedPayroll---------------------------',
  //   mergedPayroll,
  //   // openPayPeriods,
  //   payPeriodData,
  // );
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
                <Avatar
                  size={144}
                  src={mergedPayroll?.employeeInfo?.profileImage}
                  className="relative z-0"
                />

                <Title level={3} style={{ margin: 0 }}>
                  {mergedPayroll?.employeeInfo?.firstName}{' '}
                  {mergedPayroll?.employeeInfo?.middleName}{' '}
                  {mergedPayroll?.employeeInfo?.lastName}
                </Title>
                <Text type="secondary">
                  {
                    mergedPayroll?.employeeInfo?.employeeJobInformation[0]
                      ?.position?.name
                  }
                </Text>
                <Button
                  size="small"
                  type="primary"
                  style={{ backgroundColor: '#635BFF' }}
                >
                  {
                    mergedPayroll?.employeeInfo?.employeeJobInformation[0]
                      ?.employementType?.name
                  }
                </Button>

                <Divider />

                <Space direction="vertical" size="small">
                  <Text>
                    <MailOutlined /> {mergedPayroll?.employeeInfo?.email}
                  </Text>
                  <Text>
                    <PhoneOutlined />{' '}
                    {
                      mergedPayroll?.employeeInfo?.employeeInformation
                        ?.addresses?.phoneNumber
                    }
                  </Text>
                </Space>

                <Divider />

                <Space direction="vertical" size="small">
                  <Text>
                    <strong>Department:</strong>{' '}
                    {
                      mergedPayroll?.employeeInfo?.employeeJobInformation[0]
                        ?.department?.name
                    }
                  </Text>
                  <Text>
                    <strong>Office:</strong>{' '}
                    {
                      mergedPayroll?.employeeInfo?.employeeJobInformation[0]
                        ?.branch?.name
                    }
                  </Text>
                </Space>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Information" key="1">
                <PayrollDetails mergedPayroll={mergedPayroll} />
              </TabPane>

              <TabPane tab="Payroll History" key="2">
                <>
                  {payPeriodData?.map((period: any, index: any) => (
                    <Collapse size="large" className="m-4 p-4" key={index}>
                      <Collapse.Panel
                        key={period.id}
                        header={` ${dayjs(period.startDate).format('YYYY-MMM-DD')} to ${dayjs(period.endDate).format('YYYY-MMM-DD')}`}
                      >
                        <PayrollDetails mergedPayroll={mergedPayroll} />
                      </Collapse.Panel>
                    </Collapse>
                  ))}
                </>
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EmployeeProfile;
