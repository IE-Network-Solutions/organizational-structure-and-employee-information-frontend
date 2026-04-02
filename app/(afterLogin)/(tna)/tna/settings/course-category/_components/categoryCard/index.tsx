import { useDeleteCourseCategory } from '@/store/server/features/tna/courseCategory/mutation';
import { Permissions } from '@/types/commons/permissionEnum';
import { CourseCategory } from '@/types/tna/course';
import AccessGuard from '@/utils/permissionGuard';
import { Button, Dropdown, MenuProps, Popconfirm } from 'antd';
import React, { FC } from 'react';

/** Three-dot horizontal icon matching the reference image */
const DotsIcon = () => (
  <svg
    data-cy="tna-course-category-dots-icon"
    width="14"
    height="4"
    viewBox="0 0 14 4"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      data-cy="tna-dots-circle-1"
      cx="2.5"
      cy="2"
      r="1.5"
      fill="currentColor"
    />
    <circle
      data-cy="tna-dots-circle-2"
      cx="7"
      cy="2"
      r="1.5"
      fill="currentColor"
    />
    <circle
      data-cy="tna-dots-circle-3"
      cx="11.5"
      cy="2"
      r="1.5"
      fill="currentColor"
    />
  </svg>
);

interface CourseCategoryCardProps {
  item: CourseCategory;
  /** Highlight the row when it is being edited */
  isActive?: boolean;
  onEdit: (item: CourseCategory) => void;
  onDeleted?: (id: string) => void;
  'data-cy'?: string;
}

const CourseCategoryCard: FC<CourseCategoryCardProps> = ({
  item,
  isActive,
  onEdit,
  onDeleted,
  'data-cy': dataCy,
}) => {
  const { mutate: deleteCategory, isLoading } = useDeleteCourseCategory();

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: (
        <span
          data-cy={`tna-course-category-menu-edit-${item.id}`}
          className="text-[14px] font-normal"
        >
          Edit
        </span>
      ),
      onClick: () => onEdit(item),
    },
    {
      key: 'delete',
      label: (
        <Popconfirm
          title="Are you sure you want to delete?"
          okText="Yes"
          cancelText="No"
          onConfirm={() => {
            deleteCategory([item.id], {
              onSuccess: () => onDeleted?.(item.id),
            });
          }}
          disabled={isLoading}
        >
          <span
            data-cy={`tna-course-category-menu-delete-${item.id}`}
            className="text-error text-[14px] font-normal"
          >
            Delete
          </span>
        </Popconfirm>
      ),
    },
  ];

  const hasDescription = !!item.description;

  return (
    <div
      className={[
        'flex items-center justify-between px-4 py-3 border rounded-lg bg-white',
        isActive ? 'border-[#1677FF]' : 'border-[#D9D9D9]',
      ].join(' ')}
      id={`tnaCourseCategoryCard${item.id}Id`}
      data-cy={dataCy ?? `tna-course-category-card-${item.id}`}
    >
      {/* Title + optional description */}
      <div
        data-cy={`tna-course-category-card-text-${item.id}`}
        className="flex-1 min-w-0 pr-3 flex flex-col gap-1"
      >
        <div
          className="text-[14px] font-normal text-black leading-snug truncate"
          id={`tnaCourseCategoryCardTitle${item.id}Id`}
          data-cy={`tna-course-category-card-title-${item.id}`}
        >
          {item.title}
        </div>

        {hasDescription && (
          <div
            className="text-[14px] font-normal leading-snug truncate"
            style={{ color: 'rgba(0,0,0,0.45)' }}
            data-cy={`tna-course-category-card-description-${item.id}`}
          >
            {item.description}
          </div>
        )}
      </div>

      {/* Three-dot dropdown */}
      <AccessGuard
        permissions={[
          Permissions.UpdateCourseCategory,
          Permissions.DeleteCourseCategory,
        ]}
        data-cy={`tna-course-category-card-action-guard-${item.id}`}
        id={`tnaCourseCategoryCardActionGuard${item.id}Id`}
      >
        <Dropdown
          trigger={['click']}
          menu={{ items: menuItems }}
          placement="bottomRight"
        >
          <Button
            type="text"
            disabled={isLoading}
            className="!w-8 !h-8 !min-w-8 !min-h-8 flex items-center justify-center border border-[#D9D9D9] rounded-lg hover:!bg-gray-50 shrink-0"
            id={`tna-course-category-card-menu-btn-${item.id}`}
            data-cy={`tna-course-category-card-menu-btn-${item.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              data-cy={`tna-course-category-card-menu-icon-${item.id}`}
              className="text-[#737373]"
            >
              <DotsIcon />
            </span>
          </Button>
        </Dropdown>
      </AccessGuard>
    </div>
  );
};

export default CourseCategoryCard;
