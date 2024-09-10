import React from 'react';
import { Card, Typography, Dropdown, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { FaEllipsisVertical, FaCircle } from 'react-icons/fa6';
import Link from 'next/link';
import Image from 'next/image';
import { useGetUsersById } from '@/store/server/features/feedback/category/queries';

const { Title, Paragraph } = Typography;

interface CategoryCardProps {
  category: any;
  onMenuClick: (key: string, category: any) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onMenuClick,
}) => {
  const { data: userData } = useGetUsersById(category?.createdBy);
  return (
    <Card hoverable className="w-[280px] relative bg-gray-100">
      <div className="flex justify-between items-center mb-2">
        <Title level={4} className="m-0">
          {category?.name}
        </Title>
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Edit',
                onClick: () => onMenuClick('edit', category),
              },
              {
                key: 'delete',
                label: 'Delete',
                onClick: () => onMenuClick('delete', category),
              },
            ],
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <FaEllipsisVertical className="text-lg text-gray-400 cursor-pointer" />
        </Dropdown>
      </div>
      <Link href={`/feedback/categories/${category?.id}`}>
        <Paragraph className="text-gray-600">{category?.description}</Paragraph>
        <div className="flex items-center mt-4">
          <Image
            src={
              category?.createdBy?.profileImage ? (
                category?.createdBy?.profileImage
              ) : (
                <Avatar icon={<UserOutlined />} />
              )
            }
            alt="Profile pic"
            width={30}
            height={50}
            className="rounded-full object-fit"
          />

          <div className="ml-2 flex flex-col">
            <div className="flex items-center justify-start gap-1">
              <Typography.Text strong>
                {userData?.createdBy?.firstName +
                  ' ' +
                  userData?.createdBy?.middleName}
              </Typography.Text>
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
  );
};

export default CategoryCard;
