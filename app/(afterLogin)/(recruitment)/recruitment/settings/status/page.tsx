'use client';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { useRecruitmentStatusStore } from '@/store/uistate/features/recruitment/settings/status';
import RecruitmentStatusDrawer from './statusDrawer';
import { useGetRecruitmentStatuses } from '@/store/server/features/recruitment/settings/status/queries';
import { useReorderRecruitmentStatuses } from '@/store/server/features/recruitment/settings/status/mutation';
import SkeletonLoading from '@/components/common/loadings/skeletonLoading';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteRecruitmentStatus } from '@/store/server/features/recruitment/settings/status/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
  GripVertical,
} from 'lucide-react';
import { useSettingsAddButton } from '../SettingsAddButtonContext';

const STATUS_LIST_LIMIT = 100;

const canUpdate = () =>
  AccessGuard.checkAccess({
    permissions: [Permissions.UpdateApplicationStage],
  });
const canDelete = () =>
  AccessGuard.checkAccess({
    permissions: [Permissions.DeleteApplicationStage],
  });

function formatLevelLabel(level: unknown): string {
  const n = typeof level === 'number' ? level : Number(level);
  if (!Number.isFinite(n)) return 'Level';
  if (n === 1) return '1st Level';
  if (n === 2) return '2nd Level';
  if (n === 3) return '3rd Level';
  return `${n}th Level`;
}

function StatusCardContent({
  status,
  levelLabel,
  menuItems,
}: {
  status: any;
  levelLabel: string;
  menuItems?: MenuProps['items'];
}) {
  return (
    <>
      <div
        className="flex-1 min-w-0 pr-8"
        data-cy="talent-acquisition-status-card-main"
      >
        <div
          className="flex flex-wrap items-center gap-2"
          data-cy="talent-acquisition-status-card-content"
        >
          <h3
            className="text-[14px] font-normal text-black leading-normal"
            data-cy="recruitment-settings-status-card-title"
          >
            {status?.title}
          </h3>
          <span
            className="recruitment-settings-card-level inline-block px-2.5 py-0.5 rounded"
            data-cy="recruitment-settings-status-card-level"
          >
            {levelLabel}
          </span>
        </div>
        {status?.description && (
          <p
            className="recruitment-settings-card-description mt-2 leading-snug"
            data-cy="recruitment-settings-status-card-description"
          >
            {status.description}
          </p>
        )}
      </div>
      {menuItems && menuItems.length > 0 && (
        <div
          className="shrink-0"
          data-cy="talent-acquisition-status-card-menu-wrapper"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="recruitment-settings-dropdown-overlay"
          >
            <button
              type="button"
              className="recruitment-settings-more-btn p-1 text-gray-500"
              data-cy={`talent-acquisition-status-card-menu-${status?.id}`}
              aria-label="More options"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={18} />
            </button>
          </Dropdown>
        </div>
      )}
    </>
  );
}

function SortableStatusCard({
  status,
  levelLabel,
}: {
  status: any;
  levelLabel: string;
}) {
  const { menuItems } = useStatusCardActions(status, true);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(status.id) });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    position: 'relative',
    zIndex: isDragging ? 0 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-status-card
      data-status-id={status.id}
      className="recruitment-settings-card relative p-4 min-h-[80px] flex items-center gap-3 w-full"
      data-cy="recruitment-settings-status-card"
    >
      {/* Placeholder visible when this card is being dragged */}
      {isDragging && (
        <div
          className="absolute inset-0 rounded recruitment-settings-status-drag-placeholder"
          data-cy="talent-acquisition-status-drag-placeholder"
        />
      )}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center shrink-0 w-10 h-10 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none select-none"
        data-cy="talent-acquisition-status-drag-handle"
      >
        <GripVertical
          size={24}
          strokeWidth={2}
          className="pointer-events-none"
        />
      </div>
      <StatusCardContent
        status={status}
        levelLabel={levelLabel}
        menuItems={menuItems}
      />
    </div>
  );
}

function StaticStatusCard({
  status,
  levelLabel,
  showMenu,
}: {
  status: any;
  levelLabel: string;
  showMenu: boolean;
}) {
  const { menuItems } = useStatusCardActions(status, showMenu);

  return (
    <div
      className="recruitment-settings-card relative p-4 min-h-[80px] flex items-center gap-3 w-full"
      data-cy="recruitment-settings-status-card"
    >
      <StatusCardContent
        status={status}
        levelLabel={levelLabel}
        menuItems={showMenu ? menuItems : undefined}
      />
    </div>
  );
}

