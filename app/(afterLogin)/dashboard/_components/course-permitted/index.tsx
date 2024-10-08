// components/CoursePermitted.tsx
import { Progress, Select } from 'antd';
import { FC } from 'react';

const { Option } = Select;

interface CoursePermittedProps {
  total: number;
  categories: { name: string; value: number; color: string }[];
}

const CoursePermitted: FC<CoursePermittedProps> = ({ total, categories }) => {
  //   const getPercent = (value: number) => (value / total) * 100;

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg w-full">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-gray-700 font-semibold text-lg">
          Course Permitted
        </h4>
        <Select
          bordered={false}
          defaultValue="All Time"
          className="text-gray-500"
        >
          <Option value="All Time">All Time</Option>
          <Option value="This Year">This Year</Option>
          <Option value="This Month">This Month</Option>
        </Select>
      </div>

      <div className="flex justify-center items-center relative mb-4">
        <Progress
          type="circle"
          percent={100}
          //   format={() => `${total} Total`}
          strokeWidth={10}
          strokeColor="#4a90e2"
          trailColor="#e4e4e7"
          width={160}
        />
        <div className="absolute inset-0 flex justify-center items-center">
          <span className="text-2xl font-semibold">{total}</span>
        </div>
      </div>

      <ul>
        {categories.map((category, index) => (
          <li key={index} className="flex justify-between items-center my-2">
            <div className="flex items-center">
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: category.color }}
              ></span>
              <span className="text-gray-600">{category.name}</span>
            </div>
            <span className="font-semibold">{category.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CoursePermitted;
