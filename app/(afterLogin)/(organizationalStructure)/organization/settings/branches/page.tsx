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
      updateBranch({ id: editingBranch.id, branch: values });
    } else {
      createBranch(values);
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

  const menu = (branch: Branch) => (
    <Menu>
      <AccessGuard permissions={[Permissions.UpdateBranch]}>
        <Menu.Item onClick={() => handleEdit(branch)}>Edit</Menu.Item>
      </AccessGuard>
      <AccessGuard permissions={[Permissions.DeleteBranch]}>
        <Menu.Item danger onClick={() => showDeleteModal(branch)}>
          Delete
        </Menu.Item>
      </AccessGuard>
    </Menu>
  );

  return (
    <div className="flex-1 rounded-lg  items-center w-full h-full">
      <div className="bg-white p-3 rounded-2xl h-full w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg text-bold">Branches</h1>
          <AccessGuard permissions={[Permissions.CreateBranch]}>
            <Button
              className="h-10 w-10 sm:w-auto"
              icon={<FaPlus />}
              type="primary"
              onClick={handleAddNew}
            >
              <span className="hidden lg:block">Add Branch</span>
            </Button>
          </AccessGuard>
        </div>
        <List
          className="max-h-[400px] overflow-y-scroll"
          itemLayout="vertical"
          dataSource={branches?.items}
          renderItem={(item) => (
            <Card
              loading={isLoading}
              className="mt-3"
              title={
                <div>
                  <div className="flex justify-between items-start p-3">
                    <div className="grid space-y-2">
                      {item.name.includes('HQ') ? (
                        <span className="flex justify-start items-center gap-4">
                          {item.name}{' '}
                          <span className="bg-blue rounded-lg text-white p-1 text-xs border">
                            HQ
                          </span>
                        </span>
                      ) : (
                        <span className="flex justify-start items-center gap-4">
                          {item.name}
                        </span>
                      )}
                      <p className="text-sm font-light">{item.location}</p>
                    </div>

                    <Dropdown overlay={menu(item)} trigger={['click']}>
                      <BsThreeDotsVertical
                        id={`${item.name}ThreeDotButton`}
                        className="flex justify-center items-center cursor-pointer"
                      />
                    </Dropdown>
                  </div>
                </div>
              }
            >
              <div className="flex flex-col text-[#677588] text-xs gap-1 p-3">
                <span>Contact Number</span>
                <span className="text-black">{item.contactNumber}</span>
              </div>
              <div className="flex flex-col text-[#677588] text-xs gap-1 p-3">
                <span>Contact Email</span>
                <span className="text-black">{item.contactEmail}</span>
              </div>
            </Card>
          )}
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
      />
      <DeleteModal
        open={deleteModalVisible}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Branches;
