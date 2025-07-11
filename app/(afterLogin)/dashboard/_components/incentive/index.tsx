import AllRecognition from '@/app/(afterLogin)/(feedback)/feedback/settings/_components/recognition/allRecognition';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetAllRecognitionWithRelations } from '@/store/server/features/CFR/recognitionCriteria/queries';
import { useGetIncentiveSummery } from '@/store/server/features/dashboard/incentive/queries';
import { useDashboardIncentiveStore } from '@/store/uistate/features/dashboard/incentive';
import { Card, Row, Col, Select, TabsProps, Dropdown, Menu } from 'antd';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { LuSettings2 } from 'react-icons/lu';
const { Option } = Select;

const Incentive = () => {
  const {
    isShowMobileFilters,
    recognitionType,
    status,
    setRecognitionType,
    setStatus,
  } = useDashboardIncentiveStore();

  const { data: recognitionData } = useGetAllRecognitionWithRelations();
  const { data: IncentiveData, isLoading: incentiveIsLoading } =
    useGetIncentiveSummery(status, recognitionType);
  const { isMobile, isTablet } = useIsMobile();

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
        data: summary.map(
          (item: { description: string; totalAmount: number }) =>
            item.totalAmount,
        ),
        backgroundColor: [
          '#3636F0', // Primary blue
          '#4F8CFF', // Light blue
          '#3EC3FF', // Cyan
          '#22C55E', // Green
          '#FACC15', // Yellow
          '#EF4444', // Red
          '#8B5CF6', // Purple
          '#F97316', // Orange
          '#06B6D4', // Teal
          '#84CC16', // Lime
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };
  const options = {
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      datalabels: { display: false },
    },
    elements: {
      arc: { borderWidth: 2 },
    },
  };
  const MobileFilters = () => (
    <Menu className="p-4 w-[280px]">
      <div className="mb-4">
        <Select
          bordered={false}
          value={recognitionType} // use `value` here
          className="text-gray-500 w-36"
          onChange={(value) => setRecognitionType(value)}
        >
          {items?.map((i) => (
            <Option key={i.key} value={i.key}>
              {i.label}
            </Option>
          ))}
        </Select>
      </div>
      <div>
        <Select
          bordered={false}
          value={status === null ? 'All' : status.toString()} // handle null, true, false
          className="text-gray-500 w-20"
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
    </Menu>
  );

  return (
    <Card className="w-full mx-auto h-[316px] overflow-hidden  flex flex-col">
      <div className="flex justify-between items-center mb-2 h-10 ">
        <h3 className="font-bold text-lg">Incentives</h3>
        {isMobile || isTablet ? (
          <Dropdown
            overlay={<MobileFilters />}
            trigger={['click']}
            // onOpenChange={setIsShowMobileFilters}
          >
            <button
              className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                isShowMobileFilters
                  ? 'bg-blue-50 border-blue-500'
                  : 'border-gray-300'
              }`}
            >
              <LuSettings2 />
            </button>
          </Dropdown>
        ) : (
          <div>
            <Select
              bordered={false}
              defaultValue="All Recognitions"
              className="text-gray-500 w-36"
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
              className="text-gray-500 w-20"
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
        )}
      </div>{' '}
      {IncentiveData?.summary?.length > 0 ? (
        <Card loading={incentiveIsLoading}>
          <Row gutter={[16, 24]} className=" p-2">
            <Col
              lg={8}
              xs={24}
              className=" relative flex items-center justify-center w-[200px] h-[200px]  px-4 overflow-visible z-10 "
            >
              <Doughnut data={data} options={options} className="z-20" />
              <div
                className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center z-0"
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <div
                  className="bg-white border border-gray-200 shadow-xl rounded-full flex flex-col items-center justify-center"
                  style={{ width: 120, height: 120 }}
                >
                  <span className="font-bold text-2xl text-gray-900">
                    {totalCount.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400">Total</span>
                </div>
              </div>
            </Col>
            <Col lg={16} xs={24} className="">
              <div className=" ml-5 overflow-y-auto h-[200px]">
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
                          className={`min-w-24 px-3 py-1 ${item?.status === true ? 'bg-light_purple text-primary' : 'bg-red-100 text-error'} flex items-center justify-center text-xs font-bold rounded-lg`}
                        >
                          {item?.status === true ? 'Paid' : 'Not Paid'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Col>
          </Row>
        </Card>
      ) : (
        <div className="text-sm font-light flex h-[100px] justify-center items-center ">
          No Incentive For this Month
        </div>
      )}{' '}
    </Card>
  );
};

export default Incentive;
