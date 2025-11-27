'use client';
import React, { useState } from 'react';
import IncentiveFilter from './filters';
import AllIncentiveTable from './table';
import IncentiveCards from '../cards';
import { Card, Skeleton, Button, Space } from 'antd';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { DeleteOutlined } from '@ant-design/icons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useDeleteBulkIncentives } from '@/store/server/features/incentive/other/mutation';
import DeleteModal from '@/components/common/deleteConfirmationModal';

const AllIncentives = () => {
  const { parentResponseIsLoading, selectedRowKeys, setSelectedRowKeys } =
    useIncentiveStore();
  const { mutate: deleteBulkIncentives, isLoading: isDeleting } =
    useDeleteBulkIncentives();
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const handleBulkDelete = () => {
    if (selectedRowKeys && selectedRowKeys.length > 0) {
      deleteBulkIncentives(
        { ids: selectedRowKeys as string[] },
        {
          onSuccess: () => {
            setSelectedRowKeys([]);
            setShowBulkDeleteModal(false);
          },
        },
      );
    }
  };

  const hasSelectedRows = selectedRowKeys && selectedRowKeys.length > 0;

  return (
    <div className="">
      {parentResponseIsLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map(
            /* eslint-disable-next-line @typescript-eslint/naming-convention */
            (_, index) => (
              /* eslint-enable-next-line @typescript-eslint/naming-convention */
              <Card key={index}>
                <Skeleton active />
              </Card>
            ),
          )}
        </div>
      ) : (
        <IncentiveCards />
      )}
      {parentResponseIsLoading ? (
        <Skeleton active paragraph={{ rows: 1 }} />
      ) : (
        <IncentiveFilter />
      )}
      {!parentResponseIsLoading && hasSelectedRows && (
        <div className="mb-4 flex justify-end">
          <AccessGuard
            permissions={[Permissions.DeleteRecognition]}
            id="incentive-bulk-delete-guard"
            data-cy="incentive-bulk-delete-guard"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setShowBulkDeleteModal(true)}
              loading={isDeleting}
              id="incentive-bulk-delete-button"
              data-cy="incentive-bulk-delete-button"
            >
              Delete Selected ({selectedRowKeys.length})
            </Button>
          </AccessGuard>
        </div>
      )}
      {parentResponseIsLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <AllIncentiveTable />
      )}
      <DeleteModal
        open={showBulkDeleteModal}
        onCancel={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        deleteMessage={`Are you sure you want to permanently delete ${selectedRowKeys?.length || 0} selected record(s)? This action cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  );
};

export default AllIncentives;
