// import CustomDrawerLayout from '@/components/common/customDrawer';
import { Button, Form, Input, Row, Select, Modal } from 'antd';
import React from 'react';

const PayrollApprovalCreator = ({
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
      data-cy="settings-payroll-approvals-creator-modal"
      open={addModal}
      onCancel={onClose}
      footer={null}
      centered
      width={640}
      destroyOnClose
      maskClosable={false}
      closable={false}
    >
      {/* Header */}
      <div
        id="settings-payroll-approvals-creator-header"
        data-cy="settings-payroll-approvals-creator-header"
        className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100"
      >
        <h2
          id="settings-payroll-approvals-creator-title"
          data-cy="settings-payroll-approvals-creator-title"
          className="text-lg font-semibold text-gray-900"
        >
          {customFieldsDrawerHeader || 'Add Approval Workflow'}
        </h2>
        <button
          id="settings-payroll-approvals-creator-close-button"
          data-cy="settings-payroll-approvals-creator-close-button"
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-md hover:bg-gray-100"
          aria-label="Close modal"
        >
          <span
            id="settings-payroll-approvals-creator-close-icon"
            data-cy="settings-payroll-approvals-creator-close-icon"
            className="text-lg leading-none"
          >
            ✕
          </span>
        </button>
      </div>

      {/* Body */}
      <div
        className="px-6 pt-4 pb-2"
        id="settings-payroll-approvals-creator-container"
        data-cy="settings-payroll-approvals-creator-container"
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            workFlownName: selectedItem?.name,
          }}
          id="settings-payroll-approvals-creator-form"
          data-cy="settings-payroll-approvals-creator-form"
        >
          <Form.Item
            className="text-lg font-bold mt-3 mb-1"
            name="workFlownName"
            label="Workflow Name"
            rules={[
              { required: true, message: 'Please enter a workflow name!' },
            ]}
            id="settings-payroll-approvals-creator-workflow-name"
            data-cy="settings-payroll-approvals-creator-workflow-name"
          >
            <Input
              disabled
              placeholder="Enter Workflow Name"
              id="settings-payroll-approvals-creator-workflow-name-input"
              data-cy="settings-payroll-approvals-creator-workflow-name-input"
            />
          </Form.Item>

          <div
            className="my-3"
            id="settings-payroll-approvals-creator-levels"
            data-cy="settings-payroll-approvals-creator-levels"
          >
            <div
              className="text-lg font-bold"
              id="settings-payroll-approvals-creator-levels-title"
              data-cy="settings-payroll-approvals-creator-levels-title"
            >
              {approverType === 'Parallel' ? 'Approvers' : 'Level'}
            </div>
            <Select
              showSearch
              optionFilterProp="label"
              className="w-full h-10 m-1"
              style={{ width: 120 }}
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
              id="settings-payroll-approvals-creator-levels-select"
              data-cy="settings-payroll-approvals-creator-levels-select"
            />

            <div
              className="font-medium"
              id="settings-payroll-approvals-creator-levels-description"
              data-cy="settings-payroll-approvals-creator-levels-description"
            >
              This is the specific approval stage or level within the process
            </div>
          </div>
          {Array.from({ length: level }).map(
            /* eslint-disable-next-line @typescript-eslint/naming-convention */ (
              _,
              index,
            ) => (
              <div
                key={index}
                className="px-10 my-1"
                id="settings-payroll-approvals-creator-levels-container"
                data-cy="settings-payroll-approvals-creator-levels-container"
              >
                {approverType !== 'Parallel' && (
                  <div
                    id="settings-payroll-approvals-creator-levels-container-title"
                    data-cy="settings-payroll-approvals-creator-levels-container-title"
                  >
                    Additional Levels:{' '}
                    {selectedItem?.approvers?.length + index + 1}
                  </div>
                )}

                {approverType === 'Parallel' && (
                  <Form.Item
                    className="font-semibold text-xs"
                    name={`level_${index}`}
                    label="Level"
                    rules={[
                      { required: true, message: 'Please enter a level!' },
                    ]}
                    id="settings-payroll-approvals-creator-levels-container-level"
                    data-cy="settings-payroll-approvals-creator-levels-container-level"
                  >
                    <Input
                      placeholder="Enter level"
                      id="settings-payroll-approvals-creator-levels-container-level-input"
                      data-cy="settings-payroll-approvals-creator-levels-container-level-input"
                    />
                  </Form.Item>
                )}

                <Form.Item
                  className="font-semibold text-xs"
                  name={`assignedUser_${index}`}
                  label={`Assign User `}
                  rules={[{ required: true, message: 'Please select a user!' }]}
                  id="settings-payroll-approvals-creator-levels-container-assign-user"
                  data-cy="settings-payroll-approvals-creator-levels-container-assign-user"
                >
                  <Select
                    className="min-w-52 my-3"
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
                    id="settings-payroll-approvals-creator-levels-container-assign-user-select"
                    data-cy="settings-payroll-approvals-creator-levels-container-assign-user-select"
                  />
                </Form.Item>
              </div>
            ),
          )}

        </Form>
      </div>

      {/* Footer */}
      <Row
        className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4 px-6"
        id="settings-payroll-approvals-creator-footer"
        data-cy="settings-payroll-approvals-creator-footer"
      >
        <Button
          type="default"
          className="h-10 px-8"
          data-cy="settings-payroll-approvals-creator-cancel-button"
          id="settings-payroll-approvals-creator-cancel-button"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          className="h-10 px-8"
          data-cy="settings-payroll-approvals-creator-create-button"
          id="settings-payroll-approvals-creator-create-button"
          onClick={() => form.submit()}
        >
          Create
        </Button>
      </Row>
    </Modal>
  );
};

export default PayrollApprovalCreator;
