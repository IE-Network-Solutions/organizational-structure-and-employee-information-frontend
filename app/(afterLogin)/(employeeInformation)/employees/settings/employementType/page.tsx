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

const EmploymentType = () => {
  const { setOpen, pageSize, setPageSize, setPage, page } =
    EmployeTypeManagementStore();
  const { data: employeTypeData, isLoading } = useGetEmployementTypes(
    page,
    pageSize,
  );
  const deleteEmployeeType = useDeleteEmployeeType() as any;
  const { isMobile, isTablet } = useIsMobile();
  const [editingEmploymentType, setEditingEmploymentType] = React.useState<EmploymentTypeInfo | null>(null);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [employmentTypeToDelete, setEmploymentTypeToDelete] = React.useState<EmploymentTypeInfo | null>(null);
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
        console.error('Error deleting employment type:', error);
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
    (item: EmploymentTypeInfo) => ({
      ...item, // Keep original data
      displayName: (
        <div className="flex space-x-2 font-semibold">
          <FaUser className="mt-3 text-gray-500" />
          <p className="flex flex-col">
            <span>{item.name}</span>
            <span className="text-gray-500 text-xs">
              {item.description || 'No description provided'}
            </span>
          </p>
        </div>
      ),
    }),
  );

  const columns: any = [
    {
      dataIndex: 'displayName',
      key: 'Name',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-black font-bold text-lg ">Employment Type</h1>

        <div className="flex items-center space-x-2">
          <AccessGuard permissions={[Permissions.CreateEmploymentType]}>
            {/* Desktop button */}
            <Button
              className="hidden sm:flex items-center justify-center space-x-2 px-4 py-2 font-bold bg-[#3636F0] text-white hover:bg-[#2d2dbf] border-none"
              onClick={showDrawer}
            >
              <FaPlus className="text-white" />
              <span>Add New Type</span>
            </Button>

            {/* Mobile button */}
            <Button
              className="flex sm:hidden h-10 w-10 sm:w-auto"
              onClick={showDrawer}
              type="primary"
              icon={<FaPlus />}
            />
          </AccessGuard>
        </div>
      </div>

      <EmployementTypeSideDrawer 
        onClose={onClose} 
        editingEmploymentType={editingEmploymentType}
        isEditMode={isEditMode}
      />

      <DeleteModal
        open={deleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        deleteMessage={`Are you sure you want to delete "${employmentTypeToDelete?.name}"?`}
        customMessage="This action cannot be undone."
        loading={deleteEmployeeType.isLoading}
      />

      <div className="overflow-x-auto w-full scrollbar-none">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <Spin size="large" />
          </div>
        ) : (
          <div>
            <Table
              columns={[
                ...columns,
                {
                  key: 'actions',
                  render: (_: any, record: any) => (
                    <div className="flex gap-4">
                      <AccessGuard permissions={[Permissions.UpdateEmploymentType]}>
                        <button
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#366CF0]"
                          onClick={() => handleEdit(record)}
                          aria-label="Edit"
                          type="button"
                        >
                          <Pencil
                            size={15}
                           className="text-white cursor-pointer"
                          />
                        </button>
                      </AccessGuard>
                      <AccessGuard permissions={[Permissions.DeleteEmploymentType]}>
                        <button
                          className="w-10 h-10  flex items-center justify-center rounded-xl bg-[#E03137]"
                          onClick={() => handleDelete(record)}
                          aria-label="Delete"
                          type="button"
                        >
                          <Trash2 
                           size={15}
                           className="text-white cursor-pointer"
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
            />
            {isMobile || isTablet ? (
              <CustomMobilePagination
                totalResults={employeTypeData?.meta?.totalItems ?? 0}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={onPageChange}
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
