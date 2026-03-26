import DeleteModal from '@/components/common/deleteConfirmationModal';
import { Button, Form, Input, Modal, Radio, Row, Select, Tooltip } from 'antd';
import React, { useEffect } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';

const EditApproverComponent = ({
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
  useEffect(() => {
    // Prepare approvers data for Form.List
    const approversData =
      selectedItem?.approvers?.map((approver: any, index: number) => ({
        level: index + 1,
        assignedUser: approver?.userId || approver?.id,
        approverId: approver?.id,
      })) || [];

    form.setFieldsValue({
      workFlownName: selectedItem?.name,
      description: selectedItem?.description,
      workflowAppliesType: selectedItem?.entityType,
      workflowAppliesId: selectedItem?.entityId
        ? selectedItem?.entityType === 'Department'
          ? department?.find((item: any) => item.id === selectedItem?.entityId)
              ?.name
          : selectedItem?.entityType === 'Hierarchy'
            ? department?.find(
                (item: any) => item.id === selectedItem?.entityId,
              )?.name
            : selectedItem?.entityType === 'User'
              ? users?.items?.find(
                  (item: any) => item.id === selectedItem?.entityId,
                )?.firstName +
                '  ' +
                users?.items?.find(
                  (item: any) => item.id === selectedItem?.entityId,
                )?.middleName
              : selectedItem?.entityId
        : '-',
      approvers: approversData,
    });
  }, [selectedItem, form]);

  return (
    <Modal
      open={editModal}
      title={customFieldsDrawerHeader}
      onCancel={onClose}
      footer={null}
      width={760}
      centered
    >
      <div data-cy="components-approval-editapprover-index-tsx-index-div-89">
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="workFlownName"
            label="Workflow Name"
            className="mt-3 mb-1"
            rules={[
              { required: true, message: 'Please enter a workFlow name!' },
            ]}
          >
            <Input
              placeholder="Enter Workflow Name"
              className="h-10 rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            className="mt-3 mb-1"
            rules={[{ required: true, message: 'Please enter a description!' }]}
          >
            <Input.TextArea placeholder="Enter Description" />
          </Form.Item>

          <div
            id="components-approval-editapprover-index-tsx-index-div-100"
            data-cy="components-approval-editapprover-index-tsx-index-div-100"
            className="border border-gray-200 rounded-xl p-3 my-3"
          >
            <div
              className="my-1 flex flex-col sm:flex-row gap-4 items-center"
              data-cy="approval-workflow-applies-section-edit"
            >
              <span
                id="components-approval-editapprover-index-tsx-index-label-workflow-applies-to"
                data-cy="components-approval-editapprover-index-tsx-index-label-workflow-applies-to"
                className="text-sm text-[#4d4d4d]"
              >
                Workflow Applies to
              </span>
              <Form.Item
                name="workflowAppliesType"
                className="mb-0 mt-1"
                rules={[
                  {
                    required: true,
                    message: 'Please select a workflow option!',
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value="Department">Department</Radio>
                  <Radio disabled value="Hierarchy">
                    Hierarchy
                  </Radio>
                  <Radio value="User">User</Radio>
                </Radio.Group>
              </Form.Item>
            </div>

            <Form.Item name="workflowAppliesId" className="mb-0">
              <Select
                showSearch
                optionFilterProp="label"
                className="h-10"
                allowClear
                placeholder={`Select ${workflowApplies ? workflowApplies : ''}`}
              />
            </Form.Item>
          </div>

          <div
            className="rounded-xl border border-gray-200 p-3 mb-3 flex flex-col gap-2"
            data-cy="approval-workflow-levels-section-edit"
          >
            <span
              id="components-approval-editapprover-index-tsx-index-label-levels-assignees"
              data-cy="components-approval-editapprover-index-tsx-index-label-levels-assignees"
              className="text-sm text-[#4d4d4d]"
            >
              Levels & Assignees
            </span>
          </div>

          <Form.List name="approvers">
            {(fields, {}) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    data-cy="components-approval-editapprover-index-tsx-index-div-142"
                    key={key}
                    className="my-2 rounded-xl border border-gray-200 p-3"
                  >
                    <div
                      data-cy="components-approval-editapprover-index-tsx-index-div-143"
                      className="mb-1 text-sm text-[#4d4d4d]"
                    >
                      Assign - Level {name + 1}
                    </div>
                    <div
                      data-cy="components-approval-editapprover-index-tsx-index-div-144"
                      className="flex justify-between items-center gap-3"
                    >
                      <Form.Item
                        {...restField}
                        className="flex-1 mb-0"
                        name={[name, 'assignedUser']}
                        rules={[
                          { required: true, message: 'Please select a user!' },
                        ]}
                      >
                        <Select
                          disabled={!users?.items}
                          showSearch
                          optionFilterProp="label"
                          className="w-full h-10"
                          mode={
                            approverType === 'Parallel' ? 'multiple' : undefined
                          }
                          onDeselect={(value) => handleDeselect(value, name)}
                          onChange={(value) =>
                            handleUserChange(value as string, name)
                          }
                          placeholder="Select User"
                          options={users?.items?.map((list: any) => ({
                            value: list?.id,
                            label: `${list?.firstName ? list?.firstName : ''} ${list?.middleName ? list?.middleName : ''} ${list?.lastName ? list?.lastName : ''}`,
                          }))}
                        />
                      </Form.Item>
                      {approverType !== 'Parallel' && (
                        <Tooltip title={'Delete Employee'}>
                          <Button
                            id={`deleteUserButton${name}`}
                            className="bg-red-600 text-white disabled:bg-gray-400 border-none"
                            onClick={() => {
                              const userId = form.getFieldValue([
                                'approvers',
                                name,
                                'assignedUser',
                              ]);
                              setDeleteModal(true);
                              setDeletedApprover(userId);
                            }}
                          >
                            <RiDeleteBin6Line />
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </Form.List>

          <Form.Item>
            <Row className="flex justify-end gap-3 mt-4">
              <Button onClick={onClose}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </div>
      <DeleteModal
        open={deleteModal}
        onConfirm={() => handleDeleteConfirm(deletedApprover, selectedItem?.id)}
        onCancel={() => setDeleteModal(false)}
      />
    </Modal>
  );
};

export default EditApproverComponent;
