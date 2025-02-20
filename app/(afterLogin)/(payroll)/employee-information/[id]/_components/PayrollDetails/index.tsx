import { Space, Typography, Divider } from 'antd';

const { Text } = Typography;

const PayrollDetails = ({ activeMergedPayroll }: any) => {
  
  if (!activeMergedPayroll) {
    return <Text type="secondary">No payroll available.</Text>;
  }
  const totalAmount = (items: any) => {
    if (!items || items.length === 0) return '0.00';
    return items
      .reduce(
        (total: number, item: any) => total + parseFloat(item.amount || 0),
        0,
      )
      .toFixed(2);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        {/* Total Allowance */}
        <div>
          <div className="my-6 text-xl text-gray-600">
            Total Allowance{' '}
            {totalAmount(activeMergedPayroll?.breakdown?.allowances)}
          </div>
          <div className="flex gap-6 w-full">
            <div className="flex flex-col gap-6 w-1/3 justify-center items-start pl-4 text-gray-600">
              {activeMergedPayroll?.breakdown?.allowances?.map(
                (item: any, index: any) => (
                  <Text className="text-gray-600" key={index}>
                    {item.type}
                  </Text>
                ),
              )}
            </div>
            <div className="flex flex-col gap-6 text-right justify-end items-start ">
              {activeMergedPayroll?.breakdown?.allowances?.map(
                (item: any, index: any) => (
                  <Text className="font-bold" key={index}>
                    {parseFloat(item.amount).toFixed(2)}
                  </Text>
                ),
              )}
            </div>
          </div>
          <Divider />
        </div>

        {/* Total Benefits */}
        <div>
          <div className="my-6 text-xl text-gray-600">
            Total Benefits{' '}
            {totalAmount([
              ...(activeMergedPayroll?.breakdown?.merits || []),
              ...(activeMergedPayroll?.breakdown?.variablePay
                ? [
                    {
                      amount:
                        activeMergedPayroll?.breakdown?.variablePay.amount,
                    },
                  ]
                : []),
            ])}
          </div>
          <div className="flex gap-6 w-full">
            <div className="flex flex-col gap-6 w-1/3 justify-center items-start pl-4">
              {activeMergedPayroll?.breakdown?.merits?.map(
                (item: any, index: any) => (
                  <Text className="text-gray-600" key={index}>
                    {item.type}
                  </Text>
                ),
              )}
              {activeMergedPayroll?.breakdown?.variablePay && (
                <Text className="text-gray-600">
                  {activeMergedPayroll?.breakdown?.variablePay?.type}
                </Text>
              )}
            </div>
            <div className="flex flex-col gap-6 text-right justify-end items-start">
              {activeMergedPayroll?.breakdown?.merits?.map(
                (item: any, index: any) => (
                  <Text className="font-bold" key={index}>
                    {parseFloat(item.amount).toFixed(2)}
                  </Text>
                ),
              )}
              {activeMergedPayroll?.breakdown?.variablePay && (
                <Text className="font-bold">
                  {parseFloat(
                    activeMergedPayroll?.breakdown?.variablePay?.amount || '0',
                  ).toFixed(2)}{' '}
                </Text>
              )}
            </div>
          </div>
          <Divider />
        </div>

        {/* Total Deduction */}
        <div>
          <div className="my-6 text-xl text-gray-600">
            Total Deduction{' '}
            {totalAmount([
              ...(activeMergedPayroll?.breakdown?.pension || []),
              ...(activeMergedPayroll?.breakdown?.totalDeductionWithPension ||
                []),
            ])}
          </div>
          <div className="flex gap-6 w-full">
            <div className="flex flex-col gap-6 w-1/3 justify-center items-start pl-4">
              {activeMergedPayroll?.breakdown?.pension?.map(
                (item: any, index: any) => (
                  <Text className="text-gray-600" key={index}>
                    {item.type}
                  </Text>
                ),
              )}
              {activeMergedPayroll?.breakdown?.totalDeductionWithPension?.map(
                (item: any, index: any) => (
                  <Text className="text-gray-600" key={index}>
                    {item.type}
                  </Text>
                ),
              )}
            </div>
            <div className="flex flex-col gap-6 text-right justify-end items-start">
              {activeMergedPayroll?.breakdown?.pension?.map(
                (item: any, index: any) => (
                  <Text className="font-bold" key={index}>
                    {parseFloat(item.amount).toFixed(2)}
                  </Text>
                ),
              )}
              {activeMergedPayroll?.breakdown?.totalDeductionWithPension?.map(
                (item: any, index: any) => (
                  <Text className="font-bold" key={index}>
                    {parseFloat(item.amount).toFixed(2)}
                  </Text>
                ),
              )}
            </div>
          </div>
          <Divider />
        </div>

        {/* Gross Earning & Net Pay */}
        <div className="flex gap-6 w-full">
          <div className="flex flex-col gap-4 w-1/3">
            <Text>Gross Earning</Text>
            <Text>Net Pay</Text>
          </div>
          <div className="flex flex-col gap-4">
            <Text className="font-bold">
              {activeMergedPayroll?.grossSalary}
            </Text>
            <Text className="font-bold">{activeMergedPayroll?.netPay} </Text>
          </div>
        </div>
      </div>
    </Space>
  );
};

export default PayrollDetails;
