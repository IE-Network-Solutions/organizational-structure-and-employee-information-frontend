'use client';
import { Button, Table, Spin } from 'antd';
import React from 'react';
import { FaPlus, FaUser } from 'react-icons/fa';
import { Pencil, Trash2 } from 'lucide-react';
import EmployementTypeSideDrawer from './_components/employementTypeSideDrawer';
import { EmployeTypeManagementStore } from '@/store/uistate/features/employees/settings/emplyeTypeDrawer';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { useDeleteEmployeeType } from '@/store/server/features/employees/employeeManagment/employmentType/mutations';
import { EmploymentTypeInfo } from '@/store/server/features/employees/employeeManagment/employmentType/interface';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import DeleteModal from '@/components/common/deleteConfirmationModal';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const EmploymentType = () => {
  const { setOpen, pageSize, setPageSize, setPage, page } =
    EmployeTypeManagementStore();
  const { data: employeTypeData, isLoading } = useGetEmployementTypes(
    page,
    pageSize,
  );
  const deleteEmployeeType = useDeleteEmployeeType() as any;
  const { isMobile, isTablet } = useIsMobile();
  const [editingEmploymentType, setEditingEmploymentType] =
    React.useState<EmploymentTypeInfo | null>(null);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [employmentTypeToDelete, setEmploymentTypeToDelete] =
    React.useState<EmploymentTypeInfo | null>(null);
  const showDrawer = () => {
    setIsEditMode(false);
    setEditingEmploymentType(null);
    setOpen(true);
  };

  const handleEdit = (record: EmploymentTypeInfo) => {
    setEditingEmploymentType(record);
    setIsEditMode(true);
    setOpen(true);
  };

  const handleDelete = (record: EmploymentTypeInfo) => {
    setEmploymentTypeToDelete(record);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (employmentTypeToDelete) {
      try {
        await deleteEmployeeType.mutateAsync(employmentTypeToDelete.id!);
        setDeleteModalOpen(false);
        setEmploymentTypeToDelete(null);
      } catch (error) {
        // Error deleting employment type
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setEmploymentTypeToDelete(null);
  };

  const onClose = () => {
    setOpen(false);
    setIsEditMode(false);
    setEditingEmploymentType(null);
  };
  const onPageChange = (page: number, pageSize?: number) => {
    setPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const reformattedData = employeTypeData?.items?.map(
    (item: EmploymentTypeInfo) => {
      const rowSlug = toSlug(item.id ?? item.name);
      return {
        ...item,
        __slug: rowSlug,
        displayName: (
          <div
            className="flex space-x-2 font-semibold"
            id={`employment-type-row-${rowSlug}`}
            data-cy={`employment-type-row-${rowSlug}`}
          >
            <FaUser
              className="mt-3 text-gray-500"
              id={`employment-type-row-icon-${rowSlug}`}
              data-cy={`employment-type-row-icon-${rowSlug}`}
            />
            <p
              className="flex flex-col"
              id={`employment-type-row-text-${rowSlug}`}
              data-cy={`employment-type-row-text-${rowSlug}`}
            >
              <span
                id={`employment-type-row-name-${rowSlug}`}
                data-cy={`employment-type-row-name-${rowSlug}`}
              >
                {item.name}
              </span>
              <span
                className="text-gray-500 text-xs"
                id={`employment-type-row-description-${rowSlug}`}
                data-cy={`employment-type-row-description-${rowSlug}`}
              >
                {item.description || 'No description provided'}
              </span>
            </p>
          </div>
        ),
      };
    },
  );

  const columns: any = [
    {
      dataIndex: 'displayName',
      key: 'Name',
    },
  ];

  const pageSlug = 'employment-type';

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id={`settings-${pageSlug}-container`}
      data-cy={`settings-${pageSlug}-container`}
    >
      <div
        className="flex justify-between items-center mb-4"
        id={`settings-${pageSlug}-header`}
        data-cy={`settings-${pageSlug}-header`}
      >
        <h1
          className="text-black font-bold text-lg "
          id={`settings-${pageSlug}-title`}
          data-cy={`settings-${pageSlug}-title`}
        >
          Employment Type
        </h1>

        <div
          className="flex items-center space-x-2"
          id={`settings-${pageSlug}-actions`}
          data-cy={`settings-${pageSlug}-actions`}
        >
          <AccessGuard permissions={[Permissions.CreateEmploymentType]} id="settings-employment-type-add-btn-guard" data-cy="settings-employment-type-add-btn-guard">
            {/* Desktop button */}
            <Button
              className="hidden sm:flex items-center justify-center space-x-2 px-4 py-2 font-bold bg-[#3636F0] text-white hover:bg-[#2d2dbf] border-none"
              onClick={showDrawer}
              id={`settings-${pageSlug}-add-btn-desktop`}
              data-cy={`settings-${pageSlug}-add-btn-desktop`}
            >
              <FaPlus
                className="text-white"
                id={`settings-${pageSlug}-add-icon-desktop`}
                data-cy={`settings-${pageSlug}-add-icon-desktop`}
              />
              <span
                id={`settings-${pageSlug}-add-text-desktop`}
                data-cy={`settings-${pageSlug}-add-text-desktop`}
              >
                Add New Type
              </span>
            </Button>

            {/* Mobile button */}
            <Button
              className="flex sm:hidden h-10 w-10 sm:w-auto"
              onClick={showDrawer}
              type="primary"
              icon={<FaPlus />}
              id={`settings-${pageSlug}-add-btn-mobile`}
              data-cy={`settings-${pageSlug}-add-btn-mobile`}
            />
          </AccessGuard>
        </div>
      </div>

      <EmployementTypeSideDrawer
        onClose={onClose}
        editingEmploymentType={editingEmploymentType}
        isEditMode={isEditMode}
        data-cy="settings-employment-type-drawer"
      />
      <DeleteModal
        open={deleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        deleteMessage={`Are you sure you want to delete "${employmentTypeToDelete?.name}"?`}
        customMessage="This action cannot be undone."
        loading={deleteEmployeeType.isLoading}
      />

      <div
        className="overflow-x-auto w-full scrollbar-none"
        id={`settings-${pageSlug}-table-wrapper`}
        data-cy={`settings-${pageSlug}-table-wrapper`}
      >
        {isLoading ? (
          <div
            className="flex justify-center items-center h-20"
            id={`settings-${pageSlug}-loader`}
            data-cy={`settings-${pageSlug}-loader`}
          >
            <Spin
              size="large"
              data-cy={`settings-${pageSlug}-loader-spin`}
            />
          </div>
        ) : (
          <div
            id={`settings-${pageSlug}-table-section`}
            data-cy={`settings-${pageSlug}-table-section`}
          >
            <Table
              columns={[
                ...columns,
                {
                  key: 'actions',
                  render: (record: any) => (
                    <div
                      className="flex gap-4"
                      id={`employment-type-row-actions-${record.__slug}`}
                      data-cy={`employment-type-row-actions-${record.__slug}`}
                    >
                      <AccessGuard
                        permissions={[Permissions.UpdateEmploymentType]}
                        id="settings-employment-type-edit-btn-guard"
                        data-cy="settings-employment-type-edit-btn-guard"
                      >
                        <button
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#366CF0]"
                          onClick={() => handleEdit(record)}
                          aria-label="Edit"
                          type="button"
                          id={`employment-type-edit-btn-${record.__slug}`}
                          data-cy={`employment-type-edit-btn-${record.__slug}`}
                        >
                          <Pencil
                            size={15}
                            className="text-white cursor-pointer"
                            data-cy="settings-employment-type-edit-btn-icon"
                          />
                        </button>
                      </AccessGuard>
                      <AccessGuard
                        permissions={[Permissions.DeleteEmploymentType]}
                        id="settings-employment-type-delete-btn-guard"
                        data-cy="settings-employment-type-delete-btn-guard"
                      >
                        <button
                          className="w-10 h-10  flex items-center justify-center rounded-xl bg-[#E03137]"
                          onClick={() => handleDelete(record)}
                          aria-label="Delete"
                          type="button"
                          id={`employment-type-delete-btn-${record.__slug}`}
                          data-cy={`employment-type-delete-btn-${record.__slug}`}
                        >
                          <Trash2
                            size={15}
                            className="text-white cursor-pointer"
                            data-cy="settings-employment-type-delete-btn-icon"
                            id="settings-employment-type-delete-btn-icon"
                          />
                        </button>
                      </AccessGuard>
                    </div>
                  ),
                  width: 120,
                },
              ]}
              showHeader={false}
              dataSource={reformattedData}
              bordered={true}
              className="min-w-[320px]"
              pagination={false}
              id={`settings-${pageSlug}-table`}
              data-cy={`settings-${pageSlug}-table`}
            />
            {isMobile || isTablet ? (
              <CustomMobilePagination
                totalResults={employeTypeData?.meta?.totalItems ?? 0}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={onPageChange}
                data-cy="settings-employment-type-mobile-pagination"
              />
            ) : (
              <CustomPagination
                current={page}
                total={employeTypeData?.meta?.totalItems ?? 0}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={(pageSize) => {
                  setPageSize(pageSize);
                  setPage(1);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmploymentType;
