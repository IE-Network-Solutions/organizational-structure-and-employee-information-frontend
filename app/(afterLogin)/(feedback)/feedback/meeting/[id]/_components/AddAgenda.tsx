import React, { useEffect } from 'react';
import { Modal, Input, Button, Form } from 'antd';
import { MdClose } from 'react-icons/md';

import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import {
  useCreateMeetingAgendaBulk,
  useUpdateMeetingAgenda,
} from '@/store/server/features/CFR/meeting/agenda/mutations';

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

  return (
    <Modal
      title="Agenda items"
      open={visible}
      onCancel={handleClose}
      footer={null}
      closeIcon={null}
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
                    label="Agenda"
                  >
                    <Input
                      placeholder="Agenda"
                      suffix={
                        meetingAgenda == null &&
                        fields.length > 1 && (
                          <MdClose
                            className="cursor-pointer text-gray-500 hover:text-red-500"
                            onClick={() => remove(name)}
                          />
                        )
                      }
                    />
                  </Form.Item>
                </div>
              ))}
              {meetingAgenda == null && (
                <div className="flex justify-end mb-2">
                  <Button className="w-24" type="primary" onClick={() => add()}>
                    Add
                  </Button>
                </div>
              )}
            </>
          )}
        </Form.List>
        <div className="flex justify-center gap-4 mt-4">
          <Button loading={loading} className="w-48" onClick={handleClose}>
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
