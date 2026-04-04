'use client';
import { Button, Dropdown, Modal } from 'antd';
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
import { MoreHorizontal, Pencil, Trash2, GripVertical } from 'lucide-react';
import { useSettingsAddButton } from '../SettingsAddButtonContext';

function formatOrdinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

interface PendingReorderInfo {
  newOrder: any[];
  movedStatus: any;
  movedToStage: number;
}

const STATUS_LIST_LIMIT = 100;

interface TriggerRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

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
  onDeleteTrigger,
}: {
  status: any;
  levelLabel: string;
  onDeleteTrigger: (rect: TriggerRect | null) => void;
}) {
  const { menuItems } = useStatusCardActions(status, true, onDeleteTrigger);
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
      className="recruitment-settings-card relative p-4 min-h-[80px] flex items-center gap-0 w-full"
      data-cy="recruitment-settings-status-card"
    >
      {isDragging && (
        <div
          className="absolute inset-0 rounded recruitment-settings-status-drag-placeholder"
          data-cy="talent-acquisition-status-drag-placeholder"
        />
      )}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center shrink-0 w-6 h-10 mr-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none select-none"
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
  onDeleteTrigger,
}: {
  status: any;
  levelLabel: string;
  showMenu: boolean;
  onDeleteTrigger: (rect: TriggerRect | null) => void;
}) {
  const { menuItems } = useStatusCardActions(status, showMenu, onDeleteTrigger);

  return (
    <div
      className="recruitment-settings-card relative p-4 min-h-[80px] flex items-center w-full"
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

function DragGhostCard({
  status,
  levelLabel,
}: {
  status: any;
  levelLabel: string;
}) {
  const { menuItems } = useStatusCardActions(status, true, () => {});
  return (
    <div
      className="recruitment-settings-card recruitment-settings-drag-ghost p-4 min-h-[80px] flex items-center gap-0 w-full"
      style={{ cursor: 'grabbing' }}
      data-cy="talent-acquisition-status-drag-ghost"
    >
      <div
        className="flex items-center justify-center shrink-0 w-6 h-10 text-gray-400"
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

function useStatusCardActions(
  status: any,
  showMenu: boolean,
  onDeleteTrigger: (rect: TriggerRect | null) => void,
) {
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
      const btn = document.querySelector<HTMLElement>(
        `[data-cy="talent-acquisition-status-card-menu-${s.id}"]`,
      );
      if (btn) {
        const r = btn.getBoundingClientRect();
        onDeleteTrigger({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
        });
      } else {
        onDeleteTrigger(null);
      }
      setSelectedStatus(s);
      setIsDeleteModalOpen(true);
    },
    [setSelectedStatus, setIsDeleteModalOpen, onDeleteTrigger],
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

  const [deleteTriggerRect, setDeleteTriggerRect] =
    useState<TriggerRect | null>(null);

  const [pendingReorderInfo, setPendingReorderInfo] =
    useState<PendingReorderInfo | null>(null);
  const [isReorderConfirmOpen, setIsReorderConfirmOpen] = useState(false);

  const { data: recruitmentStatus, isLoading: fetchLoading } =
    useGetRecruitmentStatuses(STATUS_LIST_LIMIT, 1);
  const { mutate: deleteRecruitmentStatus } = useDeleteRecruitmentStatus();
  const { mutate: reorderStatuses } = useReorderRecruitmentStatuses();

  const handleDelete = () => {
    deleteRecruitmentStatus(selectedStatus?.id);
    setIsDeleteModalOpen(false);
    setSelectedStatus(null);
    // triggerRect is cleared in onAfterClose — NOT here — so the modal
    // keeps its anchored position throughout the entire exit animation.
  };

  const handleOpen = useCallback(() => {
    setIsDrawerOpen(true);
    setEditMode(false);
    setSelectedStatus(null);
  }, [setIsDrawerOpen, setEditMode, setSelectedStatus]);

  const { setAddAction, setAddLabel } = useSettingsAddButton();
  const canCreate = AccessGuard.checkAccess({
    permissions: [Permissions.CreateApplicationStage],
  });
  useEffect(() => {
    if (canCreate) {
      setAddAction(() => handleOpen);
      setAddLabel('Define Status');
    }
    return () => {
      setAddAction(null);
      setAddLabel(null);
    };
  }, [setAddAction, setAddLabel, canCreate, handleOpen]);

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
      const movedStatus = orderedMiddleItems[oldIndex];
      const initialCount = initialStatuses.length;
      const movedToStage = initialCount + 1 + newIndex;

      setPendingReorderInfo({
        newOrder,
        movedStatus,
        movedToStage,
      });
      setIsReorderConfirmOpen(true);
    },
    [orderedMiddleItems, initialStatuses.length],
  );

  const handleConfirmReorder = useCallback(() => {
    if (!pendingReorderInfo) return;
    setOrderedMiddleItems(pendingReorderInfo.newOrder);
    const ids = pendingReorderInfo.newOrder.map((s: any) => s.id);
    if (ids.length > 0) reorderStatuses(ids);
    setIsReorderConfirmOpen(false);
    setPendingReorderInfo(null);
  }, [pendingReorderInfo, reorderStatuses]);

  const handleCancelReorder = useCallback(() => {
    setIsReorderConfirmOpen(false);
    setPendingReorderInfo(null);
  }, []);

  if (fetchLoading) {
    return (
      <div
        className="py-3 sm:p-5 rounded-2xl bg-white h-full"
        data-cy="talent-acquisition-status-page-container"
      >
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
      className="py-3 sm:p-5 rounded-2xl bg-white h-full"
      data-cy="talent-acquisition-status-page-container"
    >
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
                onDeleteTrigger={setDeleteTriggerRect}
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
                        onDeleteTrigger={setDeleteTriggerRect}
                      />
                    ))}
                  </div>
                </SortableContext>

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
                onDeleteTrigger={setDeleteTriggerRect}
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
        onAfterClose={() => setDeleteTriggerRect(null)}
        title="Delete Status"
        deleteMessage="Are you sure you want to delete this status?"
        hideImage
        danger
        modalClassName="recruitment-settings-delete-modal"
        triggerRect={deleteTriggerRect ?? undefined}
      />

      <Modal
        open={isReorderConfirmOpen}
        onCancel={handleCancelReorder}
        footer={null}
        closable
        centered
        width={480}
        destroyOnClose
        rootClassName="recruitment-settings-reorder-modal"
        title={
          <div className="flex items-start gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0 mt-[2px]"
            >
              <path
                d="M7 0C3.13438 0 0 3.13438 0 7C0 10.8656 3.13438 14 7 14C10.8656 14 14 10.8656 14 7C14 3.13438 10.8656 0 7 0ZM6.5 3.625C6.5 3.55625 6.55625 3.5 6.625 3.5H7.375C7.44375 3.5 7.5 3.55625 7.5 3.625V7.875C7.5 7.94375 7.44375 8 7.375 8H6.625C6.55625 8 6.5 7.94375 6.5 7.875V3.625ZM7 10.5C6.80374 10.496 6.61687 10.4152 6.47948 10.275C6.3421 10.1348 6.26515 9.9463 6.26515 9.75C6.26515 9.5537 6.3421 9.36522 6.47948 9.225C6.61687 9.08478 6.80374 9.00401 7 9C7.19626 9.00401 7.38313 9.08478 7.52052 9.225C7.6579 9.36522 7.73485 9.5537 7.73485 9.75C7.73485 9.9463 7.6579 10.1348 7.52052 10.275C7.38313 10.4152 7.19626 10.496 7 10.5Z"
                fill="#FAAD14"
              />
            </svg>
            <div>
              <div className="text-[14px] font-bold text-black/70 leading-snug">
                Confirm Stage Reorder
              </div>
              <div className="text-[10px] font-normal text-black/70 mt-0.5">
                This change will update the recruitment pipeline order.
              </div>
            </div>
          </div>
        }
        data-cy="talent-acquisition-status-reorder-confirm-modal"
      >
        <div className="mt-4 text-[14px] font-normal text-black/70">
          <p>
            Are you sure you want to move{' '}
            <span className="font-semibold">
              {pendingReorderInfo?.movedStatus?.title}
            </span>{' '}
            to the{' '}
            {pendingReorderInfo
              ? formatOrdinal(pendingReorderInfo.movedToStage)
              : ''}{' '}
            stage?
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            className="recruitment-settings-reorder-cancel-btn px-6 rounded-md"
            onClick={handleCancelReorder}
            data-cy="talent-acquisition-status-reorder-cancel"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            className="recruitment-settings-reorder-confirm-btn px-6 rounded-md"
            onClick={handleConfirmReorder}
            data-cy="talent-acquisition-status-reorder-confirm"
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Status;
