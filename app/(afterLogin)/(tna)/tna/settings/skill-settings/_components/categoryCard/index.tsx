'use client';

import React, { FC, useState } from 'react';
import { Dropdown, MenuProps } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { MdDeleteForever, MdModeEditOutline } from 'react-icons/md';
import { LuPlus } from 'react-icons/lu';
import { GrowthPlanCategory } from '@/types/tna/growthPlan';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteGrowthPlanCategory } from '@/store/server/features/tna/growthPlan/mutations';

interface SkillCategoryCardProps {
  item: GrowthPlanCategory;
  onEdit: (item: GrowthPlanCategory) => void;
  onManageSkills: (item: GrowthPlanCategory) => void;
  onAddSkill: (item: GrowthPlanCategory) => void;
  onDeleted?: (id: string) => void;
}

/**
 * Pattern found: okr/settings/target-assignment — borderless gray card grid.
 */
const SkillCategoryCard: FC<SkillCategoryCardProps> = ({
  item,
  onEdit,
  onManageSkills,
  onAddSkill,
  onDeleted,
}) => {
  const { mutate: deleteCategory, isLoading } = useDeleteGrowthPlanCategory();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const menuItems: MenuProps['items'] = [
    {
      key: 'add',
      label: (
        <div
          className="flex items-center gap-3 py-1"
          data-cy={`tna-skill-category-menu-add-${item.id}`}
        >
          <LuPlus className="text-lg text-[#595959]" />
          <span
            data-cy="tna-settings-skill-settings-categorycard-index-span-42"
            className="text-[15px] text-[#262626]"
          >
            Add skill
          </span>
        </div>
      ),
      onClick: () => onAddSkill(item),
    },
    {
      key: 'edit',
      label: (
        <div
          className="flex items-center gap-3 py-1"
          data-cy={`tna-skill-category-menu-edit-${item.id}`}
        >
          <MdModeEditOutline className="text-xl text-[#595959]" />
          <span
            data-cy="tna-settings-skill-settings-categorycard-index-span-55"
            className="text-[15px] text-[#262626]"
          >
            Edit category
          </span>
        </div>
      ),
      onClick: () => onEdit(item),
    },
    { type: 'divider' },
    {
      key: 'delete',
      label: (
        <div
          className="flex items-center gap-3 py-1 text-red-600"
          data-cy={`tna-skill-category-menu-delete-${item.id}`}
        >
          <MdDeleteForever className="text-xl" />
          <span
            data-cy="tna-settings-skill-settings-categorycard-index-span-69"
            className="text-[15px]"
          >
            Delete category
          </span>
        </div>
      ),
      onClick: () => setDeleteModalOpen(true),
    },
  ];

  return (
    <div
      className="relative cursor-pointer rounded-[8px] bg-[#F9FAFB] p-5 transition-shadow hover:shadow-sm"
      onClick={() => onManageSkills(item)}
      data-cy={`tna-skill-category-card-${item.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onManageSkills(item);
      }}
    >
      <div
        className="mb-2 flex items-start justify-between"
        data-cy={`tna-skill-category-card-header-${item.id}`}
      >
        <p
          data-cy="tna-settings-skill-settings-categorycard-index-p-91"
          className="mr-2 flex-1 text-[15px] font-semibold leading-tight text-[#262626]"
        >
          {item.name}
        </p>
        <div
          data-cy="tna-settings-skill-settings-categorycard-index-div-94"
          onClick={(e) => e.stopPropagation()}
        >
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <button
              type="button"
              className="flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent text-[#8c8c8c] transition-colors hover:text-[#262626]"
              data-cy={`tna-skill-category-card-menu-${item.id}`}
            >
              <EllipsisOutlined style={{ fontSize: 14 }} />
            </button>
          </Dropdown>
        </div>
      </div>

      <p
        data-cy="tna-settings-skill-settings-categorycard-index-p-111"
        className="mb-0 text-[13px] text-[#8c8c8c]"
      >
        {item.skills.length} skill{item.skills.length === 1 ? '' : 's'}
      </p>

      <DeleteModal
        open={deleteModalOpen}
        loading={isLoading}
        title="Delete"
        deleteMessage="Are you sure you want to delete this skill category and its skills?"
        hideImage
        danger
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          deleteCategory(item.id, {
            onSuccess: () => {
              onDeleted?.(item.id);
              setDeleteModalOpen(false);
            },
          });
        }}
        data-cy={`tna-skill-category-delete-modal-${item.id}`}
      />
    </div>
  );
};

export default SkillCategoryCard;
