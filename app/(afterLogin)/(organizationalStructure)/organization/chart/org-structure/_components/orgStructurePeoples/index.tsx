'use client';

import React, {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
} from 'react';
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
import { buildFlowFromTree } from './layout';
import { useChartRef } from '../../../layout';
import { OrgChartActionsProvider } from './OrgChartActionsContext';
import {
  AddDepartmentModal,
  DepartmentUsersModal,
  DeleteDepartmentModal,
} from './modals';
import { OrgChartExportBridge } from '../OrgChartExportBridge';
import { DepartmentUsersModalPositionBridge } from './DepartmentUsersModalPositionBridge';

const nodeTypes = {
  orgNode: OrgChartNode,
  spine: SpineNode,
  horizontalConnector: HorizontalConnectorNode,
};

const edgeTypes = {
  vertical: VerticalEdge,
};

function OrgFlowContent({ onReady }: { onReady?: () => void }) {
  const chartRef = useChartRef();
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const isProgrammaticFitRef = useRef(false);
  const hasInitialFitRunRef = useRef(false);
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
  const focusViewRootId = useDepartmentStore((s) => s.focusViewRootId);
  const setNodes = useDepartmentStore((s) => s.setNodes);
  const setEdges = useDepartmentStore((s) => s.setEdges);
  const collapsedDepartmentIds = useDepartmentStore(
    (s) => s.collapsedDepartmentIds,
  );

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

  // When nodes load, fit the entire structure in view so the whole chart is visible on first load.
  const fitWholeStructure = useCallback(() => {
    const instance = flowInstanceRef.current;
    if (!instance || nodes.length === 0) return;
    isProgrammaticFitRef.current = true;
    instance.fitView({ padding: 0.12, duration: 0, maxZoom: 0.5 });
    hasInitialFitRunRef.current = true;
    onReady?.();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('org-structure-can-reset-view', {
          detail: { canReset: false },
        }),
      );
    }
    // Ignore the onMoveEnd that fitView may trigger (can fire late); allow user moves to show Reset after this.
    setTimeout(() => {
      isProgrammaticFitRef.current = false;
    }, 500);
  }, [nodes.length, onReady]);

  useEffect(() => {
    if (nodes.length === 0 || focusViewRootId) return;
    const timeoutId = setTimeout(fitWholeStructure, 350);
    return () => clearTimeout(timeoutId);
  }, [nodes.length, focusViewRootId, fitWholeStructure]);

  // Allow external consumers (like the layout header) to trigger a reset:
  // restore full graph if we were in Focus View, then fit the whole structure.
  useEffect(() => {
    const handler = () => {
      useDepartmentStore.getState().exitFocusView();
      setTimeout(fitWholeStructure, 100);
    };
    window.addEventListener('org-structure-reset-view', handler);
    return () => {
      window.removeEventListener('org-structure-reset-view', handler);
    };
  }, [fitWholeStructure]);

  // Restrict how far the viewport can be panned so the org chart
  // cannot be dragged infinitely outside the visible layout.
  useEffect(() => {
    const instance = flowInstanceRef.current;
    if (!instance || nodes.length === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    (nodes as Node[]).forEach((n) => {
      const { x, y } = n.position;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    });

    if (!Number.isFinite(minX) || !Number.isFinite(minY)) return;

    const padding = 120;
    const api = instance as any;
    if (typeof api.setTranslateExtent === 'function') {
      api.setTranslateExtent([
        [minX - padding, minY - padding],
        [maxX + padding, maxY + padding],
      ]);
    }
  }, [nodes]);

  // When the user finishes moving/zooming the viewport, show the Reset button.
  // Do not show until initial fit has run, and not when the move was from our own fitView.
  const handleMoveEnd = useCallback(() => {
    if (!hasInitialFitRunRef.current || isProgrammaticFitRef.current) return;
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('org-structure-can-reset-view', {
        detail: { canReset: true },
      }),
    );
  }, []);

  // When departments are collapsed/expanded, refit the visible structure.
  // Only run when collapsedDepartmentIds changes (not on initial load when nodes appear).
  const prevCollapsedRef = useRef(collapsedDepartmentIds);
  useEffect(() => {
    if (prevCollapsedRef.current === collapsedDepartmentIds) return;
    prevCollapsedRef.current = collapsedDepartmentIds;
    const instance = flowInstanceRef.current;
    if (!instance || nodes.length === 0) return;
    isProgrammaticFitRef.current = true;
    instance.fitView({ padding: 0.1, duration: 350, maxZoom: 1.4 });
    window.dispatchEvent(
      new CustomEvent('org-structure-can-reset-view', {
        detail: { canReset: false },
      }),
    );
    const id = setTimeout(() => {
      isProgrammaticFitRef.current = false;
    }, 400);
    return () => clearTimeout(id);
  }, [collapsedDepartmentIds, nodes.length]);

  return (
    <OrgChartActionsProvider>
      <div
        className="w-full h-[calc(100vh-220px)] min-h-[280px] sm:h-[calc(100vh-280px)] sm:min-h-[420px] bg-white overflow-clip"
        ref={chartRef}
        data-cy="org-structure-chart-flow-container"
      >
        <ReactFlow
          nodes={nodes as Node[]}
          edges={edges as Edge[]}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          panOnScroll={false}
          zoomOnScroll={false}
          panOnDrag
          zoomOnDoubleClick={false}
          onMoveEnd={handleMoveEnd}
          onInit={(instance) => {
            flowInstanceRef.current = instance;
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          minZoom={0.1}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
        defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
          proOptions={{ hideAttribution: true }}
          className="bg-white"
        >
          <OrgChartExportBridge />
          <DepartmentUsersModalPositionBridge />
        </ReactFlow>
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
  const [isChartReady, setIsChartReady] = useState(false);

  const handleChartReady = useCallback(() => {
    setIsChartReady(true);
  }, []);

  const showSkeleton = isLoading || !isChartReady;

  return (
    <div
      className="pt-0 pb-4 sm:pb-8 overflow-visible relative"
      data-cy="org-structure-tree-container"
      id="org-structure-tree-container"
    >
      {/* React Flow / chart always mounted behind */}
      <div
        className="overflow-visible min-w-0"
        data-cy="org-structure-transform-component"
        id="org-structure-transform-component"
      >
        <div
          id="org-structure-chart"
          data-cy="org-structure-chart"
          className="w-full overflow-visible"
        >
          <OrgFlowContent onReady={handleChartReady} />
        </div>
      </div>

      {/* Skeleton overlay while loading or until fitView has completed */}
      {showSkeleton && (
        <div className="absolute inset-0 z-10 bg-white">
          <OrgChartSkeleton
            loading={isLoading}
            data-cy="org-org-structure-components-orgstructurepeoples-index-orgchartskeleton-1"
          />
        </div>
      )}

      <div
        data-cy="org-structure-transform-component-buttons"
        id="org-structure-transform-component-buttons"
      />
    </div>
  );
}

export default OrgChartComponent;
