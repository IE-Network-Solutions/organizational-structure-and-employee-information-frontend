import { Space, Typography, Divider, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PayrollDetails = ({ mergedPayroll }: any) => {
  const totalAmount = (items: any) =>
    items
      ?.reduce((total: any, item: any) => total + parseFloat(item.amount), 0)
      .toFixed(2) || '0.00';

  //   console.log('-------------mergedPayrolls-------------', mergedPayroll);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
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
              {mergedPayroll?.employeeInfo?.basicSalaries[0]?.basicSalary}
            </Text>
            <Text>
              {
                mergedPayroll?.employeeInfo?.employeeInformation
                  ?.bankInformation?.bankName
              }
            </Text>
            <Text>
              {
                mergedPayroll?.employeeInfo?.employeeJobInformation[0]?.branch
                  ?.name
              }
            </Text>
            <Text>
              {
                mergedPayroll?.employeeInfo?.employeeInformation
                  ?.bankInformation?.accountNumber
              }
            </Text>
          </div>
        </div>
      </div>

      <Divider />
      <div>
        <div className="flex justify-between">
          <Title level={4}>December Pay Slip</Title>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            style={{ marginTop: 12, backgroundColor: '#635BFF' }}
          >
            Print
          </Button>
        </div>
        <Divider />

        {['allowances', 'totalDeductionWithPension', 'merits', 'pension'].map(
          (key) => (
            <div key={key}>
              <Title level={5}>
                {key.replace(/([A-Z])/g, ' $1').trim()}{' '}
                {totalAmount(mergedPayroll?.breakdown?.[key])}
              </Title>
              <div className="flex gap-6 w-full">
                <div className="flex flex-col gap-4 w-1/3">
                  {mergedPayroll?.breakdown?.[key]?.map(
                    (item: any, index: any) => (
                      <Text key={index}>{item.type}</Text>
                    ),
                  )}
                </div>
                <div className="flex flex-col gap-4 text-right">
                  {mergedPayroll?.breakdown?.[key]?.map(
                    (item: any, index: any) => (
                      <Text key={index}>
                        {parseFloat(item.amount).toFixed(2)} ETB
                      </Text>
                    ),
                  )}
                </div>
              </div>
              <Divider />
            </div>
          ),
        )}

        {['tax', 'variablePay'].map((key) => (
          <div key={key}>
            <Title level={5}>
              {key.replace(/([A-Z])/g, ' $1').trim()}{' '}
              {parseFloat(
                mergedPayroll?.breakdown?.[key]?.amount || '0',
              ).toFixed(2)}
            </Title>
            <div className="flex gap-6 w-full">
              <div className="flex flex-col gap-4 w-1/3">
                <Text>{mergedPayroll?.breakdown?.[key]?.type}</Text>
              </div>
              <div className="flex flex-col gap-4 text-right">
                <Text>
                  {parseFloat(
                    mergedPayroll?.breakdown?.[key]?.amount || '0',
                  ).toFixed(2)}{' '}
                  ETB
                </Text>
              </div>
            </div>
            <Divider />
          </div>
        ))}

        <div className="flex gap-6 w-full">
          <div className="flex flex-col gap-4 w-1/3">
            <Text>Gross Earning</Text>
            <Text>Net Pay</Text>
          </div>
          <div className="flex flex-col gap-4">
            <Text>{mergedPayroll?.grossSalary} ETB</Text>
            <Text>{mergedPayroll?.netPay} ETB </Text>
          </div>
        </div>
      </div>
    </Space>
  );
};

export default PayrollDetails;
