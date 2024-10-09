import { Card, Progress } from 'antd';
import { GoGoal } from 'react-icons/go';

const data = [
  { totalPlanned: 301, label: 'KPI', achieved: 120, percentage: 50 },
  { totalPlanned: 234, label: 'Milestone', achieved: 120, percentage: 50 },
  { totalPlanned: 563, label: 'Achieve', achieved: 120, percentage: 50 },
];

const Header = () => {
  return (
    <div className="flex space-x-4  overflow-x-auto w-full mb-4 scrollbar-thumb-rounded-full scrollbar-thumb-white scrollbar-track-gray-300 scrollbar-track-rounded-full scrollbar-thin">
      {data.map((item, index) => (
        <Card
          key={index}
          className="rounded-lg shadow-lg min-w-[300px] bg-white text-center relative p-0"
          bordered={false}
          bodyStyle={{ padding: '6px' }}
        >
          <div className="flex items-center justify-between">
            <div className="bg-gray-100 rounded-md">
              <GoGoal size={12} className="text-[#7152F3] w-8 h-8 p-2" />
            </div>
            <div className=" text-green-500 text-xs font-bold">12.7 ↑</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="">
              <div className="text-xl font-bold ">{item.totalPlanned}</div>
            </div>
            <div className="">
              <div className="text-xs text-gray-400 text-end">
                <span className="text-blue"> {item.achieved}</span> Key Results
                achieved
              </div>
              <Progress
                percent={item.percentage}
                showInfo={false}
                strokeColor="#4c6ef5"
                trailColor="#f5f5f5"
              />
            </div>
          </div>

          <div className="text-gray-500 mb-1 w-full text-start text-xs">
            Total Planned
          </div>
          <div className="flex justify-end">
            <div className="bg-light_purple text-purple px-4 py-1  rounded-lg min-w-28">
              {item.label}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Header;
