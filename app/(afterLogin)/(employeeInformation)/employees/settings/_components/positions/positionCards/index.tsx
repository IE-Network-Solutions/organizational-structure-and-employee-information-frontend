import DeleteModal from '@/components/common/deleteConfirmationModal';
import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import { useGetPositions } from '@/store/server/features/employees/positions/queries';
import { usePositionState } from '@/store/uistate/features/employees/positions';
import { useDeletePosition } from '@/store/server/features/employees/positions/mutation';
import PositionsEdit from '../positionEdit';
import RecruitmentPagination from '@/app/(afterLogin)/(recruitment)/recruitment/_components';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const PositionCards: React.FC = () => {
  const { data: positions } = useGetPositions();
  const { mutate: deletePosition } = useDeletePosition();

  const {
    currentPage,
    pageSize,
    deleteModal,
    deletedPositionId,
    editModal,
    setSelectedPosition,
    setDeleteModal,
    setCurrentPage,
    setPageSize,
    setSelectedPositionId,
    setDeletePositionId,
    setEditModal,
  } = usePositionState();

  const handlePositionEditModalOpen = (position: any) => {
    setSelectedPosition(position);
    setSelectedPositionId(position?.id);
    setEditModal(true);
  };
  const handlePositionDeleteModalOpen = (position: any) => {
    setSelectedPosition(position);
    setDeletePositionId(position?.id);
    setDeleteModal(true);
  };
  const handleDelete = () => {
    deletePosition(deletedPositionId);
    setDeleteModal(false);
  };

  return (
    <>
      {positions?.items && positions?.items?.length > 0 ? (
        positions?.items.map((position: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 my-5 mx-2 border-gray-100 border-[1px] rounded-md px-2 py-4"
          >
            <div className="text-medium font-medium">{position?.name}</div>
            <div className="flex items-center justify-center gap-2">
              <AccessGuard permissions={[Permissions.UpdatePosition]}>
                <div className="bg-[#2f78ee] w-7 h-7 rounded-md flex items-center justify-center">
                  <Pencil
                    size={15}
                    className="text-white cursor-pointer"
                    onClick={() => handlePositionEditModalOpen(position)}
                  />
                </div>
              </AccessGuard>
              <AccessGuard permissions={[Permissions.DeletePosition]}>
                <div className="bg-[#e03137] w-7 h-7 rounded-md flex items-center justify-center">
                  <Trash2
                    size={15}
                    className="text-white cursor-pointer"
                    onClick={() => handlePositionDeleteModalOpen(position)}
                  />
                </div>
              </AccessGuard>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center my-5">No Employee position available.</div>
      )}
      <DeleteModal
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
        onConfirm={handleDelete}
      />
      {editModal && <PositionsEdit />}
      <RecruitmentPagination
        current={currentPage}
        total={positions?.meta?.totalItems ?? 1}
        pageSize={pageSize}
        onChange={(page: number, pageSize: number) => {
          setCurrentPage(page);
          setPageSize(pageSize);
        }}
        onShowSizeChange={(size: number) => {
          setPageSize(size);
          setCurrentPage(pageSize);
        }}
      />
    </>
  );
};

export default PositionCards;
