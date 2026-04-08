import DeleteModal from '@/components/common/deleteConfirmationModal';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import React, { useEffect, useRef } from 'react';
import { Button, Dropdown, Skeleton } from 'antd';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { MenuProps } from 'antd';
import { useGetPositions } from '@/store/server/features/employees/positions/queries';
import { usePositionState } from '@/store/uistate/features/employees/positions';
import { useDeletePosition } from '@/store/server/features/employees/positions/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
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
    searchTerm,
    setSelectedPosition,
    setDeleteModal,
    setCurrentPage,
    setPageSize,
    setSelectedPositionId,
    setDeletePositionId,
    setEditModal,
    setFormValues,
    setOpenPositionDrawer,
  } = usePositionState();
  const { data: positions, isLoading } = useGetPositions(
    currentPage,
    pageSize,
    searchTerm,
  );

  const handlePositionEdit = (position: any) => {
    setSelectedPosition(position);
    setSelectedPositionId(position?.id);
    setFormValues({
      name: position?.name ?? '',
      description: position?.description ?? '',
    });
    setEditModal(false);
    setOpenPositionDrawer(true);
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
      {isLoading ? (
        <div
          id="settings-position-cards-skeleton"
          data-cy="settings-position-cards-skeleton"
        >
          {Array.from({ length: 5 }).map((notUsed, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2 my-2 mx-1 border-gray-100 border rounded-md px-2 py-2"
              id={`settings-position-card-skeleton-${index}`}
              data-cy={`settings-position-card-skeleton-${index}`}
            >
              <Skeleton.Input
                active
                className="!w-48 !min-w-0"
                data-cy={`settings-position-card-skeleton-name-${index}`}
              />
              <Skeleton.Button
                active
                size="small"
                data-cy={`settings-position-card-skeleton-menu-${index}`}
              />
            </div>
          ))}
        </div>
      ) : positions?.items && positions?.items?.length > 0 ? (
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
                    onClick={() => handlePositionEdit(position)}
                    id={`settings-position-edit-menu-item-${positionSlug}`}
                    data-cy={`settings-position-edit-menu-item-${positionSlug}`}
                  >
                    <EditOutlinedIcon className="text-gray-600" />
                    <span data-cy="settings-position-edit-menu-item-text">
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
                    <DeleteOutlineOutlinedIcon />
                    <span data-cy="settings-position-delete-menu-item-text">
                      Delete
                    </span>
                  </div>
                </AccessGuard>
              ),
            },
          ];
          return (
            <div
              key={index}
              className="flex items-center justify-between gap-2 my-2 mx-1 border-gray-100 border rounded-md px-2 py-2"
              id={`settings-position-card-${positionSlug}`}
              data-cy={`settings-position-card-${positionSlug}`}
            >
              <div
                className="text-sm font-medium leading-tight"
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
                    icon={<MoreHorizIcon fontSize="small" />}
                    className="w-7 h-7 !p-0 leading-none flex items-center justify-center border border-[#D9D9D9] rounded-md [&_.ant-btn-icon]:m-0 [&_.ant-btn-icon]:leading-none"
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
      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={positions?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
          showGoTo={false}
          data-cy="settings-position-custom-mobile-pagination"
        />
      ) : (
        <CustomMobilePagination
          totalResults={positions?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
          showGoTo={false}
          data-cy="settings-position-custom-mobile-pagination"
        />
      )}
    </>
  );
};

export default PositionCards;
