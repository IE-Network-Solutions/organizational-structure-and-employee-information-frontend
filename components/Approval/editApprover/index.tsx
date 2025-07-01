import CustomDrawerLayout from '@/components/common/customDrawer';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { Button, Form, Input, Radio, Row, Select, Tooltip } from 'antd';
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
    <CustomDrawerLayout
      open={editModal}
      modalHeader={customFieldsDrawerHeader}
      onClose={onClose}
      width="40%"
      footer={null}
    >
      <div className="pb-[60px]">
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            className="text-lg font-bold mt-3 mb-1"
            name="workFlownName"
            label="WorkFlow Name"
            rules={[
              { required: true, message: 'Please enter a workFlow name!' },
            ]}
          >
            <Input disabled placeholder="Enter WorkFlow Name" />
          </Form.Item>

          <Form.Item
            className="text-lg font-bold mt-3 mb-1"
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description!' }]}
          >
            <Input.TextArea placeholder="Enter Description" disabled />
          </Form.Item>

          <Form.Item
            className="text-lg font-bold mt-3"
            name="workflowAppliesType"
            label="Workflow Applies Type"
            rules={[
              { required: true, message: 'Please select a workflow option!' },
            ]}
          >
            <Radio.Group disabled>
              <Radio value="Department">Department</Radio>
              <Radio value="Hierarchy">Hierarchy</Radio>
              <Radio value="User">User</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item className="text-lg font-bold" name="workflowAppliesId">
            <Select
              showSearch
              optionFilterProp="label"
              className="min-w-52 mb-1"
              allowClear
              style={{ width: 120 }}
              disabled
              placeholder={`Select ${workflowApplies ? workflowApplies : ''}`}
            />
          </Form.Item>

          <Form.List name="approvers">
            {(fields, {}) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="px-10 my-1">
                    <div>Level: {name + 1}</div>
                    <div className="flex justify-between items-center">
                      <Form.Item
                        {...restField}
                        className="font-semibold text-xs"
                        name={[name, 'assignedUser']}
                        label={`Assign User for Level ${name + 1}`}
                        rules={[
                          { required: true, message: 'Please select a user!' },
                        ]}
                      >
                        <Select
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
                        />
                      </Form.Item>
                      {approverType !== 'Parallel' && (
                        <Tooltip title={'Delete Employee'}>
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
            <Row className="flex justify-end gap-3">
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
    </CustomDrawerLayout>
  );
};

export default EditApproverComponent;
