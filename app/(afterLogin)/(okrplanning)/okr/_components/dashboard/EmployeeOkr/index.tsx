import React from "react";
import { Table, Button, Dropdown, Menu, Avatar } from "antd";
import { DownOutlined } from "@ant-design/icons";

interface Employee {
  key: string;
  name: string;
  email: string;
  title: string;
  role: string;
  department: string;
  quarter: string;
  score: number;
}

const employees: Employee[] = [
  {
    key: "1",
    name: "Mathias Abdissa",
    email: "mathias@enetwork.co",
    title: "UI UX Designer",
    role: "PM",
    department: "Saas",
    quarter: "FY2017 Q3",
    score: 90,
  },
  {
    key: "2",
    name: "Hanna Baptista",
    email: "hanna@enetwork.co",
    title: "Graphic Designer",
    role: "CFO",
    department: "Saas",
    quarter: "FY2017 Q3",
    score: 60,
  },
  {
    key: "3",
    name: "Miracle Geict",
    email: "miracle@enetwork.co",
    title: "Finance",
    role: "SO",
    department: "Saas",
    quarter: "FY2017 Q3",
    score: 85,
  },
  {
    key: "4",
    name: "Rayna Torff",
    email: "rayna@enetwork.co",
    title: "Project Manager",
    role: "SO",
    department: "Saas",
    quarter: "FY2017 Q3",
    score: 75,
  },
  {
    key: "5",
    name: "Giana Lipshutz",
    email: "giana@enetwork.co",
    title: "Creative Director",
    role: "PM",
    department: "Saas",
    quarter: "FY2017 Q3",
    score: 90,
  },
  {
    key: "6",
    name: "James George",
    email: "james@enetwork.co",
    title: "Lead Designer",
    role: "Designer",
    department: "Saas",
    quarter: "FY2017 Q3",
    score: 60,
  },
  {
    key: "7",
    name: "Jordyn George",
    email: "jordyn@enetwork.co",
    title: "IT Support",
    role: "Saas TL",
    department: "Saas",
    quarter: "FY2017 Q3",
    score: 90,
  },
  {
    key: "8",
    name: "Skylar Herwitz",
    email: "skylar@enetwork.co",
    title: "3D Designer",
    role: "Admin",
    department: "Saas",
    quarter: "FY2017 Q3",
    score: 100,
  },
];

const getScoreTag = (score: number): JSX.Element => {
  if (score >= 90)
    return <span className="block w-24 text-center bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">{score}%</span>;
  if (score >= 75)
    return <span className="block w-24 text-center bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">{score}%</span>;
  return <span className="block w-24 text-center bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">{score}%</span>;
};

const columns = [
  {
    title: "Employee Name",
    dataIndex: "name",
    key: "name",
    render: (_: string, record: Employee) => (
      <div className="flex items-center gap-2">
         {!true ? (
                            <Avatar size={30}  />
                          ) : (
                            <Avatar size={30}>
                              {record.name[0]?.toUpperCase()}{' '}
                              {record.name[0]?.toUpperCase()}
                              
                            </Avatar>
                          )}
                          <div>
        <div className="font-medium text-gray-900">{record.name}</div>
        <div className="text-gray-500 text-sm">{record.email}</div>
        </div>
      </div>
    ),
  },
  {
    title: "Job Title",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
  },
  {
    title: "Department",
    dataIndex: "department",
    key: "department",
  },
  {
    title: "Quarter",
    dataIndex: "quarter",
    key: "quarter",
  },
  {
    title: "OKR Score",
    dataIndex: "score",
    key: "score",
    render: (score: number) => getScoreTag(score),
  },
];

const EmployeeOKRTable: React.FC = () => {
  

  return (
    <div className="py-6">
      <div className="flex gap-4 mb-4">
        
      </div>
      <Table
        columns={columns}
        dataSource={employees}
        pagination={{ pageSize: 8, showSizeChanger: true, total: 50 }}
      />
    </div>
  );
};

export default EmployeeOKRTable;