/** Ghost card rendered inside DragOverlay — floats with the cursor */
function DragGhostCard({
  status,
  levelLabel,
}: {
  status: any;
  levelLabel: string;
}) {
  const { menuItems } = useStatusCardActions(status, true);
  return (
    <div
      className="recruitment-settings-card recruitment-settings-drag-ghost p-4 min-h-[80px] flex items-center gap-3 w-full"
      style={{ cursor: 'grabbing' }}
      data-cy="talent-acquisition-status-drag-ghost"
    >
      <div
        className="flex items-center justify-center shrink-0 w-10 h-10 text-gray-400"
        data-cy="talent-acquisition-status-drag-ghost-handle"
      >
        <GripVertical size={24} strokeWidth={2} />
      </div>
      <StatusCardContent
        status={status}
        levelLabel={levelLabel}
        menuItems={menuItems}
      />
    </div>
  );
}

function useStatusCardActions(status: any, showMenu: boolean) {
  const {
    setSelectedStatus,
    setIsDrawerOpen,
    setEditMode,
    setIsDeleteModalOpen,
  } = useRecruitmentStatusStore();

  const handleEditStatus = useCallback(
    (s: any) => {
      setSelectedStatus(s);
      setIsDrawerOpen(true);
      setEditMode(true);
    },
    [setSelectedStatus, setIsDrawerOpen, setEditMode],
  );

  const handleDeleteStatus = useCallback(
    (s: any) => {
      setSelectedStatus(s);
      setIsDeleteModalOpen(true);
    },
    [setSelectedStatus, setIsDeleteModalOpen],
  );

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      showMenu
        ? ([
            canUpdate() && {
              key: 'edit',
              label: 'Edit',
              icon: <Pencil size={14} className="text-gray-900" />,
              disabled: status?.isFixed === true,
              onClick: () => handleEditStatus(status),
            },
            canDelete() && {
              key: 'delete',
              label: 'Delete',
              icon: <Trash2 size={14} className="text-gray-900" />,
              danger: true,
              disabled: status?.isFixed === true,
              onClick: () => handleDeleteStatus(status),
            },
          ].filter(Boolean) as MenuProps['items'])
        : [],
    [showMenu, status, handleEditStatus, handleDeleteStatus],
  );

  return { handleEditStatus, handleDeleteStatus, menuItems };
}

