'use client';
import React from 'react';
import {
  Card,
  Typography,
  Dropdown,
  Divider,
  Flex,
  Progress,
  Row,
  Col,
} from 'antd';
import { FaEllipsisVertical } from 'react-icons/fa6';
import Link from 'next/link';
import { FaArrowRightLong } from 'react-icons/fa6';
import { FaPlus } from 'react-icons/fa';
import { SubcategoryCardProps } from '@/store/uistate/features/feedback/categories/interface';
import CustomButton from '@/components/common/buttons/customButton';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import DynamicForm from '../dynamicForm';

const { Title, Paragraph } = Typography;

const SubcategoryCard: React.FC<SubcategoryCardProps> = ({
  id,
  title,
  description,
  startDate,
  endDate,
  completedCount,
  totalCount,
  resolvedCount,
}) => {
  const { setIsAddOpen } = CategoriesManagementStore();

  const getStrokeColor = (percent: number) => {
    if (percent < 30) return '#F44336';
    if (percent < 50) return '#FFA500';
    if (percent < 70) return '#63b7f1';
    if (percent > 70) return '#55c790';
    return '#4CAF50';
  };
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

  const handleMenuClick = (key: string) => {
    <div>{key}</div>;
  };

  const showDrawer = () => {
    setIsAddOpen(true);
  };

  const onClose = () => {
    setIsAddOpen(false);
  };

  const renderProgress = (
    percent: number,
    completed: number,
    total: number,
    label: string,
  ) => (
    <div className="text-center">
      <Progress
        type="circle"
        percent={percent}
        width={80}
        strokeColor={getStrokeColor(percent)}
        format={(percent) => `${Math.round(percent ?? 0)}%`}
      />
      <div className="mt-2">
        <div className="text-sm font-bold text-gray-700">
          {percent ? Math.round(percent).toLocaleString() : 0}%
        </div>
        <div className="text-xs text-gray-500">
          {`${completed.toLocaleString()}/${total.toLocaleString()} ${label}`}
        </div>
      </div>
    </div>
  );

  const cardContent = (
    <>
      <div className="flex justify-between items-start mb-2">
        <Title level={5} className="m-0">
          {title}
        </Title>
        <Dropdown
          menu={{ items: menu }}
          trigger={['click']}
          placement="bottomRight"
        >
          <FaEllipsisVertical className="text-lg text-gray-400 cursor-pointer" />
        </Dropdown>
      </div>
      <Link href={`/feedback/categories/${id}/subcategories`}>
        <Paragraph className="text-gray-600">{description}</Paragraph>
        <div className="flex flex-wrap items-center justify-between gap-1 text-gray-400 mx-5">
          <p>{startDate}</p> <FaArrowRightLong /> <p>{endDate}</p>
        </div>
        <Divider className="text-gray-300" />
      </Link>
    </>
  );
  return (
    <>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12}>
          <Card hoverable className="w-[300px] h-full relative bg-gray-100">
            {cardContent}
            <Flex gap="small" wrap justify="center">
              {renderProgress(
                ((completedCount ?? 0) / (totalCount ?? 1)) * 100,
                completedCount ?? 0,
                totalCount ?? 1,
                'Completed',
              )}
              {renderProgress(
                ((resolvedCount ?? 0) / (totalCount ?? 1)) * 100,
                resolvedCount ?? 0,
                totalCount ?? 1,
                'Resolved',
              )}
            </Flex>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card hoverable className="w-[300px] h-full relative bg-gray-100">
            {cardContent}
            <div className="flex items-center justify-center mx-5">
              <CustomButton
                title="Add Questions"
                icon={<FaPlus size={13} className="mr-2" />}
                onClick={showDrawer}
                className="text-gray-800 border-1 border-gray-500 bg-white font-light mx-5"
              />
            </div>
          </Card>
        </Col>
      </Row>
      <DynamicForm onClose={onClose} />
    </>
  );
};

export default SubcategoryCard;
