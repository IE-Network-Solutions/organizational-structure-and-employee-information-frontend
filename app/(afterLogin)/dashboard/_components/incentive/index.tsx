import AllRecognition from '@/app/(afterLogin)/(feedback)/feedback/settings/_components/recognition/allRecognition';
import { useGetAllRecognitionWithRelations } from '@/store/server/features/CFR/recognitionCriteria/queries';
import { useGetIncentiveSummery } from '@/store/server/features/dashboard/incentive/queries';
import { useDashboardIncentiveStore } from '@/store/uistate/features/dashboard/incentive';
import { Card, Select, TabsProps } from 'antd';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
const { Option } = Select;

const Incentive = () => {
  const { setRecognitionType, setStatus, recognitionType, status } =
    useDashboardIncentiveStore();

  const { data: recognitionData } = useGetAllRecognitionWithRelations();
  const { data: IncentiveData, isLoading: incentiveIsLoading } =
    useGetIncentiveSummery(status, recognitionType);

  const items: TabsProps['items'] = [
    {
      key: '',
      label: 'All Recognitions',
      children: (
        <AllRecognition
          data={recognitionData?.items?.filter(
            (item: any) =>
              item.parentTypeId !== null && item?.isMonetized === true,
          )}
          all={true}
        />
      ),
    },
    ...(recognitionData?.items
      ?.filter(
        (item: any) => item.parentTypeId !== null && item?.isMonetized === true,
      )
      ?.map((recognitionType: any) => ({
        key: `${recognitionType?.id}`, // Ensure unique keys
        label: recognitionType?.name,
        children: <AllRecognition data={[recognitionType]} />,
      })) || []),
  ];
  const itemStatus: { key: string; label: string }[] = [
    { key: 'null', label: 'All' },
    { key: 'true', label: 'True' },
    { key: 'false', label: 'False' },
  ];
  const totalCount =
    IncentiveData?.summary?.reduce(
      (sum: number, item: { description: string; totalAmount: number }) =>
        sum + item.totalAmount,
      0,
    ) || 0;
  const summary = IncentiveData?.summary || [];

  const data = {
    labels: summary.map(
      (item: { description: string; totalAmount: number }) => item.description,
    ),
    datasets: [
      {
        label: 'Total Amount',
        data: summary.map(
          (item: { description: string; totalAmount: number }) =>
            item.totalAmount,
        ),
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'], // Extend as needed
      },
    ],
  };
  const options = {
    cutout: '60%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    elements: {
      arc: { borderWidth: 0 },
    },
  };
  return (
    <Card
      loading={incentiveIsLoading}
      className="w-full mx-auto h-[316px] overflow-hidden  flex flex-col"
    >
      <div className="flex justify-between items-center mb-2 h-10 ">
        <h3 className="text-gray-700 font-semibold text-lg">Incentives</h3>
        <div>
          <Select
            bordered={false}
            defaultValue="All Recognitions"
            className="text-gray-500 w-28"
            onChange={(value) => setRecognitionType(value)}
          >
            {items?.map((i) => (
              <Option key={i.key} value={i.key}>
                {i.label}
              </Option>
            ))}
          </Select>
          <Select
            bordered={false}
            className="text-gray-500 w-28"
            defaultValue="All"
            onChange={(value) => {
              const parsedValue =
                value === 'true' ? true : value === 'false' ? false : null;
              setStatus(parsedValue);
            }}
          >
            {itemStatus.map((i) => (
              <Option key={i.key} value={i.key}>
                {i.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>{' '}
      {IncentiveData?.summary?.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4  ">
          <div className="relative flex items-center justify-center w-[180px] h-[180px] px-4 overflow-visible z-10">
            <Doughnut data={data} options={options} />
            <div
              className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center z-0"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <div
                className="bg-white border border-gray-200 shadow-md rounded-full flex flex-col items-center justify-center"
                style={{ width: 60, height: 60 }}
              >
                <span className="font-bold text-2xl text-gray-900">
                  {totalCount.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400">Total</span>
              </div>
            </div>
          </div>
          <div className="col-span-1 lg:col-span-7  ml-5 overflow-y-auto h-[200px]">
            {IncentiveData?.details?.map((item: any, index: any) => {
              const key = index;
              return (
                <div
                  key={key}
                  className="mb-2 border-b-2 pb-2 flex justify-between items-center gap-8 "
                >
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">
                      {item?.recognitionType?.name}
                    </div>
                    <div className="text-xs font-normal">
                      {item?.recognitionType?.description}
                    </div>{' '}
                  </div>
                  <div className="">
                    <div className="flex items-center justify-center">
                      {item?.totalAmount.toLocaleString()}
                    </div>
                    <div
                      className={`min-w-24 px-3 py-1 ${item?.status === true ? 'bg-light_purple text-primary' : 'bg-red-300 text-error'} flex items-center justify-center rounded-lg`}
                    >
                      {item?.status === true ? 'Paid' : 'Not Paid'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-sm font-light flex h-[100px] justify-center items-center ">
          No Incentive For this Month
        </div>
      )}{' '}
    </Card>
  );
};

export default Incentive;
