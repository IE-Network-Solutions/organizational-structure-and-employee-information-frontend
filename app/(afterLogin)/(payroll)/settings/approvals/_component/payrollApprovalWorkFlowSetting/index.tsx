'use client';
import { useApprovalStore } from '@/store/uistate/features/approval';
import React, { useEffect, useMemo } from 'react';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { Select, Button, Form, Input, Tag } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
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
    setSelections,
    workflowUserId,
    setDepartmentApproval,
  } = useApprovalStore();

  const userLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    users?.items?.forEach((u: User) => {
      map[u.id] =
        `${u.firstName || ''} ${u.middleName || ''} ${u.lastName || ''}`.trim();
    });
    return map;
  }, [users]);

  const handleUsersChange = (values: string[]) => {
    const updatedSelections = values.map((userId) => ({ user: userId }));
    setSelections({ SectionItemType: updatedSelections });
  };

  const handleRemoveUser = (userId: string) => {
    const current: string[] = form.getFieldValue('assignedUsers') || [];
    const updated = current.filter((id) => id !== userId);
    form.setFieldValue('assignedUsers', updated);
    handleUsersChange(updated);
  };
  const handleLevelChange = (value: number) => {
    setLevel(value);
    form.setFieldValue('level', value);

    const currentUsers: string[] = form.getFieldValue('assignedUsers') || [];
    if (currentUsers.length > value) {
      const trimmed = currentUsers.slice(0, value);
      form.setFieldValue('assignedUsers', trimmed);
      setSelections({
        SectionItemType: trimmed.map((userId) => ({ user: userId })),
      });
    } else {
      setSelections({
        SectionItemType: currentUsers.map((userId) => ({ user: userId })),
      });
    }
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
                  // eslint-disable-next-line
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
                Select {level} assignee{level > 1 ? 's' : ''} for approval
              </div>
            </div>

            <div
              className="mt-3 border-t border-gray-200 pt-3"
              id="approval-payroll-workflow-setting-assignees"
              data-cy="approval-payroll-workflow-setting-assignees"
            >
              <Form.Item
                className="mb-0 mt-2"
                name="assignedUsers"
                label="Assignee"
                rules={[
                  { required: true, message: 'Please select assignees!' },
                  {
                    // eslint-disable-next-line
                    validator: (_, value) => {
                      if (!value || value.length === 0) {
                        return Promise.reject('Please select assignees!');
                      }
                      if (value.length !== level) {
                        return Promise.reject(
                          `Please select exactly ${level} assignee${level > 1 ? 's' : ''}`,
                        );
                      }
                      if (workflowApplies === 'User' && workflowUserId) {
                        if (value.includes(workflowUserId)) {
                          return Promise.reject(
                            'Cannot select the same user as both workflow target and approver',
                          );
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                id="approval-payroll-workflow-setting-assignee-select"
                data-cy="approval-payroll-workflow-setting-assignee-select"
              >
                <Select
                  className="w-full"
                  allowClear={false}
                  showSearch
                  optionFilterProp="label"
                  mode="multiple"
                  maxCount={level}
                  maxTagCount={0}
                  maxTagPlaceholder={() => null}
                  onChange={handleUsersChange}
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
                  id="approval-payroll-workflow-setting-assignee-select-input"
                  data-cy="approval-payroll-workflow-setting-assignee-select-input"
                />
              </Form.Item>

              <Form.Item shouldUpdate noStyle>
                {() => {
                  const selectedIds: string[] =
                    form.getFieldValue('assignedUsers') || [];
                  if (selectedIds.length === 0) return null;
                  return (
                    <div
                      className="mt-2 flex flex-wrap gap-2"
                      data-cy="approval-payroll-workflow-setting-assignee-tags"
                    >
                      {selectedIds.map((id) => (
                        <Tag
                          key={id}
                          className="m-0 flex items-center gap-1 rounded-md border px-2 py-1 text-sm"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            borderColor: '#D9D9D9',
                            color: 'rgba(0, 0, 0, 0.7)',
                          }}
                          closeIcon={
                            <CloseOutlined
                              style={{
                                fontSize: 10,
                                color: 'rgba(0,0,0,0.45)',
                              }}
                            />
                          }
                          onClose={() => handleRemoveUser(id)}
                          data-cy={`approval-payroll-workflow-assignee-tag-${id}`}
                        >
                          {userLabelMap[id] || id}
                        </Tag>
                      ))}
                    </div>
                  );
                }}
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PayrollApprovalWorkFlowSetting;
