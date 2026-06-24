'use client';
import { Button, Card, Row, Col, Dropdown, MenuProps, Typography } from 'antd';
import React from 'react';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EmployementTypeSideDrawer from './_components/employementTypeSideDrawer';
import { EmployeTypeManagementStore } from '@/store/uistate/features/employees/settings/emplyeTypeDrawer';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { useDeleteEmployeeType } from '@/store/server/features/employees/employeeManagment/employmentType/mutations';
import { EmploymentTypeInfo } from '@/store/server/features/employees/employeeManagment/employmentType/interface';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const EmploymentType = () => {
  const {
    setOpen,
    pageSize,
    page,
    isEditMode,
    setIsEditMode,
    editingEmploymentType,
    setEditingEmploymentType,
  } = EmployeTypeManagementStore();
  const { data: employeTypeData } = useGetEmployementTypes(page, pageSize);
  const deleteEmployeeType = useDeleteEmployeeType() as any;
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [employmentTypeToDelete, setEmploymentTypeToDelete] =
    React.useState<EmploymentTypeInfo | null>(null);

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

  const reformattedData = employeTypeData?.items?.map(
    (item: EmploymentTypeInfo) => {
      const rowSlug = toSlug(item.id ?? item.name);
      return {
        ...item,
        __slug: rowSlug,
      };
    },
  );

  const pageSlug = 'employment-type';

  return (
    <div
      className="bg-white h-full"
      id={`settings-${pageSlug}-container`}
      data-cy={`settings-${pageSlug}-container`}
    >
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
        className="w-full"
        id={`settings-${pageSlug}-cards-wrapper`}
        data-cy={`settings-${pageSlug}-cards-wrapper`}
      >
        <div
          id={`settings-${pageSlug}-cards-section`}
          data-cy={`settings-${pageSlug}-cards-section`}
        >
          <Row gutter={[16, 16]}>
            {reformattedData?.map((record: any) => {
              const menuItems: MenuProps['items'] = [
                {
                  key: 'edit',
                  label: (
                    <AccessGuard
                      permissions={[Permissions.UpdateEmploymentType]}
                      id={`settings-employment-type-edit-menu-guard-${record.__slug}`}
                      data-cy={`settings-employment-type-edit-menu-guard-${record.__slug}`}
                    >
                      <div
                        className="flex items-center gap-2"
                        onClick={() => handleEdit(record)}
                        id={`employment-type-edit-menu-item-${record.__slug}`}
                        data-cy={`employment-type-edit-menu-item-${record.__slug}`}
                      >
                        <EditOutlinedIcon />
                        <span data-cy="settings-employment-type-edit-menu-item-label">
                          Edit Employment Type
                        </span>
                      </div>
                    </AccessGuard>
                  ),
                },
                {
                  key: 'delete',
                  label: (
                    <AccessGuard
                      permissions={[Permissions.DeleteEmploymentType]}
                      id={`settings-employment-type-delete-menu-guard-${record.__slug}`}
                      data-cy={`settings-employment-type-delete-menu-guard-${record.__slug}`}
                    >
                      <div
                        className="flex items-center gap-2 text-red-600"
                        onClick={() => handleDelete(record)}
                        id={`employment-type-delete-menu-item-${record.__slug}`}
                        data-cy={`employment-type-delete-menu-item-${record.__slug}`}
                      >
                        <DeleteOutlineOutlinedIcon />
                        <span data-cy="settings-employment-type-delete-menu-item-label">
                          Delete Employment Type
                        </span>
                      </div>
                    </AccessGuard>
                  ),
                },
              ];

              return (
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  lg={12}
                  xl={12}
                  key={record.id}
                  id={`employment-type-card-col-${record.__slug}`}
                  data-cy={`employment-type-card-col-${record.__slug}`}
                >
                  <Card
                    className="rounded-lg border-0"
                    style={{ background: '#F9FAFB' }}
                    id={`employment-type-card-${record.__slug}`}
                    data-cy={`employment-type-card-${record.__slug}`}
                    title={
                      <Typography.Title
                        className="!mb-2 !font-normal !text-gray-900 !text-sm"
                        id={`employment-type-card-title-${record.__slug}`}
                        data-cy={`employment-type-card-title-${record.__slug}`}
                      >
                        {record.name}
                      </Typography.Title>
                    }
                    extra={
                      <div
                        id={`employment-type-dropdown-${record.__slug}`}
                        data-cy={`employment-type-dropdown-${record.__slug}`}
                      >
                        <Dropdown
                          menu={{ items: menuItems }}
                          trigger={['click']}
                          placement="bottomRight"
                        >
                          <Button
                            type="text"
                            className="!w-6 !h-6 !min-w-0 !p-0 !border-0 flex items-center justify-center"
                            id={`employment-type-menu-btn-${record.__slug}`}
                            data-cy={`employment-type-menu-btn-${record.__slug}`}
                          >
                            <MoreHorizIcon style={{ fontSize: 14 }} />
                          </Button>
                        </Dropdown>
                      </div>
                    }
                    headStyle={{
                      borderBottom: 'none',
                      padding: '12px 16px 12px 16px',
                      background: '#F9FAFB',
                    }}
                    bodyStyle={{ padding: '0px 16px 12px 16px' }}
                  >
                    <p
                      data-cy="settings-employment-type-description"
                      className="text-sm text-[#8c8c8c] text-wrap font-normal"
                    >
                      {record.description || 'No description provided'}
                    </p>
                  </Card>
                </Col>
              );
            })}
          </Row>
          {/* {isMobile || isTablet ? (
              <div
                data-cy="settings-employment-type-mobile-pagination-container"
                className="mt-4"
              >
                <CustomMobilePagination
                  totalResults={employeTypeData?.meta?.totalItems ?? 0}
                  pageSize={pageSize}
                  onChange={onPageChange}
                  onShowSizeChange={onPageChange}
                  data-cy="settings-employment-type-mobile-pagination"
                />
              </div>
            ) : (
              <div
                data-cy="settings-employment-type-pagination-container"
                className="mt-4"
              >
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
              </div>
            )} */}
        </div>
      </div>
    </div>
  );
};

export default EmploymentType;
