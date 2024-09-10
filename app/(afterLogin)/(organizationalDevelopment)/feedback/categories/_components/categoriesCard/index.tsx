'use client';
import React from 'react';
import { Card, Typography, Dropdown, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { FaEllipsisVertical } from 'react-icons/fa6';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { FaCircle } from 'react-icons/fa';
import CategoryPagination from '../categoryPagination';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

const CategoriesCard: React.FC = () => {
  const { current, pageSize, totalPages, setCurrent, setPageSize } =
    CategoriesManagementStore();
  const id = 'qwerty45678';
  const menu = [
    {
      key: 'edit',
      label: 'Edit',
      onClick: () => handleMenuClick('edit'),
    },
    {
      key: 'delete',
      label: 'Delete',
      onClick: () => handleMenuClick('delete'),
    },
  ];

  const handleChange = (page: number, pageSize: number) => {
    setCurrent(page);
    setPageSize(pageSize);
  };

  const handleShowSizeChange = (size: number) => {
    setPageSize(size);
    setCurrent(1);
  };
  const handleMenuClick = (key: string) => {
    <div>{key}</div>;
  };

  return (
    <>
      <Card hoverable className="w-[300px] relative bg-gray-100">
        <div className="flex justify-between items-center mb-2">
          <Title level={4} className="m-0">
            Survey
          </Title>
          <Dropdown
            menu={{ items: menu }}
            trigger={['click']}
            placement="bottomRight"
          >
            <FaEllipsisVertical className="text-lg text-gray-400 cursor-pointer" />
          </Dropdown>
        </div>
        <Link href={`/feedback/categories/${id}`}>
          <Paragraph className="text-gray-600">
            This is test description. This is test description. This is test
            description. This is test description.
          </Paragraph>
          <div className="flex items-center mt-4">
            <Avatar icon={<UserOutlined />} />
            <div className="ml-2 flex flex-col">
              <div className="flex items-center justify-start gap-1">
                <Typography.Text strong>John Doe</Typography.Text>
                <FaCircle size={8} color="#3636f0" />
                <Typography.Text className="text-xs font-normal text-gray-400">
                  Creator
                </Typography.Text>
              </div>

              <Typography.Text type="secondary">
                Marketing Manager
              </Typography.Text>
            </div>
          </div>
        </Link>
      </Card>
      <CategoryPagination
        current={current}
        total={totalPages}
        pageSize={pageSize}
        onChange={handleChange}
        onShowSizeChange={handleShowSizeChange}
      />
    </>
  );
};

export default CategoriesCard;
