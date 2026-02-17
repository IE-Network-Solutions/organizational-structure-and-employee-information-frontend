'use client';

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGetOrgChartsPeoples } from '@/store/server/features/organizationStructure/organizationalChart/query';
import type { DepartmentUserTree } from '@/store/server/features/organizationStructure/organizationalChart/interface';
import useDepartmentStore from '@/store/uistate/features/organizationStructure/orgState/departmentStates';
import OrgChartSkeleton from '../loading/orgStructureLoading';
import {
  OrgChartNode,
  SpineNode,
  HorizontalConnectorNode,
  VerticalEdge,
} from './nodes';
import { buildFlowFromTree, NODE_WIDTH, NODE_HEIGHT } from './layout';
import type { OrgNodeData } from './layout';
import { useChartRef } from '../../../layout';
import { OrgChartActionsProvider } from './OrgChartActionsContext';
import {
  AddDepartmentModal,
  DepartmentUsersModal,
  DeleteDepartmentModal,
} from './modals';

const nodeTypes = {
  orgNode: OrgChartNode,
  spine: SpineNode,
  horizontalConnector: HorizontalConnectorNode,
};

const edgeTypes = {
  vertical: VerticalEdge,
};

function OrgFlowContent() {
  const chartRef = useChartRef();
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const { data: userTreeData } = useGetOrgChartsPeoples();

  const built = useMemo(() => {
    const root = userTreeData as DepartmentUserTree | null | undefined;
    return buildFlowFromTree(root);
  }, [userTreeData]);

  if (built.nodes.length > 0) {
    const state = useDepartmentStore.getState();
    if (state.fullNodes !== built.nodes || state.fullEdges !== built.edges) {
      state.setFullGraph(built.nodes, built.edges);
    }
  }

  const nodes = useDepartmentStore((s) => s.nodes);
  const edges = useDepartmentStore((s) => s.edges);
  const setNodes = useDepartmentStore((s) => s.setNodes);
  const setEdges = useDepartmentStore((s) => s.setEdges);

  const onNodesChange = useCallback(
    (changes: Parameters<typeof applyNodeChanges>[0]) => {
      setNodes(
        applyNodeChanges(
          changes,
          useDepartmentStore.getState().nodes as Parameters<
            typeof applyNodeChanges
          >[1],
        ),
      );
    },
    [setNodes],
  );
  const onEdgesChange = useCallback(
    (changes: Parameters<typeof applyEdgeChanges>[0]) => {
      setEdges(
        applyEdgeChanges(
          changes,
          useDepartmentStore.getState().edges as Parameters<
            typeof applyEdgeChanges
          >[1],
        ),
      );
    },
    [setEdges],
  );

  // Center viewport on level-zero (root) node and zoom to fit whole tree.
  // Runs when flow is ready and again when nodes load; delay so viewport dimensions are set.
  const centerViewOnRoot = useCallback(() => {
    const instance = flowInstanceRef.current;
    const container = chartRef.current;
    const currentNodes = useDepartmentStore.getState()
      .nodes as Node<OrgNodeData>[];
    if (!instance || !container || currentNodes.length === 0) return;

    const rootNode =
      currentNodes.find(
        (n) => n.type === 'orgNode' && (n.data as OrgNodeData).isRoot,
      ) ??
      (currentNodes
        .filter((n) => n.type === 'orgNode')
        .sort((a, b) => a.position.y - b.position.y)[0] as
        | Node<OrgNodeData>
        | undefined);
    if (!rootNode) return;

    const rootCenterX = rootNode.position.x + NODE_WIDTH / 2;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    currentNodes.forEach((n) => {
      const left = n.position.x;
      const top = n.position.y;
      let w = 0;
      let h = 0;
      if (n.type === 'orgNode') {
        w = NODE_WIDTH;
        h = NODE_HEIGHT;
      } else if (
        n.type === 'horizontalConnector' &&
        n.data &&
        'width' in n.data
      ) {
        w = Number((n.data as { width: number }).width) || 0;
        h = 20;
      }
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, left + w);
      maxY = Math.max(maxY, top + h);
    });
    const boundsW = maxX - minX;
    const boundsH = maxY - minY;

    const padding = { top: 8, right: 40, bottom: 40, left: 40 };
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const availableW = Math.max(1, width - padding.left - padding.right);
    const availableH = Math.max(1, height - padding.top - padding.bottom);
    const zoomX = boundsW > 0 ? availableW / boundsW : 1;
    const zoomY = boundsH > 0 ? availableH / boundsH : 1;
    const zoom = Math.min(zoomX, zoomY, 1.2, 1.5);
    const zoomedIn = zoom * 1.2;
    const clampedZoom = Math.max(0.1, Math.min(1.5, zoomedIn));

    // Root at horizontal center and at the start (top) of the pane, not vertically centered
    const viewportX = width / 2 - rootCenterX * clampedZoom;
    const viewportY = padding.top - rootNode.position.y * clampedZoom;
    instance.setViewport(
      { x: viewportX, y: viewportY, zoom: clampedZoom },
      { duration: 0 },
    );
  }, []);

  useEffect(() => {
    if (nodes.length === 0) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const rafId = requestAnimationFrame(() => {
      timeoutId = setTimeout(centerViewOnRoot, 350);
    });
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [nodes.length, centerViewOnRoot]);

  return (
    <OrgChartActionsProvider>
      <div
        className="w-full h-[calc(100vh-280px)] min-h-[420px] bg-white overflow-visible"
        ref={chartRef}
        data-cy="org-structure-chart-flow-container"
      >
        <ReactFlow
          nodes={nodes as Node[]}
          edges={edges as Edge[]}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={(instance) => {
            flowInstanceRef.current = instance;
            // Schedule center once viewport and nodes are ready (backup to effect)
            setTimeout(() => {
              const currentNodes = useDepartmentStore.getState().nodes;
              if (currentNodes.length > 0) {
                const container = chartRef.current;
                if (container?.offsetWidth && container?.offsetHeight) {
                  centerViewOnRoot();
                }
              }
            }, 400);
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          minZoom={0.1}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={true}
          panOnScroll={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
          proOptions={{ hideAttribution: true }}
          className="bg-white"
        />
        <AddDepartmentModal />
        <DepartmentUsersModal />
        <DeleteDepartmentModal />
      </div>
    </OrgChartActionsProvider>
  );
}

const OrgChartComponent: React.FC = () => {
  return (
    <div
      className="w-full overflow-visible"
      data-cy="org-structure-container"
      id="org-structure-container"
    >
      <div
        className="w-full pt-0 pb-7 overflow-visible"
        data-cy="org-structure-content"
        id="org-structure-content"
      >
        <OrgChartComponentInner />
      </div>
    </div>
  );
};

function OrgChartComponentInner() {
  const { isLoading } = useGetOrgChartsPeoples();

  if (isLoading) {
    return (
      <OrgChartSkeleton
        loading={isLoading}
        data-cy="org-org-structure-components-orgstructurepeoples-index-orgchartskeleton-1"
      />
    );
  }

  return (
    <div
      className="pt-0 px-4 pb-8 sm:px-2 md:px-6 md:pb-8 lg:px-8 overflow-visible"
      data-cy="org-structure-tree-container"
      id="org-structure-tree-container"
    >
      <div
        className="overflow-visible"
        data-cy="org-structure-transform-component"
        id="org-structure-transform-component"
      >
        <div
          id="org-structure-chart"
          data-cy="org-structure-chart"
          className="w-full overflow-visible"
        >
          <OrgFlowContent />
        </div>
      </div>
      <div
        data-cy="org-structure-transform-component-buttons"
        id="org-structure-transform-component-buttons"
      />
    </div>
  );
}

export default OrgChartComponent;
