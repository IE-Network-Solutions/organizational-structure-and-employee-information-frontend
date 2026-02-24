'use client';
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { message } from 'antd';
import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useMergingDepartment } from '@/store/server/features/organizationStructure/mergeDepartments/mutations';
import { useMergeStore } from '@/store/uistate/features/organizationStructure/orgState/mergeDepartmentsStore';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetOrgCharts } from '@/store/server/features/organizationStructure/organizationalChart/query';
import TeamCard, { Department } from './cards/TeamCard';
import AvailableTeamsPanel from './panels/AvailableTeamsPanel';
import SourceDestinationView from './panels/SourceDestinationView';
import MergeFormModal from './modals/MergeFormModal';
import MergeConfirmationModal from './modals/MergeConfirmationModal';

const MergeDragDrop: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceTeam, setSourceTeam] = useState<Department | null>(null);
  const [destinationTeam, setDestinationTeam] = useState<Department | null>(
    null,
  );
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    teamLead: string;
    departmentName: string;
  } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSourceOver, setIsSourceOver] = useState(false);
  const [isDestinationOver, setIsDestinationOver] = useState(false);

  // Refs for React Flow positioning
  const sourceBoxRef = useRef<HTMLDivElement>(null);
  const destinationBoxRef = useRef<HTMLDivElement>(null);
  const mergeButtonRef = useRef<HTMLDivElement>(null);
  const mergeButtonMobileRef = useRef<HTMLDivElement>(null);
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);

  const { data: departments, refetch: refetchDepartments } =
    useGetDepartments();
  const { data: orgStructureData } = useGetOrgCharts();
  const { mutate: mergeDepartment, isLoading } = useMergingDepartment();

  const { setMergeData, mergeData } = useMergeStore();

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Filter departments based on search
  const filteredDepartments = useMemo(() => {
    if (!departments) return [];
    const query = searchQuery.toLowerCase().trim();
    if (!query) return departments;

    return departments.filter((dept: any) =>
      dept.name?.toLowerCase().includes(query),
    );
  }, [departments, searchQuery]);

  // Exclude already selected teams from the list
  const availableDepartments = useMemo(() => {
    const selectedIds = [sourceTeam?.id, destinationTeam?.id].filter(Boolean);

    return filteredDepartments
      .filter((dept: any) => !selectedIds.includes(dept.id))
      .map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        branchId: dept.branchId,
        description: dept.description,
      }));
  }, [filteredDepartments, sourceTeam, destinationTeam]);

  // Department cache for finding departments with children
  const departmentCache: Record<string, any> = {};

  const findDepartmentWithChildren = useCallback(
    (tree: any, id: string): any => {
      if (departmentCache[id]) return departmentCache[id];

      if (tree.id === id) {
        const departmentData = {
          id: tree.id,
          name: tree.name,
          description: tree.description,
          branchId: tree.branchId,
          children: tree.department || [],
        };
        departmentCache[id] = departmentData;
        return departmentData;
      }
      if (tree.department?.length) {
        for (const child of tree.department) {
          const result = findDepartmentWithChildren(child, id);
          if (result) {
            departmentCache[id] = result;
            return result;
          }
        }
      }
      return null;
    },
    [],
  );

  // Compute depth (level) of a department in the org tree; root = 1
  const getDepartmentLevel = useCallback((tree: any, id: string, depth = 1): number => {
    if (!tree) return 1;
    if (tree.id === id) return depth;
    if (tree.department?.length) {
      for (const child of tree.department) {
        const found = getDepartmentLevel(child, id, depth + 1);
        if (found > 0) return found;
      }
    }
    return 0;
  }, []);

  // Build merge data
  useEffect(() => {
    if (sourceTeam && destinationTeam && orgStructureData) {
      const destinationDept = findDepartmentWithChildren(
        orgStructureData,
        destinationTeam.id,
      );
      const sourceDept = findDepartmentWithChildren(
        orgStructureData,
        sourceTeam.id,
      );

      if (destinationDept && sourceDept) {
        const level = getDepartmentLevel(orgStructureData, destinationTeam.id) || 3;

        // API expects department: []; teamLeader added at submit time
        const mergePayload = {
          id: destinationTeam.id,
          name: destinationTeam.name,
          description: destinationTeam.description || '',
          branchId: destinationTeam.branchId,
          departmentToDelete: [sourceTeam.id],
          department: [],
          level,
        };

        setMergeData(mergePayload);
      }
    }
  }, [
    sourceTeam,
    destinationTeam,
    orgStructureData,
    findDepartmentWithChildren,
    getDepartmentLevel,
    setMergeData,
  ]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setIsSourceOver(false);
    setIsDestinationOver(false);

    if (!over) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the department being dragged
    let deptData: Department | null = null;

    // Try to find in available departments
    const availableDept = availableDepartments.find(
      (d: Department) => d.id === activeId,
    );
    if (availableDept) {
      deptData = availableDept;
    } else {
      // Try to find in source team
      if (sourceTeam && sourceTeam.id === activeId) {
        deptData = sourceTeam;
      } else if (destinationTeam && destinationTeam.id === activeId) {
        deptData = destinationTeam;
      }
    }

    if (!deptData) return;

    // Handle drop on source-teams droppable area
    if (overId === 'source-teams') {
      setSourceTeam(deptData);
      // Remove from destination if it was there
      if (destinationTeam && destinationTeam.id === activeId) {
        setDestinationTeam(null);
      }
    }
    // Handle drop on destination-team droppable area
    else if (overId === 'destination-team') {
      setDestinationTeam(deptData);
      // Remove from source team if it was there
      if (sourceTeam && sourceTeam.id === activeId) {
        setSourceTeam(null);
      }
    }
    // Handle drop back to available-teams (removes from source/destination)
    else if (overId === 'available-teams') {
      // Remove from source team if it was there
      if (sourceTeam && sourceTeam.id === activeId) {
        setSourceTeam(null);
      }
      // Remove from destination if it was there
      if (destinationTeam && destinationTeam.id === activeId) {
        setDestinationTeam(null);
      }
    }
  };

  // Remove handlers for mobile X buttons
  const handleRemoveSourceTeam = useCallback(() => {
    setSourceTeam(null);
  }, []);

  const handleRemoveDestinationTeam = useCallback(() => {
    setDestinationTeam(null);
  }, []);

  const handleMerge = () => {
    if (!destinationTeam) {
      message.error('Please select a destination team');
      return;
    }
    if (!sourceTeam) {
      message.error('Please select a source team to merge');
      return;
    }
    setIsFormModalOpen(true);
  };

  const handleFormNext = (data: {
    teamLead: string;
    departmentName: string;
  }) => {
    setFormData(data);
    setIsFormModalOpen(false);
    setIsConfirmationModalOpen(true);
  };

  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setFormData(null);
  };

  const handleConfirmMerge = () => {
    if (!mergeData) {
      message.error('Merge data is not ready');
      setIsConfirmationModalOpen(false);
      return;
    }

    // Update merge data with form values - API expects teamLeader and name from form
    const updatedMergeData = {
      ...mergeData,
      name: formData?.departmentName || mergeData.name,
      teamLeader: formData?.teamLead ?? '',
      level: mergeData.level ?? 3,
    };

    mergeDepartment(updatedMergeData, {
      onSuccess: () => {
        message.success('Departments merged successfully');
        setIsConfirmationModalOpen(false);
        setSourceTeam(null);
        setDestinationTeam(null);
        setMergeData(null);
        setFormData(null);
        refetchDepartments();
      },
      onError: () => {
        setIsConfirmationModalOpen(false);
      },
    });
  };

  const handleConfirmationCancel = () => {
    setIsConfirmationModalOpen(false);
    setFormData(null);
  };

  const getTeamColor = (index: number) => {
    const colors = [
      'bg-green-50 border-green-200',
      'bg-pink-50 border-pink-200',
      'bg-blue-50 border-blue-200',
      'bg-yellow-50 border-yellow-200',
      'bg-gray-50 border-gray-200',
      'bg-purple-50 border-purple-200',
    ];
    return colors[index % colors.length];
  };

  // Get active dragged item for overlay
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return (
      availableDepartments.find((d: Department) => d.id === activeId) ||
      (sourceTeam && sourceTeam.id === activeId ? sourceTeam : null) ||
      (destinationTeam && destinationTeam.id === activeId
        ? destinationTeam
        : null)
    );
  }, [activeId, availableDepartments, sourceTeam, destinationTeam]);

  // Dynamic styling based on items in buckets
  const hasItemsInBuckets = !!(sourceTeam && destinationTeam); // For button border - only when both are present
  const borderColorClass = hasItemsInBuckets
    ? 'border-primary'
    : 'border-gray-400';
  const textColorClass = hasItemsInBuckets ? 'text-primary' : 'text-gray-900';

  // Get primary color value dynamically from Tailwind theme
  const primaryColorValue = useMemo(() => {
    if (typeof window === 'undefined') return '#3636F0'; // Fallback to Tailwind config value
    const tempEl = document.createElement('div');
    tempEl.className = 'bg-primary';
    tempEl.style.position = 'absolute';
    tempEl.style.visibility = 'hidden';
    tempEl.style.pointerEvents = 'none';
    document.body.appendChild(tempEl);
    const computedColor = window.getComputedStyle(tempEl).backgroundColor;
    document.body.removeChild(tempEl);
    return computedColor || '#3636F0';
  }, []);

  // Function to calculate and update node positions
  const updateNodePositions = useCallback(() => {
    // Only show lines on desktop (when desktop button is visible)
    const isDesktop =
      mergeButtonRef.current &&
      window.getComputedStyle(mergeButtonRef.current).display !== 'none';
    const shouldShowLines =
      isDesktop &&
      mergeButtonRef.current &&
      sourceBoxRef.current &&
      destinationBoxRef.current;
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (shouldShowLines) {
      const buttonRect = mergeButtonRef.current.getBoundingClientRect();
      const containerRect = mergeButtonRef.current
        .closest('[data-cy="org-settings-merge-container"]')
        ?.getBoundingClientRect();

      if (containerRect && buttonRect) {
        const buttonX =
          buttonRect.left - containerRect.left + buttonRect.width / 2;
        const buttonY = buttonRect.top - containerRect.top;

        // Add merge button node (always add)
        nodes.push({
          id: 'merge-button-node',
          position: { x: buttonX - 10, y: buttonY + 2 },
          data: { label: '' },
          style: { width: 20, height: 20, opacity: 0 },
          draggable: false,
          selectable: false,
        });

        // Always add source box node and edge (even when empty)
        const sourceRect = sourceBoxRef.current.getBoundingClientRect();
        const sourceX =
          sourceRect.left - containerRect.left + sourceRect.width / 2;
        const sourceY = sourceRect.bottom - containerRect.top - 25;

        nodes.push({
          id: 'source-node',
          position: { x: sourceX - 10, y: sourceY },
          data: { label: '' },
          style: { width: 20, height: 20, opacity: 0 },
          draggable: false,
          selectable: false,
        });

        edges.push({
          id: 'source-to-merge',
          source: 'source-node',
          target: 'merge-button-node',
          type: 'straight',
          style: {
            stroke: sourceTeam ? primaryColorValue : '#e5e7eb',
            strokeWidth: 2,
            strokeDasharray: sourceTeam ? 0 : '5 3', // Solid when has item, dashed when empty
          },
          animated: sourceTeam ? true : false,
        });

        // Always add destination box node and edge (even when empty)
        const destinationRect =
          destinationBoxRef.current.getBoundingClientRect();
        const destinationX =
          destinationRect.left - containerRect.left + destinationRect.width / 2;
        const destinationY = destinationRect.bottom - containerRect.top - 25;

        nodes.push({
          id: 'destination-node',
          position: { x: destinationX - 10, y: destinationY },
          data: { label: '' },
          style: { width: 20, height: 20, opacity: 0 },
          draggable: false,
          selectable: false,
        });

        edges.push({
          id: 'destination-to-merge',
          source: 'destination-node',
          target: 'merge-button-node',
          type: 'straight',
          style: {
            stroke: destinationTeam ? primaryColorValue : '#e5e7eb',
            strokeWidth: 2,
            strokeDasharray: destinationTeam ? 0 : '5 3', // Solid when has item, dashed when empty
          },
          animated: destinationTeam ? true : false,
        });

        // Always update if we have nodes
        if (nodes.length > 0) {
          setFlowNodes(nodes);
          setFlowEdges(edges);
        }
      }
    } else {
      // Clear if refs are not available
      setFlowNodes([]);
      setFlowEdges([]);
    }
  }, [sourceTeam, destinationTeam, primaryColorValue]);

  // Update React Flow nodes and edges based on positions
  useEffect(() => {
    // Use requestAnimationFrame and setTimeout to ensure DOM has updated
    let timeoutId: NodeJS.Timeout;
    const rafId = requestAnimationFrame(() => {
      timeoutId = setTimeout(() => {
        updateNodePositions();
      }, 50); // Small delay to ensure DOM is fully updated
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [updateNodePositions]);

  // Update positions on window resize and layout changes
  useEffect(() => {
    const handleResize = () => {
      updateNodePositions();
    };

    // Use ResizeObserver to watch for layout changes
    let resizeObserver: ResizeObserver | null = null;
    const container = mergeButtonRef.current?.closest(
      '[data-cy="org-settings-merge-container"]',
    );

    if (container) {
      resizeObserver = new ResizeObserver(() => {
        updateNodePositions();
      });
      resizeObserver.observe(container);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [updateNodePositions]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={({ over }) => {
        setIsSourceOver(over?.id === 'source-teams');
        setIsDestinationOver(over?.id === 'destination-team');
      }}
    >
      <div
        className="bg-white relative"
        data-cy="org-settings-merge-container"
        id="org-settings-merge-container"
      >
        {/* React Flow overlay for connection lines - Desktop only */}
        {flowNodes.length > 0 && (
          <div
            className="hidden lg:block absolute inset-0 pointer-events-none z-30"
            style={{ overflow: 'visible' }}
            data-cy="merge-react-flow-overlay-container"
          >
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              fitView={false}
              panOnDrag={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              preventScrolling={false}
              style={{
                background: 'transparent',
                width: '100%',
                height: '100%',
              }}
              data-cy="merge-react-flow"
            ></ReactFlow>
          </div>
        )}
        <div
          className="flex flex-col lg:flex-row items-start"
          data-cy="merge-main-content-container"
        >
          {/* Left Panel - Available Teams */}
          <AvailableTeamsPanel
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            availableDepartments={availableDepartments}
            getTeamColor={getTeamColor}
          />
          <div
            className="hidden lg:block w-[6%]"
            data-cy="merge-spacer-div"
          ></div>

          {/* Middle Section - Two boxes with button below/between */}
          <SourceDestinationView
            sourceTeam={sourceTeam}
            destinationTeam={destinationTeam}
            availableDepartments={availableDepartments}
            filteredDepartments={filteredDepartments}
            isSourceOver={isSourceOver}
            isDestinationOver={isDestinationOver}
            onRemoveSourceTeam={handleRemoveSourceTeam}
            onRemoveDestinationTeam={handleRemoveDestinationTeam}
            setSourceTeam={setSourceTeam}
            setDestinationTeam={setDestinationTeam}
            handleMerge={handleMerge}
            isLoading={isLoading}
            hasItemsInBuckets={hasItemsInBuckets}
            borderColorClass={borderColorClass}
            textColorClass={textColorClass}
            setIsSourceOver={setIsSourceOver}
            setIsDestinationOver={setIsDestinationOver}
            sourceBoxRef={sourceBoxRef}
            destinationBoxRef={destinationBoxRef}
            mergeButtonRef={mergeButtonRef}
            mergeButtonMobileRef={mergeButtonMobileRef}
          />
        </div>
      </div>

      <DragOverlay data-cy="merge-drag-overlay">
        {activeItem ? (
          <div className="rotate-2" data-cy="merge-drag-overlay-item-container">
            <TeamCard department={activeItem} isOverlay isDragging />
          </div>
        ) : null}
      </DragOverlay>

      <MergeFormModal
        open={isFormModalOpen}
        onNext={handleFormNext}
        onCancel={handleFormCancel}
        sourceTeam={sourceTeam}
        destinationTeam={destinationTeam}
      />
      <MergeConfirmationModal
        open={isConfirmationModalOpen}
        onConfirm={handleConfirmMerge}
        onCancel={handleConfirmationCancel}
        sourceTeams={sourceTeam ? [sourceTeam] : []}
        destinationTeam={destinationTeam}
        loading={isLoading}
      />
    </DndContext>
  );
};

export default MergeDragDrop;
