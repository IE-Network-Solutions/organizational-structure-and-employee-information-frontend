import EditApproverComponent from '@/components/Approval/editApprover';
import React from 'react';

const EditPayrollApproval = ({
  editModal,
  customFieldsDrawerHeader,
  onClose,
  form,
  handleSubmit,
  selectedItem,
  department,
  users,
  workflowApplies,
  approverType,
  handleDeselect,
  handleUserChange,
  handleDeleteConfirm,
  deleteModal,
  deletedApprover,
  setDeleteModal,
  setDeletedApprover,
}: {
  editModal: any;
  customFieldsDrawerHeader: any;
  onClose: () => void;
  handleSubmit: () => void;
  form: any;
  selectedItem: any;
  department: any;
  users: any;
  level: any;
  workflowApplies: any;
  initialValues: any;
  approverType: any;
  handleDeselect: (value: string, index: number) => void;
  handleUserChange: (value: string, index: number) => void;
  handleDeleteConfirm: (id: string, workFlowId: string) => void;
  deleteModal: any;
  deletedApprover: any;
  setDeleteModal: (id: boolean) => void;
  setDeletedApprover: (id: string) => void;
}) => {
  return (
    <EditApproverComponent
      editModal={editModal}
      customFieldsDrawerHeader={customFieldsDrawerHeader}
      onClose={onClose}
      form={form}
      handleSubmit={handleSubmit}
      selectedItem={selectedItem}
      department={department}
      users={users}
      level={undefined}
      workflowApplies={workflowApplies}
      initialValues={undefined}
      approverType={approverType}
      handleDeselect={handleDeselect}
      handleUserChange={handleUserChange}
      handleDeleteConfirm={handleDeleteConfirm}
      deleteModal={deleteModal}
      deletedApprover={deletedApprover}
      setDeleteModal={setDeleteModal}
      setDeletedApprover={setDeletedApprover}
      hideWorkflowAppliesSection
      disableNameAndDescription
    />
  );
};

export default EditPayrollApproval;
