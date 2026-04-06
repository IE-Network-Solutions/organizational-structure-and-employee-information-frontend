import { useDeleteCourseCategory } from '@/store/server/features/tna/courseCategory/mutation';
import { Permissions } from '@/types/commons/permissionEnum';
import { CourseCategory } from '@/types/tna/course';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import AccessGuard from '@/utils/permissionGuard';
import { Button, Dropdown, MenuProps } from 'antd';
import React, { FC, useCallback, useState } from 'react';

interface TriggerRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Edit row icon (spec SVG) */
const CourseCategoryMenuEditIcon = () => (
  <svg
    data-cy="tna-course-category-menu-edit-icon"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      data-cy="tna-course-category-menu-edit-icon-path"
      d="M11.8067 2.69333C12.0667 2.43333 12.0667 2.01333 11.8067 1.75333L10.2467 0.193333C10.1133 0.06 9.94667 0 9.77333 0C9.6 0 9.43333 0.0666666 9.30667 0.193333L8.08667 1.41333L10.5867 3.91333L11.8067 2.69333V2.69333ZM0 9.5V12H2.5L9.87333 4.62667L7.37333 2.12667L0 9.5ZM1.94667 10.6667H1.33333V10.0533L7.37333 4.01333L7.98667 4.62667L1.94667 10.6667Z"
      fill="#323232"
    />
  </svg>
);

/** Delete row icon (spec SVG) */
const CourseCategoryMenuDeleteIcon = () => (
  <svg
    data-cy="tna-course-category-menu-delete-icon"
    width="10"
    height="12"
    viewBox="0 0 10 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      data-cy="tna-course-category-menu-delete-icon-path"
      d="M0.666667 10.6667C0.666667 11.4 1.26667 12 2 12H7.33333C8.06667 12 8.66667 11.4 8.66667 10.6667V2.66667H0.666667V10.6667ZM2 4H7.33333V10.6667H2V4ZM7 0.666667L6.33333 0H3L2.33333 0.666667H0V2H9.33333V0.666667H7Z"
      fill="#323232"
    />
  </svg>
);

/** Three-dot icon — artwork fits in 14×14 px */
const DotsIcon = () => (
  <svg
    data-cy="tna-course-category-dots-icon"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      data-cy="tna-dots-circle-1"
      cx="2.5"
      cy="7"
      r="1.5"
      fill="currentColor"
    />
    <circle
      data-cy="tna-dots-circle-2"
      cx="7"
      cy="7"
      r="1.5"
      fill="currentColor"
    />
    <circle
      data-cy="tna-dots-circle-3"
      cx="11.5"
      cy="7"
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTriggerRect, setDeleteTriggerRect] =
    useState<TriggerRect | null>(null);

  const openDeleteModalAnchored = useCallback(() => {
    const btn = document.querySelector<HTMLElement>(
      `[data-cy="tna-course-category-card-menu-btn-${item.id}"]`,
    );
    if (btn) {
      const r = btn.getBoundingClientRect();
      setDeleteTriggerRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    } else {
      setDeleteTriggerRect(null);
    }
    setDeleteModalOpen(true);
  }, [item.id]);

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: (
        <span
          data-cy={`tna-course-category-menu-edit-${item.id}`}
          className="tna-course-category-menu-row flex items-center gap-2 text-[14px] font-normal leading-none text-black/70"
        >
          <span
            className="shrink-0 w-3 h-3 flex items-center justify-center"
            data-cy={`tna-course-category-menu-edit-icon-wrap-${item.id}`}
          >
            <CourseCategoryMenuEditIcon />
          </span>
          Edit
        </span>
      ),
      onClick: () => onEdit(item),
    },
    {
      key: 'delete',
      label: (
        <span
          data-cy={`tna-course-category-menu-delete-${item.id}`}
          className="tna-course-category-menu-row flex items-center gap-2 text-[14px] font-normal leading-none text-black/70"
        >
          <span
            className="shrink-0 w-3 h-3 flex items-center justify-center"
            data-cy={`tna-course-category-menu-delete-icon-wrap-${item.id}`}
          >
            <CourseCategoryMenuDeleteIcon />
          </span>
          Delete
        </span>
      ),
      onClick: () => openDeleteModalAnchored(),
    },
  ];

  const hasDescription = !!item.description;

  return (
    <div
      className={[
        'flex items-center justify-between px-3 py-2.5 lg:px-4 lg:py-3 border rounded-lg bg-white',
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
          className="text-[13px] lg:text-[14px] font-semibold text-black leading-snug truncate lg:font-normal"
          id={`tnaCourseCategoryCardTitle${item.id}Id`}
          data-cy={`tna-course-category-card-title-${item.id}`}
        >
          {item.title}
        </div>

        {hasDescription && (
          <div
            className="text-[13px] lg:text-[14px] font-normal leading-snug truncate"
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
          overlayClassName="tna-course-category-menu-overlay"
        >
          <Button
            type="text"
            disabled={isLoading}
            className="!w-6 !h-6 !min-w-6 !min-h-6 !p-0 flex items-center justify-center border border-[#D9D9D9] rounded-[4px] hover:!bg-gray-50 shrink-0"
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

      <DeleteModal
        open={deleteModalOpen}
        loading={isLoading}
        title="Delete"
        deleteMessage="Are you sure you want to delete this course category?"
        hideImage
        danger
        triggerRect={deleteTriggerRect ?? undefined}
        onCancel={() => setDeleteModalOpen(false)}
        onAfterClose={() => setDeleteTriggerRect(null)}
        onConfirm={() => {
          deleteCategory([item.id], {
            onSuccess: () => {
              onDeleted?.(item.id);
              setDeleteModalOpen(false);
            },
          });
        }}
        data-cy={`tna-course-category-delete-confirmation-modal-${item.id}`}
        id={`tnaCourseCategoryDeleteModal${item.id}Id`}
      />
    </div>
  );
};

export default CourseCategoryCard;
