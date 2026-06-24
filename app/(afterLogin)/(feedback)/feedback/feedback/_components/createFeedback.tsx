import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Select, Input, Button, Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import {
  useGetAllUsers,
  useGetActiveEmployee,
} from '@/store/server/features/employees/employeeManagment/queries';
import {
  useFetchAllFeedbackTypes,
  useFetchFeedbackTypeById,
} from '@/store/server/features/feedback/feedbackType/queries';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useCreateFeedbackRecord,
  useUpdateFeedbackRecord,
} from '@/store/server/features/feedback/feedbackRecord/mutation';
import { FeedbackItem } from '@/store/server/features/CFR/conversation/action-plan/interface';
import { useGetAllPerspectives } from '@/store/server/features/CFR/feedback/queries';
import { FeedbackTypeItems } from '@/store/server/features/CFR/conversation/action-plan/interface';

const { TextArea } = Input;

const CreateFeedbackForm = ({ form }: { form: any }) => {
  const { userId } = useAuthenticationStore();
  const {
    open,
    setOpen,
    setSelectedFeedbackRecord,
    selectedFeedbackRecord,
    variantType,
    activeTab,
    setActiveTab,
  } = ConversationStore();
  const [selectedDepartment, setSelectedDepartmentId] = useState<string | null>(
    null,
  );
  const { data: getAllUsersData } = useGetAllUsers();
  const { data: getActiveEmployee } = useGetActiveEmployee();
  const { data: getAllFeedbackTypeById } = useFetchFeedbackTypeById(activeTab);

  const { data: perspectiveData } = useGetAllPerspectives();
  const {
    mutate: createFeedbackRecord,
    isLoading: loadingCreateFeedbackRecord,
  } = useCreateFeedbackRecord();
  const {
    mutate: updateFeedbackRecord,
    isLoading: loadingUpdateFeedbackRecord,
  } = useUpdateFeedbackRecord();
  const { data: getAllFeedbackTypes } = useFetchAllFeedbackTypes();
  const selectedRecipientId = Form.useWatch('recipientId', form);

  const getDepartmentIdForUser = useCallback(
    (recipientId?: string | null) => {
      if (!recipientId) return null;

      const recipient = getActiveEmployee?.items?.find(
        (item: any) => item?.id === recipientId,
      );

      return recipient?.employeeJobInformation?.[0]?.departmentId ?? null;
    },
    [getActiveEmployee?.items],
  );

  const onFinish = (values: any) => {
    const derivedDepartmentId =
      getDepartmentIdForUser(values.recipientId) ?? selectedDepartment;
    if (selectedFeedbackRecord !== null) {
      const updatedValues = {
        ...values,
        departmentId: derivedDepartmentId,
        points:
          getAllFeedbackTypeById?.feedback?.find(
            (feedback: FeedbackItem) => feedback.id === values.feedbackId,
          )?.points || 0,
        issuerId: userId,
        feedbackTypeId: activeTab,
      };
      updateFeedbackRecord(updatedValues, {
        onSuccess: () => {
          setOpen(false);
          setSelectedFeedbackRecord(null);
        },
      });
    } else {
      const updatedValues = {
        ...values,
        departmentId: derivedDepartmentId,
        points:
          getAllFeedbackTypeById?.feedback?.find(
            (feedback: FeedbackItem) => feedback.id === values.feedbackId,
          )?.points || 0,
        issuerId: userId,
        feedbackTypeId: activeTab,
      };
      createFeedbackRecord(updatedValues, {
        onSuccess: () => {
          setOpen(false);
          setSelectedFeedbackRecord(null);
          form.resetFields();
        },
      });
    }
  };

  const perspectiveIds =
    perspectiveData
      ?.filter(
        (perspective: any) => perspective.departmentId === selectedDepartment,
      )
      ?.map((perspective: any) => perspective.id) || [];

  const filteredFeedback = getAllFeedbackTypeById?.feedback?.filter(
    (item: any) => {
      if (item.perspectiveId) {
        return perspectiveIds.includes(item.perspectiveId);
      }
      return true;
    },
  );

  const handleClose = () => {
    setOpen(false);
    setSelectedFeedbackRecord(null);
    setSelectedDepartmentId(null);
    form.resetFields();
  };

  useEffect(() => {
    if (selectedFeedbackRecord !== null) {
      form.setFieldsValue({
        id: selectedFeedbackRecord?.id,
        recipientId: selectedFeedbackRecord?.recipientId,
        feedbackId: selectedFeedbackRecord?.feedbackId,
        reason: selectedFeedbackRecord?.reason,
        action: selectedFeedbackRecord?.action,
      });
    }
  }, [selectedFeedbackRecord, form]);

  useEffect(() => {
    if (!open) return;

    const departmentIdFromRecipient =
      getDepartmentIdForUser(selectedRecipientId);
    const fallbackDepartmentId =
      selectedFeedbackRecord?.perspectiveId && perspectiveData
        ? (perspectiveData.find(
            (item: any) => item.id === selectedFeedbackRecord.perspectiveId,
          )?.departmentId ?? null)
        : null;

    setSelectedDepartmentId(departmentIdFromRecipient ?? fallbackDepartmentId);
  }, [
    open,
    perspectiveData,
    selectedFeedbackRecord?.perspectiveId,
    selectedRecipientId,
    getDepartmentIdForUser,
  ]);

  useEffect(() => {
    if (
      selectedFeedbackRecord?.feedbackTypeId &&
      open &&
      selectedFeedbackRecord !== null
    ) {
      setActiveTab(selectedFeedbackRecord.feedbackTypeId);
    }
  }, [
    selectedFeedbackRecord?.id,
    selectedFeedbackRecord?.feedbackTypeId,
    open,
    selectedFeedbackRecord,
    setActiveTab,
  ]);

  useEffect(() => {
    if (selectedFeedbackRecord === null && open) {
      form.setFieldsValue({ feedbackId: undefined });
    }
  }, [activeTab, selectedFeedbackRecord, open, form]);

  const activeTabName =
    getAllFeedbackTypes?.items?.find(
      (item: FeedbackTypeItems) => item.id === activeTab,
    )?.category ?? '';

  const selectedTypeMeta = getAllFeedbackTypes?.items?.find(
    (item: FeedbackTypeItems) => item.id === activeTab,
  );

  const ccSelectOptions = useMemo(() => {
    const buildName = (item: any) => {
      const fromParts =
        `${item?.firstName ?? ''} ${item?.middleName ?? ''} ${item?.lastName ?? ''}`
          .trim()
          .replace(/\s+/g, ' ');
      if (fromParts) return fromParts;
      const alt = [item?.fullName, item?.name].find(
        (v: unknown) => typeof v === 'string' && v.trim().length > 0,
      );
      return typeof alt === 'string' ? alt.trim() : '';
    };
    return (
      getAllUsersData?.items
        ?.filter((item: any) => item?.email)
        ?.map((item: any) => {
          const name = buildName(item);
          const email = item.email as string;
          return {
            value: email,
            label: name || email,
          };
        }) ?? []
    );
  }, [getAllUsersData?.items]);

  const ccFieldValue = Form.useWatch('cc', form);
  const ccEmails: string[] = Array.isArray(ccFieldValue) ? ccFieldValue : [];

  const removeCcEmail = (email: string) => {
    const next = ccEmails.filter((e) => e !== email);
    form.setFieldValue('cc', next);
  };

  const isModalOpen =
    (open && activeTabName !== '') || selectedFeedbackRecord !== null;

  return (
    <>
      <Modal
        open={isModalOpen}
        onCancel={handleClose}
        footer={null}
        closable={false}
        centered
        width={795}
        destroyOnClose
        maskClosable
        className="add-feedback-modal"
        styles={{
          content: {
            padding: 0,
            borderRadius: 8,
            overflow: 'hidden',
            width: 'min(795px, calc(100vw - 24px))',
            maxHeight: 'min(580px, calc(100vh - 48px))',
            display: 'flex',
            flexDirection: 'column',
            boxShadow:
              '0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12), 0px 9px 28px 8px rgba(0, 0, 0, 0.05)',
          },
        }}
        data-cy="feedback-feedback-components-createfeedback-drawer"
      >
        <div
          className="add-feedback-modal-root flex h-full min-h-0 max-h-[min(580px,calc(100vh-48px))] w-full min-w-0 flex-1 flex-col bg-white font-[Calibri,Candara,'Segoe_UI',sans-serif]"
          data-cy="feedback-create-feedback-modal-layout"
        >
          <div
            className="relative flex shrink-0 flex-row items-center gap-[10px] px-6 pb-2 pt-5"
            data-cy="feedback-create-feedback-modal-header"
          >
            <span
              className="m-0 flex-1 text-base font-bold leading-6 text-black/[0.7]"
              data-cy="feedback-feedback-components-createfeedback-div-header"
            >
              {selectedFeedbackRecord !== null
                ? 'Edit Feedback'
                : variantType === 'appreciation'
                  ? 'Add Appriciation'
                  : 'Add Reprimand'}
            </span>
            <button
              type="button"
              aria-label="Close"
              onClick={handleClose}
              className="absolute right-5 top-4 flex h-[22px] w-[22px] items-center justify-center rounded border-0 bg-transparent p-0 text-black/[0.45] transition-colors hover:bg-black/[0.04]"
              data-cy="feedback-create-feedback-modal-close"
            >
              <CloseOutlined
                className="text-base"
                data-cy="feedback-create-feedback-modal-close-icon"
              />
            </button>
          </div>

          <div
            className="add-feedback-modal-body-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-3"
            data-cy="feedback-create-feedback-modal-body"
          >
            <div
              className="mx-auto flex w-full max-w-[747px] flex-col items-center gap-1"
              data-cy="feedback-create-feedback-type-section"
            >
              <div
                className="w-full text-center text-sm font-normal leading-[22px] text-black"
                data-cy="feedback-create-feedback-type-label"
              >
                Select Type
              </div>
              <div
                className="flex w-full flex-row flex-wrap items-center justify-center gap-3"
                data-cy="feedback-create-feedback-type-toggles"
              >
                {getAllFeedbackTypes?.items?.map((item: FeedbackTypeItems) => {
                  const selected = item.id === activeTab;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      data-cy={`feedback-create-feedback-type-toggle-${item.id}`}
                      className={`box-border flex h-8 min-w-0 shrink-0 items-center justify-center px-[15px] text-sm font-normal leading-[22px] transition-colors ${
                        selected
                          ? 'add-feedback-type-btn add-feedback-type-btn--primary rounded-md border border-solid border-[#1E40AF] bg-[#1E40AF] text-white shadow-[0px_2px_0px_rgba(5,145,255,0.1)]'
                          : 'add-feedback-type-btn add-feedback-type-btn--default rounded-md border border-solid border-[#D9D9D9] bg-white text-black/[0.7] shadow-[0px_2px_0px_rgba(0,0,0,0.02)] hover:border-[#bfbfbf]'
                      }`}
                    >
                      {item.category}
                    </button>
                  );
                })}
              </div>
              <p
                className="m-0 w-full text-center text-sm font-normal leading-[22px] text-black"
                data-cy="feedback-create-feedback-type-description"
              >
                {selectedTypeMeta?.description?.trim()
                  ? selectedTypeMeta.description
                  : `Content about what ${(selectedTypeMeta?.category ?? 'Engagement').toLowerCase()} ${variantType === 'appreciation' ? 'appreciation' : 'feedback'} is`}
              </p>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              className="add-feedback-modal-form w-full max-w-[747px]"
              initialValues={{
                feedbackId: undefined,
                reason: '',
                action: '',
                cc: [],
              }}
              data-cy="feedback-feedback-components-createfeedback-form"
            >
              {selectedFeedbackRecord !== null && (
                <Form.Item name="id" hidden>
                  <Input type="hidden" />
                </Form.Item>
              )}

              <div
                className="grid w-full grid-cols-1 gap-3"
                data-cy="feedback-create-feedback-row-employee-dept"
              >
                <div
                  className="min-w-0"
                  data-cy="feedback-create-feedback-col-employee"
                >
                  <Form.Item
                    name="recipientId"
                    label={
                      <span
                        className="add-feedback-form-label text-sm font-normal leading-[22px] text-[#030712]"
                        data-cy="feedback-create-feedback-label-employee"
                      >
                        Employee{' '}
                        <span
                          className="text-[#FF4D4F]"
                          data-cy="feedback-create-feedback-label-employee-required"
                        >
                          *
                        </span>
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: 'Please select at least one employee!',
                      },
                    ]}
                    data-cy="feedback-feedback-components-createfeedback-form-item-recipient"
                  >
                    <Select
                      showSearch
                      allowClear
                      className="add-feedback-field-select w-full"
                      placeholder="Select"
                      data-cy="feedback-feedback-components-createfeedback-select-employee"
                      onChange={(value) => {
                        if (value !== selectedFeedbackRecord?.recipientId) {
                          form.setFieldValue('feedbackId', undefined);
                        }
                      }}
                      options={
                        getActiveEmployee?.items
                          ?.filter((i: any) => i.id !== userId)
                          ?.map((item: any) => ({
                            label:
                              `${item?.firstName} ${item?.middleName} ${item?.lastName}`.trim(),
                            value: item?.id,
                          })) ?? []
                      }
                      filterOption={(input, option) =>
                        (option?.label as string)
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                </div>
              </div>

              <Form.Item
                name="feedbackId"
                label={
                  <span
                    className="add-feedback-form-label text-sm font-normal leading-[22px] text-[#030712]"
                    data-cy="feedback-create-feedback-label-feedback"
                  >
                    Feedback{' '}
                    <span
                      className="text-[#FF4D4F]"
                      data-cy="feedback-create-feedback-label-feedback-required"
                    >
                      *
                    </span>
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: 'Please select at least one type!',
                  },
                ]}
                data-cy="feedback-feedback-components-createfeedback-form-item-feedback"
              >
                <Select
                  showSearch
                  placeholder="Select"
                  className="add-feedback-field-select w-full"
                  data-cy="feedback-feedback-components-createfeedback-select-feedback"
                  options={
                    filteredFeedback
                      ?.filter((i: any) => i.variant === variantType)
                      ?.map((feedback: FeedbackItem) => ({
                        label: feedback.name,
                        value: feedback.id,
                      })) ?? []
                  }
                  filterOption={(input, option) =>
                    (option?.label as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                name="reason"
                label={
                  <span
                    className="add-feedback-form-label text-sm font-normal leading-[22px] text-[#030712]"
                    data-cy="feedback-create-feedback-label-reason"
                  >
                    Reason{' '}
                    <span
                      className="text-[#FF4D4F]"
                      data-cy="feedback-create-feedback-label-reason-required"
                    >
                      *
                    </span>
                  </span>
                }
                rules={[
                  { required: true, message: 'Please provide a reason!' },
                ]}
                data-cy="feedback-feedback-components-createfeedback-form-item-reason"
              >
                <TextArea
                  rows={2}
                  placeholder="Textarea"
                  className="add-feedback-field-textarea"
                  data-cy="feedback-feedback-components-createfeedback-textarea-reason"
                />
              </Form.Item>

              <Form.Item
                name="action"
                className={`${variantType === 'appreciation' ? 'hidden' : 'block'}`}
                label={
                  <span
                    className="add-feedback-form-label text-sm font-normal leading-[22px] text-[#030712]"
                    data-cy="feedback-create-feedback-label-action"
                  >
                    Action to Be Taken{' '}
                    <span
                      className="text-[#FF4D4F]"
                      data-cy="feedback-create-feedback-label-action-required"
                    >
                      *
                    </span>
                  </span>
                }
                rules={[{ message: 'Please describe the action to be taken!' }]}
              >
                <TextArea
                  rows={2}
                  placeholder="Describe the action to be taken"
                  className="add-feedback-field-textarea"
                  data-cy="feedback-feedback-components-createfeedback-textarea-action"
                />
              </Form.Item>

              {selectedFeedbackRecord === null && (
                <Form.Item
                  label={
                    <span
                      className="add-feedback-form-label text-sm font-normal leading-[22px] text-[#030712]"
                      data-cy="feedback-create-feedback-label-cc"
                    >
                      CC{' '}
                      <span
                        className="text-[#FF4D4F]"
                        data-cy="feedback-create-feedback-label-cc-required"
                      >
                        *
                      </span>
                    </span>
                  }
                  required={false}
                  className="mb-0"
                  data-cy="feedback-feedback-components-createfeedback-form-item-cc"
                >
                  <Form.Item
                    name="cc"
                    noStyle
                    rules={[
                      {
                        required: true,
                        message: 'Please select at least one CC!',
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select"
                      showSearch
                      className="add-feedback-field-select add-feedback-cc-trigger w-full"
                      data-cy="feedback-feedback-components-createfeedback-select-cc"
                      optionFilterProp="label"
                      filterOption={(input: string, option: any) => {
                        const q = input.trim().toLowerCase();
                        if (!q) return true;
                        const label = String(option?.label ?? '').toLowerCase();
                        const value = String(option?.value ?? '').toLowerCase();
                        return label.includes(q) || value.includes(q);
                      }}
                      options={ccSelectOptions}
                    />
                  </Form.Item>
                  {ccEmails.length > 0 ? (
                    <div
                      className="mt-2 flex flex-wrap gap-2"
                      data-cy="feedback-create-feedback-cc-tags"
                    >
                      {ccEmails.map((email, tagIndex) => {
                        const label =
                          ccSelectOptions.find(
                            (o: { value: string; label: string }) =>
                              o.value === email,
                          )?.label ?? email;
                        return (
                          <span
                            key={email}
                            className="add-feedback-cc-tag box-border inline-flex h-6 items-center gap-1 rounded border border-[#D9D9D9] bg-black/[0.02] px-2 py-px text-sm font-normal leading-[22px] text-black/[0.7]"
                            data-cy={`feedback-create-feedback-cc-tag-${tagIndex}`}
                          >
                            {label}
                            <button
                              type="button"
                              className="flex h-3 w-3 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-black/[0.7] hover:text-black"
                              aria-label={`Remove ${label}`}
                              onClick={() => removeCcEmail(email)}
                              data-cy={`feedback-create-feedback-cc-tag-remove-${tagIndex}`}
                            >
                              <CloseOutlined className="text-[10px]" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </Form.Item>
              )}
            </Form>
          </div>

          <div
            className="flex shrink-0 flex-row items-center justify-end gap-2 px-6 pb-5 pt-0"
            data-cy="feedback-feedback-components-createfeedback-div-footer"
          >
            <Button
              className="add-feedback-footer-cancel !m-0 !h-8 !min-w-[68px] !rounded-md !border !border-solid !border-[#D9D9D9] !bg-white !px-[15px] !text-sm !font-normal !leading-[22px] !text-black/[0.7] !shadow-[0px_2px_0px_rgba(0,0,0,0.02)] hover:!border-[#D9D9D9] hover:!text-black/[0.7]"
              onClick={handleClose}
              data-cy="feedback-feedback-components-createfeedback-button-cancel"
            >
              Cancel
            </Button>
            {selectedFeedbackRecord !== null ? (
              <Button
                type="primary"
                className="add-feedback-footer-submit !m-0 !h-8 !min-w-[70px] !rounded-lg !border !border-solid !border-[#1E40AF] !bg-[#1E40AF] !px-4 !text-sm !font-normal !leading-[22px] !text-white !shadow-[0px_2px_0px_rgba(5,145,255,0.1)] hover:!border-[#1E40AF] hover:!bg-[#1d3d99]"
                onClick={() => form.submit()}
                data-cy="feedback-feedback-components-createfeedback-button-update"
              >
                Update
              </Button>
            ) : (
              <Button
                type="primary"
                loading={
                  loadingCreateFeedbackRecord || loadingUpdateFeedbackRecord
                }
                className="add-feedback-footer-submit !m-0 !h-8 !min-w-[70px] !rounded-lg !border !border-solid !border-[#1E40AF] !bg-[#1E40AF] !px-4 !text-sm !font-normal !leading-[22px] !text-white !shadow-[0px_2px_0px_rgba(5,145,255,0.1)] hover:!border-[#1E40AF] hover:!bg-[#1d3d99]"
                onClick={() => form.submit()}
                data-cy="feedback-feedback-components-createfeedback-button-submit"
              >
                Create
              </Button>
            )}
          </div>
        </div>
      </Modal>

      <style data-cy="feedback-create-feedback-modal-styles" jsx global>{`
        .add-feedback-modal.ant-modal {
          width: min(795px, calc(100vw - 24px)) !important;
          max-width: calc(100vw - 24px) !important;
        }
        .add-feedback-modal .ant-modal-content {
          width: min(795px, calc(100vw - 24px)) !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .add-feedback-modal .ant-modal-body {
          flex: 1 1 auto !important;
          display: flex !important;
          flex-direction: column !important;
          min-height: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        .add-feedback-modal-form.ant-form {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }
        .add-feedback-modal-form .ant-form-item {
          margin-bottom: 0 !important;
        }
        .add-feedback-modal-form .ant-form-item-label {
          padding: 0 0 8px !important;
        }
        .add-feedback-modal-form .ant-form-item-label > label {
          font-family: Calibri, Candara, 'Segoe UI', sans-serif !important;
          height: auto !important;
        }
        .add-feedback-modal .add-feedback-field-select .ant-select-selector {
          box-sizing: border-box !important;
          height: 40px !important;
          min-height: 40px !important;
          border-radius: 8px !important;
          border: 1px solid #d9d9d9 !important;
          padding: 0 12px !important;
          padding-inline-end: 36px !important;
          align-items: center !important;
          box-shadow: none !important;
        }
        .add-feedback-modal
          .add-feedback-field-select
          .ant-select-selection-item,
        .add-feedback-modal
          .add-feedback-field-select
          .ant-select-selection-search-input,
        .add-feedback-modal
          .add-feedback-field-select
          .ant-select-selection-placeholder {
          font-family: Calibri, Candara, 'Segoe UI', sans-serif !important;
          font-size: 16px !important;
          line-height: 24px !important;
        }
        .add-feedback-modal
          .add-feedback-field-select
          .ant-select-selection-item {
          color: rgba(0, 0, 0, 0.7) !important;
          line-height: 38px !important;
        }
        .add-feedback-modal
          .add-feedback-field-select
          .ant-select-selection-placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
          line-height: 38px !important;
        }
        .add-feedback-modal
          .add-feedback-field-select:hover
          .ant-select-selector {
          border-color: #d9d9d9 !important;
        }
        .add-feedback-modal
          .add-feedback-field-select.ant-select-focused
          .ant-select-selector {
          border-color: #1e40af !important;
          box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.12) !important;
        }
        .add-feedback-modal .add-feedback-field-select .ant-select-arrow {
          color: rgba(0, 0, 0, 0.25) !important;
          font-size: 12px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          margin-top: 4px !important;
        }
        .add-feedback-modal .add-feedback-cc-trigger .ant-select-arrow {
          margin-top: 0 !important;
        }
        .add-feedback-modal .add-feedback-field-textarea textarea.ant-input {
          box-sizing: border-box !important;
          min-height: 52px !important;
          padding: 4px 11px !important;
          border-radius: 6px !important;
          border: 1px solid #d9d9d9 !important;
          font-family: Calibri, Candara, 'Segoe UI', sans-serif !important;
          font-size: 14px !important;
          line-height: 22px !important;
          color: rgba(0, 0, 0, 0.7) !important;
          box-shadow: none !important;
        }
        .add-feedback-modal
          .add-feedback-field-textarea
          textarea.ant-input::placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        .add-feedback-modal
          .add-feedback-field-textarea
          textarea.ant-input:hover {
          border-color: #d9d9d9 !important;
        }
        .add-feedback-modal
          .add-feedback-field-textarea
          textarea.ant-input:focus {
          border-color: #1e40af !important;
          box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.12) !important;
        }
        .add-feedback-footer-cancel.ant-btn-default:not(:disabled) {
          font-family: Calibri, Candara, 'Segoe UI', sans-serif !important;
        }
        .add-feedback-footer-submit.ant-btn-primary:not(:disabled) {
          font-family: Calibri, Candara, 'Segoe UI', sans-serif !important;
          background: #1e40af !important;
          border-color: #1e40af !important;
        }
        .add-feedback-cc-trigger.ant-select-multiple
          .ant-select-selection-overflow-item:not(
            .ant-select-selection-overflow-item-suffix
          ) {
          display: none !important;
        }
        .add-feedback-cc-trigger.ant-select-multiple .ant-select-selector {
          height: 40px !important;
          min-height: 40px !important;
        }
        .add-feedback-modal
          .add-feedback-cc-trigger
          .ant-select-selection-placeholder {
          display: flex !important;
          align-items: center !important;
          margin-left: -8px !important;
          margin-top: 4px !important;
          height: 100% !important;
          /* Keep horizontal padding/positioning from the shared selector rules */
          line-height: 24px !important;
        }
      `}</style>
    </>
  );
};

export default CreateFeedbackForm;
