'use client';
import {
  Card,
  Tabs,
  Typography,
  Row,
  Col,
  Button,
  Divider,
  Avatar,
  Collapse,
} from 'antd';
import {
  MailOutlined,
  PhoneOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
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
  const openPayPeriods = payPeriodData?.filter(
    (period: any) => period.status === 'OPEN',
  );
  const params = useParams();
  const empId = params?.id as string;

  const { data: employee } = useGetEmployee(empId);
  const { data: payroll } = useGetActivePayroll();
  const [mergedPayroll, setMergedPayroll] = useState<any>([]);
  const [activeMergedPayroll, setActiveMergedPayroll] = useState<any>([]);
  const [activePayPeriod, setActivePayPeriod] = useState<any>(null);

  useEffect(() => {
    if (payPeriodData && activeMergedPayroll?.payPeriodId) {
      const currentPayPeriod = payPeriodData.find(
        (payPeriod: any) => payPeriod.id === activeMergedPayroll.payPeriodId,
      );
      setActivePayPeriod(currentPayPeriod);
    }
  }, [activeMergedPayroll, payPeriodData]);

  useEffect(() => {
    if (payroll?.payrolls && employee) {
      const mergedData = payroll.payrolls
        .filter((pay: any) => pay.employeeId === employee.id)
        .map((pay: any) => ({
          ...pay,
          employeeInfo: employee || null,
        }));

      setMergedPayroll(mergedData);

      const activeMergedData = mergedData?.filter(
        (pay: any) => openPayPeriods?.[0]?.id === pay.payPeriodId,
      );
      setActiveMergedPayroll(activeMergedData[0]);
    }
  }, [payroll, employee, empId, payPeriodData]);

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <Card>
              <div>
                <div className="flex flex-col justify-center items-center text-center gap-4">
                  <div>
                    <Avatar
                      size={144}
                      src={activeMergedPayroll?.employeeInfo?.profileImage}
                      className="relative z-0"
                    />
                  </div>

                  <Title level={3} style={{ margin: 0 }}>
                    {[
                      activeMergedPayroll?.employeeInfo?.firstName,
                      activeMergedPayroll?.employeeInfo?.middleName,
                      activeMergedPayroll?.employeeInfo?.lastName,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  </Title>

                  {activeMergedPayroll?.employeeInfo
                    ?.employeeJobInformation?.[0]?.position?.name && (
                    <Text type="secondary">
                      {
                        activeMergedPayroll?.employeeInfo
                          ?.employeeJobInformation?.[0]?.position?.name
                      }
                    </Text>
                  )}

                  <div className="mt-2">
                    {activeMergedPayroll?.employeeInfo
                      ?.employeeJobInformation?.[0]?.employementType?.name && (
                      <Button
                        size="small"
                        type="primary"
                        style={{ backgroundColor: '#635BFF' }}
                      >
                        {
                          activeMergedPayroll?.employeeInfo
                            ?.employeeJobInformation?.[0]?.employementType?.name
                        }
                      </Button>
                    )}
                  </div>

                  <Divider className="w-full" />
                </div>

                <div className="flex flex-col gap-2">
                  <Text className="font-bold">
                    <MailOutlined /> {activeMergedPayroll?.employeeInfo?.email}
                  </Text>
                  <Text className="font-bold">
                    <PhoneOutlined />{' '}
                    {
                      activeMergedPayroll?.employeeInfo?.employeeInformation
                        ?.addresses?.phoneNumber
                    }
                  </Text>
                </div>

                <Divider />

                <div className="flex flex-col gap-2">
                  <Text>
                    <strong>Department:</strong>
                    <p>
                      {
                        activeMergedPayroll?.employeeInfo
                          ?.employeeJobInformation[0]?.department?.name
                      }
                    </p>
                  </Text>
                  <Text>
                    <strong>Office:</strong>
                    <p>
                      {
                        activeMergedPayroll?.employeeInfo
                          ?.employeeJobInformation[0]?.branch?.name
                      }
                    </p>
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Tabs defaultActiveKey="1">
              <TabPane
                tab="Information"
                key="1"
                className="border border-solid rounded-xl p-4"
              >
                <div>
                  <Title level={4}>Payroll Information</Title>
                  <div className="flex gap-6 w-full">
                    <div className="flex flex-col gap-4 w-1/3">
                      <Text>Base Salary:</Text>
                      <Text>Bank Information:</Text>
                      <Text>Branch:</Text>
                      <Text>Account Number:</Text>
                    </div>
                    <div className="flex flex-col gap-4 font-bold">
                      <Text>
                        {
                          activeMergedPayroll?.employeeInfo?.basicSalaries[0]
                            ?.basicSalary
                        }
                      </Text>
                      <Text>
                        {
                          activeMergedPayroll?.employeeInfo?.employeeInformation
                            ?.bankInformation?.bankName
                        }
                      </Text>
                      <Text>
                        {
                          activeMergedPayroll?.employeeInfo
                            ?.employeeJobInformation[0]?.branch?.name
                        }
                      </Text>
                      <Text>
                        {
                          activeMergedPayroll?.employeeInfo?.employeeInformation
                            ?.bankInformation?.accountNumber
                        }
                      </Text>
                    </div>
                  </div>
                </div>
                <Divider />
                <div className="flex justify-between">
                  <Title level={4}>
                    {dayjs(activePayPeriod?.startDate).format('MMMM')} Pay Slip
                  </Title>
                  <Button
                    type="primary"
                    icon={<PrinterOutlined />}
                    style={{ marginTop: 12, backgroundColor: '#635BFF' }}
                  >
                    Print
                  </Button>
                </div>
                <Divider />
                <div className="flex gap-6 w-full m-4">
                  <div className="flex flex-col gap-4 w-1/3">
                    <Text className=" text-gray-600">Salary Period</Text>
                    <Text className=" text-gray-600">Pay Date</Text>
                  </div>
                  <div className="flex flex-col gap-4 font-bold">
                    <Text>
                      {dayjs(openPayPeriods?.[0]?.startDate).format('MMM-YYYY')}
                    </Text>
                    <Text>
                      {dayjs(openPayPeriods?.[0]?.updatedAt).format(
                        'MMM-DD-YYYY',
                      )}
                    </Text>
                  </div>
                </div>
                <PayrollDetails activeMergedPayroll={activeMergedPayroll} />
              </TabPane>

              <TabPane tab="Payroll History" key="2">
                <>
                  {payPeriodData
                    ?.filter(
                      (period: any) =>
                        mergedPayroll.some(
                          (pay: any) => pay.payPeriodId === period.id,
                        ), // Filter only periods with merged data
                    )
                    .map((period: any, index: any) => {
                      const activeMergedPayroll = mergedPayroll.find(
                        (pay: any) => pay.payPeriodId === period.id,
                      );

                      return (
                        <Collapse size="large" className="p-4" key={index}>
                          <Collapse.Panel
                            key={period.id}
                            header={`${dayjs(period.startDate).format('MMMM-YYYY')}`}
                          >
                            <div className="flex gap-6 w-full m-4">
                              <div className="flex flex-col gap-4 w-1/3">
                                <Text className=" text-gray-600">
                                  Salary Period
                                </Text>
                                <Text className=" text-gray-600">Pay Date</Text>
                              </div>
                              <div className="flex flex-col gap-4 font-bold">
                                <Text>
                                  {dayjs(period.startDate).format('MMM-YYYY')}
                                </Text>
                                <Text>
                                  {dayjs(period.updatedAt).format(
                                    'MMM-DD-YYYY',
                                  )}
                                </Text>
                              </div>
                            </div>
                            <PayrollDetails
                              activeMergedPayroll={activeMergedPayroll}
                            />
                          </Collapse.Panel>
                        </Collapse>
                      );
                    })}
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
