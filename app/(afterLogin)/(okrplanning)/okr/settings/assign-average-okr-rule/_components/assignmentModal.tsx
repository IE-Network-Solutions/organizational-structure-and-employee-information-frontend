'use client';

import React, { useEffect, useMemo } from 'react';
import { Button, Form, Modal, Select } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useAssignAverageOkrRuleToUser } from '@/store/server/features/okrplanning/monitoring-evaluation/okr-rule/mutations';
import { AverageOkrRuleAssignment } from '@/store/uistate/features/okrplanning/monitoring-evaluation/average-okr-rule-assignment/interface';
import { TalentAcqSelectChevronSuffix } from '@/app/(afterLogin)/(recruitment)/recruitment/_components/recruitmentIcons';

const ALL_EMPLOYEES_OPTION = '__all_employees__';

type AssignmentModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  assignment: AverageOkrRuleAssignment | null;
  users: any[];
  okrRules: any[];
};

const getAssignmentUserId = (assignment: AverageOkrRuleAssignment | null) =>
  assignment?.userId ?? assignment?.user?.id ?? '';

const getAssignmentRuleId = (assignment: AverageOkrRuleAssignment | null) =>
  assignment?.averageOkrRuleId ?? assignment?.averageOkrRule?.id ?? '';

const getUserFullName = (user: any) =>
  `${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`
    .replace(/\s+/g, ' ')
    .trim();

const getFirstName = (name: string) => name.trim().split(' ')[0] || name;

