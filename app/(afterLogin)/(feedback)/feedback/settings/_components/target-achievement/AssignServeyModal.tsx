'use client';

import React, { useEffect, useMemo } from 'react';
import { Button, Form, Modal, Select } from 'antd';
import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/hooks/useIsMobile';
import { SettingsModalHeader } from '@/app/(afterLogin)/(feedback)/feedback/settings/_components/SettingsModalHeader';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useFetchedForms } from '@/store/server/features/feedback/form/queries';
import {
  useAssignSurvey,
  useUpdateSurveyAssignment,
} from '@/store/server/features/conversation/survey/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';

type OptionType = {
  label: string;
  value: string;
};
const { Option } = Select;

type AssignServeyModalProps = {
  open: boolean;
  loading?: boolean;
  surveyOptions?: OptionType[];
  initialValues?: {
    assignmentId?: string;
    departmentIds?: string[];
    departmentId?: string;
    userIds?: string[];
    surveyId?: string;
  };
  onClose: () => void;
  onSubmit?: (values: {
    departmentIds: string[];
    departmentId?: string;
    userIds: string[];
    surveyId: string;
  }) => void;
};

const AssignServeyModal: React.FC<AssignServeyModalProps> = ({
  open,
  initialValues,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: formsData } = useFetchedForms(100, 1);
  const { mutate: assignSurvey, isLoading: assignLoading } = useAssignSurvey();
  const { mutate: updateSurveyAssignment, isLoading: updateLoading } =
    useUpdateSurveyAssignment();
  const { isMobile } = useIsMobile();
  const selectedDepartmentIds = Form.useWatch('departmentIds', form) || [];
  const selectedUserIds = Form.useWatch('userIds', form) || [];
  const isEditMode = Boolean(initialValues?.assignmentId);

  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      form.setFieldsValue({
        departmentIds:
          initialValues.departmentIds ??
          (initialValues.departmentId ? [initialValues.departmentId] : []),
        userIds: initialValues.userIds ?? [],
        surveyId: initialValues.surveyId,
      });
      return;
    }

    form.resetFields();
  }, [open, initialValues, form, departmentData]);

  const surveyOptions = useMemo(
    () =>
      (formsData?.items ?? []).map((form: any) => ({
        value: String(form.id),
        label: form.name ?? 'Unnamed form',
      })),
    [formsData],
  );

  const selectedDepartmentUsers = useMemo(() => {
    if (!selectedDepartmentIds?.length || !Array.isArray(departmentData)) {
      return [] as OptionType[];
    }
    const seen = new Set<string>();
    const users: OptionType[] = [];
    selectedDepartmentIds.forEach((departmentId: string) => {
      const department = departmentData.find(
        (dept: any) => String(dept?.id) === String(departmentId),
      );
      const departmentUsers = Array.isArray(department?.users)
        ? department.users
        : [];
      departmentUsers.forEach((user: any) => {
        const userId = String(user?.id ?? user?.userId ?? '');
        if (!userId || seen.has(userId)) return;
        seen.add(userId);
        const fullName = `${user?.firstName ?? ''} ${user?.middleName ?? ''} ${
          user?.lastName ?? ''
        }`
          .replace(/\s+/g, ' ')
          .trim();
        users.push({
          value: userId,
          label: fullName || user?.email || userId,
        });
      });
    });
    return users;
  }, [departmentData, selectedDepartmentIds]);

  const allUsersMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!Array.isArray(departmentData)) return map;
    departmentData.forEach((dept: any) => {
      const users = Array.isArray(dept?.users) ? dept.users : [];
      users.forEach((user: any) => {
        const userId = String(user?.id ?? user?.userId ?? '');
        if (!userId) return;
        const fullName = `${user?.firstName ?? ''} ${user?.middleName ?? ''} ${
          user?.lastName ?? ''
        }`
          .replace(/\s+/g, ' ')
          .trim();
        map.set(userId, fullName || user?.email || userId);
      });
    });
    return map;
  }, [departmentData]);

  const isMobileViewport =
    isMobile ||
    (typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  const handleAssignSurvey = (values: {
    departmentIds?: string[];
    userIds?: string[];
    surveyId: string;
  }) => {
    const userIds = values.userIds || [];
    const onSuccess = () => {
      onSubmit?.({
        departmentIds: values.departmentIds || [],
        departmentId: values.departmentIds?.[0],
        userIds,
        surveyId: values.surveyId,
      });
      form.resetFields();
      onClose();
    };

    if (isEditMode && initialValues?.assignmentId) {
      updateSurveyAssignment(
        {
          id: initialValues.assignmentId,
          formId: values.surveyId,
          users: userIds.map((userId: string) => ({ userId })),
        },
        {
          onSuccess: () => {
            NotificationMessage.success({
              message: 'Successfully updated',
              description: 'Survey Assignment Updated Successfully',
            });
            onSuccess();
          },
        },
      );
      return;
    }

    assignSurvey(
      {
        formId: values.surveyId,
        users: userIds.map((userId: string) => ({
          userId,
          surveyVpAssignment: true,
        })),
      },
      {
        onSuccess: () => {
          NotificationMessage.success({
            message: 'Successfully created',
            description: 'Survey Assignment Created Successfully',
          });
          onSuccess();
        },
      },
    );
  };

  return (
    <Modal
      rootClassName="cfr-feedback-settings-modal"
      open={open}
      onCancel={onClose}
      closeIcon={null}
      footer={null}
      destroyOnClose
      centered
      width={isMobileViewport ? '100%' : 700}
      styles={{
        body: {
          maxHeight: isMobileViewport ? 'calc(100vh - 220px)' : undefined,
          overflowY: isMobileViewport ? 'auto' : undefined,
        },
        content: {
          ...(isMobileViewport
            ? { borderRadius: 12, width: '100%', maxWidth: '100%' }
            : {}),
        },
      }}
      data-cy="assign-survey-modal"
    >
      <SettingsModalHeader
        title={
          <span
            data-cy="assign-survey-modal-title"
            className="text-lg font-semibold text-black"
            id="assignSurveyModalTitle"
          >
            {isEditMode ? 'Edit Survey Assignment' : 'Survey Assignment'}
          </span>
        }
        onClose={onClose}
        data-cy="assign-survey-modal-header"
        closeDataCy="assign-survey-modal-close-button"
      />

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          departmentIds:
            initialValues?.departmentIds ??
            (initialValues?.departmentId ? [initialValues.departmentId] : []),
          userIds: initialValues?.userIds ?? [],
          surveyId: initialValues?.surveyId,
        }}
        onFinish={handleAssignSurvey}
        className="mt-4"
        data-cy="assign-survey-modal-form"
      >
        <div
          data-cy="assign-survey-modal-form-items"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <Form.Item
            name="departmentIds"
            label={
              <span
                data-cy="assign-survey-modal-department-label"
                className="text-sm font-medium text-black/[0.85]"
              >
                Department{' '}
                <span
                  data-cy="assign-survey-modal-department-label-required"
                  className="text-red-500"
                >
                  *
                </span>
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please select at least one department',
              },
            ]}
            data-cy="assign-survey-modal-department-field"
          >
            <Select
              mode="multiple"
              placeholder="Select"
              className="h-10"
              showSearch
              optionFilterProp="children"
              onChange={(departmentIds: string[]) => {
                const nextDepartmentIds = departmentIds || [];
                const currentUserIds = (form.getFieldValue('userIds') ||
                  []) as string[];
                const usersUnderDepartments = (
                  Array.isArray(departmentData)
                    ? departmentData
                        .filter((dept: any) =>
                          nextDepartmentIds.includes(String(dept?.id)),
                        )
                        .flatMap((dept: any) =>
                          Array.isArray(dept?.users) ? dept.users : [],
                        )
                        .map((user: any) =>
                          String(user?.id ?? user?.userId ?? ''),
                        )
                        .filter(Boolean)
                    : []
                ) as string[];
                const mergedUserIds = Array.from(
                  new Set([
                    ...currentUserIds.filter((id) =>
                      usersUnderDepartments.includes(String(id)),
                    ),
                    ...usersUnderDepartments,
                  ]),
                );
                form.setFieldsValue({
                  departmentIds: nextDepartmentIds,
                  userIds: mergedUserIds,
                });
              }}
              data-cy="assign-survey-modal-department-select"
              maxTagCount={1}
            >
              {departmentData?.map((dept: any) => (
                <Option
                  key={dept.id}
                  value={dept.id}
                  data-cy={`assign-survey-modal-department-option-${dept.id}`}
                >
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="surveyId"
            label={
              <span
                data-cy="assign-survey-modal-survey-label"
                className="text-sm font-medium text-black/[0.85]"
              >
                Survey
                <span
                  data-cy="assign-survey-modal-survey-label-required"
                  className="text-red-500"
                >
                  *
                </span>
              </span>
            }
            rules={[{ required: true, message: 'Please select survey' }]}
            data-cy="assign-survey-modal-survey-field"
          >
            <Select
              placeholder="Select"
              options={surveyOptions}
              className="h-10"
              data-cy="assign-survey-modal-survey-select"
            />
          </Form.Item>
        </div>
        <Form.Item
          name="userIds"
          label={
            <div
              data-cy="assign-survey-modal-users-label"
              className="flex items-center gap-1"
            >
              <span
                data-cy="assign-survey-modal-users-label-text"
                className="text-sm font-medium text-black/[0.85]"
              >
                Users{' '}
                <span
                  data-cy="assign-survey-modal-users-label-required"
                  className="text-red-500"
                >
                  *
                </span>
              </span>
              <QuestionCircleOutlined className="text-black/40" />
            </div>
          }
          rules={[
            { required: true, message: 'Please select at least one user' },
          ]}
          data-cy="assign-survey-modal-users-field"
        >
          <Select
            mode="multiple"
            placeholder="Select"
            className="h-10"
            showSearch
            optionFilterProp="label"
            options={selectedDepartmentUsers}
            maxTagCount={0}
            maxTagPlaceholder={() => null}
            data-cy="assign-survey-modal-users-select"
          />
        </Form.Item>
        {selectedUserIds.length > 0 ? (
          <div
            className="mb-4 flex flex-wrap gap-2"
            data-cy="assign-survey-modal-users-selected-tags"
          >
            {selectedUserIds.map((id: string) => {
              const userName = allUsersMap.get(String(id)) || String(id);
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 rounded-md border border-[#D9D9D9] bg-white px-3 py-1"
                  data-cy={`assign-survey-modal-users-selected-tag-${id}`}
                >
                  <span
                    data-cy="assign-survey-modal-users-selected-tag-text"
                    className="text-sm text-black/[0.65]"
                  >
                    {userName}
                  </span>
                  <CloseOutlined
                    className="cursor-pointer text-[10px] text-black/45 hover:text-red-500"
                    onClick={() => {
                      form.setFieldsValue({
                        userIds: selectedUserIds.filter(
                          (userId: string) => String(userId) !== String(id),
                        ),
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : null}

        <div
          data-cy="assign-survey-modal-actions"
          className="feedback-settings-modal-actions mt-1 flex items-center justify-end gap-2"
        >
          <Button
            type="default"
            onClick={onClose}
            className="!h-8 !min-h-8 !rounded-lg !border !border-[#D9D9D9] !bg-white !px-5 !text-sm !font-normal !leading-[22px] !text-black/[0.65]"
            data-cy="assign-survey-modal-cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={assignLoading || updateLoading}
            className="!h-8 !min-h-8 !rounded-lg !bg-[#1E40AF] !px-5 !text-sm !font-normal !leading-[22px]"
            data-cy="assign-survey-modal-submit-button"
          >
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AssignServeyModal;
