import React, { useEffect } from 'react';
import { Modal, Input, Button, Form } from 'antd';
import { MdClose } from 'react-icons/md';
import {
  useCreateMeetingAgendaBulk,
  useUpdateMeetingAgenda,
} from '@/store/server/features/CFR/meeting/mutations';

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

  function onFinish(values: any) {
    const finalValue = (values.agendaItems || []).map((i: any) => ({
      ...i,
      meetingId,
    }));
    const finalValueEdit = { ...values?.agendaItems[0], meetingId };
    if (meetingAgenda == null) {
      createMeetingAgenda(finalValue, {
        onSuccess() {
          form?.resetFields();
          onClose();
        },
      });
    } else {
      updateMeetingAgenda(finalValueEdit, {
        onSuccess() {
          form?.resetFields();
          onClose();
        },
      });
    }
  }

  useEffect(() => {
    if (meetingAgenda) {
      form.setFieldsValue({
        agendaItems: [meetingAgenda],
      });
    }
  }, [meetingAgenda]);

  const loading = createLoading || updateLoading;

  return (
    <Modal
      title="Agenda items"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.List name="agendaItems">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <div key={key} className="flex items-center mb-2">
                  <Form.Item
                    {...restField}
                    name={[name, 'agenda']}
                    fieldKey={[fieldKey ?? 0, 'agenda']}
                    rules={[{ required: true, message: 'Agenda is required' }]}
                    className="w-full"
                    label={'Agenda'}
                  >
                    <Input placeholder="Agenda" />
                  </Form.Item>
                  {meetingAgenda == null && (
                    <Button
                      className="text-black mt-2"
                      type="link"
                      onClick={() => remove(name)}
                    >
                      <MdClose size={16} />
                    </Button>
                  )}
                </div>
              ))}
              {meetingAgenda == null && (
                <div className="flex justify-end">
                  <Button
                    className="w-24"
                    type="primary"
                    onClick={() => add()}
                    block
                  >
                    Add
                  </Button>
                </div>
              )}
            </>
          )}
        </Form.List>
        <div className="flex justify-center gap-4 mt-4">
          <Button loading={loading} className="w-48" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={loading}
            className="w-48"
            type="primary"
            htmlType="submit"
          >
            {meetingAgenda == null ? 'Create' : 'Update'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AgendaModal;
