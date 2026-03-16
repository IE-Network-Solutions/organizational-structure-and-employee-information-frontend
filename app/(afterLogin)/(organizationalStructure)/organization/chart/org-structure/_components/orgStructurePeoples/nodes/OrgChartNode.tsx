'use client';

import React, { useMemo, useCallback } from 'react';
import {
  type NodeProps,
  Handle,
  Position,
  useReactFlow,
  useStoreApi,
} from '@xyflow/react';
import type { Node } from '@xyflow/react';
import { Card, Avatar, Typography, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { User } from 'lucide-react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { MdOutlineAccountTree } from 'react-icons/md';
import Person2OutlinedIcon from '@mui/icons-material/Person2Outlined';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import type { OrgNodeData } from '../layout';
import { getSubtreeNodeIds, NODE_HEIGHT, NODE_WIDTH } from '../layout';
import { useOrgChartActions } from '../OrgChartActionsContext';
import useDepartmentStore from '@/store/uistate/features/organizationStructure/orgState/departmentStates';

type OrgNode = Node<OrgNodeData, 'orgNode'>;

export function OrgChartNode(props: NodeProps<OrgNode>) {
  const { data } = props;
  const orgChartActions = useOrgChartActions();
  const { getNodes, fitView } = useReactFlow();
  const storeApi = useStoreApi();
  const setNodes = useDepartmentStore((s) => s.setNodes);
  const setEdges = useDepartmentStore((s) => s.setEdges);
  const setFocusViewRootId = useDepartmentStore((s) => s.setFocusViewRootId);
  const collapsedDepartmentIds = useDepartmentStore(
    (s) => s.collapsedDepartmentIds,
  );
  const toggleCollapse = useDepartmentStore((s) => s.toggleCollapse);
  const setUsersModalOpen = useDepartmentStore((s) => s.setUsersModalOpen);
  const setUsersModalDepartmentId = useDepartmentStore(
    (s) => s.setUsersModalDepartmentId,
  );
  const setUsersModalAnchor = useDepartmentStore((s) => s.setUsersModalAnchor);
  const setUsersModalFlowPosition = useDepartmentStore(
    (s) => s.setUsersModalFlowPosition,
  );
  const setUsersModalScreenPosition = useDepartmentStore(
    (s) => s.setUsersModalScreenPosition,
  );
  const isCollapsed = collapsedDepartmentIds.includes(data?.id ?? '');

  const menuItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'add',
        icon: <FiPlus size={16} />,
        label: 'Add',
        style: {
          height: 36,
          padding: '10px 16px',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        },
      },
      {
        key: 'edit',
        icon: <FiEdit2 size={16} />,
        label: 'Edit',
        style: {
          height: 36,
          padding: '10px 16px',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        },
      },
      {
        key: 'delete',
        icon: <FiTrash2 size={16} />,
        label: 'Delete',
        style: {
          height: 36,
          padding: '10px 16px',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        },
      },
      {
        key: 'focusView',
        icon: <FiEye size={16} />,
        label: 'Focus View',
        style: {
          height: 36,
          padding: '10px 16px',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        },
      },
    ],
    [],
  );

  const handleFocusView = useCallback(() => {
    if (!data?.id) return;
    const focusedNodeId = data.id;
    const state = useDepartmentStore.getState();
    const fullNodes = state.fullNodes as {
      id: string;
      position?: { x: number; y: number };
      [key: string]: unknown;
    }[];
    const fullEdges = state.fullEdges as {
      source: string;
      target: string;
      [key: string]: unknown;
    }[];
    if (fullNodes.length === 0 || fullEdges.length === 0) return;

    const subtreeIds = getSubtreeNodeIds(
      fullEdges.map((e) => ({ source: e.source, target: e.target })),
      focusedNodeId,
    );
    const subtreeNodes = fullNodes.filter((n) => subtreeIds.has(n.id));
    const subtreeEdges = fullEdges.filter(
      (e) => subtreeIds.has(e.source) && subtreeIds.has(e.target),
    );
    if (subtreeNodes.length === 0) return;

    if (isCollapsed) {
      toggleCollapse(data.id);
    }
    // Show only the focused department and its children as the main org structure
    setFocusViewRootId(focusedNodeId);
    setNodes(subtreeNodes);
    setEdges(subtreeEdges);

    // After React has applied the new nodes, zoom in for a better view
    const runFitView = () => {
      fitView({
        padding: 0.2,
        maxZoom: 1.4,
        minZoom: 0.35,
        duration: 400,
      });
      // Position at top and center
      const TOP_PADDING_PX = 56;
      setTimeout(() => {
        const flowState = storeApi.getState();
        const { width, height, transform } = flowState;
        if (
          width === 0 ||
          height === 0 ||
          !transform ||
          !Array.isArray(transform)
        )
          return;
        const [, , zoom] = transform;

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        subtreeNodes.forEach((n) => {
          const pos = n.position ?? { x: 0, y: 0 };
          minX = Math.min(minX, pos.x);
          minY = Math.min(minY, pos.y);
          maxX = Math.max(maxX, pos.x + NODE_WIDTH);
          maxY = Math.max(maxY, pos.y + NODE_HEIGHT);
        });
        if (!Number.isFinite(minX)) return;

        const boundsCenterX = (minX + maxX) / 2;
        const boundsTopY = minY;
        const newX = width / 2 - boundsCenterX * zoom;
        const newY = TOP_PADDING_PX - boundsTopY * zoom;

        storeApi.setState({
          transform: [newX, newY, zoom],
        });
      }, 450);
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        runFitView();
      });
    });
  }, [
    data?.id,
    isCollapsed,
    toggleCollapse,
    fitView,
    storeApi,
    setNodes,
    setEdges,
    setFocusViewRootId,
  ]);

  if (!data) return null;
  const {
    displayName,
    title,
    subtitle,
    avatarUrl,
    directReportCount,
    usersWithoutTeamLeadCount,
    borderColor,
  } = data;

  const displayLabel =
    displayName === 'Unassigned' || displayName === 'Not Assigned'
      ? 'Unassigned'
      : displayName;

  // Show only first and middle name for employees in the chart (no hook needed)
  const nameParts = displayLabel?.split(' ').filter(Boolean) ?? [];
  const compactName =
    nameParts.length <= 2 ? displayLabel : `${nameParts[0]} ${nameParts[1]}`;

  const handleMenuClick: MenuProps['onClick'] = ({ key, domEvent }) => {
    const mouseEvent =
      domEvent?.nativeEvent?.type === 'click'
        ? (domEvent as React.MouseEvent)
        : undefined;
    if (key === 'add') {
      orgChartActions?.openAddModal(data.id, mouseEvent);
    }
    if (key === 'edit') {
      orgChartActions?.openEditModal(
        data.id,
        {
          name: data.department?.name ?? '',
          description: data.department?.description ?? '',
          branchId: data.department?.branchId ?? '',
        },
        mouseEvent,
      );
    }
    if (key === 'delete') {
      orgChartActions?.openDeleteModal(
        data.id,
        data.department?.name ?? data.title ?? '',
      );
    }
    if (key === 'focusView') {
      handleFocusView();
    }
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-2 !h-2 !border-2 !border-[#CBD5E0] !bg-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !border-2 !border-[#CBD5E0] !bg-white"
      />
      <div
        className="w-[168px] group relative"
        data-cy={`org-structure-node-wrapper-${data.id}`}
      >
        <div
          className="h-1.5 mx-2 rounded-t-md transition-transform duration-200 ease-out group-hover:translate-y-1 group-hover:scale-[0.98]"
          style={{ backgroundColor: borderColor }}
          data-cy="org-structure-node-accent-bar"
        />
        <Card
          data-cy={`org-structure-node-${data.id}`}
          styles={{
            body: { padding: '8px 10px 6px', position: 'relative' },
          }}
          className="nodrag nopan w-full min-h-[104px] rounded-lg border border-gray-200 bg-white overflow-visible shadow-lg transition-transform duration-200 ease-out group-hover:translate-y-1 group-hover:scale-[0.98]"
        >
          <Dropdown
            menu={{
              items: menuItems,
              onClick: handleMenuClick,
              style: {
                minWidth: 160,
                padding: '8px 0',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              },
            }}
            overlayStyle={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
            trigger={['click']}
            placement={'rightTop' as 'bottomRight'}
          >
            <span
              className="nodrag nopan absolute top-2.5 right-2 text-gray-500 cursor-pointer inline-flex items-center justify-center"
              data-cy={`org-structure-node-menu-btn-${data.id}`}
              aria-label="Menu"
            >
              <BsThreeDotsVertical size={16} />
            </span>
          </Dropdown>

          <div
            className="flex flex-col items-center"
            data-cy="org-structure-node-content"
          >
            <Avatar
              size={48}
              src={avatarUrl}
              icon={
                !avatarUrl ? (
                  <User className="!text-white" size={24} strokeWidth={2} />
                ) : undefined
              }
              style={!avatarUrl ? { backgroundColor: borderColor } : undefined}
              className="-mt-[34px] border-2 border-white shadow-sm"
            />
            <Typography.Text
              strong
              className="block text-center text-[13px] leading-tight mt-2 text-gray-800 w-full overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {compactName}
            </Typography.Text>
            {title && (
              <Typography.Text className="block text-center text-xs leading-tight mt-0.5 text-gray-800 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {title}
              </Typography.Text>
            )}
            {subtitle && (
              <Typography.Text
                type="secondary"
                className="block text-center text-[11px] leading-tight mt-0.5 w-full overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {subtitle}
              </Typography.Text>
            )}
          </div>
        </Card>
        {(directReportCount > 0 || (usersWithoutTeamLeadCount ?? 0) > 0) && (
          <div
            className="absolute right-2 top-full transition-transform duration-200 ease-out group-hover:translate-y-1 group-hover:scale-[0.98]"
            data-cy="org-structure-node-badge-wrapper"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (directReportCount > 0) {
                  toggleCollapse(data.id);
                } else {
                  // Toggle subordinate popup: if already open, fully close it
                  const { usersModalOpen, usersModalDepartmentId } =
                    useDepartmentStore.getState();
                  if (usersModalOpen && usersModalDepartmentId === data.id) {
                    setUsersModalOpen(false);
                    setUsersModalDepartmentId(null);
                    setUsersModalAnchor(null);
                    setUsersModalFlowPosition(null);
                    setUsersModalScreenPosition(null);
                    return;
                  }
                  const buttonEl = e.currentTarget as HTMLElement;
                  const cardEl = buttonEl.closest(
                    '.react-flow__node',
                  ) as HTMLElement | null;
                  const verticalOffset = 0;
                  if (cardEl) {
                    const rect = cardEl.getBoundingClientRect();
                    setUsersModalAnchor({
                      top: rect.top + rect.height / 2 + verticalOffset,
                      left: rect.left + rect.width + 8,
                    });
                  } else {
                    const rect = buttonEl.getBoundingClientRect();
                    setUsersModalAnchor({
                      top: rect.top + rect.height / 2 + verticalOffset,
                      left: rect.right + 8,
                    });
                  }
                  setUsersModalDepartmentId(data.id);
                  setUsersModalScreenPosition(null);
                  const node = getNodes().find((n) => n.id === data.id);
                  if (node && 'position' in node) {
                    const pos = node.position as { x: number; y: number };
                    setUsersModalFlowPosition({
                      x: pos.x + NODE_WIDTH + 8,
                      y: pos.y + NODE_HEIGHT / 2 + verticalOffset,
                    });
                  } else {
                    setUsersModalFlowPosition(null);
                  }
                  setUsersModalOpen(true);
                }
              }}
              className="nodrag nopan inline-flex items-center gap-1.5 py-1 px-2 min-h-6 rounded-t-none rounded-b-lg border border-gray-200 border-t-0 bg-white text-xs font-medium cursor-pointer shadow-sm"
              style={{ color: '#1E40AF' }}
              title={
                directReportCount > 0
                  ? isCollapsed
                    ? 'Expand children'
                    : 'Collapse children'
                  : 'View staff in department'
              }
              data-cy={`org-structure-node-badge-${data.id}`}
            >
              {directReportCount > 0 ? (
                <MdOutlineAccountTree size={14} className="shrink-0" />
              ) : (
                <Person2OutlinedIcon fontSize="small" className="shrink-0" />
              )}
              {(directReportCount > 0
                ? directReportCount
                : (usersWithoutTeamLeadCount ?? 0)) > 0 && (
                <span data-cy="org-structure-node-badge-count">
                  {directReportCount > 0
                    ? directReportCount
                    : (usersWithoutTeamLeadCount ?? 0)}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-2 !h-2 !border-2 !border-[#CBD5E0] !bg-white"
      />
    </>
  );
}
