import React, { useEffect } from 'react';
import { Modal, Input, Button, Form } from 'antd';
import { MdClose, MdOutlineEdit } from 'react-icons/md';

import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import {
  useCreateMeetingAgendaBulk,
  useUpdateMeetingAgenda,
} from '@/store/server/features/CFR/meeting/agenda/mutations';
import { meetingFormRequiredMark } from '../../_component/meetingFormRequiredMark';

interface AgendaModalProps {
  visible: boolean;
  onClose: () => void;
  meetingId: string;
  meetingAgenda: any;
}

const AgendaModal: React.FC<AgendaModalProps> = ({
  visible,
  onClose,
  meetingId,
  meetingAgenda,
}) => {
  const { mutate: createMeetingAgenda, isLoading: createLoading } =
    useCreateMeetingAgendaBulk();
  const { mutate: updateMeetingAgenda, isLoading: updateLoading } =
    useUpdateMeetingAgenda();

  const [form] = Form.useForm();
  const { setMeetingAgenda } = useMeetingStore();
  const agendaItems = Form.useWatch('agendaItems', form) ?? [];

  const handleClose = () => {
    setMeetingAgenda(null);
    form.resetFields();
    onClose();
  };

  const onFinish = (values: any) => {
    const finalValue = (values.agendaItems || []).map((item: any) => ({
      ...item,
      meetingId,
    }));

    const finalEditValue = { ...values?.agendaItems[0], meetingId };

    if (meetingAgenda == null) {
      createMeetingAgenda(finalValue, {
        onSuccess: handleClose,
      });
    } else {
      updateMeetingAgenda(finalEditValue, {
        onSuccess: handleClose,
      });
    }
  };

  useEffect(() => {
    if (meetingAgenda) {
      form.setFieldsValue({
        agendaItems: [meetingAgenda],
      });
    } else {
      form.setFieldsValue({
        agendaItems: [{ agenda: '' }],
      });
    }
  }, [meetingAgenda]);

  const loading = createLoading || updateLoading;
  const modalTitle = meetingAgenda == null ? 'Meeting Agenda' : 'Edit agenda';

  const footer = (
    <div
      className="flex justify-end gap-2"
      data-cy="feedback-meeting-components-addagenda-div-footer"
      id="feedback-meeting-components-addagenda-div-footer"
    >
      <Button
        loading={loading}
        className="flex h-[32px] items-center justify-center rounded-[8px] !border !border-solid !border-[#D9D9D9] bg-white px-[15px] py-0 text-[14px] font-normal text-[#595959] hover:text-[#262626]"
        onClick={handleClose}
        data-cy="feedback-meeting-components-addagenda-button-cancel"
        id="feedback-meeting-components-addagenda-button-cancel"
      >
        Cancel
      </Button>
      <Button
        loading={loading}
        className="flex h-[32px] items-center justify-center rounded-[8px] border-none bg-[#1E40AF] px-[15px] py-0 text-[14px] font-normal hover:bg-[#1e3a8a]"
        type="primary"
        onClick={() => form.submit()}
        data-cy="feedback-meeting-components-addagenda-button-submit"
        id="feedback-meeting-components-addagenda-button-submit"
      >
        {meetingAgenda == null ? 'Create' : 'Update'}
      </Button>
    </div>
  );

  return (
    <Modal
      title={
        <span
          className="text-[16px] font-bold text-black/70"
          data-cy="feedback-meeting-components-addagenda-header"
        >
          {modalTitle}
        </span>
      }
      open={visible}
      onCancel={handleClose}
      width={675}
      footer={footer}
      closeIcon={<MdClose size={16} className="text-[#8c8c8c]" />}
      className="okr-settings-modal meeting-agenda-modal"
      data-cy="feedback-meeting-components-addagenda-modal"
    >
      <style
        jsx
        global
        data-cy="feedback-meeting-components-addagenda-modal-global-styles"
      >{`
        .okr-settings-modal .ant-modal-content {
          padding: 0 !important;
        }
        .okr-settings-modal .ant-modal-header {
          padding: 20px 24px 8px 24px !important;
          border-bottom: none !important;
          margin-bottom: 0 !important;
        }
        .okr-settings-modal .ant-modal-body {
          padding: 12px 24px !important;
        }
        .okr-settings-modal .ant-modal-footer {
          padding: 1px 24px 20px 24px !important;
          border-top: none !important;
          margin-top: 0 !important;
        }
        .meeting-agenda-modal .ant-input {
          height: 40px !important;
          min-height: 40px !important;
        }
      `}</style>
      <Form
        form={form}
        layout="vertical"
        className="meeting-form-field-spacing"
        requiredMark={meetingFormRequiredMark}
        onFinish={onFinish}
        data-cy="feedback-meeting-components-addagenda-form"
        id="feedback-meeting-components-addagenda-form"
      >
        <Form.List
          name="agendaItems"
          data-cy="feedback-meeting-components-addagenda-list"
        >
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }, index) => {
                if (index === 0) {
                  return (
                    <div
                      key={key}
                      className="mb-2"
                      data-cy={`feedback-meeting-components-addagenda-item-${key}`}
                      id={`feedback-meeting-components-addagenda-item-${key}`}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'agenda']}
                        fieldKey={[fieldKey ?? 0, 'agenda']}
                        rules={[
                          {
                            required: true,
                            message: 'Meeting agenda is required',
                          },
                        ]}
                        className="w-full"
                        label="Meeting Agenda"
                        data-cy={`feedback-meeting-components-addagenda-form-item-${key}`}
                        id={`feedback-meeting-components-addagenda-form-item-${key}`}
                      >
                        <Input
                          placeholder="Input"
                          data-cy={`feedback-meeting-components-addagenda-input-${key}`}
                          id={`feedback-meeting-components-addagenda-input-${key}`}
                        />
                      </Form.Item>
                    </div>
                  );
                }

                const agendaText = agendaItems?.[name]?.agenda || '';
                return (
                  <div
                    key={key}
                    className="mb-2 flex items-center justify-between rounded-md border border-[#d9d9d9] bg-white px-3 py-2"
                    data-cy={`feedback-meeting-components-addagenda-item-${key}`}
                    id={`feedback-meeting-components-addagenda-item-${key}`}
                  >
                    <span
                      className="min-w-0 flex-1 truncate pr-2 text-[14px] font-normal text-[#262626]"
                      data-cy={`feedback-meeting-components-addagenda-item-text-${key}`}
                    >
                      {agendaText}
                    </span>
                    <div
                      className="flex items-center gap-2"
                      data-cy={`feedback-meeting-components-addagenda-item-actions-${key}`}
                    >
                      <button
                        type="button"
                        className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#D9D9D9] bg-white text-[#667085] hover:bg-[#FAFAFA]"
                        onClick={() => {
                          form.setFieldValue(
                            ['agendaItems', 0, 'agenda'],
                            agendaText,
                          );
                          remove(name);
                        }}
                        aria-label="Edit agenda"
                        data-cy={`feedback-meeting-components-addagenda-item-edit-${key}`}
                      >
                        <MdOutlineEdit size={16} />
                      </button>
                      <button
                        type="button"
                        className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#FF4D4F] bg-white text-[#FF4D4F] hover:bg-[#FFF1F0]"
                        onClick={() => remove(name)}
                        aria-label="Remove agenda"
                        data-cy={`feedback-meeting-components-addagenda-item-remove-${key}`}
                      >
                        <MdClose size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {meetingAgenda == null && (
                <div
                  className="mb-2 flex justify-center"
                  data-cy="feedback-meeting-components-addagenda-div-add-button"
                  id="feedback-meeting-components-addagenda-div-add-button"
                >
                  <Button
                    className="h-[34px] min-w-[96px] rounded-[8px] border-none bg-[#1E40AF] px-4 text-[14px] font-normal hover:bg-[#1e3a8a]"
                    type="primary"
                    onClick={async () => {
                      const current = form.getFieldValue([
                        'agendaItems',
                        0,
                        'agenda',
                      ]);
                      if (!current || !String(current).trim()) {
                        await form.validateFields([
                          ['agendaItems', 0, 'agenda'],
                        ]);
                        return;
                      }
                      add({ agenda: String(current).trim() });
                      form.setFieldValue(['agendaItems', 0, 'agenda'], '');
                    }}
                    data-cy="feedback-meeting-components-addagenda-button-add-entry"
                    id="feedback-meeting-components-addagenda-button-add-entry"
                  >
                    Add Agenda
                  </Button>
                </div>
              )}
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default AgendaModal;
