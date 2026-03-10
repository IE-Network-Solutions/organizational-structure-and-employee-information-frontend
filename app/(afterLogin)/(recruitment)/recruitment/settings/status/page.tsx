'use client';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

const DRAG_DATA_KEY = 'application/x-status-id';
const STATUS_LIST_LIMIT = 100;

const canUpdate = () =>
  AccessGuard.checkAccess({
    permissions: [Permissions.UpdateApplicationStage],
  });
const canDelete = () =>
  AccessGuard.checkAccess({
    permissions: [Permissions.DeleteApplicationStage],
  });

function getLevelLabel(order: number, total: number): string {
  if (order === total && total > 0) return 'Last Stage';
  const n = order;
  if (n === 1) return '1st Level';
  if (n === 2) return '2nd Level';
  if (n === 3) return '3rd Level';
  return `${n}th Level`;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
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

function DraggableMiddleCard({
  status,
  levelLabel,
  orderIndex,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  status: any;
  levelLabel: string;
  orderIndex: number;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, cardEl: HTMLElement) => void;
  onDragOver: (e: React.DragEvent, targetIndex: number) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const { menuItems } = useStatusCardActions(status, true);

  const handleGripDragStart = useCallback(
    (e: React.DragEvent) => {
      const cardEl = (e.currentTarget as HTMLElement).closest(
        '[data-status-card]',
      ) as HTMLElement;
      if (cardEl) onDragStart(e, cardEl);
    },
    [onDragStart],
  );

  return (
    <div
      data-status-card
      data-status-id={status.id}
      data-order-index={orderIndex}
      draggable={false}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        onDragOver(e, orderIndex);
      }}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`recruitment-settings-card relative p-4 min-h-[80px] flex items-center gap-3 w-full recruitment-settings-status-card-animate ${
        isDragging ? 'recruitment-settings-status-drag-placeholder' : ''
      }`}
      data-cy="recruitment-settings-status-card"
    >
      <div
        draggable
        onDragStart={handleGripDragStart}
        className="flex items-center justify-center shrink-0 w-10 h-10 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none select-none"
        data-cy="talent-acquisition-status-drag-handle"
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
  const totalItems = items.length;

  const { firstItem, middleItems, lastItem } = useMemo(() => {
    if (items.length === 0)
      return { firstItem: null, middleItems: [], lastItem: null };
    if (items.length === 1)
      return { firstItem: items[0], middleItems: [], lastItem: null };
    return {
      firstItem: items[0],
      middleItems: items.slice(1, -1),
      lastItem: items[items.length - 1],
    };
  }, [items]);

  const [orderedMiddleItems, setOrderedMiddleItems] = useState<any[]>([]);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const orderedRef = useRef<any[]>([]);
  const middleListRef = useRef<HTMLDivElement>(null);
  const positionsBeforeRef = useRef<Map<string, DOMRect>>(new Map());
  const dragOverThrottleRef = useRef(false);
  orderedRef.current = orderedMiddleItems;

  useEffect(() => {
    setOrderedMiddleItems(middleItems);
  }, [middleItems]);

  const snapshotPositions = useCallback(() => {
    const container = middleListRef.current;
    if (!container) return;
    const map = new Map<string, DOMRect>();
    container.querySelectorAll('[data-status-card]').forEach((el) => {
      const id = (el as HTMLElement).getAttribute('data-status-id');
      if (id) map.set(id, (el as HTMLElement).getBoundingClientRect());
    });
    positionsBeforeRef.current = map;
  }, []);

  useLayoutEffect(() => {
    const before = positionsBeforeRef.current;
    const container = middleListRef.current;
    if (!container || before.size === 0) return;

    const cards = container.querySelectorAll(
      '[data-status-card]',
    ) as NodeListOf<HTMLElement>;
    const toAnimate: { el: HTMLElement; dx: number; dy: number }[] = [];

    cards.forEach((el) => {
      const id = el.getAttribute('data-status-id');
      if (!id) return;
      const prev = before.get(id);
      if (!prev) return;
      const curr = el.getBoundingClientRect();
      const dx = prev.left - curr.left;
      const dy = prev.top - curr.top;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        toAnimate.push({ el, dx, dy });
      }
    });
    positionsBeforeRef.current = new Map();

    if (toAnimate.length === 0) return;

    toAnimate.forEach(({ el, dx, dy }) => {
      el.style.transition = 'none';
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    container.offsetHeight;

    toAnimate.forEach(({ el }) => {
      el.style.transition = 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)';
      el.style.transform = '';
    });

    const cleanup = () => {
      toAnimate.forEach(({ el }) => {
        el.style.transition = '';
        el.style.transform = '';
      });
    };
    const timer = setTimeout(cleanup, 300);
    return () => clearTimeout(timer);
  }, [orderedMiddleItems]);

  const handleDragStart = useCallback(
    (e: React.DragEvent, cardEl: HTMLElement) => {
      const id = (
        cardEl.closest('[data-status-id]') as HTMLElement
      )?.getAttribute('data-status-id');
      if (!id) return;
      e.dataTransfer.setData(DRAG_DATA_KEY, id);
      e.dataTransfer.effectAllowed = 'move';
      setDragSourceId(id);

      const ghost = cardEl.cloneNode(true) as HTMLElement;
      ghost.style.position = 'absolute';
      ghost.style.top = '-9999px';
      ghost.style.left = '0';
      ghost.style.width = `${cardEl.offsetWidth}px`;
      ghost.style.pointerEvents = 'none';
      ghost.style.transform = 'rotate(3deg)';
      ghost.style.transformOrigin = 'center center';
      ghost.style.boxShadow =
        '0 12px 28px -6px rgba(0,0,0,0.18), 0 4px 10px -4px rgba(0,0,0,0.1)';
      ghost.style.borderRadius = '8px';
      ghost.style.opacity = '0.95';
      document.body.appendChild(ghost);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      ghost.offsetHeight;
      e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, 24);
      setTimeout(() => ghost.remove(), 0);
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!dragSourceId || dragOverThrottleRef.current) return;

      const list = orderedRef.current;
      const sourceIndex = list.findIndex(
        (s: any) => String(s.id) === dragSourceId,
      );
      if (sourceIndex === -1 || sourceIndex === targetIndex) return;

      dragOverThrottleRef.current = true;
      setTimeout(() => {
        dragOverThrottleRef.current = false;
      }, 80);

      snapshotPositions();
      const reordered = reorder(list, sourceIndex, targetIndex);
      setOrderedMiddleItems(reordered);
    },
    [dragSourceId, snapshotPositions],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragSourceId(null);
      const ids = orderedRef.current.map((s: any) => s.id);
      if (ids.length > 0) reorderStatuses(ids);
    },
    [reorderStatuses],
  );

  const handleDragEnd = useCallback(() => {
    setDragSourceId(null);
  }, []);

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
        {totalItems === 0 ? (
          <p
            className="text-gray-500 text-sm"
            data-cy="talent-acquisition-status-list-empty"
          >
            No statuses defined yet. Add one to get started.
          </p>
        ) : (
          <>
            {firstItem && (
              <StaticStatusCard
                status={firstItem}
                levelLabel={getLevelLabel(1, totalItems)}
                showMenu={false}
                data-cy="talent-acquisition-status-first-card"
              />
            )}

            {orderedMiddleItems.length > 0 && (
              <div
                ref={middleListRef}
                className="flex flex-col gap-4"
                data-cy="talent-acquisition-status-middle-list"
              >
                {orderedMiddleItems.map((status: any, index: number) => (
                  <DraggableMiddleCard
                    key={status.id}
                    status={status}
                    levelLabel={getLevelLabel(index + 2, totalItems)}
                    orderIndex={index}
                    isDragging={dragSourceId === String(status.id)}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    data-cy={`talent-acquisition-status-middle-card-${status.id}`}
                  />
                ))}
              </div>
            )}

            {lastItem && (
              <StaticStatusCard
                status={lastItem}
                levelLabel={getLevelLabel(totalItems, totalItems)}
                showMenu
                data-cy="talent-acquisition-status-last-card"
              />
            )}
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
