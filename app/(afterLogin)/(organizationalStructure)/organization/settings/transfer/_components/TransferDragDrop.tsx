'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { message } from 'antd';
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
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTransferDepartment } from '@/store/server/features/organizationStructure/mergeDepartments/mutations';
import { useTransferStore } from '@/store/uistate/features/organizationStructure/orgState/transferDepartmentsStore';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetOrgCharts } from '@/store/server/features/organizationStructure/organizationalChart/query';
import TeamCard, { Department } from './cards/TeamCard';
import AvailableTeamsPanel from './panels/AvailableTeamsPanel';
import InitialStateView from './panels/InitialStateView';
import ExpandedStateView from './panels/ExpandedStateView';
import TransferConfirmationModal from './modals/TransferConfirmationModal';

const TransferDragDrop: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceTeams, setSourceTeams] = useState<Department[]>([]);
  const [destinationTeam, setDestinationTeam] = useState<Department | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSourceOver, setIsSourceOver] = useState(false);
  const [isDestinationOver, setIsDestinationOver] = useState(false);

  const { data: departments } = useGetDepartments();
  const { data: orgStructureData } = useGetOrgCharts();
  const { mutate: transferDepartment, isLoading } = useTransferDepartment();

  const {
    setRootDepartment,
    setChildDepartment,
    setTransferDepartment,
    resetStore,
    transferDepartment: transferData,
  } = useTransferStore();

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
    const selectedIds = [
      ...sourceTeams.map((t) => t.id),
      destinationTeam?.id,
    ].filter(Boolean);

    return filteredDepartments
      .filter((dept: any) => !selectedIds.includes(dept.id))
      .map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        branchId: dept.branchId,
        description: dept.description,
      }));
  }, [filteredDepartments, sourceTeams, destinationTeam]);

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

  // Build transfer data when source teams or destination changes
  useEffect(() => {
    if (sourceTeams.length > 0 && destinationTeam && orgStructureData) {
      const rootDept = findDepartmentWithChildren(
        orgStructureData,
        destinationTeam.id,
      );

      if (!rootDept) return;

      const departmentChildren = sourceTeams.map((child) => {
        const departmentData = findDepartmentWithChildren(
          orgStructureData,
          child.id,
        );
        return {
          id: child.id,
          name: departmentData?.name || child.name,
          branchId: departmentData?.branchId || child.branchId,
          description: departmentData?.description || child.description,
        };
      });

      const transferData = {
        id: rootDept.id,
        name: rootDept.name,
        description: rootDept.description,
        branchId: rootDept.branchId,
        departmentToDelete: sourceTeams.map((child) => child.id),
        department: departmentChildren,
      };

      setTransferDepartment(transferData);
      setRootDepartment({
        id: destinationTeam.id,
        name: destinationTeam.name,
        branchId: destinationTeam.branchId,
        description: destinationTeam.description,
      });
      setChildDepartment(departmentChildren);
    }
  }, [
    sourceTeams,
    destinationTeam,
    orgStructureData,
    findDepartmentWithChildren,
    setTransferDepartment,
    setRootDepartment,
    setChildDepartment,
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
      // If dropped outside, and it was from source/destination, return to available
      if (
        sourceTeams.find((t) => t.id === active.id) ||
        (destinationTeam && destinationTeam.id === active.id)
      ) {
        // No explicit action needed here, as it will remain in its original list
        // or be handled by the availableDepartments filter if it was a new drag.
      }
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
      // Try to find in source teams
      const sourceTeam = sourceTeams.find((t) => t.id === activeId);
      if (sourceTeam) {
        deptData = sourceTeam;
      } else if (destinationTeam && destinationTeam.id === activeId) {
        deptData = destinationTeam;
      }
    }

    if (!deptData) return;

    // Check if dropping on another item (for reordering)
    const isDroppingOnItem = sourceTeams.some((t) => t.id === overId);

    // Handle drop on source-teams droppable area
    if (overId === 'source-teams') {
      // If item is already in source teams, it's a reorder (handled by SortableContext)
      if (!sourceTeams.find((t) => t.id === activeId)) {
        // Adding new item to source teams
        setSourceTeams([...sourceTeams, deptData]);
        // Remove from destination if it was there
        if (destinationTeam && destinationTeam.id === activeId) {
          setDestinationTeam(null);
        }
      }
    }
    // Handle drop on destination-team droppable area
    else if (overId === 'destination-team') {
      setDestinationTeam(deptData);
      // Remove from source teams if it was there
      if (sourceTeams.find((t) => t.id === activeId)) {
        setSourceTeams(sourceTeams.filter((t) => t.id !== activeId));
      }
    }
    // Handle drop back to available-teams (removes from source/destination)
    else if (overId === 'available-teams') {
      // Remove from source teams if it was there
      if (sourceTeams.find((t) => t.id === activeId)) {
        setSourceTeams(sourceTeams.filter((t) => t.id !== activeId));
      }
      // Remove from destination if it was there
      if (destinationTeam && destinationTeam.id === activeId) {
        setDestinationTeam(null);
      }
    }
    // Handle reordering within source teams (dropping on another item)
    else if (isDroppingOnItem && sourceTeams.find((t) => t.id === activeId)) {
      const oldIndex = sourceTeams.findIndex((t) => t.id === activeId);
      const newIndex = sourceTeams.findIndex((t) => t.id === overId);
      if (oldIndex !== newIndex) {
        setSourceTeams(arrayMove(sourceTeams, oldIndex, newIndex));
      }
    }
  };

  const handleAddAnotherTeam = () => {
    message.info('Drag a team from the left panel to add it');
  };

  const handleTransfer = () => {
    if (!destinationTeam) {
      message.error('Please select a destination team');
      return;
    }
    if (sourceTeams.length === 0) {
      message.error('Please select at least one team to transfer');
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmTransfer = () => {
    if (!transferData) {
      message.error('Transfer data is not ready');
      setIsModalOpen(false);
      return;
    }

    transferDepartment(transferData, {
      onSuccess: () => {
        message.success('Departments transferred successfully');
        setIsModalOpen(false);
        setSourceTeams([]);
        setDestinationTeam(null);
        resetStore();
      },
      onError: () => {
        setIsModalOpen(false);
      },
    });
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

  // Remove team from source teams
  const handleRemoveSourceTeam = useCallback((teamId: string) => {
    setSourceTeams((prev) => prev.filter((team) => team.id !== teamId));
  }, []);

  // Remove destination team
  const handleRemoveDestinationTeam = useCallback(() => {
    setDestinationTeam(null);
  }, []);

  // Get active dragged item for overlay
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return (
      availableDepartments.find((d: Department) => d.id === activeId) ||
      sourceTeams.find((t: Department) => t.id === activeId) ||
      (destinationTeam && destinationTeam.id === activeId
        ? destinationTeam
        : null)
    );
  }, [activeId, availableDepartments, sourceTeams, destinationTeam]);

  // Dynamic styling based on items in buckets
  const hasItemsInBuckets = sourceTeams.length > 0 || !!destinationTeam;
  const borderColorClass = hasItemsInBuckets
    ? 'border-primary'
    : 'border-gray-400';

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
        className="bg-white"
        id="org-settings-transfer-container"
        data-cy="org-settings-transfer-container"
      >
        <div className="flex flex-col lg:flex-row items-center lg:items-start"
        id="org-settings-transfer-container-div"
        data-cy="org-settings-transfer-container-div"
        >
          {/* Left Panel - Available Teams */}
          <AvailableTeamsPanel
            data-cy="org-settings-transfer-available-teams-panel"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            availableDepartments={availableDepartments}
            getTeamColor={getTeamColor}
          />
          <div 
          className="hidden lg:block w-[6%]"
          id="org-settings-transfer-container-divider-div"
          data-cy="org-settings-transfer-container-divider-div"
          ></div>

          {/* Middle Section - Conditional Layout */}
          {sourceTeams.length === 0 && !destinationTeam ? (
            <InitialStateView
              data-cy="org-settings-transfer-initial-state-view"
              availableDepartments={availableDepartments}
              isSourceOver={isSourceOver}
              setSourceTeams={setSourceTeams}
              sourceTeams={sourceTeams}
              setIsSourceOver={setIsSourceOver}
            />
          ) : (
            <ExpandedStateView
              data-cy="org-settings-transfer-expanded-state-view"
              sourceTeams={sourceTeams}
              destinationTeam={destinationTeam}
              availableDepartments={availableDepartments}
              filteredDepartments={filteredDepartments}
              isSourceOver={isSourceOver}
              isDestinationOver={isDestinationOver}
              onRemoveSourceTeam={handleRemoveSourceTeam}
              onRemoveDestinationTeam={handleRemoveDestinationTeam}
              setSourceTeams={setSourceTeams}
              setDestinationTeam={setDestinationTeam}
              handleAddAnotherTeam={handleAddAnotherTeam}
              handleTransfer={handleTransfer}
              isLoading={isLoading}
              hasItemsInBuckets={hasItemsInBuckets}
              setIsSourceOver={setIsSourceOver}
              setIsDestinationOver={setIsDestinationOver}
            />
          )}
        </div>
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="rotate-2"
          id="org-settings-transfer-drag-overlay-div"
          data-cy="org-settings-transfer-drag-overlay-div"
          >
            <TeamCard department={activeItem} isOverlay isDragging />
          </div>
        ) : null}
      </DragOverlay>

      <TransferConfirmationModal
        open={isModalOpen}
        onConfirm={handleConfirmTransfer}
        onCancel={() => setIsModalOpen(false)}
        sourceTeams={sourceTeams}
        destinationTeam={destinationTeam}
        loading={isLoading}
      />
    </DndContext>
  );
};

export default TransferDragDrop;
