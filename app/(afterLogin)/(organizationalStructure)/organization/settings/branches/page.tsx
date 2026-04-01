'use client';
import React, { useMemo, useState } from 'react';
import { Card, Dropdown, Menu, Form, Popconfirm } from 'antd';
import { BsThreeDots } from 'react-icons/bs';
import { MdOutlineEdit, MdOutlineDelete } from 'react-icons/md';
import { useGetBranches } from '@/store/server/features/organizationStructure/branchs/queries';
import {
  useCreateBranch,
  useDeleteBranch,
  useUpdateBranch,
} from '@/store/server/features/organizationStructure/branchs/mutation';
import { Branch } from '@/store/server/features/organizationStructure/branchs/interface';
import { useBranchStore } from '@/store/uistate/features/organizationStructure/branchStore';
import BranchForm from '@/app/(afterLogin)/(employeeInformation)/_components/branchForm';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { CloseOutlined } from '@ant-design/icons';

const Branches = () => {
  const { data: branches, isLoading } = useGetBranches();
  const { mutate: createBranch, isLoading: createLoading } = useCreateBranch();
  const { mutate: updateBranch, isLoading: updateLoading } = useUpdateBranch();
  const { mutate: deleteBranch } = useDeleteBranch();
  const [form] = Form.useForm();
  const [openDeleteConfirmBranchId, setOpenDeleteConfirmBranchId] = useState<
    string | null
  >(null);

  const {
    editingBranch,
    setFormOpen,
    setEditingBranch,
    setSelectedBranch,
    searchQuery,
  } = useBranchStore();

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

  const handleDelete = (branch: Branch) => {
    if (branch && branch.id) {
      deleteBranch(branch.id);
      setSelectedBranch(null);
    }
  };

  const filteredBranches = useMemo(() => {
    if (!branches?.items) return [];
    if (!searchQuery.trim()) return branches.items;

    const query = searchQuery.toLowerCase().trim();
    return branches.items.filter((branch) => {
      const name = branch.name?.toLowerCase() || '';
      const location = branch.location?.toLowerCase() || '';
      const contactNumber = branch.contactNumber?.toLowerCase() || '';
      const contactEmail = branch.contactEmail?.toLowerCase() || '';

      return (
        name.includes(query) ||
        location.includes(query) ||
        contactNumber.includes(query) ||
        contactEmail.includes(query)
      );
    });
  }, [branches?.items, searchQuery]);

  const menu = (branch: Branch) => {
    const branchId =
      branch.id || branch.name?.replace(/\s+/g, '-').toLowerCase() || 'branch';
    return (
      <Menu
        selectable={false}
        className="bg-white"
        theme="light"
        mode="vertical"
        data-cy={`org-settings-branch-menu-${branchId}`}
        id={`org-settings-branch-menu-${branchId}`}
      >
        <AccessGuard
          permissions={[Permissions.UpdateBranch]}
          data-cy={`org-settings-branch-edit-menu-item-${branchId}`}
          id={`org-settings-branch-edit-menu-item-${branchId}`}
        >
          <Menu.Item
            onClick={() => handleEdit(branch)}
            data-cy={`org-settings-branch-edit-${branchId}`}
            id={`org-settings-branch-edit-${branchId}`}
            className="bg-white hover:bg-gray-100 text-gray-600"
            icon={<MdOutlineEdit />}
          >
            Edit
          </Menu.Item>
        </AccessGuard>
        <AccessGuard
          permissions={[Permissions.DeleteBranch]}
          data-cy={`org-settings-branch-delete-menu-item-${branchId}`}
          id={`org-settings-branch-delete-menu-item-${branchId}`}
        >
          <Menu.Item
            data-cy={`org-settings-branch-delete-${branchId}`}
            id={`org-settings-branch-delete-${branchId}`}
            className="bg-white hover:bg-gray-100 text-gray-600"
            icon={<MdOutlineDelete />}
          >
            <Popconfirm
              icon={<></>}
              open={openDeleteConfirmBranchId === branchId}
              onOpenChange={(visible) =>
                setOpenDeleteConfirmBranchId(visible ? branchId : null)
              }
              title={
                <div
                  className="flex items-center justify-between mb-3 mx-4"
                  data-cy={`org-settings-branch-delete-popconfirm-title-${branchId}`}
                >
                  <p
                    className="text-lg font-bold text-gray-700 m-0"
                    data-cy={`org-settings-branch-delete-popconfirm-title-text-${branchId}`}
                  >
                    Delete Branch
                  </p>
                  <CloseOutlined
                    className="text-gray-400 m-0 cursor-pointer hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDeleteConfirmBranchId(null);
                    }}
                  />
                </div>
              }
              description={
                <p
                  className="text-sm text-gray-500 m-0 my-1  mb-4 mx-4"
                  data-cy={`org-settings-branch-delete-popconfirm-description-${branchId}`}
                >
                  Are you sure you want to delete {branch.name}?
                </p>
              }
              onConfirm={() => handleDelete(branch)}
              okText="Delete"
              okButtonProps={{
                danger: true,
                className: 'p-2 mr-4 mb-2 rounded-md',
                'data-cy': `org-settings-branch-delete-popconfirm-ok-${branchId}`,
              }}
              cancelButtonProps={{
                'data-cy': `org-settings-branch-delete-popconfirm-cancel-${branchId}`,
                className: 'text-gray-200 m-0 p-2 mb-2 rounded-md',
              }}
              cancelText={
                <div
                  className="text-gray-500 m-0"
                  data-cy={`org-settings-branch-delete-popconfirm-cancel-text-${branchId}`}
                >
                  Cancel
                </div>
              }
              data-cy={`org-settings-branch-delete-popconfirm-${branchId}`}
            >
              <span
                className="cursor-pointer"
                data-cy={`org-settings-branch-delete-popconfirm-pointer-text-${branchId}`}
              >
                Delete
              </span>
            </Popconfirm>
          </Menu.Item>
        </AccessGuard>
      </Menu>
    );
  };

  return (
    <div
      className="bg-white w-full"
      data-cy="org-settings-branches-container"
      id="org-settings-branches-container"
    >
      <div
        className="w-full"
        data-cy="org-settings-branches-list-container"
        id="org-settings-branches-list-container"
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          data-cy="org-settings-branches-list"
          id="org-settings-branches-list"
        >
          {filteredBranches.map((item) => {
            const branchId =
              item.id ||
              item.name?.replace(/\s+/g, '-').toLowerCase() ||
              'branch';
            return (
              <Card
                key={item.id || branchId}
                loading={isLoading}
                className="h-full pt-2 px-1 pb-4 border-gray-200"
                data-cy={`org-settings-branch-card-${branchId}`}
                id={`org-settings-branch-card-${branchId}`}
                styles={{
                  body: { padding: '4px 14px 4px 14px' },
                }}
              >
                <div
                  className="flex justify-between items-center mb-4"
                  data-cy={`org-settings-branch-card-separator-${branchId}`}
                >
                  <div
                    className="text-base text-gray-800 m-0"
                    data-cy={`org-settings-branch-name-${branchId}`}
                    id={`org-settings-branch-name-${branchId}`}
                  >
                    {item.name}
                  </div>
                  <Dropdown
                    overlay={menu(item)}
                    trigger={['click']}
                    data-cy={`org-settings-branch-dropdown-${branchId}`}
                  >
                    <button
                      type="button"
                      className="cursor-pointer text-gray-500 hover:text-gray-700 p-1.5 border border-gray-300 rounded-md bg-transparent flex items-center justify-center hover:border-gray-400"
                      id={`org-settings-branch-actions-button-${branchId}`}
                      data-cy={`org-settings-branch-actions-button-${branchId}`}
                    >
                      <BsThreeDots
                        id={`org-settings-branch-actions-${branchId}`}
                        data-cy={`org-settings-branch-actions-${branchId}`}
                        className="text-lg"
                      />
                    </button>
                  </Dropdown>
                </div>
                <div
                  className="flex justify-between w-full gap-0.5 pt-3"
                  data-cy={`org-settings-branch-details-${branchId}`}
                  id={`org-settings-branch-details-${branchId}`}
                >
                  <div
                    className="flex flex-col flex-1 min-w-0"
                    data-cy={`org-settings-branch-location-${branchId}`}
                    id={`org-settings-branch-location-${branchId}`}
                  >
                    <span
                      className="text-xs text-gray-400 mb-1"
                      data-cy={`org-settings-branch-location-label-${branchId}`}
                      id={`org-settings-branch-location-label-${branchId}`}
                    >
                      Location
                    </span>
                    <span
                      className="text-base text-gray-700 break-words"
                      data-cy={`org-settings-branch-location-value-${branchId}`}
                      id={`org-settings-branch-location-value-${branchId}`}
                    >
                      {item.location}
                    </span>
                  </div>
                  <div
                    className="flex flex-col flex-1 min-w-0"
                    data-cy={`org-settings-branch-contact-email-${branchId}`}
                    id={`org-settings-branch-contact-email-${branchId}`}
                  >
                    <span
                      className="text-xs text-gray-400 mb-1"
                      data-cy={`org-settings-branch-contact-email-label-${branchId}`}
                      id={`org-settings-branch-contact-email-label-${branchId}`}
                    >
                      Contact Email
                    </span>
                    <span
                      className="text-sm text-gray-700 break-words"
                      data-cy={`org-settings-branch-contact-email-value-${branchId}`}
                      id={`org-settings-branch-contact-email-value-${branchId}`}
                    >
                      {item.contactEmail}
                    </span>
                  </div>
                  <div
                    className="flex flex-col flex-1 min-w-0"
                    data-cy={`org-settings-branch-contact-number-${branchId}`}
                    id={`org-settings-branch-contact-number-${branchId}`}
                  >
                    <span
                      className="text-xs text-gray-400 mb-1"
                      data-cy={`org-settings-branch-contact-number-label-${branchId}`}
                      id={`org-settings-branch-contact-number-label-${branchId}`}
                    >
                      Contact Number
                    </span>
                    <span
                      className="text-base text-gray-700 break-words"
                      data-cy={`org-settings-branch-contact-number-value-${branchId}`}
                      id={`org-settings-branch-contact-number-value-${branchId}`}
                    >
                      {item.contactNumber}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
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
    </div>
  );
};

export default Branches;
