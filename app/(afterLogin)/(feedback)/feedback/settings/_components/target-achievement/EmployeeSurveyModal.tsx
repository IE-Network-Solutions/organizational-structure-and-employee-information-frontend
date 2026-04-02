'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Form, Select, InputNumber, Modal, Button, Avatar } from 'antd';
import { CloseOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

import CustomButton from '@/components/common/buttons/customButton';
import { useGetActiveMonth } from '@/store/server/features/payroll/payroll/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  useCreateEmployeeSurvey,
  useUpdateEmployeeSurvey,
} from '@/store/server/features/conversation/survey/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { EmployeeSurveyStore } from '@/store/uistate/features/conversation/survey';
import { SettingsModalHeader } from '@/app/(afterLogin)/(feedback)/feedback/settings/_components/SettingsModalHeader';
import { useGetActiveEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { MdCheck } from 'react-icons/md';

interface EmployeeSurveyModalProps {
  open: boolean;
  onClose: () => void;
}

type DraftRow = {
  userId: string | null;
  score: number | null;
  targetIndex: number | null;
};

const emptyDraftRow = (): DraftRow => ({
  userId: null,
  score: null,
  targetIndex: null,
});

const EmployeeSurveyModal: React.FC<EmployeeSurveyModalProps> = ({
  open,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { survey, openModal } = EmployeeSurveyStore();
  const isEditMode = Boolean(open && openModal && survey?.id);
  const { isMobile } = useIsMobile();
  // Fallback to viewport width in case global isMobile updates after modal open.
  const isMobileViewport =
    isMobile ||
    (typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  const { data: userData, isLoading } = useGetActiveEmployee();
  const users = userData?.items || [];
  const usersById = useMemo(() => {
    const map = new Map<string, any>();
    users?.forEach((u: any) => {
      if (u?.id != null) map.set(String(u.id), u);
    });
    return map;
  }, [users]);

  const [confirmed, setConfirmed] = useState<
    Array<{ userId: string; score: number }>
  >([]);
  const [draftRows, setDraftRows] = useState<DraftRow[]>([emptyDraftRow()]);

  const createdBy = useAuthenticationStore.getState().userId;
  const updatedBy = useAuthenticationStore.getState().userId;
  const { data: month } = useGetActiveMonth();
  const { mutate: createEmployeeSurvey, isLoading: createLoading } =
    useCreateEmployeeSurvey();
  const { mutate: updateEmployeeSurvey, isLoading: updateLoading } =
    useUpdateEmployeeSurvey();

  const handleClose = () => {
    form.resetFields();
    setConfirmed([]);
    setDraftRows([emptyDraftRow()]);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    if (isEditMode) {
      form.setFieldsValue(survey);
    } else {
      form.resetFields();
      setConfirmed([]);
      setDraftRows([emptyDraftRow()]);
    }
  }, [open, isEditMode, survey, month?.id, form]);

  const onFinishCreate = () => {
    const hasUnconfirmedNonEmptyRow = draftRows.some(
      (r) => r.userId != null || r.score != null,
    );
    if (hasUnconfirmedNonEmptyRow) {
      NotificationMessage.error({
        message: 'Unconfirmed entries',
        description:
          'Please confirm (✓) or remove (✕) all entries before creating.',
      });
      return;
    }
    if (!confirmed.length) return;
    const monthId = month?.id;
    const data = confirmed.map((entry) => ({
      userId: entry.userId,
      score: entry.score,
      monthId,
      createdBy,
    }));
    createEmployeeSurvey(data, {
      onSuccess: () => {
        NotificationMessage.success({
          message: 'Successfully Created',
          description: 'Employee Survey Created Successfully',
        });
        handleClose();
      },
    });
  };

  const onFinishUpdate = (values: any) => {
    const payload = {
      ...values,
      monthId: month?.id,
      createdBy,
      updatedBy,
      id: survey?.id,
    };
    updateEmployeeSurvey(payload, {
      onSuccess: () => {
        NotificationMessage.success({
          message: 'Successfully updated',
          description: 'Employee Survey Updated Successfully',
        });
        handleClose();
      },
    });
  };

  const modalTitle = isEditMode ? 'Edit Employee Survey' : 'Achievement';
  const isLoadingSubmit = createLoading || updateLoading;

  const footer = (
    <div
      className="w-full flex justify-end items-center gap-4"
      data-cy="employee-survey-modal-footer"
      id="employeeSurveyModalFooter"
    >
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleClose}
        loading={isLoadingSubmit}
        data-cy="employee-survey-modal-cancel-button"
        id="employeeSurveyModalCancelButton"
      />
      <CustomButton
        title={isEditMode ? 'Submit' : 'Create'}
        type="primary"
        htmlType="submit"
        onClick={() => {
          if (isEditMode) form.submit();
          else onFinishCreate();
        }}
        loading={isLoadingSubmit}
        disabled={!isEditMode && confirmed.length === 0}
        data-cy="employee-survey-modal-submit-button"
        id="employeeSurveyModalSubmitButton"
      />
    </div>
  );

  const getUserLabel = (id: string) => {
    const u = usersById.get(String(id));
    const name =
      `${u?.firstName ?? ''} ${u?.middleName ?? ''} ${u?.lastName ?? ''}`
        .replace(/\s+/g, ' ')
        .trim();
    return name || id;
  };

  const scorePill = (score: number) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-lg border px-3 py-1 text-xs font-medium';
    const scoreText = `${Number(score).toFixed(2)}%`;

    if (score >= 10) {
      return (
        <span
          className={`${baseClasses} border-green-300 bg-green-50 text-green-600`}
          data-cy={`employee-survey-modal-score-pill-green-${score}`}
        >
          {scoreText}
        </span>
      );
    }
    if (score >= 7.5) {
      return (
        <span
          className={`${baseClasses} border-yellow-300 bg-yellow-50 text-yellow-700`}
          data-cy={`employee-survey-modal-score-pill-yellow-${score}`}
        >
          {scoreText}
        </span>
      );
    }
    return (
      <span
        className={`${baseClasses} border-red-300 bg-red-50 text-red-600`}
        data-cy={`employee-survey-modal-score-pill-red-${score}`}
      >
        {scoreText}
      </span>
    );
  };

  const setDraftField = (
    index: number,
    key: 'userId' | 'score',
    value: string | number | null,
  ) => {
    setDraftRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  };

  const addDraftRow = () => {
    setDraftRows((prev) => [...prev, emptyDraftRow()]);
  };

  const removeDraftRow = (index: number) => {
    setDraftRows((prev) => prev.filter((row, i) => i !== index));
  };

  const confirmDraftRow = (index: number) => {
    const row = draftRows[index];
    if (!row) return;
    if (!row.userId || row.score == null) {
      NotificationMessage.error({
        message: 'Missing Required Fields',
        description:
          'Please select employee and input score before confirming.',
      });
      return;
    }

    if (row.targetIndex != null) {
      setConfirmed((prev) => {
        const next = [...prev];
        next.splice(row.targetIndex as number, 0, {
          userId: String(row.userId),
          score: Number(row.score),
        });
        return next;
      });
    } else {
      setConfirmed((prev) => [
        ...prev,
        { userId: String(row.userId), score: Number(row.score) },
      ]);
    }

    removeDraftRow(index);
  };

  const editRow = (index: number) => {
    const row = confirmed[index];
    if (!row) return;
    setConfirmed((prev) => prev.filter((row, i) => i !== index));
    setDraftRows((prev) => [
      ...prev,
      { userId: row.userId, score: row.score, targetIndex: index },
    ]);
  };

  const deleteRow = (index: number) => {
    setConfirmed((prev) => prev.filter((row, i) => i !== index));
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      closeIcon={null}
      title={
        <SettingsModalHeader
          title={modalTitle}
          onClose={handleClose}
          data-cy="employee-survey-modal-header"
          id="employeeSurveyModalHeader"
          closeDataCy="employee-survey-modal-close-button"
        />
      }
      footer={footer}
      destroyOnClose
      centered={!isMobileViewport}
      width={isMobileViewport ? '100%' : isEditMode ? undefined : 640}
      style={
        isMobileViewport
          ? {
              position: 'fixed',
              top: 'auto',
              bottom: 0,
              left: 0,
              right: 0,
              margin: 0,
              padding: 0,
              transform: 'none',
              width: '100%',
              maxWidth: '100%',
            }
          : undefined
      }
      styles={{
        content: isMobileViewport
          ? { width: '100%', maxWidth: '100%', margin: 0, borderRadius: 12 }
          : undefined,
        body: {
          maxHeight: isMobileViewport ? 'calc(100vh - 220px)' : undefined,
          overflowY: isMobileViewport ? 'auto' : undefined,
        },
      }}
      data-cy="employee-survey-modal"
    >
      {isEditMode ? (
        <Form
          form={form}
          layout="vertical"
          name="employee_survey_edit"
          onFinish={onFinishUpdate}
          requiredMark={false}
          data-cy="employee-survey-modal-form"
          id="employeeSurveyModalForm"
        >
          <div
            className="grid grid-cols-12 gap-4 items-start"
            data-cy="employee-survey-modal-edit-fields-grid"
          >
            <Form.Item
              label={
                <span data-cy="employee-survey-modal-employee-label">
                  Employee{' '}
                  <span
                    style={{ color: 'red' }}
                    data-cy="employee-survey-modal-required-asterisk"
                  >
                    *
                  </span>
                </span>
              }
              name="userId"
              rules={[{ required: true, message: 'Please select employee' }]}
              className="col-span-8 mb-0"
              data-cy="employee-survey-modal-employee-field"
              id="employeeSurveyModalEmployeeField"
            >
              <Select
                disabled
                showSearch
                placeholder="Select"
                className="w-full rounded-lg border-[#D9D9D9]"
                allowClear
                loading={isLoading}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={users?.map((item: any) => ({
                  ...item,
                  value: item?.id,
                  label:
                    item?.firstName +
                    ' ' +
                    item?.middleName +
                    ' ' +
                    item?.lastName,
                }))}
                data-cy="employee-survey-modal-employee-select"
                id="employeeSurveyModalEmployeeSelect"
              />
            </Form.Item>

            <Form.Item
              label={
                <span data-cy="employee-survey-modal-score-label">
                  Score{' '}
                  <span
                    style={{ color: 'red' }}
                    data-cy="employee-survey-modal-score-required"
                  >
                    *
                  </span>
                </span>
              }
              name="score"
              rules={[{ required: true, message: 'Please input score' }]}
              className="col-span-4 mb-0"
              data-cy="employee-survey-modal-score-field"
              id="employeeSurveyModalScoreField"
            >
              <InputNumber
                min={0}
                max={10}
                className="w-full rounded-lg border-[#D9D9D9]"
                placeholder="Input"
                data-cy="employee-survey-modal-score-input"
                id="employeeSurveyModalScoreInput"
              />
            </Form.Item>
          </div>
        </Form>
      ) : (
        <div data-cy="employee-survey-modal-form" id="employeeSurveyModalForm">
          <div data-cy="employee-survey-modal-employees-editor">
            {draftRows.map((draft, index) => (
              <div
                key={`draft-${index}`}
                className="grid grid-cols-12 gap-4 items-start mb-3"
                data-cy={`employee-survey-modal-draft-row-${index}`}
              >
                <div
                  className="col-span-7"
                  data-cy={`employee-survey-modal-draft-employee-col-${index}`}
                >
                  <label
                    className="block mb-2 text-sm font-medium text-gray-700"
                    data-cy={`employee-survey-modal-draft-employee-label-${index}`}
                  >
                    Employee{' '}
                    <span
                      className="text-red-500"
                      data-cy={`employee-survey-modal-draft-employee-required-${index}`}
                    >
                      *
                    </span>
                  </label>
                  <Select
                    value={draft.userId ?? undefined}
                    showSearch
                    placeholder="Select"
                    className="w-full rounded-lg border-[#D9D9D9] h-10"
                    allowClear
                    loading={isLoading}
                    onChange={(value) =>
                      setDraftField(
                        index,
                        'userId',
                        value ? String(value) : null,
                      )
                    }
                    filterOption={(input: any, option: any) =>
                      (option?.label ?? '')
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={users?.map((item: any) => ({
                      ...item,
                      value: item?.id,
                      label:
                        item?.firstName +
                        ' ' +
                        item?.middleName +
                        ' ' +
                        item?.lastName,
                    }))}
                    data-cy={`employee-survey-modal-draft-employee-select-${index}`}
                    id={`employeeSurveyModalDraftEmployeeSelect${index}`}
                  />
                </div>

                <div
                  className="col-span-3"
                  data-cy={`employee-survey-modal-draft-score-col-${index}`}
                >
                  <label
                    className="block mb-2 text-sm font-medium text-gray-700"
                    data-cy={`employee-survey-modal-draft-score-label-${index}`}
                  >
                    Score{' '}
                    <span
                      className="text-red-500"
                      data-cy={`employee-survey-modal-draft-score-required-${index}`}
                    >
                      *
                    </span>
                  </label>
                  <InputNumber
                    value={draft.score ?? undefined}
                    min={0}
                    max={10}
                    className="w-full rounded-lg border-[#D9D9D9] h-10"
                    placeholder="Input"
                    onChange={(value) =>
                      setDraftField(
                        index,
                        'score',
                        value == null ? null : Number(value),
                      )
                    }
                    data-cy={`employee-survey-modal-draft-score-input-${index}`}
                    id={`employeeSurveyModalDraftScoreInput${index}`}
                  />
                </div>

                <div
                  className="col-span-2 flex gap-2 items-end justify-end h-full"
                  data-cy={`employee-survey-modal-draft-actions-${index}`}
                >
                  <Button
                    type="primary"
                    onClick={() => confirmDraftRow(index)}
                    icon={<MdCheck />}
                    className="!bg-blue-600 hover:!bg-blue-700 !border-0 w-10 h-10"
                    data-cy={`employee-survey-modal-draft-confirm-btn-${index}`}
                    id={`employeeSurveyModalDraftConfirmBtn${index}`}
                  />
                  <Button
                    danger
                    onClick={() => removeDraftRow(index)}
                    icon={<CloseOutlined />}
                    className="!border-red-500 w-10 h-10"
                    data-cy={`employee-survey-modal-draft-cancel-btn-${index}`}
                    id={`employeeSurveyModalDraftCancelBtn${index}`}
                  />
                </div>
              </div>
            ))}

            <div
              className="mt-4 space-y-3"
              data-cy="employee-survey-modal-list"
            >
              {confirmed.map((row, index) => {
                const u = usersById.get(String(row.userId));
                const img = u?.profileImage || u?.imageUrl;
                return (
                  <div
                    key={`${row.userId}-${index}`}
                    className="flex items-center justify-between border border-[#D9D9D9] rounded-lg px-3 py-2"
                    data-cy={`employee-survey-modal-list-row-${index}`}
                    id={`employeeSurveyModalListRow${index}`}
                  >
                    <div
                      className="flex items-center gap-3"
                      data-cy={`employee-survey-modal-list-row-main-${index}`}
                    >
                      <Avatar src={img} size={28}>
                        {(getUserLabel(row.userId)[0] || 'U').toUpperCase()}
                      </Avatar>
                      <span
                        className="text-sm font-medium text-gray-700"
                        data-cy={`employee-survey-modal-list-row-name-${index}`}
                      >
                        {getUserLabel(row.userId)}
                      </span>
                      {scorePill(row.score)}
                    </div>

                    <div
                      className="flex items-center gap-2"
                      data-cy={`employee-survey-modal-list-row-actions-${index}`}
                    >
                      <Button
                        onClick={() => editRow(index)}
                        icon={<EditOutlined />}
                        className="border border-[#D9D9D9]"
                        data-cy={`employee-survey-modal-list-edit-${index}`}
                        id={`employeeSurveyModalListEdit${index}`}
                      />
                      <Button
                        danger
                        onClick={() => deleteRow(index)}
                        icon={<CloseOutlined />}
                        data-cy={`employee-survey-modal-list-delete-${index}`}
                        id={`employeeSurveyModalListDelete${index}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="flex justify-center mt-4"
              data-cy="employee-survey-modal-add-row-wrapper"
            >
              <Button
                type="primary"
                onClick={addDraftRow}
                icon={<PlusOutlined />}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 border-0"
                data-cy="employee-survey-modal-add-row-button"
                id="employeeSurveyModalAddRowButton"
              >
                Employee
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EmployeeSurveyModal;
