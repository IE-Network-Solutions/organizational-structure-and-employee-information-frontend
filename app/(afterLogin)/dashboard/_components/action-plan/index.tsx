import { Card } from 'antd';
import Calender from './calender';
import Lists from './Lists';

export default function ActionPlans() {
  return (
    <Card className="flex justify-between px-2 pt-1 items-center shadow-lg">
      <div
        className="text-base lg:text-xl  font-bold "
        data-cy="schedule-title"
      >
        Schedule
      </div>
      <Calender />
      <Lists />
    </Card>
  );
}
