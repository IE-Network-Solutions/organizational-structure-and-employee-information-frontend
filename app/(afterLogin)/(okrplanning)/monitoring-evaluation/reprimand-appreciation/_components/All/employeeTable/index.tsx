import React from 'react';
import { Table, Button, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { FaEye } from 'react-icons/fa';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { AppreciationLog } from '@/store/uistate/features/okrplanning/monitoring-evaluation/appreciation-log/interface';
import { AppreciationType } from '@/store/uistate/features/okrplanning/monitoring-evaluation/appreciation-type/interface';
import { ReprimandLog } from '@/store/uistate/features/okrplanning/monitoring-evaluation/reprimand-log/interface';

// Define props interface for EmployeeTable
interface EmployeeTableProps {
  showDeleteModal: (key: string, value: any) => void; // Function to show delete modal
  handleEditModal: (key: string) => void; // Function to handle edit modal
  setDeletedId: (key: string) => void; // Function to handle edit modal
  loading: boolean; // Loading state
  data?: AppreciationLog[] | ReprimandLog[]; // Data items
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  showDeleteModal,
  handleEditModal,
  loading,
  data,
}) => {
  const { data: allUsers } = useGetAllUsers();

  // Function to get employee information based on ID
  function employeeInfo(id: string) {
    return allUsers?.items?.find((user: any) => user.id === id) || {};
  }

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: AppreciationType) => {
        return <span className="ml-2">{type?.name || 'Unknown Type'}</span>;
      },
    },
    {
      title: 'Given to',
      dataIndex: 'recipientId',
      key: 'recipientId',
      render: (recipientId: string) => {
        const user = employeeInfo(recipientId); // Fetch employee info
        return (
          <div className="flex md:flex-row flex-col items-center">
            {user?.profileImage ? (
              <Avatar
                size={40}
                src={
                  user?.profileImage // Fallback in case avatarUrl doesn't exist
                }
              />
            ) : (
              <Avatar size={40} icon={<UserOutlined />}></Avatar>
            )}
            <span className="ml-2">{user?.firstName || 'Unknown User'}</span>
          </div>
        );
      },
    },
    {
      title: 'Given by',
      dataIndex: 'issuerId',
      key: 'issuerId',
      render: (issuerId: string) => {
        const user = employeeInfo(issuerId); // Fetch employee info
        return (
          <div className="flex md:flex-row flex-col items-center">
            <div className="flex md:flex-row flex-col items-center">
              {user?.profileImage ? (
                <Avatar
                  size={40}
                  src={
                    user?.profileImage // Fallback in case avatarUrl doesn't exist
                  }
                />
              ) : (
                <Avatar size={40} icon={<UserOutlined />}></Avatar>
              )}
              <span className="ml-2">{user?.firstName || 'Unknown User'}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Reason',
      dataIndex: 'action',
      key: 'action',
    },

    {
      title: 'Action',
      key: 'action',
      render: (record: Record<string, string> | any) => {
        return (
          <div className="flex space-x-2">
            <Button
              href={
                record?.type?.type === 'appreciation'
                  ? `reprimand-appreciation/appreciation/${record.id}`
                  : `reprimand-appreciation/reprimand/${record.id}`
              }
              className="bg-green-500 text-white border-none"
              icon={<FaEye />}
            />
            <Button
              className="bg-blue text-white border-none"
              icon={<EditOutlined />}
              onClick={() => handleEditModal(record)} // Pass key to edit handler
            />
            <Button
              className="bg-red-500 text-white border-none"
              icon={<DeleteOutlined />}
              onClick={() => showDeleteModal(record.id, record)} // Pass key to delete handler
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Table
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 600 }} // Enables horizontal scrolling if content overflows
        loading={loading} // Display loading state if needed
      />
    </>
  );
};

export default EmployeeTable;
