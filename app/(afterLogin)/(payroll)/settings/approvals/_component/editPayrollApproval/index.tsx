import CustomDrawerLayout from '@/components/common/customDrawer';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { Button, Form, Input, Row, Select, Tooltip } from 'antd';
import React, { useEffect } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';

const EditPayrollApproval = ({
  editModal,
  customFieldsDrawerHeader,
  onClose,
  form,
  handleSubmit,
  selectedItem,
  users,
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
      approvers: approversData,
    });
  }, [selectedItem, form]);

  return (
    <CustomDrawerLayout
      open={editModal}
      modalHeader={customFieldsDrawerHeader}
      onClose={onClose}
      width="35%"
      footer={
        <Row
          className="flex justify-center gap-6"
          id="editPayrollApprovalFooter"
          data-cy="editPayrollApprovalFooter"
        >
          <Button
            type="default"
            className="h-10 px-10"
            data-cy="editPayrollApprovalCancelBtn"
            id="editPayrollApprovalCancelBtn"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            className="h-10 px-10"
            data-cy="editPayrollApprovalSubmitBtn"
            id="editPayrollApprovalSubmitBtn"
          >
            Submit
          </Button>
        </Row>
      }
    >
      <div
        className="pb-[60px]"
        data-cy="editPayrollApprovalContent"
        id="editPayrollApprovalContent"
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          data-cy="editPayrollApprovalForm"
          id="editPayrollApprovalForm"
        >
          <Form.Item
            className="text-lg font-bold mt-3 mb-1"
            name="workFlownName"
            label="WorkFlow Name"
            rules={[
              { required: true, message: 'Please enter a workFlow name!' },
            ]}
            data-cy="editPayrollApprovalWorkFlowName"
            id="editPayrollApprovalWorkFlowName"
          >
            <Input
              className="h-10"
              disabled
              placeholder="Enter WorkFlow Name"
              data-cy="editPayrollApprovalWorkFlowNameInput"
              id="editPayrollApprovalWorkFlowNameInput"
            />
          </Form.Item>

          <Form.Item
            className="text-lg font-bold mt-3 mb-1"
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description!' }]}
            data-cy="editPayrollApprovalDescription"
            id="editPayrollApprovalDescription"
          >
            <Input.TextArea
              className="min-h-[100px]"
              placeholder="Enter Description"
              disabled
              data-cy="editPayrollApprovalDescriptionInput"
              id="editPayrollApprovalDescriptionInput"
            />
          </Form.Item>

          <Form.List name="approvers" data-cy="editPayrollApprovalApprovers">
            {(fields, {}) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    className="my-1"
                    data-cy="editPayrollApprovalApproversItem"
                    id="editPayrollApprovalApproversItem"
                  >
                    <div
                      className="mt-5"
                      data-cy="editPayrollApprovalApproversItemLevel"
                      id="editPayrollApprovalApproversItemLevel"
                    >
                      Level: {name + 1}
                    </div>
                    <div
                      className="flex justify-between items-center"
                      data-cy="editPayrollApprovalApproversItemFlex"
                      id="editPayrollApprovalApproversItemFlex"
                    >
                      <Form.Item
                        {...restField}
                        className="font-semibold text-xs"
                        name={[name, 'assignedUser']}
                        label={`Assign User for Level ${name + 1}`}
                        rules={[
                          { required: true, message: 'Please select a user!' },
                        ]}
                        data-cy="editPayrollApprovalApproversItemSelect"
                        id="editPayrollApprovalApproversItemSelect"
                      >
                        <Select
                          disabled={!users?.items}
                          showSearch
                          optionFilterProp="label"
                          className="min-w-52 my-3"
                          mode={
                            approverType === 'Parallel' ? 'multiple' : undefined
                          }
                          style={{ width: 120 }}
                          onDeselect={(value) => handleDeselect(value, name)}
                          onChange={(value) =>
                            handleUserChange(value as string, name)
                          }
                          placeholder="Select User"
                          options={users?.items?.map((list: any) => ({
                            value: list?.id,
                            label: `${list?.firstName ? list?.firstName : ''} ${list?.middleName ? list?.middleName : ''} ${list?.lastName ? list?.lastName : ''}`,
                          }))}
                          data-cy="editPayrollApprovalApproversItemSelect"
                          id="editPayrollApprovalApproversItemSelect"
                        />
                      </Form.Item>
                      {approverType !== 'Parallel' && (
                        <Tooltip
                          title={'Delete Employee'}
                          data-cy="editPayrollApprovalApproversItemDelete"
                          id="editPayrollApprovalApproversItemDelete"
                        >
                          <Button
                            id={`deleteUserButton${name}`}
                            className="bg-red-600 px-[8%] text-white disabled:bg-gray-400"
                            onClick={() => {
                              const userId = form.getFieldValue([
                                'approvers',
                                name,
                                'assignedUser',
                              ]);
                              setDeleteModal(true);
                              setDeletedApprover(userId);
                            }}
                            data-cy="editPayrollApprovalApproversItemDeleteBtn"
                          >
                            <RiDeleteBin6Line
                              data-cy="editPayrollApprovalApproversItemDeleteBtnIcon"
                              id="editPayrollApprovalApproversItemDeleteBtnIcon"
                            />
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </Form.List>
        </Form>
      </div>
      <DeleteModal
        open={deleteModal}
        onConfirm={() => handleDeleteConfirm(deletedApprover, selectedItem?.id)}
        onCancel={() => setDeleteModal(false)}
        data-cy="editPayrollApprovalDeleteModal"
        id="editPayrollApprovalDeleteModal"
      />
    </CustomDrawerLayout>
  );
};

export default EditPayrollApproval;
