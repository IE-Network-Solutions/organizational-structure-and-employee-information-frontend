'use client';
import dynamic from 'next/dynamic';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const MergeDragDrop = dynamic(() => import('./_components/MergeDragDrop'), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center min-h-[400px]"
      data-cy="merge-page-loading-container"
    >
      <div className="text-gray-500" data-cy="merge-page-loading-text">
        Loading merge interface...
      </div>
    </div>
  ),
});

const MergePage = () => {
  return (
    <AccessGuard
      permissions={[Permissions.DeleteDepartment]}
      data-cy="org-settings-merge-form-guard"
      id="org-settings-merge-form-guard"
    >
      <MergeDragDrop />
    </AccessGuard>
  );
};

export default MergePage;
