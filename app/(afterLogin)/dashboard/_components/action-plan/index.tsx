import { Card } from 'antd';
import Calender from './calender';
import Lists from './Lists';

export default function ActionPlans() {
  return (
    <Card className="flex justify-between px-2 pt-1 items-center ">
      <div className="text-lg  font-bold text-gray-400">Schedule</div>{' '}
      <Calender />
      <Lists />
    </Card>
  );
}