const Status: React.FC = () => {
  const {
    isDeleteModalOpen,
    setIsDrawerOpen,
    setSelectedStatus,
    setEditMode,
    setIsDeleteModalOpen,
    selectedStatus,
  } = useRecruitmentStatusStore();

  const { data: recruitmentStatus, isLoading: fetchLoading } =
    useGetRecruitmentStatuses(STATUS_LIST_LIMIT, 1);
  const { mutate: deleteRecruitmentStatus } = useDeleteRecruitmentStatus();
  const { mutate: reorderStatuses } = useReorderRecruitmentStatuses();

  const handleDelete = () => {
    deleteRecruitmentStatus(selectedStatus?.id);
    setIsDeleteModalOpen(false);
    setSelectedStatus(null);
  };

  const handleOpen = useCallback(() => {
    setIsDrawerOpen(true);
    setEditMode(false);
    setSelectedStatus(null);
  }, [setIsDrawerOpen, setEditMode, setSelectedStatus]);

  const { setAddAction } = useSettingsAddButton();
  const canCreate = AccessGuard.checkAccess({
    permissions: [Permissions.CreateApplicationStage],
  });
  useEffect(() => {
    if (canCreate) setAddAction(() => handleOpen);
    return () => setAddAction(null);
  }, [setAddAction, canCreate, handleOpen]);

  const items = recruitmentStatus?.items ?? [];

  const sortByLevel = (a: any, b: any) => {
    const la = Number(a?.level);
    const lb = Number(b?.level);
    if (!Number.isFinite(la) && !Number.isFinite(lb)) return 0;
    if (!Number.isFinite(la)) return 1;
    if (!Number.isFinite(lb)) return -1;
    return la - lb;
  };

  const initialStatuses = useMemo(
    () =>
      items
        .filter((s: any) => !!s?.isInitial)
        .slice()
        .sort(sortByLevel),
    [items],
  );

  const finalStatuses = useMemo(
    () =>
      items
        .filter((s: any) => !!s?.isFinal)
        .slice()
        .sort(sortByLevel),
    [items],
  );

  const middleStatuses = useMemo(
    () =>
      items
        .filter((s: any) => !s?.isInitial && !s?.isFinal)
        .slice()
        .sort(sortByLevel),
    [items],
  );

  const [orderedMiddleItems, setOrderedMiddleItems] = useState<any[]>([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  useEffect(() => {
    setOrderedMiddleItems(middleStatuses);
  }, [middleStatuses]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a tiny move before starting drag so clicks still work
      activationConstraint: { distance: 5 },
    }),
  );

  const activeDragStatus = useMemo(
    () =>
      activeDragId
        ? (orderedMiddleItems.find((s: any) => String(s.id) === activeDragId) ??
          null)
        : null,
    [activeDragId, orderedMiddleItems],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = orderedMiddleItems.findIndex(
        (s: any) => String(s.id) === String(active.id),
      );
      const newIndex = orderedMiddleItems.findIndex(
        (s: any) => String(s.id) === String(over.id),
      );
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(orderedMiddleItems, oldIndex, newIndex);
      setOrderedMiddleItems(newOrder);

      const ids = newOrder.map((s: any) => s.id);
      if (ids.length > 0) reorderStatuses(ids);
    },
    [orderedMiddleItems, reorderStatuses],
  );

  if (fetchLoading) {
    return (
      <div
        className="p-5 rounded-2xl bg-white h-full"
        data-cy="talent-acquisition-status-page-container"
      >
        <div
          className="hidden md:flex justify-end items-center mb-6"
          data-cy="talent-acquisition-status-button-define-new-container"
        >
          <AccessGuard
            permissions={[Permissions.CreateApplicationStage]}
            data-cy="talent-acquisition-status-button-define-new"
          >
            <Button
              type="primary"
              className="h-10 px-4 recruitment-settings-primary-btn"
              disabled
              data-cy="talent-acquisition-status-button-define-new-button"
            >
              Define Status
            </Button>
          </AccessGuard>
        </div>
        <SkeletonLoading
          alignment="vertical"
          componentType="card"
          count={5}
          type="default"
        />
      </div>
    );
  }

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      data-cy="talent-acquisition-status-page-container"
    >
      <div
        className="hidden md:flex justify-end items-center mb-6"
        data-cy="talent-acquisition-status-page-header"
      >
        <AccessGuard
          permissions={[Permissions.CreateApplicationStage]}
          data-cy="talent-acquisition-status-button-define-new-access-guard"
        >
          <Button
            type="primary"
            id="createStatusButton"
            data-cy="talent-acquisition-status-button-define-new"
            onClick={handleOpen}
            className="h-10 px-4 recruitment-settings-primary-btn"
            icon={
              <UserPlus
                size={18}
                data-cy="talent-acquisition-status-button-define-new-icon"
              />
            }
          >
            <span
              className="hidden sm:inline"
              data-cy="talent-acquisition-status-button-define-new-text"
            >
              Define Status
            </span>
          </Button>
        </AccessGuard>
      </div>

      <div
        className="flex flex-col gap-4 w-full"
        data-cy="talent-acquisition-status-list-container"
      >
        {items.length === 0 ? (
          <p
            className="text-gray-500 text-sm"
            data-cy="talent-acquisition-status-list-empty"
          >
            No statuses defined yet. Add one to get started.
          </p>
        ) : (
          <>
            {initialStatuses.map((status: any) => (
              <StaticStatusCard
                key={status.id}
                status={status}
                levelLabel={formatLevelLabel(status?.level)}
                showMenu={false}
              />
            ))}

            {orderedMiddleItems.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={orderedMiddleItems.map((s: any) => String(s.id))}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    className="flex flex-col gap-4"
                    data-cy="talent-acquisition-status-middle-list"
                  >
                    {orderedMiddleItems.map((status: any) => (
                      <SortableStatusCard
                        key={status.id}
                        status={status}
                        levelLabel={formatLevelLabel(status?.level)}
                      />
                    ))}
                  </div>
                </SortableContext>

                {/* Floating ghost card that follows the cursor while dragging */}
                <DragOverlay dropAnimation={null}>
                  {activeDragStatus ? (
                    <DragGhostCard
                      status={activeDragStatus}
                      levelLabel={formatLevelLabel(activeDragStatus?.level)}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}

            {finalStatuses.map((status: any) => (
              <StaticStatusCard
                key={status.id}
                status={status}
                levelLabel={formatLevelLabel(status?.level)}
                showMenu
              />
            ))}
          </>
        )}
      </div>

      <RecruitmentStatusDrawer data-cy="talent-acquisition-status-create-edit-modal" />
      <DeleteModal
        data-cy="talent-acquisition-status-delete-modal"
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Status"
        deleteMessage="Are you sure you want to delete this status?"
        hideImage
        danger
        modalClassName="recruitment-settings-delete-modal"
      />
    </div>
  );
};

export default Status;
