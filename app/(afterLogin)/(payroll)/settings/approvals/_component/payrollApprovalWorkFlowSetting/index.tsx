'use client';
import { useApprovalStore } from '@/store/uistate/features/approval';
import React, { useEffect } from 'react';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { Select, Button, Form, Input } from 'antd';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { IoArrowBack } from 'react-icons/io5';

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
          id="approval-payroll-workflow-setting-form"
          data-cy="approval-payroll-workflow-setting-form"
        >
          <Form.Item
            className="text-lg  font-bold mt-3 mb-1"
            name="workFlownName"
            label="WorkFlow Name"
            rules={[
              { required: true, message: 'Please enter a workFlow name!' },
            ]}
            id="approval-payroll-workflow-setting-workflow-name"
            data-cy="approval-payroll-workflow-setting-workflow-name"
          >
            <Input
              className="w-full h-10"
              placeholder="Enter WorkFlow Name"
              id="approval-payroll-workflow-setting-workflow-name-input"
              data-cy="approval-payroll-workflow-setting-workflow-name-input"
            />
          </Form.Item>
          <div
            className="font-medium mb-3 text-gray-500"
            id="approval-payroll-workflow-setting-workflow-name-label"
            data-cy="approval-payroll-workflow-setting-workflow-name-label"
          >
            WorkfLow Name
          </div>

          <Form.Item
            className="text-lg font-bold mt-3 mb-1"
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description!' }]}
            id="approval-payroll-workflow-setting-description"
            data-cy="approval-payroll-workflow-setting-description"
          >
            <Input.TextArea
              placeholder="Enter Description"
              id="approval-payroll-workflow-setting-description-input"
              data-cy="approval-payroll-workflow-setting-description-input"
            />
          </Form.Item>

          <div
            className="my-3"
            id="approval-payroll-workflow-setting-number-of-level"
            data-cy="approval-payroll-workflow-setting-number-of-level"
          >
            <div
              className="text-lg font-bold "
              id="approval-payroll-workflow-setting-number-of-level-title"
              data-cy="approval-payroll-workflow-setting-number-of-level-title"
            >
              Number Of Level
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
              id="approval-payroll-workflow-setting-number-of-level-select"
              data-cy="approval-payroll-workflow-setting-number-of-level-select"
            />

            <div
              className="font-medium mb-3 text-gray-500"
              id="approval-payroll-workflow-setting-number-of-level-select-description"
              data-cy="approval-payroll-workflow-setting-number-of-level-select-description"
            >
              Select Number of specific approval stage or level within the
              process
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
                id="approval-payroll-workflow-setting-level"
                data-cy="approval-payroll-workflow-setting-level"
              >
                <div
                  id="approval-payroll-workflow-setting-level-title"
                  data-cy="approval-payroll-workflow-setting-level-title"
                >
                  Level: {index + 1}
                </div>
                <Form.Item
                  className="font-semibold text-xs"
                  name={`assignedUser_${index}`}
                  label={`Assign User `}
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
                    className="w-full  my-3"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    mode={approverType === 'Parallel' ? 'multiple' : undefined}
                    style={{ width: 120 }}
                    onChange={(value) =>
                      handleUserChange(value as string, index)
                    }
                    placeholder="Select User"
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
        </Form>
      </div>
    </div>
  );
};

export default PayrollApprovalWorkFlowSetting;
