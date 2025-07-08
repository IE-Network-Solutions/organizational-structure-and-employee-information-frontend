import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const columns: ColumnsType<any> = [
  {
    title: 'Criteria',
    dataIndex: 'criteria',
    key: 'criteria',
    render: (value, record) => {
      return (
        <div className="bg-gray-300 h-full p-3 rounded-lg">{record.name}</div>
      );
    },
  },
  {
    title: 'Weight',
    dataIndex: 'weight',
    key: 'weight',
  },
  {
    title: 'Operator',
    dataIndex: 'operator',
    key: 'operator',
  },
  {
    title: 'Condition',
    dataIndex: 'condition',
    key: 'condition',
  },
  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
  },
  {
    title: 'Score',
    dataIndex: 'score',
    key: 'score',
  },
];

interface EmployeeScoreCardProps {
  data: any; // Replace 'any' with a more specific type if possible
}
export default function EmployeeScoreCard({ data }: EmployeeScoreCardProps) {
  const totalPoints = data?.reduce((acc: any, item: any) => {
    // You can customize the score logic based on item.operator and item.weight
    const weightedScore = ((item.score ?? 0) * 100) / (item.weight ?? 1);
    return acc + (item.operator === '-' ? -weightedScore : weightedScore);
  }, 0);
  return (
    <>
      {data?.length > 0 ? (
        <div className="flex p-4 space-y-6 items-center">
          <Card bodyStyle={{ padding: 0 }} className="p-4 border-none">
            <Table dataSource={data} columns={columns} pagination={false} />
          </Card>
          <Card bodyStyle={{ padding: 0 }} className="p-4 border-none text-sm">
            <p className="font-semibold mb-2">Score</p>
            {data.map((item: any) => (
              <p key={item.id}>
                {item.name}: {item.operator} ({item.score} × 100 / {item.weight}
                ) = {item.operator === '-' ? '-' : ''}{' '}
                {(((item.score ?? 0) * 100) / (item.weight ?? 1)).toFixed(2)}
              </p>
            ))}
            <p className="font-bold text-lg mt-2">{totalPoints.toFixed(2)}</p>
          </Card>
        </div>
      ) : (
        <div className="flex justify-center items-center h-full py-5">
          {' '}
          No criteria found for this recognition type
        </div>
      )}
    </>
  );
}
