import DeleteModal from '@/components/common/deleteConfirmationModal';
import { Pencil, Trash2 } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { Button, Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useGetPositions } from '@/store/server/features/employees/positions/queries';
import { usePositionState } from '@/store/uistate/features/employees/positions';
import { useDeletePosition } from '@/store/server/features/employees/positions/mutation';
import PositionsEdit from '../positionEdit';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const PositionCards: React.FC = () => {
  const { mutate: deletePosition } = useDeletePosition();
  const { isMobile, isTablet } = useIsMobile();
  const {
    currentPage,
    pageSize,
    deleteModal,
    deletedPositionId,
    editModal,
    searchTerm,
    setSelectedPosition,
    setDeleteModal,
    setCurrentPage,
    setPageSize,
    setSelectedPositionId,
    setDeletePositionId,
    setEditModal,
  } = usePositionState();
  const { data: positions } = useGetPositions(
    currentPage,
    pageSize,
    searchTerm,
  );

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

  const prevSearchTermRef = useRef<string>('');
  useEffect(() => {
    // Reset to page 1 when search term actually changes
    if (prevSearchTermRef.current !== searchTerm && currentPage !== 1) {
      setCurrentPage(1);
    }
    prevSearchTermRef.current = searchTerm;
  }, [searchTerm, currentPage, setCurrentPage]);

  const onPageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  return (
    <>
      {positions?.items && positions?.items?.length > 0 ? (
        positions?.items.map((position: any, index: number) => {
          const positionSlug = toSlug(position?.id ?? position?.name ?? index);
          const menuItems: MenuProps['items'] = [
            {
              key: 'edit',
              label: (
                <AccessGuard
                  permissions={[Permissions.UpdatePosition]}
                  id={`settings-position-edit-menu-guard-${positionSlug}`}
                  data-cy={`settings-position-edit-menu-guard-${positionSlug}`}
                >
                  <div
                    className="flex items-center gap-2"
                    onClick={() => handlePositionEditModalOpen(position)}
                    id={`settings-position-edit-menu-item-${positionSlug}`}
                    data-cy={`settings-position-edit-menu-item-${positionSlug}`}
                  >
                    <Pencil size={14} className="text-gray-600" />
                    <span data-cy="settings-position-edit-menu-item-label">
                      Edit
                    </span>
                  </div>
                </AccessGuard>
              ),
            },
            {
              key: 'delete',
              label: (
                <AccessGuard
                  permissions={[Permissions.DeletePosition]}
                  id={`settings-position-delete-menu-guard-${positionSlug}`}
                  data-cy={`settings-position-delete-menu-guard-${positionSlug}`}
                >
                  <div
                    className="flex items-center gap-2 text-red-600"
                    onClick={() => handlePositionDeleteModalOpen(position)}
                    id={`settings-position-delete-menu-item-${positionSlug}`}
                    data-cy={`settings-position-delete-menu-item-${positionSlug}`}
                  >
                    <Trash2 size={14} />
                    <span data-cy="settings-position-delete-menu-item-label">
                      Delete
                    </span>
                  </div>
                </AccessGuard>
              ),
              danger: true,
            },
          ];
          return (
            <div
              key={index}
              className="flex items-center justify-between gap-3 my-5 mx-2 border-gray-100 border-[1px] rounded-md px-2 py-4"
              id={`settings-position-card-${positionSlug}`}
              data-cy={`settings-position-card-${positionSlug}`}
            >
              <div
                className="text-medium font-medium"
                id={`settings-position-card-name-${positionSlug}`}
                data-cy={`settings-position-card-name-${positionSlug}`}
              >
                {position?.name}
              </div>
              <div
                className="flex items-center justify-center gap-2"
                id={`settings-position-card-actions-${positionSlug}`}
                data-cy={`settings-position-card-actions-${positionSlug}`}
              >
                <Dropdown
                  menu={{ items: menuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                    id={`settings-position-menu-btn-${positionSlug}`}
                    data-cy={`settings-position-menu-btn-${positionSlug}`}
                  />
                </Dropdown>
              </div>
            </div>
          );
        })
      ) : (
        <div
          className="text-center my-5"
          id="settings-position-empty"
          data-cy="settings-position-empty"
        >
          No Employee position available.
        </div>
      )}
      <DeleteModal
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        data-cy="settings-position-delete-modal"
      />
      {editModal && <PositionsEdit data-cy="settings-position-edit-form" />}

      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={positions?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
          data-cy="settings-position-custom-mobile-pagination"
        />
      ) : (
        <CustomPagination
          current={currentPage}
          total={positions?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={(pageSize) => setPageSize(pageSize)}
          data-cy="settings-position-custom-pagination"
        />
      )}
    </>
  );
};

export default PositionCards;
