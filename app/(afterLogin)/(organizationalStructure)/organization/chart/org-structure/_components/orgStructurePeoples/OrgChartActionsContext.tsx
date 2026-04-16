'use client';

import React, { createContext, useContext, useCallback } from 'react';
import useDepartmentStore from '@/store/uistate/features/organizationStructure/orgState/departmentStates';
import type { DepartmentToEdit } from '@/store/uistate/features/organizationStructure/orgState/departmentStates';

export type { DepartmentToEdit };

type OrgChartActionsContextValue = {
  /** Open add department modal; pass element or event to position modal below it (e.g. the Add menu item) */
  openAddModal: (
    parentDepartmentId: string,
    anchorSource?: HTMLElement | React.MouseEvent,
  ) => void;
  /** Open edit department modal; pass element or event to position modal below it (e.g. the Edit menu item) */
  openEditModal: (
    departmentId: string,
    department: Omit<DepartmentToEdit, 'id'>,
    anchorSource?: HTMLElement | React.MouseEvent,
  ) => void;
  /** Open delete department modal (step 1: choose shift-to department, then step 2: confirm) */
  openDeleteModal: (departmentId: string, departmentName: string) => void;
};

const OrgChartActionsContext =
  createContext<OrgChartActionsContextValue | null>(null);

export function OrgChartActionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setAddModalOpen = useDepartmentStore((s) => s.setAddModalOpen);
  const setEditModalOpen = useDepartmentStore((s) => s.setEditModalOpen);
  const setParentIdForAdd = useDepartmentStore((s) => s.setParentIdForAdd);
  const setAddModalAnchor = useDepartmentStore((s) => s.setAddModalAnchor);
  const setEditModalAnchor = useDepartmentStore((s) => s.setEditModalAnchor);
  const setDepartmentToEdit = useDepartmentStore((s) => s.setDepartmentToEdit);
  const setLastCreatedDepartment = useDepartmentStore(
    (s) => s.setLastCreatedDepartment,
  );
  const setDeleteModalOpen = useDepartmentStore((s) => s.setDeleteModalOpen);
  const setDeleteStep = useDepartmentStore((s) => s.setDeleteStep);
  const setDepartmentTobeDeleted = useDepartmentStore(
    (s) => s.setDepartmentTobeDeleted,
  );
  const setDepartmentTobeShiftedId = useDepartmentStore(
    (s) => s.setDepartmentTobeShiftedId,
  );

  const openDeleteModal = useCallback(
    (departmentId: string, departmentName: string) => {
      setDepartmentTobeDeleted(departmentId, departmentName);
      setDepartmentTobeShiftedId(null);
      setDeleteStep(1);
      setDeleteModalOpen(true);
    },
    [
      setDepartmentTobeDeleted,
      setDepartmentTobeShiftedId,
      setDeleteStep,
      setDeleteModalOpen,
    ],
  );

  const openAddModal = useCallback(
    (
      parentDepartmentId: string,
      anchorSource?: HTMLElement | React.MouseEvent,
    ) => {
      const el =
        anchorSource instanceof HTMLElement
          ? anchorSource
          : ((anchorSource as React.MouseEvent)?.currentTarget as
              | HTMLElement
              | undefined);
      if (el) {
        const rect = el.getBoundingClientRect();
        setAddModalAnchor({ top: rect.bottom, left: rect.left });
      } else {
        setAddModalAnchor(null);
      }
      setParentIdForAdd(parentDepartmentId);
      setDepartmentToEdit(null);
      setAddModalOpen(true);
    },
    [
      setParentIdForAdd,
      setAddModalOpen,
      setDepartmentToEdit,
      setAddModalAnchor,
    ],
  );

  const openEditModal = useCallback(
    (
      departmentId: string,
      department: Omit<DepartmentToEdit, 'id'>,
      anchorSource?: HTMLElement | React.MouseEvent,
    ) => {
      const el =
        anchorSource instanceof HTMLElement
          ? anchorSource
          : ((anchorSource as React.MouseEvent)?.currentTarget as
              | HTMLElement
              | undefined);
      if (el) {
        const rect = el.getBoundingClientRect();
        setEditModalAnchor({ top: rect.bottom, left: rect.left });
      } else {
        setEditModalAnchor(null);
      }
      setAddModalAnchor(null);
      const hasIncompleteNodeData = !department?.name?.trim?.();
      const cached = useDepartmentStore.getState().lastCreatedDepartment;
      const hasCachedCreated = cached?.name?.trim?.();
      const useCached =
        hasIncompleteNodeData &&
        hasCachedCreated &&
        (cached?.id === departmentId || !cached?.id?.trim?.());
      if (useCached && cached) {
        setDepartmentToEdit({
          id: departmentId,
          name: cached.name,
          description: cached.description ?? '',
          branchId: cached.branchId ?? '',
        });
        setLastCreatedDepartment(null);
      } else {
        setDepartmentToEdit({ id: departmentId, ...department });
      }
      setEditModalOpen(true);
      setAddModalOpen(false);
    },
    [
      setDepartmentToEdit,
      setEditModalOpen,
      setAddModalOpen,
      setAddModalAnchor,
      setEditModalAnchor,
      setLastCreatedDepartment,
    ],
  );

  const value: OrgChartActionsContextValue = {
    openAddModal,
    openEditModal,
    openDeleteModal,
  };

  return (
    <OrgChartActionsContext.Provider value={value}>
      {children}
    </OrgChartActionsContext.Provider>
  );
}

export function useOrgChartActions() {
  const ctx = useContext(OrgChartActionsContext);
  return ctx;
}
