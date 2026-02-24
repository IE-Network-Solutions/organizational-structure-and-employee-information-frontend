'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

// Dynamically import the drag-and-drop component with SSR disabled
// This ensures @dnd-kit works properly with Next.js
const TransferDragDrop = dynamic(
  () => import('./_components/TransferDragDrop'),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center min-h-[400px]"
        id="org-settings-transfer-loading-div"
        data-cy="org-settings-transfer-loading-div"
      >
        <div
          className="text-gray-500"
          id="org-settings-transfer-loading-div-text"
          data-cy="org-settings-transfer-loading-div-text"
        >Loading transfer interface...</div>
      </div>
    ),
  },
);

const TransferPage = () => {
  return (
    <AccessGuard
      permissions={[Permissions.DeleteDepartment]}
      data-cy="org-settings-transfer-form-guard"
      id="org-settings-transfer-form-guard"
    >
      <TransferDragDrop />
    </AccessGuard>
  );
};

export default TransferPage;
