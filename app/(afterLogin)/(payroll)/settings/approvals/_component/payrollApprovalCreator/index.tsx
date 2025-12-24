import CustomDrawerLayout from '@/components/common/customDrawer';
import { Button, Form, Input, Row, Select } from 'antd';
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
    <CustomDrawerLayout
      open={addModal}
      modalHeader={customFieldsDrawerHeader}
      onClose={onClose}
      width="40%"
      footer={null}
    >
      <div
        className="pb-[60px]"
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

          <Form.Item
            id="settings-payroll-approvals-creator-levels-container-submit"
            data-cy="settings-payroll-approvals-creator-levels-container-submit"
          >
            <Row
              className="flex justify-end gap-3"
              id="settings-payroll-approvals-creator-levels-container-submit-row"
              data-cy="settings-payroll-approvals-creator-levels-container-submit-row"
            >
              <Button
                type="primary"
                htmlType="submit"
                id="settings-payroll-approvals-creator-levels-container-submit-row-button"
                data-cy="settings-payroll-approvals-creator-levels-container-submit-row-button"
              >
                Submit
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </div>
    </CustomDrawerLayout>
  );
};

export default PayrollApprovalCreator;
