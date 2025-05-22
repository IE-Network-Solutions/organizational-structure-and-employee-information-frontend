import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input } from 'antd';
import { useUpdateMeeting } from '@/store/server/features/CFR/meeting/mutations';

interface FinalNotesProps {
  meetingId: string; // Change 'string' to the correct type if needed
  finalNote: string;
  loading: boolean;
}

export default function FinalNotes({
  meetingId,
  finalNote,
  loading,
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
    >
      <h2 className="text-lg font-semibold mb-2">Final Notes</h2>

      {editing ? (
        <div className="relative">
          <Form form={form} initialValues={{ finalNote }} onFinish={handleSave}>
            <Form.Item name="finalNote">
              <Input.TextArea
                name="finalNote"
                autoSize={{ minRows: 4 }}
                autoFocus
                className="border-gray-300 p-5"
              />
            </Form.Item>
          </Form>
          <div className="absolute bottom-2 right-2">
            <Button
              size="small"
              type="default"
              onClick={() => setEditing(false)}
              className=""
              loading={isLoading}
            >
              Cancel
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => form.submit()}
              className="ml-2"
              loading={isLoading}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="text-gray-700 whitespace-pre-wrap p-3 rounded-md text-sm border cursor-pointer hover:bg-gray-50"
          onClick={() => setEditing(true)}
        >
          {finalNote}
        </div>
      )}
    </Card>
  );
}
