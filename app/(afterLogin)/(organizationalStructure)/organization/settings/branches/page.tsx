'use client';
import React from 'react';
import { Card, Button, List, Dropdown, Menu, Form } from 'antd';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useGetBranches } from '@/store/server/features/organizationStructure/branchs/queries';
import {
  useCreateBranch,
  useDeleteBranch,
  useUpdateBranch,
} from '@/store/server/features/organizationStructure/branchs/mutation';
import { Branch } from '@/store/server/features/organizationStructure/branchs/interface';
import { useBranchStore } from '@/store/uistate/features/organizationStructure/branchStore';
import DeleteModal from '@/components/common/deleteModal';
import BranchForm from '@/app/(afterLogin)/(employeeInformation)/_components/branchForm';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';

const Branches = () => {
  const { data: branches, isLoading } = useGetBranches();
  const { mutate: createBranch, isLoading: createLoading } = useCreateBranch();
  const { mutate: updateBranch, isLoading: updateLoading } = useUpdateBranch();
  const { mutate: deleteBranch, isLoading: deleteLoading } = useDeleteBranch();
  const [form] = Form.useForm();

  const {
    editingBranch,
    deleteModalVisible,
    branchToDelete,
    setFormOpen,
    setEditingBranch,
    setSelectedBranch,
    setDeleteModalVisible,
    setBranchToDelete,
  } = useBranchStore();

  const handleAddNew = () => {
    setEditingBranch(null);
    setFormOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormOpen(true);
  };

  const handleFormSubmit = (values: Branch) => {
    if (editingBranch && editingBranch.id) {
      updateBranch(
        { id: editingBranch.id, branch: values },
        {
          onSuccess: () => {
            form.resetFields();
            setFormOpen(false);
          },
        },
      );
    } else {
      createBranch(values, {
        onSuccess: () => {
          form.resetFields();
          setFormOpen(false);
        },
      });
    }
  };

  const handleDelete = () => {
    if (branchToDelete && branchToDelete.id) {
      deleteBranch(branchToDelete.id);
      setSelectedBranch(null);
      setDeleteModalVisible(false);
      setBranchToDelete(null);
    }
  };

  const showDeleteModal = (branch: Branch) => {
    setBranchToDelete(branch);
    setDeleteModalVisible(true);
  };

  const menu = (branch: Branch) => {
    const branchId = branch.id || branch.name?.replace(/\s+/g, '-').toLowerCase() || 'branch';
    return (
      <Menu data-cy={`org-settings-branch-menu-${branchId}`} id={`org-settings-branch-menu-${branchId}`}>
        <AccessGuard permissions={[Permissions.UpdateBranch]} data-cy={`org-settings-branch-edit-menu-item-${branchId}`} id={`org-settings-branch-edit-menu-item-${branchId}`} >
          <Menu.Item onClick={() => handleEdit(branch)} data-cy={`org-settings-branch-edit-${branchId}`} id={`org-settings-branch-edit-${branchId}`}>Edit</Menu.Item>
        </AccessGuard>
        <AccessGuard permissions={[Permissions.DeleteBranch]} data-cy={`org-settings-branch-delete-menu-item-${branchId}`} id={`org-settings-branch-delete-menu-item-${branchId}`} >
          <Menu.Item danger onClick={() => showDeleteModal(branch)} data-cy={`org-settings-branch-delete-${branchId}`} id={`org-settings-branch-delete-${branchId}`}>
            Delete
          </Menu.Item>
        </AccessGuard>
      </Menu>
    );
  };

  return (
    <div className="flex-1 rounded-lg  items-center w-full h-full" data-cy="org-settings-branches-container" id="org-settings-branches-container">
      <div className="bg-white p-3 rounded-2xl h-full w-full" data-cy="org-settings-branches-list-container" id="org-settings-branches-list-container">
        <div className="flex justify-between items-center mb-4" data-cy="org-settings-branches-header" id="org-settings-branches-header">
          <h1 className="text-lg text-bold" data-cy="org-settings-branches-title" id="org-settings-branches-title">Branches</h1>
          <AccessGuard permissions={[Permissions.CreateBranch]} data-cy="org-settings-branches-add-btn" id="org-settings-branches-add-btn">
            <Button
              className="h-10 w-10 sm:w-auto"
              icon={<FaPlus  data-cy="org-organization-settings-branches-page-faplus-1" id="org-organization-settings-branches-page-faplus-1"/>}
              type="primary"
              onClick={handleAddNew}
              data-cy="org-settings-branches-add-btn"
              id="org-settings-branches-add-btn"
            >
              <span className="hidden lg:block" data-cy="org-organization-settings-branches-page-span-1" id="org-organization-settings-branches-page-span-1">Add Branch</span>
            </Button>
          </AccessGuard>
        </div>
        <List
          className="max-h-[400px] overflow-y-scroll"
          data-cy="org-settings-branches-list"
          id="org-settings-branches-list"
          itemLayout="vertical"
          dataSource={branches?.items}
          renderItem={(item) => {
            const branchId = item.id || item.name?.replace(/\s+/g, '-').toLowerCase() || 'branch';
            return (
              <Card
                loading={isLoading}
                className="mt-3"
                data-cy={`org-settings-branch-card-${branchId}`}
                id={`org-settings-branch-card-${branchId}`}
                title={
                  <div data-cy={`org-settings-branch-card-title-${branchId}`} id={`org-settings-branch-card-title-${branchId}`}>
                    <div className="flex justify-between items-start p-3" data-cy={`org-settings-branch-card-title-inner-${branchId}`} id={`org-settings-branch-card-title-inner-${branchId}`}>
                      <div className="grid space-y-2" data-cy={`org-settings-branch-card-title-inner-content-${branchId}`} id={`org-settings-branch-card-title-inner-content-${branchId}`}>
                        {item.name.includes('HQ') ? (
                          <span className="flex justify-start items-center gap-4" data-cy={`org-settings-branch-name-${branchId}`} id={`org-settings-branch-name-${branchId}`}>
                            {item.name}{' '}
                            <span className="bg-blue rounded-lg text-white p-1 text-xs border" data-cy={`org-settings-branch-hq-badge-${branchId}`} id={`org-settings-branch-hq-badge-${branchId}`}>
                              HQ
                            </span>
                          </span>
                        ) : (
                          <span className="flex justify-start items-center gap-4" data-cy={`org-settings-branch-name-${branchId}`} id={`org-settings-branch-name-${branchId}`}>
                            {item.name}
                          </span>
                        )}
                        <p className="text-sm font-light" data-cy={`org-settings-branch-location-${branchId}`} id={`org-settings-branch-location-${branchId}`}>{item.location}</p>
                      </div>

                      <Dropdown overlay={menu(item)} trigger={['click']} data-cy={`org-settings-branch-dropdown-${branchId}`}>
                        <BsThreeDotsVertical
                          id={`org-settings-branch-actions-${branchId}`}
                          data-cy={`org-settings-branch-actions-${branchId}`}
                          className="flex justify-center items-center cursor-pointer"
                        />
                      </Dropdown>
                    </div>
                  </div>
                }
              >
                <div className="flex flex-col text-[#677588] text-xs gap-1 p-3" data-cy={`org-settings-branch-contact-number-${branchId}`} id={`org-settings-branch-contact-number-${branchId}`}>
                  <span data-cy={`org-settings-branch-contact-number-label-${branchId}`} id={`org-settings-branch-contact-number-label-${branchId}`}>Contact Number</span>
                  <span className="text-black" data-cy={`org-settings-branch-contact-number-${branchId}`} id={`org-settings-branch-contact-number-${branchId}`}>{item.contactNumber}</span>
                </div>
                <div className="flex flex-col text-[#677588] text-xs gap-1 p-3" data-cy={`org-settings-branch-contact-email-${branchId}`} id={`org-settings-branch-contact-email-${branchId}`}>
                  <span data-cy={`org-settings-branch-contact-email-label-${branchId}`} id={`org-settings-branch-contact-email-label-${branchId}`}>Contact Email</span>
                  <span className="text-black" data-cy={`org-settings-branch-contact-email-${branchId}`} id={`org-settings-branch-contact-email-${branchId}`}>{item.contactEmail}</span>
                </div>
              </Card>
            );
          }}
        />
      </div>

      <BranchForm
        form={form}
        loading={editingBranch ? updateLoading : createLoading}
        onClose={() => {
          form.resetFields();
          setFormOpen(false);
        }}
        submitAction={handleFormSubmit}
        title={editingBranch ? 'Edit Branch' : 'Create Branch'}
        data-cy="org-settings-branches-form"
      />
      <DeleteModal
        open={deleteModalVisible}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        loading={deleteLoading}
        data-cy="org-settings-branches-delete-modal"
      />
    </div>
  );
};

export default Branches;
