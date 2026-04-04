'use client';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import React, { useEffect, useState } from 'react';

interface TriggerRect {
  top: number;
  left: number;
  width: number;
  height: number;
}
import { useTalentPoolSettingsStore } from '@/store/uistate/features/recruitment/settings/talentPoolCategory';
import { useGetTalentPoolCategory } from '@/store/server/features/recruitment/tallentPoolCategory/query';
import CustomDeleteTalentPool from '../deleteModal';
import SkeletonLoading from '@/components/common/loadings/skeletonLoading';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import TalentPoolDrawer from '../customDrawer';
import { useSettingsAddButton } from '../../SettingsAddButtonContext';

const canUpdate = () =>
  AccessGuard.checkAccess({
    permissions: [Permissions.UpdateTalentPoolCategory],
  });
const canDelete = () =>
  AccessGuard.checkAccess({
    permissions: [Permissions.DeleteTalentPoolCategory],
  });

function TalentPoolCategoryTab() {
  const { openDrawer, setEditMode, setDeleteMode, setSelectedTalentPool } =
    useTalentPoolSettingsStore();

  const [deleteTriggerRect, setDeleteTriggerRect] =
    useState<TriggerRect | null>(null);

  const { data: talentPoolCategories, isLoading: fetchLoading } =
    useGetTalentPoolCategory(100, 1);

  const handleEditTalentPoolCategory = (data: any): void => {
    openDrawer();
    setEditMode(true);
    setSelectedTalentPool(data);
  };

  const handleDeleteTalentPoolCategory = (data: any): void => {
    const btn = document.querySelector<HTMLElement>(
      `[data-cy="talent-acquisition-talent-pool-category-card-menu-${data?.id}"]`,
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
    setSelectedTalentPool(data);
    setDeleteMode(true);
  };

  const { setAddAction, setAddLabel } = useSettingsAddButton();
  const canCreate = AccessGuard.checkAccess({
    permissions: [Permissions.CreateTalentPool],
  });
  useEffect(() => {
    if (canCreate) {
      setAddAction(() => openDrawer);
      setAddLabel('Add Category');
    }
    return () => {
      setAddAction(null);
      setAddLabel(null);
    };
  }, [setAddAction, setAddLabel, canCreate, openDrawer]);

  return (
    <div
      className="py-3 sm:p-5 rounded-2xl bg-white h-full"
      data-cy="talent-acquisition-talent-pool-category-page-container"
    >
      {/* Talent Pool Category cards grid */}
      <div
        data-cy="settings-talentpoolcategory-talentpoolcategorytab-page-tsx-page-div-94"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full"
      >
        {fetchLoading ? (
          <SkeletonLoading
            alignment="vertical"
            componentType="card"
            count={6}
            type="default"
          />
        ) : (
          talentPoolCategories?.items?.map((talentPool: any, index: number) => {
            const menuItems: MenuProps['items'] = [
              canUpdate() && {
                key: 'edit',
                label: 'Edit',
                icon: <Pencil size={14} />,
                onClick: () => handleEditTalentPoolCategory(talentPool),
              },
              canDelete() && {
                key: 'delete',
                label: 'Delete',
                icon: <Trash2 size={14} />,
                danger: true,
                onClick: () => handleDeleteTalentPoolCategory(talentPool),
              },
            ].filter(Boolean) as MenuProps['items'];

            const showMenu = menuItems && menuItems.length > 0;

            return (
              <div
                key={talentPool?.id ?? index}
                className="recruitment-settings-card relative p-4 flex items-center justify-between min-h-[56px]"
                data-cy="talent-acquisition-talent-pool-category-card"
              >
                <span
                  className="recruitment-settings-card-title font-medium text-gray-900"
                  data-cy={`talent-acquisition-talent-pool-category-card-title-${talentPool?.id}`}
                >
                  {talentPool?.title}
                </span>
                {showMenu && (
                  <Dropdown
                    menu={{ items: menuItems }}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="recruitment-settings-dropdown-overlay"
                  >
                    <button
                      type="button"
                      className="recruitment-settings-more-btn p-1 text-gray-500"
                      data-cy={`talent-acquisition-talent-pool-category-card-menu-${talentPool?.id}`}
                      aria-label="More options"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </Dropdown>
                )}
              </div>
            );
          })
        )}
      </div>
      <TalentPoolDrawer />
      <CustomDeleteTalentPool
        triggerRect={deleteTriggerRect}
        onAfterClose={() => setDeleteTriggerRect(null)}
      />
    </div>
  );
}

export default TalentPoolCategoryTab;
