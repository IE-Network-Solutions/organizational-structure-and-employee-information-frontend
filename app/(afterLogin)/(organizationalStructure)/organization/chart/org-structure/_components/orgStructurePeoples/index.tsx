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
  const wheelZoomingRef = useRef(false);
  const lastZoomRef = useRef<number | null>(null);
  const lastZoomGestureAtRef = useRef(0);
  const lastFocusViewActivatedAtRef = useRef(0);
  const pinchGestureCountRef = useRef(0);
  const [showZoomHint, setShowZoomHint] = useState(false);
  const { data: userTreeData } = useGetOrgChartsPeoples();

  const builtFull = useMemo(() => {
    const root = userTreeData as DepartmentUserTree | null | undefined;
    return buildFlowFromTree(root);
  }, [userTreeData]);

  // Keep a full graph snapshot for Focus View (subtree extraction).
  // This is the uncollapsed layout.
  useEffect(() => {
    if (builtFull.nodes.length === 0) return;
    const state = useDepartmentStore.getState();
    if (
      state.fullNodes !== builtFull.nodes ||
      state.fullEdges !== builtFull.edges
    ) {
      state.setFullGraph(builtFull.nodes, builtFull.edges);
    }
  }, [builtFull.nodes, builtFull.edges]);

  const nodes = useDepartmentStore((s) => s.nodes);
  const edges = useDepartmentStore((s) => s.edges);
  const focusViewRootId = useDepartmentStore((s) => s.focusViewRootId);
  const setNodes = useDepartmentStore((s) => s.setNodes);
  const setEdges = useDepartmentStore((s) => s.setEdges);
  const collapsedDepartmentIds = useDepartmentStore(
    (s) => s.collapsedDepartmentIds,
  );

  // Rebuild the *visible* layout when collapse state changes.
  // - In normal view: lay out the full tree with collapsed subsets hidden.
  // - In Focus View: lay out only the focused subtree, but still respect collapse.
  useEffect(() => {
    const rootTree = userTreeData as DepartmentUserTree | null | undefined;
    if (!rootTree) return;

    // If we're in Focus View, extract that subtree before building the layout.
    if (focusViewRootId) {
      // Mark the moment Focus View was (re)activated so we can ignore
      // the programmatic fit zoom from the Focus View button click
      // when deciding whether to show the "faster zoom" tip.
      lastFocusViewActivatedAtRef.current = Date.now();

      const stack: DepartmentUserTree[] = [rootTree];
      let focusRoot: DepartmentUserTree | null = null;
      while (stack.length && !focusRoot) {
        const current = stack.pop()!;
        if (current.id === focusViewRootId) {
          focusRoot = current;
          break;
        }
        current.department?.forEach((child) => stack.push(child));
      }
      const treeForLayout = focusRoot ?? rootTree;
      const builtVisible = buildFlowFromTree(treeForLayout, {
        collapsedDepartmentIds,
      });
      setNodes(builtVisible.nodes);
      setEdges(builtVisible.edges);
      return;
    }

    const builtVisible = buildFlowFromTree(rootTree, {
      collapsedDepartmentIds,
    });
    setNodes(builtVisible.nodes);
    setEdges(builtVisible.edges);
  }, [userTreeData, collapsedDepartmentIds, focusViewRootId, setNodes, setEdges]);

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
    // Only run the initial fit once. Collapsing/expanding changes node counts,
    // but we don't want to re-fit (and hide Reset View) after the chart is already initialized.
    if (hasInitialFitRunRef.current) return;
    if (nodes.length === 0 || focusViewRootId) return;
    const timeoutId = setTimeout(fitWholeStructure, 350);
    return () => clearTimeout(timeoutId);
  }, [nodes.length, focusViewRootId, fitWholeStructure]);

  // Allow external consumers (like the layout header) to trigger a reset:
  // restore full graph if we were in Focus View, then fit the whole structure.
  useEffect(() => {
    const handler = () => {
      const state = useDepartmentStore.getState();
      state.exitFocusView();
      state.clearCollapsedDepartments();
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

  // Collapse/expand changes the visible structure.
  // Smoothly refit the viewport so the chart zooms in/out as the tree grows/shrinks.
  const prevCollapsedRef = useRef(collapsedDepartmentIds);
  useEffect(() => {
    if (prevCollapsedRef.current === collapsedDepartmentIds) return;
    prevCollapsedRef.current = collapsedDepartmentIds;
    if (!hasInitialFitRunRef.current || focusViewRootId) return;
    const instance = flowInstanceRef.current;
    if (!instance || nodes.length === 0) return;

    // Any collapse/expand after the initial fit should make Reset View available.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('org-structure-can-reset-view', {
          detail: { canReset: true },
        }),
      );
    }

    isProgrammaticFitRef.current = true;
    instance.fitView({ padding: 0.1, duration: 320, maxZoom: 1.4 });

    // After the programmatic zoom completes, stop suppressing onMoveEnd.
    const id = setTimeout(() => {
      isProgrammaticFitRef.current = false;
    }, 340);

    return () => clearTimeout(id);
  }, [collapsedDepartmentIds, focusViewRootId, nodes.length]);

  // Faster wheel/trackpad zoom (few strokes).
  // ReactFlow's built-in wheel zoom is disabled to prevent accidental zooming;
  // we implement our own with a larger step and prevent page scroll while over the chart.
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const minZoom = 0.1;
    const maxZoom = 1.5;
    // Base multiplier for one "wheel tick". Larger => one stroke zooms a lot.
    const zoomStep = 1.9;

    const onWheel = (e: WheelEvent) => {
      wheelZoomingRef.current = true;
      const instance = flowInstanceRef.current;
      if (!instance) return;

      // If the user is actively dragging, don't fight their gesture.
      if ((e.buttons ?? 0) !== 0) return;

      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;
      const viewport = instance.getViewport();
      // Scale by wheel delta so one mouse-wheel tick is a big zoom jump,
      // while trackpads (smaller deltas) remain smooth.
      const magnitude = Math.min(3, Math.abs(e.deltaY) / 100);
      const step = Math.pow(zoomStep, magnitude);
      const direction = e.deltaY < 0 ? step : 1 / step;
      const nextZoom = Math.min(
        maxZoom,
        Math.max(minZoom, viewport.zoom * direction),
      );

      // Keep the point under the cursor fixed while zooming.
      const worldX = (pointerX - viewport.x) / viewport.zoom;
      const worldY = (pointerY - viewport.y) / viewport.zoom;
      const nextX = pointerX - worldX * nextZoom;
      const nextY = pointerY - worldY * nextZoom;

      instance.setViewport(
        { x: nextX, y: nextY, zoom: nextZoom },
        { duration: 0 },
      );

      // If the user uses wheel/trackpad (two-finger) zoom, don't nag about pinch.
      pinchGestureCountRef.current = 0;
      if (showZoomHint) {
        setShowZoomHint(false);
      }
      setTimeout(() => {
        wheelZoomingRef.current = false;
      }, 200);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel as any);
    };
  }, [chartRef, showZoomHint]);

  // Detect repeated pinch zoom gestures (non-wheel, non-programmatic zoom changes).
  // After 3 distinct pinch gestures, show a UX tip about using two-finger scroll
  // for faster zooming.
  const handleMove = useCallback(
    (_evt: any, viewport: { x: number; y: number; zoom: number }) => {
      const prevZoom = lastZoomRef.current;
      lastZoomRef.current = viewport.zoom;

      // Ignore until we have a baseline zoom.
      if (prevZoom == null) return;

      // No meaningful zoom change.
      if (Math.abs(viewport.zoom - prevZoom) < 0.002) return;

      // Ignore our own fitView animations.
      if (isProgrammaticFitRef.current) return;

      // Ignore wheel/trackpad zoom – we specifically want pinch.
      if (wheelZoomingRef.current) return;

      // Ignore zooms that immediately follow entering Focus View
      // (these come from the Focus View button's fitView call).
      const now = Date.now();
      if (now - lastFocusViewActivatedAtRef.current < 700) {
        return;
      }

      const sinceLast = now - lastZoomGestureAtRef.current;

      // Treat zoom changes separated by >400ms as a new gesture.
      if (sinceLast > 400) {
        pinchGestureCountRef.current += 1;
        lastZoomGestureAtRef.current = now;
      }

      if (!showZoomHint && pinchGestureCountRef.current >= 3) {
        setShowZoomHint(true);
      }
    },
    [showZoomHint],
  );

  return (
    <OrgChartActionsProvider>
      <div
        className="w-full h-[calc(100vh-220px)] min-h-[280px] sm:h-[calc(100vh-280px)] sm:min-h-[420px] bg-white overflow-clip relative"
        ref={chartRef}
        data-cy="org-structure-chart-flow-container"
      >
        <ReactFlow
          nodes={nodes as Node[]}
          edges={edges as Edge[]}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onMove={handleMove}
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
          className="bg-white org-structure-flow"
        >
          <OrgChartExportBridge />
          <DepartmentUsersModalPositionBridge />
        </ReactFlow>
        {showZoomHint && (
          <div className="pointer-events-auto fixed bottom-10 right-[120px] z-[1001]">
            <div className="flex items-start gap-3 rounded-lg bg-white shadow-lg border border-slate-200 px-4 py-3 max-w-sm">
              <div className="mt-1 h-2 w-2 rounded-full bg-[#1E40AF]" />
              <div className="text-xs text-slate-700">
                <div className="font-medium mb-1 whitespace-nowrap">
                  Tip for faster zoom
                </div>
                <div className="whitespace-nowrap">
                  Use two-finger scroll up or down instead of pinch.
                </div>
              </div>
              <button
                type="button"
                aria-label="Dismiss zoom tip"
                className="ml-1 text-slate-400 hover:text-slate-600 text-xs"
                onClick={() => setShowZoomHint(false)}
              >
                ×
              </button>
            </div>
          </div>
        )}
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
        <div
          className="absolute inset-0 z-10 bg-white"
          data-cy="org-structure-skeleton-container"
        >
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
