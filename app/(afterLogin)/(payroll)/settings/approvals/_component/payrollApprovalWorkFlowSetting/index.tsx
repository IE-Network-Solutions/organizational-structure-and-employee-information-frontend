'use client';
import { useApprovalStore } from '@/store/uistate/features/approval';
import React, { useEffect } from 'react';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { Select, Button, Form, Input } from 'antd';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { IoArrowBack } from 'react-icons/io5';
import CustomLabel from '@/components/form/customLabel/customLabel';

interface User {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

const PayrollApprovalWorkFlowSetting = ({
  handleSubmit,
  isSuccess,
  form,
  title,
  wizardMode = false,
}: {
  handleSubmit: (a: string) => void;
  isSuccess: boolean;
  form: any;
  title?: string;
  /** Hide inner back/header when embedded in multi-step modal. */
  wizardMode?: boolean;
}) => {
  useEffect(() => {
    isSuccess && form.resetFields();
  }, [isSuccess]);

  const { data: users } = useGetAllUsers();
  const {
    approverType,
    level,
    setLevel,
    workflowApplies,
    selections,
    setSelections,
    workflowUserId,
    setDepartmentApproval,
  } = useApprovalStore();

  const handleUserChange = (value: string, index: number) => {
    const updatedSelections = [...selections.SectionItemType];
    updatedSelections[index] = { ...updatedSelections[index], user: value };
    setSelections({ SectionItemType: updatedSelections });
  };
  const handleLevelChange = (value: number) => {
    setLevel(value);
    form.setFieldValue('level', value);
    const updatedSelections = Array.from(
      { length: value },
      /* eslint-disable-next-line @typescript-eslint/naming-convention */ (
        _,
        index,
      ) => {
        return selections.SectionItemType[index] || { user: null };
      },
    );
    setSelections({ SectionItemType: updatedSelections });
  };
  const pageSlug = 'approvals-settings';

  return (
    <div
      id="approval-payroll-workflow-setting-container"
      data-cy="approval-payroll-workflow-setting-container"
    >
      {!wizardMode && (
        <div
          className="mb-10 flex "
          id="approval-payroll-workflow-setting-header"
          data-cy="approval-payroll-workflow-setting-header"
        >
          <Button
            className="flex items-center justify-center font-bold text-black border-none"
            onClick={() => setDepartmentApproval(false)}
            id={`settings-${pageSlug}-payroll-workflow-setting-back-btn`}
            data-cy={`settings-${pageSlug}-payroll-workflow-setting-back-btn`}
            icon={
              <IoArrowBack data-cy="settings-payroll-workflow-setting-back-btn-icon" />
            }
          />
          <PageHeader
            size="small"
            data-cy="payroll-settings-page-header-title-view-text"
            title="Approval Setting "
            description={
              title
                ? title
                : approverType === 'Sequential'
                  ? 'Sequential '
                  : approverType === 'Parallel'
                    ? 'Parallel '
                    : approverType === 'Conditional'
                      ? 'Conditional '
                      : ' '
            }
          />
        </div>
      )}
      <div
        className={wizardMode ? 'px-0' : 'px-8'}
        id="approval-payroll-workflow-setting-form"
        data-cy="approval-payroll-workflow-setting-form"
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={CustomLabel}
          id="approval-payroll-workflow-setting-form"
          data-cy="approval-payroll-workflow-setting-form"
          className={wizardMode ? 'px-2' : undefined}
        >
          <Form.Item
            className="mb-4"
            name="workFlownName"
            label="Workflow Name"
            rules={[
              { required: true, message: 'Please enter a workFlow name!' },
            ]}
            id="approval-payroll-workflow-setting-workflow-name"
            data-cy="approval-payroll-workflow-setting-workflow-name"
          >
            <Input
              className="h-10 rounded-md"
              placeholder="Input"
              id="approval-payroll-workflow-setting-workflow-name-input"
              data-cy="approval-payroll-workflow-setting-workflow-name-input"
            />
          </Form.Item>

          <Form.Item
            className="mb-4"
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description!' }]}
            id="approval-payroll-workflow-setting-description"
            data-cy="approval-payroll-workflow-setting-description"
          >
            <Input.TextArea
              placeholder="Enter Description"
              className="rounded-md"
              id="approval-payroll-workflow-setting-description-input"
              data-cy="approval-payroll-workflow-setting-description-input"
            />
          </Form.Item>

          <div
            className="rounded-xl border border-gray-200 p-3 mb-4"
            id="approval-payroll-workflow-setting-levels-and-assignees"
            data-cy="approval-payroll-workflow-setting-levels-and-assignees"
          >
            <div
              id="approval-payroll-workflow-setting-number-of-level"
              data-cy="approval-payroll-workflow-setting-number-of-level"
            >
              <div
                className="text-sm text-[#4d4d4d]"
                id="approval-payroll-workflow-setting-number-of-level-title"
                data-cy="approval-payroll-workflow-setting-number-of-level-title"
              >
                Levels
              </div>
              <Form.Item
                name="level"
                className="mb-0 mt-1"
                required
                rules={[{ required: true, message: 'Please select levels' }]}
                initialValue={level}
                data-cy="approval-payroll-workflow-setting-levels-field"
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  className="h-10"
                  onChange={handleLevelChange}
                  placeholder="Select"
                  options={Array.from({ length: 9 }, (_, i) => ({
                    value: i + 1,
                    label: `${i + 1}`,
                  }))}
                  id="approval-payroll-workflow-setting-number-of-level-select"
                  data-cy="approval-payroll-workflow-setting-number-of-level-select"
                />
              </Form.Item>

              <div
                className="text-sm text-[#4d4d4d] mt-1"
                id="approval-payroll-workflow-setting-number-of-level-select-description"
                data-cy="approval-payroll-workflow-setting-number-of-level-select-description"
              >
                Select one assignee for {level} level{level === 1 ? '' : 's'} of
                approval
              </div>
            </div>

            <div
              className="mt-3 border-t border-gray-200 pt-3"
              id="approval-payroll-workflow-setting-assignees"
              data-cy="approval-payroll-workflow-setting-assignees"
            >
              {Array.from({ length: level }).map(
                /* eslint-disable-next-line @typescript-eslint/naming-convention */ (
                  _,
                  index,
                ) => (
                  <div
                    key={index}
                    className={index === 0 ? '' : 'mt-3 pt-3 border-t border-gray-200'}
                    id="approval-payroll-workflow-setting-level"
                    data-cy="approval-payroll-workflow-setting-level"
                  >
                    <div
                      className="text-sm text-[#4d4d4d]"
                      id="approval-payroll-workflow-setting-level-title"
                      data-cy="approval-payroll-workflow-setting-level-title"
                    >
                      Level: {index + 1}
                    </div>
                    <Form.Item
                      className="mb-0 mt-2"
                      name={`assignedUser_${index}`}
                      label="Assignee"
                      rules={[
                        { required: true, message: 'Please select a user!' },
                        {
                          /* eslint-disable-next-line @typescript-eslint/naming-convention */
                          validator: (_, value) => {
                            /* eslint-enable @typescript-eslint/naming-convention */

                            if (
                              workflowApplies === 'User' &&
                              value === workflowUserId
                            ) {
                              return Promise.reject(
                                'Cannot select the same user as both workflow target and approver',
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                      id="approval-payroll-workflow-setting-level-select"
                      data-cy="approval-payroll-workflow-setting-level-select"
                    >
                      <Select
                        className="h-10 w-full"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        mode={
                          approverType === 'Parallel' ? 'multiple' : undefined
                        }
                        onChange={(value) =>
                          handleUserChange(value as string, index)
                        }
                        placeholder="Select"
                        options={users?.items
                          ?.filter(
                            (user: User) =>
                              workflowApplies !== 'User' ||
                              user.id !== workflowUserId,
                          )
                          ?.map((list: User) => ({
                            value: list.id,
                            label:
                              `${list.firstName ? list.firstName : ''} ${list.middleName ? list.middleName : ''} ${list.lastName ? list.lastName : ''}`.trim(),
                          }))}
                        id="approval-payroll-workflow-setting-level-select"
                        data-cy="approval-payroll-workflow-setting-level-select"
                      />
                    </Form.Item>
                  </div>
                ),
              )}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PayrollApprovalWorkFlowSetting;
