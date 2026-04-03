/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */
import React from 'react';
import { Card, Typography, Dropdown, MenuProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { FaCircle } from 'react-icons/fa6';
import { MdMoreHoriz } from 'react-icons/md';
import Link from 'next/link';
import Image from 'next/image';
import { useGetUserById } from '@/store/server/features/feedback/category/queries';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

type SurveyCountState = {
  count?: number;
  loading: boolean;
  error: boolean;
};

function legacyFormsCountFromCategory(category: any): number {
  return (
    (category as any)?.formsCount ??
    (category as any)?.formCount ??
    (category as any)?.forms?.length ??
    0
  );
}

interface CategoryCardProps {
  category: any;
  onMenuClick: (key: string, category: any) => void;
  surveyCountState?: SurveyCountState;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onMenuClick,
  surveyCountState,
}) => {
  const creatorId =
    (category as any)?.createdByUserId ??
    (category as any)?.createdById ??
    (category as any)?.createdBy ??
    (category as any)?.createdByUser?.id ??
    (category as any)?.createdBy?.id;
  const { data: creatorData } = useGetUserById(creatorId);
  const creator = creatorData?.item ?? creatorData;
  const creatorFirstName = String(creator?.firstName ?? '').trim();
  const creatorMiddleName = String(creator?.middleName ?? '').trim();
  const creatorDisplayName = `${creatorFirstName} ${creatorMiddleName}`.trim();
  const hasKnownCreator = creatorDisplayName.length > 0;
  const hasCreatorProfileImage =
    typeof creator?.profileImage === 'string' &&
    creator.profileImage.trim() !== '';

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
      className="w-full h-[172px] relative bg-white border border-[#E2E8F0] rounded-xl [&_.ant-card-body]:h-full [&_.ant-card-body]:p-4"
      data-cy={`feedback-categories-components-categoriescard-categorycard-card-${category?.id}`}
      id={`feedback-categories-components-categoriescard-categorycard-card-${category?.id}`}
    >
      <div className="flex flex-col h-full">
        <div
          className="flex items-center justify-between"
          data-cy={`feedback-categories-components-categoriescard-categorycard-div-header-${category?.id}`}
          id={`feedback-categories-components-categoriescard-categorycard-div-header-${category?.id}`}
        >
          <div
            className="text-[18px] font-semibold text-[#4B5563] truncate pr-2"
            data-cy={`feedback-categories-components-categoriescard-categorycard-title-label-${category?.id}`}
            id={`feedback-categories-components-categoriescard-categorycard-title-label-${category?.id}`}
            title={category?.name ?? ''}
          >
            {category?.name ?? '-'}
          </div>

          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
            data-cy={`feedback-categories-components-categoriescard-categorycard-dropdown-${category?.id}`}
          >
            <button
              type="button"
              className="w-10 h-9 flex items-center justify-center border border-[#E5E7EB] rounded-lg bg-white hover:bg-[#F8FAFC] transition-colors shrink-0"
              aria-label="Open menu"
              data-cy={`feedback-categories-components-categoriescard-categorycard-menu-btn-${category?.id}`}
              id={`feedback-categories-components-categoriescard-categorycard-menu-btn-${category?.id}`}
            >
              <MdMoreHoriz
                className="text-[24px] text-[#374151]"
                data-cy={`feedback-categories-components-categoriescard-categorycard-icon-menu-${category?.id}`}
                id={`feedback-categories-components-categoriescard-categorycard-icon-menu-${category?.id}`}
              />
            </button>
          </Dropdown>
        </div>

        <Link
          href={`/feedback/categories/${category?.id}`}
          data-cy={`feedback-categories-components-categoriescard-categorycard-link-content-${category?.id}`}
          id={`feedback-categories-components-categoriescard-categorycard-link-content-${category?.id}`}
          className="flex-1 flex items-center justify-center"
        >
          <div className="text-[22px] sm:text-[24px] font-bold text-[#4B5563] leading-none text-center min-h-[1.5rem] flex items-center justify-center">
            {(() => {
              const loading =
                surveyCountState?.loading &&
                surveyCountState.count === undefined;
              if (loading) {
                return (
                  <span
                    className="inline-block h-7 w-14 rounded-md bg-gray-100 animate-pulse"
                    aria-hidden
                  />
                );
              }
              const n =
                !surveyCountState?.error &&
                typeof surveyCountState?.count === 'number'
                  ? surveyCountState.count
                  : legacyFormsCountFromCategory(category);
              if (n === 0) {
                return <>No forms</>;
              }
              if (n === 1) {
                return <>1 Form</>;
              }
              return <>{`${n} Forms`}</>;
            })()}
          </div>
        </Link>

        <div
          className="flex items-center pt-2 gap-3"
          data-cy={`feedback-categories-components-categoriescard-categorycard-div-user-${category?.id}`}
          id={`feedback-categories-components-categoriescard-categorycard-div-user-${category?.id}`}
        >
          <div
            className="relative w-8 h-8 shrink-0"
            data-cy={`feedback-categories-components-categoriescard-categorycard-image-wrap-${category?.id}`}
            id={`feedback-categories-components-categoriescard-categorycard-image-wrap-${category?.id}`}
          >
            {hasKnownCreator && hasCreatorProfileImage ? (
              <Image
                src={creator.profileImage}
                alt="Profile pic"
                fill
                sizes="32px"
                className="rounded-full object-cover"
                data-cy={`feedback-categories-components-categoriescard-categorycard-image-${category?.id}`}
                id={`feedback-categories-components-categoriescard-categorycard-image-${category?.id}`}
              />
            ) : (
              <div
                className="h-8 w-8 rounded-full border border-[#D1D5DB] bg-white flex items-center justify-center text-[#374151]"
                data-cy={`feedback-categories-components-categoriescard-categorycard-image-${category?.id}`}
                id={`feedback-categories-components-categoriescard-categorycard-image-${category?.id}`}
              >
                <UserOutlined className="text-[14px]" />
              </div>
            )}
          </div>
          <div
            className="flex items-center justify-between w-full gap-3 min-w-0"
            data-cy={`feedback-categories-components-categoriescard-categorycard-div-user-info-${category?.id}`}
            id={`feedback-categories-components-categoriescard-categorycard-div-user-info-${category?.id}`}
          >
            <div className="min-w-0 flex-1">
              <Typography.Text
                strong
                className="text-[#374151] text-[14px] sm:text-[16px] font-semibold block truncate"
                data-cy={`feedback-categories-components-categoriescard-categorycard-text-name-${category?.id}`}
                id={`feedback-categories-components-categoriescard-categorycard-text-name-${category?.id}`}
                title={hasKnownCreator ? creatorDisplayName : 'Unknown user'}
              >
                {hasKnownCreator ? creatorDisplayName : 'Unknown user'}
              </Typography.Text>
              <div
                className="text-[11px] sm:text-[12px] text-gray-400 font-normal leading-tight truncate"
                data-cy={`feedback-categories-components-categoriescard-categorycard-text-role-${category?.id}`}
                id={`feedback-categories-components-categoriescard-categorycard-text-role-${category?.id}`}
                title="Creator"
              >
                Creator
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CategoryCard;
