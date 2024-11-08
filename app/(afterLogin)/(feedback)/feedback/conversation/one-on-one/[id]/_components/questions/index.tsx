import React from 'react';
import { Table, Button } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';

interface DataType {
  key: React.Key;
  name: string;
  department: string; // Added department field
  heldDate: string;   // Added heldDate field
  createdBy: string;  // Added createdBy field
  attendees: number;  // Added attendees field
}

const columns: TableColumnsType<DataType> = [
  {
    title: 'Type',
    dataIndex: 'heldDate',
    sorter: (a, b) => new Date(a.heldDate).getTime() - new Date(b.heldDate).getTime(),
  },
  {
    title: 'Givent To',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: 'Given By',
    dataIndex: 'department',
    sorter: (a, b) => a.department.localeCompare(b.department),
  },
  {
    title: 'Given Date',
    dataIndex: 'createdBy',
    sorter: (a, b) => a.createdBy.localeCompare(b.createdBy),
  },
  {
    title: 'Attendees',
    dataIndex: 'attendees',
    sorter: (a, b) => a.attendees - b.attendees,
  },
  {
    title: 'Action',
    dataIndex: 'action',
    width:100,
    render: (_, record) => (
      <div className="flex space-x-2">
        <Button type="primary" onClick={() => handleEdit(record.key)}>Edit</Button>
        <Button type="primary" danger onClick={() => handleDelete(record.key)}>Delete</Button>
      </div>
    ),
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    department: 'HR',              // Added department value
    heldDate: '2023-11-01',        // Added heldDate value
    createdBy: 'Admin',            // Added createdBy value
    attendees: 10,                 // Added attendees value
  },
  {
    key: '2',
    name: 'Jim Green',
    department: 'IT',
    heldDate: '2023-11-02',
    createdBy: 'Admin',
    attendees: 15,
  },
  {
    key: '3',
    name: 'Joe Black',
    department: 'Finance',
    heldDate: '2023-11-03',
    createdBy: 'Admin',
    attendees: 20,
  },
  {
    key: '4',
    name: 'Jim Red',
    department: 'Sales',
    heldDate: '2023-11-04',
    createdBy: 'Admin',
    attendees: 5,
  },
];

const handleEdit = (key: React.Key) => {
  console.log('Edit:', key);
  // Implement your edit logic here
};

const handleDelete = (key: React.Key) => {
  console.log('Delete:', key);
  // Implement your delete logic here
};

const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
  console.log('params', pagination, filters, sorter, extra);
};

const QuestionDataTable: React.FC = () => (
  <div className="overflow-x-auto"> {/* Make the table scrollable on smaller screens */}
    <Table<DataType>
      columns={columns}
      dataSource={data}
      onChange={onChange}
      pagination={{ pageSize: 5 }} // Set the number of rows per page
      scroll={{ x: 800 }} // Enable horizontal scrolling for responsive design
    />
  </div>
);

export default QuestionDataTable;
