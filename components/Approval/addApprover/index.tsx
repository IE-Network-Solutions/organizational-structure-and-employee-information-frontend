import { Button, Form, Input, Modal, Row, Select } from 'antd';
import React from 'react';

const AddApproverComponent = ({
  addModal,
  customFieldsDrawerHeader,
  onClose,
  form,
  handleSubmit,
  selectedItem,
  approverType,
  level,
  handleLevelChange,
  handleUserChange,
  users,
}: {
  addModal: any;
  customFieldsDrawerHeader: any;
  onClose: () => void;
  form: any;
  handleSubmit: (a: string) => void;
  selectedItem: any;
  approverType: any;
  level: any;
  handleLevelChange: (a: number) => void;
  handleUserChange: (value: string, index: number) => void;
  users: any;
}) => {
  return (
    <Modal
      open={addModal}
      title={customFieldsDrawerHeader}
      onCancel={onClose}
      width="40%"
      centered
      footer={null}
      zIndex={10002}
    >
      <div data-cy="components-approval-addapprover-index-tsx-index-div-38">
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            workFlownName: selectedItem?.name,
          }}
        >
          {/* keep workflow name in form state but not editable here */}
          <Form.Item name="workFlownName">
            <Input disabled />
          </Form.Item>

          <div
            data-cy="components-approval-addapprover-index-tsx-index-div-58"
            className="my-3"
          >
            <label
              data-cy="components-approval-addapprover-index-tsx-index-label-levels"
              className="block text-sm font-medium text-[#4d4d4d] mb-1"
            >
              Levels
            </label>
            <Select
              showSearch
              optionFilterProp="label"
              className="w-full h-10"
              onChange={handleLevelChange}
              defaultValue={1}
              placeholder="Select Levels"
              options={Array.from(
                { length: 9 },
                /* eslint-disable-next-line @typescript-eslint/naming-convention */ (
                  _,
                  i,
                ) => ({
                  value: i + 1,
                  label: `${i + 1}`,
                }),
              )}
            />

            <div
              data-cy="components-approval-addapprover-index-tsx-index-div-82"
              className="mt-1 text-xs text-gray-500"
            >
              Select one assignee for {level || 1}{' '}
              {level === 1 ? 'level' : 'levels'} of approval
            </div>
          </div>

          <div
            id="components-approval-addapprover-index-tsx-index-div-90"
            data-cy="components-approval-addapprover-index-tsx-index-div-90"
            className="mt-4"
          >
            <span
              id="components-approval-addapprover-index-tsx-index-label-assignee"
              data-cy="components-approval-addapprover-index-tsx-index-label-assignee"
              className="block text-sm font-medium text-[#4d4d4d] mb-1"
            >
              Assignee
            </span>
          </div>
          {Array.from({ length: level }).map(
            /* eslint-disable-next-line @typescript-eslint/naming-convention */ (
              _,
              index,
            ) => (
              <div
                data-cy="components-approval-addapprover-index-tsx-index-div-91"
                key={index}
                className="my-2"
              >
                {approverType !== 'Parallel' && (
                  <div data-cy="components-approval-addapprover-index-tsx-index-div-93">
                    Additional Levels:{' '}
                    {selectedItem?.approvers?.length + index + 1}
                  </div>
                )}

                <Form.Item
                  className="mb-3"
                  name={`assignedUser_${index}`}
                  rules={[{ required: true, message: 'Please select a user!' }]}
                >
                  <Select
                    className="w-full"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    mode={approverType === 'Parallel' ? 'multiple' : undefined}
                    style={{ width: 120 }}
                    onChange={(value) =>
                      handleUserChange(value as string, index)
                    }
                    placeholder="Select User"
                    options={users?.items?.map((list: any) => ({
                      value: list?.id,
                      label: `${list?.firstName ? list?.firstName : ''} ${list?.middleName ? list?.middleName : ''} ${list?.lastName ? list?.lastName : ''}`,
                    }))}
                  />
                </Form.Item>
              </div>
            ),
          )}

          <Form.Item>
            <Row className="flex justify-end gap-3 mt-4">
              <Button onClick={onClose}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Add
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default AddApproverComponent;
