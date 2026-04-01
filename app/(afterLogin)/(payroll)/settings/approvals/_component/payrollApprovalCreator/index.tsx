// import CustomDrawerLayout from '@/components/common/customDrawer';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Modal } from 'antd';
import React from 'react';
import CustomLabel from '@/components/form/customLabel/customLabel';

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
      title={
        <div
          className="flex w-full items-center justify-between gap-4"
          data-cy="settings-payroll-approvals-creator-title-row"
        >
          <span
            className="text-lg font-semibold text-[#4d4d4d]"
            id="settings-payroll-approvals-creator-title"
            data-cy="settings-payroll-approvals-creator-title"
          >
            {customFieldsDrawerHeader || 'Add Approval Workflow'}
          </span>
          <button
            id="settings-payroll-approvals-creator-close-button"
            data-cy="settings-payroll-approvals-creator-close-button"
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
          >
            <CloseOutlined style={{ fontSize: 16, color: '#262626' }} />
          </button>
        </div>
      }
      footer={
        <div
          className="flex justify-end gap-3"
          id="settings-payroll-approvals-creator-footer"
          data-cy="settings-payroll-approvals-creator-footer"
        >
          <Button
            type="default"
            className="h-8 border border-[#D9D9D9] text-[#4d4d4d] font-normal"
            data-cy="settings-payroll-approvals-creator-cancel-button"
            id="settings-payroll-approvals-creator-cancel-button"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            className="h-8 font-normal"
            data-cy="settings-payroll-approvals-creator-create-button"
            id="settings-payroll-approvals-creator-create-button"
            onClick={() => form.submit()}
          >
            Add
          </Button>
        </div>
      }
      centered
      width={640}
      destroyOnClose
      maskClosable={false}
      closable={false}
      styles={{ body: { paddingTop: 8, paddingLeft: 0, paddingRight: 0 } }}
      zIndex={10002}
      classNames={{
        header:
          '!mb-0 flex !items-center !rounded-t-lg border-0 !px-6 !py-4 !min-h-0',
        body: '!px-6 !pb-0 !pt-0',
        footer: '!mt-0 border-0 !px-6 !pb-6 !pt-4',
      }}
      styles={{
        body: {
          borderBottom: 'none',
          paddingTop: 8,
          paddingLeft: 0,
          paddingRight: 0,
        },
        content: { borderRadius: 8, padding: 0 },
        header: { borderBottom: 'none' },
        footer: { borderTop: 'none' },
      }}
    >
      <div
        className="pt-2 pb-2"
        id="settings-payroll-approvals-creator-container"
        data-cy="settings-payroll-approvals-creator-container"
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={CustomLabel}
          className=""
          initialValues={{
            workFlownName: selectedItem?.name,
          }}
          id="settings-payroll-approvals-creator-form"
          data-cy="settings-payroll-approvals-creator-form"
        >
          <Form.Item
            className="mb-4"
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
              className="h-10 rounded-md"
              placeholder="Input"
              id="settings-payroll-approvals-creator-workflow-name-input"
              data-cy="settings-payroll-approvals-creator-workflow-name-input"
            />
          </Form.Item>

          <div
            className="rounded-xl border border-gray-200 p-3 mb-4"
            id="settings-payroll-approvals-creator-levels"
            data-cy="settings-payroll-approvals-creator-levels"
          >
            <div
              className="text-sm text-[#4d4d4d]"
              id="settings-payroll-approvals-creator-levels-title"
              data-cy="settings-payroll-approvals-creator-levels-title"
            >
              {approverType === 'Parallel' ? 'Approvers' : 'Level'}
            </div>
            <Select
              showSearch
              optionFilterProp="label"
              className="h-10 w-full mt-1"
              onChange={handleLevelChange}
              defaultValue={1}
              placeholder="Select"
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
              className="text-sm text-[#4d4d4d] mt-1"
              id="settings-payroll-approvals-creator-levels-description"
              data-cy="settings-payroll-approvals-creator-levels-description"
            >
              This is the specific approval stage or level within the process
            </div>
            <div className="mt-3 border-t border-gray-200 pt-3">
          {Array.from({ length: level }).map(
            /* eslint-disable-next-line @typescript-eslint/naming-convention */ (
              _,
              index,
            ) => (
              <div
                key={index}
                className={index === 0 ? '' : 'mt-3 pt-3 border-t border-gray-200'}
                id="settings-payroll-approvals-creator-levels-container"
                data-cy="settings-payroll-approvals-creator-levels-container"
              >
                {approverType !== 'Parallel' && (
                  <div
                    className="text-sm text-[#4d4d4d]"
                    id="settings-payroll-approvals-creator-levels-container-title"
                    data-cy="settings-payroll-approvals-creator-levels-container-title"
                  >
                    Additional Levels:{' '}
                    {selectedItem?.approvers?.length + index + 1}
                  </div>
                )}

                {approverType === 'Parallel' && (
                  <Form.Item
                    className="mb-3 mt-2"
                    name={`level_${index}`}
                    label="Level"
                    rules={[
                      { required: true, message: 'Please enter a level!' },
                    ]}
                    id="settings-payroll-approvals-creator-levels-container-level"
                    data-cy="settings-payroll-approvals-creator-levels-container-level"
                  >
                    <Input
                      className="h-10 rounded-md"
                      placeholder="Enter level"
                      id="settings-payroll-approvals-creator-levels-container-level-input"
                      data-cy="settings-payroll-approvals-creator-levels-container-level-input"
                    />
                  </Form.Item>
                )}

                <Form.Item
                  className="mb-0 mt-2"
                  name={`assignedUser_${index}`}
                  label="Assignee"
                  rules={[{ required: true, message: 'Please select a user!' }]}
                  id="settings-payroll-approvals-creator-levels-container-assign-user"
                  data-cy="settings-payroll-approvals-creator-levels-container-assign-user"
                >
                  <Select
                    className="h-10 w-full"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    mode={approverType === 'Parallel' ? 'multiple' : undefined}
                    onChange={(value) =>
                      handleUserChange(value as string, index)
                    }
                    placeholder="Select"
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
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default PayrollApprovalCreator;