const getSelectLabels = (
  values: string[],
  options: Array<{ value: string; label: string }>,
) => {
  const optionMap = new Map(options.map((option) => [option.value, option.label]));

  return values
    .filter(Boolean)
    .map((value) => ({
      value,
      label: optionMap.get(value) || value,
    }));
};

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  open,
  mode,
  onClose,
  assignment,
  users,
  okrRules,
}) => {
  const [form] = Form.useForm();
  const { mutate: assignAverageOkrRuleToUser, isLoading: isAssigning } =
    useAssignAverageOkrRuleToUser();

  const isEditMode = mode === 'edit';
  const isSubmitting = isAssigning;
  const selectedUserIds = Form.useWatch('userIds', form) as string[] | undefined;
  const selectedOkrRuleIds = Form.useWatch('averageOkrRuleId', form) as
    | string[]
    | undefined;

  const activeUsers = useMemo(
    () =>
      (users || [])
        .filter(
          (user) =>
            !user?.deletedAt &&
            user?.employee_status !== 'inactive' &&
            user?.employee_status !== 'terminated',
        )
        .sort((a, b) => getUserFullName(a).localeCompare(getUserFullName(b))),
    [users],
  );

  const userOptions = useMemo(
    () =>
      activeUsers.map((user) => ({
        value: user.id,
        label: getUserFullName(user) || 'Unknown employee',
      })),
    [activeUsers],
  );

  const createUserOptions = useMemo(
    () => [
      {
        value: ALL_EMPLOYEES_OPTION,
        label: 'All',
      },
      ...userOptions,
    ],
    [userOptions],
  );

  const okrRuleOptions = useMemo(
    () =>
      (okrRules || []).map((item) => ({
        value: item.id,
        label: item.title || 'Untitled rule',
      })),
    [okrRules],
  );

  const selectedUserChips = useMemo(
    () =>
      getSelectLabels(
        Array.isArray(selectedUserIds)
          ? selectedUserIds
          : selectedUserIds
            ? [selectedUserIds]
            : [],
        userOptions,
      ),
    [selectedUserIds, userOptions],
  );

  const selectedRuleChips = useMemo(
    () =>
      getSelectLabels(
        selectedOkrRuleIds || [],
        okrRuleOptions,
      ),
    [okrRuleOptions, selectedOkrRuleIds],
  );

  useEffect(() => {
    if (!open) return;

    if (isEditMode) {
      form.setFieldsValue({
        userIds: getAssignmentUserId(assignment)
          ? [getAssignmentUserId(assignment)]
          : undefined,
        averageOkrRuleId: getAssignmentRuleId(assignment)
          ? [getAssignmentRuleId(assignment)]
          : undefined,
      });
      return;
    }

    form.setFieldsValue({
      userIds: undefined,
      averageOkrRuleId: undefined,
    });
  }, [assignment, form, isEditMode, open]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleCreateUserChange = (value: string[]) => {
    if (!value?.includes(ALL_EMPLOYEES_OPTION)) {
      form.setFieldValue('userIds', value);
      return;
    }

    form.setFieldValue(
      'userIds',
      activeUsers.map((user) => user.id),
    );
  };

  const handleRuleChange = (value: string[]) => {
    form.setFieldValue(
      'averageOkrRuleId',
      Array.isArray(value) ? value.slice(-1) : [],
    );
  };

  const handleSubmit = (values: any) => {
    const userIds = values.userIds || [];
    const averageOkrRuleId = Array.isArray(values.averageOkrRuleId)
      ? values.averageOkrRuleId[0]
      : values.averageOkrRuleId;

    if (isEditMode) {
      assignAverageOkrRuleToUser(
        {
          userIds,
          averageOkrRuleId,
        },
        {
          onSuccess: () => {
            handleClose();
          },
        },
      );

      return;
    }

    assignAverageOkrRuleToUser(
      {
        userIds,
        averageOkrRuleId,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  const handleRemoveUserChip = (value: string) => {
    const currentValues = form.getFieldValue('userIds') || [];
    form.setFieldValue(
      'userIds',
      currentValues.filter((item: string) => item !== value),
    );
  };

  const handleRemoveRuleChip = (value: string) => {
    const currentValues = form.getFieldValue('averageOkrRuleId') || [];
    form.setFieldValue(
      'averageOkrRuleId',
      currentValues.filter((item: string) => item !== value),
    );
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      closable={false}
      centered
      width={560}
      style={{ maxWidth: 'calc(100vw - 32px)' }}
      footer={
        <div
          className="!flex !w-full !flex-row !justify-end !gap-3"
          data-cy="average-okr-rule-assignment-modal-footer"
        >
          <Button
            type="default"
            className="!h-8 !w-[68px] !rounded-md !border !border-gray-300 !bg-white !px-0 !text-sm !font-normal !text-gray-700 hover:!bg-gray-50"
            onClick={handleClose}
            disabled={isSubmitting}
            data-cy="average-okr-rule-assignment-modal-cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            className="!h-8 !w-[69px] !rounded-md !bg-[#2b54ad] !px-0 !text-sm !font-normal hover:!bg-[#3d66c2]"
            loading={isSubmitting}
            onClick={() => form.submit()}
            data-cy="average-okr-rule-assignment-modal-submit-button"
          >
            {isEditMode ? 'Update' : 'Assign'}
          </Button>
        </div>
      }
      title={
        <div
          className="flex w-full items-center justify-between gap-4"
          data-cy="average-okr-rule-assignment-modal-title-row"
        >
          <span
            className="inline-flex min-h-6 min-w-0 flex-1 items-center text-left text-base font-semibold leading-6 text-gray-900"
            data-cy="average-okr-rule-assignment-modal-title-text"
          >
            {isEditMode ? 'Edit Assignment' : 'Add Assignment'}
          </span>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            data-cy="average-okr-rule-assignment-modal-close"
          >
            <CloseOutlined style={{ fontSize: 16, color: '#262626' }} />
          </button>
        </div>
      }
      className="average-okr-rule-assignment-modal"
      rootClassName="[&_.ant-modal-title]:!block [&_.ant-modal-title]:!w-full [&_.ant-form-item-label>label]:!font-normal [&_.ant-form-item-label>label]:text-[#262626] [&_.ant-form-item-required]:before:!hidden"
      classNames={{
        header:
          '!mb-0 flex !items-center !rounded-t-lg border-0 !px-6 !py-4 !min-h-0',
        body: '!px-4 !pb-0 !pt-0 sm:!px-6',
        footer: '!mt-0 border-0 !px-4 !pb-4 !pt-4 sm:!px-6 sm:!pb-6',
      }}
      styles={{
        content: { borderRadius: 8, padding: 0 },
        header: { borderBottom: 'none' },
        footer: { borderTop: 'none' },
      }}
      data-cy="average-okr-rule-assignment-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="pb-4 pt-2 [&_.ant-form-item-label>label]:text-sm [&_.ant-form-item-label>label]:font-normal [&_.ant-form-item-label>label]:text-[#262626]"
        data-cy="average-okr-rule-assignment-modal-form"
      >
        <Form.Item
          name="userIds"
          label="Department Lead"
          className="mb-0"
          rules={[
            {
              required: true,
              message: 'Please select employees',
            },
          ]}
          data-cy="average-okr-rule-assignment-modal-users-item"
        >
          <div
            className="relative"
            data-cy="average-okr-rule-assignment-modal-users-select-wrapper"
          >
            <Select
              mode="multiple"
              showSearch
              allowClear
              placeholder=""
              suffixIcon={TalentAcqSelectChevronSuffix}
              className="w-full average-okr-rule-assignment-modal-select-base average-okr-rule-assignment-modal-select-multiple"
              maxTagCount={0}
              tagRender={() => (
                <span
                  className="hidden"
                  data-cy="average-okr-rule-assignment-modal-users-hidden-tag"
                />
              )}
              options={isEditMode ? userOptions : createUserOptions}
              onChange={handleCreateUserChange}
              filterOption={(input, option) =>
                `${option?.label ?? ''}`
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              data-cy="average-okr-rule-assignment-modal-users-select"
            />
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[rgba(0,0,0,0.45)]"
              data-cy="average-okr-rule-assignment-modal-users-placeholder"
            >
              {isEditMode ? 'Select employee' : 'All'}
            </span>
          </div>
        </Form.Item>
        {selectedUserChips.length > 0 && (
          <div
            className="mb-0 mt-3 flex flex-wrap gap-2"
            data-cy="average-okr-rule-assignment-modal-users-chips"
          >
            {selectedUserChips.map((item) => (
              <span
                key={item.value}
                className="inline-flex items-center gap-1.5 rounded-[4px] border border-solid border-[#E5E7EB] bg-[#F3F4F6] px-2 py-1 text-[14px] font-normal text-[rgba(0,0,0,0.7)]"
                data-cy={`average-okr-rule-assignment-modal-users-chip-${item.value}`}
              >
                {getFirstName(item.label)}
                <button
                  type="button"
                  onClick={() => handleRemoveUserChip(item.value)}
                  className="inline-flex h-4 w-4 items-center justify-center rounded text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.7)]"
                  data-cy={`average-okr-rule-assignment-modal-users-chip-remove-${item.value}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <Form.Item
          name="averageOkrRuleId"
          label="OKR Rule"
          className="mb-0 mt-4"
          rules={[{ required: true, message: 'Please select an OKR rule' }]}
          data-cy="average-okr-rule-assignment-modal-rule-item"
        >
          <div
            className="relative w-full"
            data-cy="average-okr-rule-assignment-modal-rule-select-wrapper"
          >
            <Select
              mode="multiple"
              showSearch
              allowClear
              placeholder=""
              suffixIcon={TalentAcqSelectChevronSuffix}
              className="w-full average-okr-rule-assignment-modal-select-base average-okr-rule-assignment-modal-select-multiple"
              maxTagCount={0}
              tagRender={() => (
                <span
                  className="hidden"
                  data-cy="average-okr-rule-assignment-modal-rule-hidden-tag"
                />
              )}
              options={okrRuleOptions}
              onChange={handleRuleChange}
              filterOption={(input, option) =>
                `${option?.label ?? ''}`
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              data-cy="average-okr-rule-assignment-modal-rule-select"
            />
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[rgba(0,0,0,0.45)]"
              data-cy="average-okr-rule-assignment-modal-rule-placeholder"
            >
              Select
            </span>
          </div>
        </Form.Item>
        {selectedRuleChips.length > 0 && (
          <div
            className="mb-0 mt-3 flex flex-wrap gap-2"
            data-cy="average-okr-rule-assignment-modal-rule-chips"
          >
            {selectedRuleChips.map((item) => (
              <span
                key={item.value}
                className="inline-flex items-center gap-1.5 rounded-[4px] border border-solid border-[#E5E7EB] bg-[#F3F4F6] px-2 py-1 text-[14px] font-normal text-[rgba(0,0,0,0.7)]"
                data-cy={`average-okr-rule-assignment-modal-rule-chip-${item.value}`}
              >
                {item.label}
                <button
                  type="button"
                  onClick={() => handleRemoveRuleChip(item.value)}
                  className="inline-flex h-4 w-4 items-center justify-center rounded text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.7)]"
                  data-cy={`average-okr-rule-assignment-modal-rule-chip-remove-${item.value}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </Form>

      <style jsx global data-cy="average-okr-rule-assignment-modal-styles">{`
        .average-okr-rule-assignment-modal .ant-modal-content {
          padding: 0 !important;
          border-radius: 8px !important;
        }
        .average-okr-rule-assignment-modal .ant-form-item-label {
          padding-bottom: 6px !important;
        }
        .average-okr-rule-assignment-modal .ant-form-item-explain,
        .average-okr-rule-assignment-modal .ant-form-item-extra {
          margin-top: 6px !important;
        }
        .average-okr-rule-assignment-modal-select-base .ant-select-selector {
          border-radius: 8px !important;
          border-color: #d9d9d9 !important;
          box-shadow: none !important;
        }
        .average-okr-rule-assignment-modal-select-base.ant-select:hover
          .ant-select-selector,
        .average-okr-rule-assignment-modal-select-base.ant-select-focused
          .ant-select-selector {
          border-color: #d9d9d9 !important;
          box-shadow: none !important;
        }
        /* Match recruitment TA selects: 40px control height so default arrow math centers */
        .average-okr-rule-assignment-modal-select-multiple
          .ant-select-selector {
          min-height: 40px !important;
          height: 40px !important;
          align-items: center !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
        .average-okr-rule-assignment-modal-select-single .ant-select-selector {
          height: 40px !important;
          min-height: 40px !important;
          display: flex !important;
          align-items: center !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
        /* Chevron: do not set height:100% here — it breaks vertical centering with top:50% + translateY */
        .average-okr-rule-assignment-modal-select-base.ant-select
          .ant-select-arrow {
          top: 50% !important;
          bottom: auto !important;
          inset-block-start: 50% !important;
          inset-block-end: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          transform: translateY(-50%) !important;
          height: auto !important;
          line-height: 1 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          inset-inline-end: 12px !important;
          color: rgba(0, 0, 0, 0.45) !important;
        }
        .average-okr-rule-assignment-modal-select-base.ant-select
          .ant-select-arrow
          > span {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          line-height: 1 !important;
        }
        .average-okr-rule-assignment-modal-select-base.ant-select
          .ant-select-clear {
          top: 50% !important;
          inset-block-start: 50% !important;
          margin: 0 !important;
          transform: translateY(-50%) !important;
        }
        .average-okr-rule-assignment-modal-select-multiple
          .ant-select-selection-overflow {
          flex-wrap: nowrap !important;
        }
        .average-okr-rule-assignment-modal-select-multiple
          .ant-select-selection-overflow-item {
          display: none !important;
        }
        .average-okr-rule-assignment-modal-select-multiple
          .ant-select-selection-placeholder {
          inset-inline-start: 11px !important;
        }
        .average-okr-rule-assignment-modal-select-multiple
          .ant-select-selection-placeholder,
        .average-okr-rule-assignment-modal-select-multiple
          .ant-select-selection-item,
        .average-okr-rule-assignment-modal-select-single
          .ant-select-selection-placeholder,
        .average-okr-rule-assignment-modal-select-single
          .ant-select-selection-item {
          line-height: 38px !important;
        }
        .average-okr-rule-assignment-modal-select-multiple
          .ant-select-selection-item,
        .average-okr-rule-assignment-modal-select-single
          .ant-select-selection-item {
          opacity: 0 !important;
        }
        .average-okr-rule-assignment-modal-select-single
          .ant-select-selection-placeholder,
        .average-okr-rule-assignment-modal-select-multiple
          .ant-select-selection-placeholder {
          opacity: 1 !important;
          color: rgba(0, 0, 0, 0.45) !important;
        }
        .average-okr-rule-assignment-modal-select-single
          .ant-select-selection-placeholder {
          display: flex !important;
          align-items: center !important;
        }
        .average-okr-rule-assignment-modal-select-multiple.ant-select-multiple
          .ant-select-selection-overflow {
          gap: 6px 0 !important;
        }
        .average-okr-rule-assignment-modal-select-multiple
          .ant-select-selection-item {
          border-radius: 4px !important;
        }
        @media (max-width: 640px) {
          .average-okr-rule-assignment-modal .ant-modal-header {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .average-okr-rule-assignment-modal .ant-modal-footer {
            padding-left: 16px !important;
            padding-right: 16px !important;
            padding-bottom: 16px !important;
          }
        }
      `}</style>
    </Modal>
  );
};

export default AssignmentModal;
