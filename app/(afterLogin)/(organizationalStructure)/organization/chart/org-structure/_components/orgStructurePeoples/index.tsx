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
import { buildFlowFromTree } from './layout';
import type { OrgNodeData } from './layout';
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

  // When nodes load, fit the entire structure in view so the whole chart is visible on first load.
  const fitWholeStructure = useCallback(() => {
    const instance = flowInstanceRef.current;
    if (!instance || nodes.length === 0) return;
    instance.fitView({ padding: 0.12, duration: 0, maxZoom: 1.2 });
  }, [nodes.length]);

  useEffect(() => {
    if (nodes.length === 0) return;
    const timeoutId = setTimeout(fitWholeStructure, 350);
    return () => clearTimeout(timeoutId);
  }, [nodes.length, fitWholeStructure]);

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
            // Fit whole structure once viewport and nodes are ready (backup to effect)
            setTimeout(() => {
              const currentNodes = useDepartmentStore.getState().nodes;
              if (currentNodes.length > 0) {
                instance.fitView({ padding: 0.12, duration: 0, maxZoom: 1.2 });
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
