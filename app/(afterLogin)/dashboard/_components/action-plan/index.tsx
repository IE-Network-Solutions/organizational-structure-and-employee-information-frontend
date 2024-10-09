import { Calendar, List } from 'antd';

const tasks = [
  { time: '09:30', task: 'Klaus Application Practical Task Review' },
  { time: '12:00', task: 'Resume Review' },
  { time: '01:30', task: 'Human Resources Final HR Round' },
  { time: '09:30', task: 'Klaus Application Practical Task Review' },
  { time: '12:00', task: 'Resume Review' },
  { time: '01:30', task: 'Human Resources Final HR Round' },
  { time: '01:30', task: 'Human Resources Final HR Round' },
];

export default function ActionPlans() {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Delegated Action Plans</h2>
      <div className="grid ">
        <Calendar fullscreen={false} />
        <List
          header={<div>Tasks for July 5, 2023</div>}
          dataSource={tasks}
          renderItem={(item) => (
            <List.Item className="my-4">
              <div>{item.time}</div>
              <div>{item.task}</div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}
