import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input } from 'antd';
import { useUpdateMeeting } from '@/store/server/features/CFR/meeting/mutations';

interface FinalNotesProps {
  meetingId: string; // Change 'string' to the correct type if needed
  finalNote: string;
  loading: boolean;
  canEdit: boolean;
}

export default function FinalNotes({
  meetingId,
  finalNote,
  loading,
  canEdit,
}: FinalNotesProps) {
  const [editing, setEditing] = useState(false);
  const { mutate: updateMeeting, isLoading } = useUpdateMeeting();
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({ finalNote });
  }, [editing]);
  const handleSave = (value: any) => {
    updateMeeting(
      { ...value, id: meetingId },
      {
        onSuccess() {
          setEditing(false);
        },
      },
    );
  };

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={loading}
      className="border-none p-4 rounded-xl"
      data-cy="feedback-meeting-components-finalnotes-card"
      id="feedback-meeting-components-finalnotes-card"
    >
      <h2
        className="text-lg font-bold mb-2"
        data-cy="feedback-meeting-components-finalnotes-heading"
        id="feedback-meeting-components-finalnotes-heading"
      >
        Final Notes
      </h2>

      {editing ? (
        <div
          className="relative"
          data-cy="feedback-meeting-components-finalnotes-div-editing"
          id="feedback-meeting-components-finalnotes-div-editing"
        >
          <Form
            form={form}
            initialValues={{ finalNote }}
            onFinish={handleSave}
            data-cy="feedback-meeting-components-finalnotes-form"
            id="feedback-meeting-components-finalnotes-form"
          >
            <Form.Item
              name="finalNote"
              data-cy="feedback-meeting-components-finalnotes-form-item"
              id="feedback-meeting-components-finalnotes-form-item"
            >
              <Input.TextArea
                name="finalNote"
                autoSize={{ minRows: 4 }}
                autoFocus
                className="border-gray-300 p-5"
                data-cy="feedback-meeting-components-finalnotes-textarea"
                id="feedback-meeting-components-finalnotes-textarea"
              />
            </Form.Item>
          </Form>
          <div
            className="absolute bottom-2 right-2"
            data-cy="feedback-meeting-components-finalnotes-div-actions"
            id="feedback-meeting-components-finalnotes-div-actions"
          >
            <Button
              size="small"
              type="default"
              onClick={() => setEditing(false)}
              className="h-10"
              loading={isLoading}
              data-cy="feedback-meeting-components-finalnotes-button-cancel"
              id="feedback-meeting-components-finalnotes-button-cancel"
            >
              Cancel
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => form.submit()}
              className="ml-2 h-10"
              loading={isLoading}
              data-cy="feedback-meeting-components-finalnotes-button-save"
              id="feedback-meeting-components-finalnotes-button-save"
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="text-gray-700 whitespace-pre-wrap p-3 rounded-md text-sm border cursor-pointer hover:bg-gray-50"
          onClick={() => (canEdit ? setEditing(true) : null)}
          data-cy="feedback-meeting-components-finalnotes-div-display"
          id="feedback-meeting-components-finalnotes-div-display"
        >
          {finalNote}
        </div>
      )}
    </Card>
  );
}
