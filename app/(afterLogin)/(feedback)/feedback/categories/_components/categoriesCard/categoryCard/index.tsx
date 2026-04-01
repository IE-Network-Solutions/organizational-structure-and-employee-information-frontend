import React from 'react';
import { Card, Typography, Dropdown, MenuProps } from 'antd';
import { FaEllipsisVertical, FaCircle } from 'react-icons/fa6';
import Link from 'next/link';
import Image from 'next/image';
import { useGetUsersById } from '@/store/server/features/feedback/category/queries';
const Avatar = '/gender_neutral_avatar.jpg';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const { Title, Paragraph } = Typography;

interface CategoryCardProps {
  category: any;
  onMenuClick: (key: string, category: any) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onMenuClick,
}) => {
  const { data: userData } = useGetUsersById();

  const { rows } = CategoriesManagementStore();

  const items = [
    {
      key: 'edit',
      label: 'Edit',
      onClick: () => onMenuClick('edit', category),
      permissions: [Permissions.UpdateFormCategory],
    },
    {
      key: 'delete',
      label: 'Delete',
      onClick: () => onMenuClick('delete', category),
      permissions: [Permissions.DeleteFormCategory],
    },
  ];

  const filteredItems = items.filter((item) => {
    return AccessGuard.checkAccess({ permissions: item.permissions });
  });

  const menuItems: MenuProps['items'] = filteredItems.map((item) => ({
    key: item.key,
    label: (
      <span
        onClick={item.onClick}
        data-cy={`category-card-menu-item-${item.key}`}
      >
        {item.label}
      </span>
    ),
  }));

  return (
    <Card
      hoverable
      className="w-[280px] relative bg-gray-100 h-min-screen flex flex-col justify-between"
      data-cy={`feedback-categories-components-categoriescard-categorycard-card-${category?.id}`}
      id={`feedback-categories-components-categoriescard-categorycard-card-${category?.id}`}
    >
      <div
        className="flex justify-between items-center mb-2"
        data-cy={`feedback-categories-components-categoriescard-categorycard-div-header-${category?.id}`}
        id={`feedback-categories-components-categoriescard-categorycard-div-header-${category?.id}`}
      >
        <Link
          href={`/feedback/categories/${category?.id}`}
          data-cy={`feedback-categories-components-categoriescard-categorycard-link-${category?.id}`}
          id={`feedback-categories-components-categoriescard-categorycard-link-${category?.id}`}
        >
          <Title
            level={4}
            className="m-0"
            data-cy={`feedback-categories-components-categoriescard-categorycard-title-${category?.id}`}
            id={`feedback-categories-components-categoriescard-categorycard-title-${category?.id}`}
          >
            {category?.name}
          </Title>
        </Link>
        <Dropdown
          menu={{ items: menuItems }}
          trigger={['click']}
          placement="bottomRight"
          data-cy={`feedback-categories-components-categoriescard-categorycard-dropdown-${category?.id}`}
        >
          <FaEllipsisVertical
            className="text-lg text-gray-400 cursor-pointer"
            data-cy={`feedback-categories-components-categoriescard-categorycard-icon-menu-${category?.id}`}
            id={`feedback-categories-components-categoriescard-categorycard-icon-menu-${category?.id}`}
          />
        </Dropdown>
      </div>
      <Link
        href={`/feedback/categories/${category?.id}`}
        data-cy={`feedback-categories-components-categoriescard-categorycard-link-content-${category?.id}`}
        id={`feedback-categories-components-categoriescard-categorycard-link-content-${category?.id}`}
      >
        <Paragraph
          ellipsis={{ rows }}
          className="text-gray-600 h-[50px]"
          data-cy={`feedback-categories-components-categoriescard-categorycard-paragraph-${category?.id}`}
          id={`feedback-categories-components-categoriescard-categorycard-paragraph-${category?.id}`}
        >
          {category?.description}
        </Paragraph>
        <div
          className="flex items-center mt-4"
          data-cy={`feedback-categories-components-categoriescard-categorycard-div-user-${category?.id}`}
          id={`feedback-categories-components-categoriescard-categorycard-div-user-${category?.id}`}
        >
          <Image
            src={userData?.profileImage ?? Avatar}
            alt="Profile pic"
            width={30}
            height={50}
            className="rounded-full object-fit"
            data-cy={`feedback-categories-components-categoriescard-categorycard-image-${category?.id}`}
            id={`feedback-categories-components-categoriescard-categorycard-image-${category?.id}`}
          />
          <div
            className="ml-2 flex flex-col"
            data-cy={`feedback-categories-components-categoriescard-categorycard-div-user-info-${category?.id}`}
            id={`feedback-categories-components-categoriescard-categorycard-div-user-info-${category?.id}`}
          >
            <div
              className="flex flex-wrap md:gap-0 items-center justify-between gap-4 "
              data-cy={`feedback-categories-components-categoriescard-categorycard-div-user-name-${category?.id}`}
              id={`feedback-categories-components-categoriescard-categorycard-div-user-name-${category?.id}`}
            >
              <div
                data-cy={`feedback-categories-components-categoriescard-categorycard-div-name-${category?.id}`}
                id={`feedback-categories-components-categoriescard-categorycard-div-name-${category?.id}`}
              >
                <Typography.Text
                  strong
                  data-cy={`feedback-categories-components-categoriescard-categorycard-text-name-${category?.id}`}
                  id={`feedback-categories-components-categoriescard-categorycard-text-name-${category?.id}`}
                >
                  {(userData?.firstName ?? 'Unknown') +
                    ' ' +
                    (userData?.middleName ?? '-')}
                </Typography.Text>
              </div>
              <div
                className="flex justify-center items-center gap-1"
                data-cy={`feedback-categories-components-categoriescard-categorycard-div-creator-${category?.id}`}
                id={`feedback-categories-components-categoriescard-categorycard-div-creator-${category?.id}`}
              >
                <FaCircle
                  size={8}
                  color="#3636f0"
                  data-cy={`feedback-categories-components-categoriescard-categorycard-icon-circle-${category?.id}`}
                  id={`feedback-categories-components-categoriescard-categorycard-icon-circle-${category?.id}`}
                />
                <Typography.Text
                  className="text-xs font-normal text-gray-400"
                  data-cy={`feedback-categories-components-categoriescard-categorycard-text-creator-${category?.id}`}
                  id={`feedback-categories-components-categoriescard-categorycard-text-creator-${category?.id}`}
                >
                  Creator
                </Typography.Text>
              </div>
            </div>
            <Typography.Text
              type="secondary"
              data-cy={`feedback-categories-components-categoriescard-categorycard-text-role-${category?.id}`}
              id={`feedback-categories-components-categoriescard-categorycard-text-role-${category?.id}`}
            >
              <span
                className="capitalize"
                data-cy={`feedback-categories-components-categoriescard-categorycard-span-role-${category?.id}`}
                id={`feedback-categories-components-categoriescard-categorycard-span-role-${category?.id}`}
              >
                {userData?.role?.name}
              </span>
            </Typography.Text>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default CategoryCard;
