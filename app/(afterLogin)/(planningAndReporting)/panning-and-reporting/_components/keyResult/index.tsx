import { Progress, Dropdown, Menu, Typography } from 'antd';
import { FC, useState } from 'react';
import { IoIosMore } from 'react-icons/io';
import { MdKey } from 'react-icons/md';

const { Text, Title } = Typography;

interface KPIMetricsProps {
  keyResult?: any;
  myOkr?: boolean;
}

const KeyResultMetrics: FC<KPIMetricsProps> = ({ keyResult, myOkr }) => {
  const [open, setOpen] = useState(false);
  
  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const menu = (
    <Menu
      items={[
        {
          key: '1',
          label: 'Edit',
          onClick: showDrawer,
        },
        {
          key: '2',
          label: 'Delete',
        },
      ]}
    />
  );

  return (
    <div className="py-4 px-6 bg-white shadow-sm rounded-lg border">
      <div className="flex flex-col md:flex-row justify-between mb-4 items-start">
        <div className="flex items-start gap-4">
          <MdKey size={24} className="text-blue-600" />
          <Title level={5} className="text-sm font-normal">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea.
          </Title>
        </div>
        <div className="flex items-center mt-4 md:mt-0">
          <Progress type="circle" percent={keyResult?.progress} size={40} showInfo={false} />
          <Text className="ml-2 text-lg">{keyResult?.progress}%</Text>
          {myOkr && (
            <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
              <IoIosMore className="text-gray-500 text-lg cursor-pointer ml-2" />
            </Dropdown>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end">
        <div className="flex gap-4 mb-4 md:mb-0">
          <div className="flex items-center gap-2">
            <span className="bg-purple text-blue font-semibold text-xs px-2 py-1 rounded-lg">
              {keyResult?.metricType?.name}
            </span>
            <span className="text-blue text-xs">Metric</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-purple text-blue font-semibold text-xs px-2 py-1 rounded-lg">
              {keyResult?.weight}
            </span>
            <span className="text-blue text-xs">Weight</span>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-purple-200 text-blue font-semibold text-sm px-1 w-20 text-center rounded-lg">
                {keyResult?.currentValue || 0}
              </span>
              <span className="text-blue text-xs">Achieved</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-purple text-blue font-semibold text-sm px-1 w-20 text-center rounded-lg">
                {keyResult?.metricType?.name === "Milestone" ? keyResult?.milestones?.length : keyResult?.targetValue || 0}
              </span>
              <span className="text-blue text-xs">Target</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyResultMetrics;
