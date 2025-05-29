'use client';

import React from 'react';
import { Typography, Form, Button } from 'antd';
import { useUpdateMeetingAttachment } from '@/store/server/features/CFR/meeting/mutations';
import CustomUpload from '@/components/form/customUpload';
import { FaRegFileLines } from 'react-icons/fa6';

const { Text } = Typography;

interface UploadSectionProps {
  meetingId: string;
  meeting: any;
  canEdit: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  meetingId,
  meeting,
  canEdit,
}) => {
  const { mutate: updateMeeting, isLoading } = useUpdateMeetingAttachment();
  const [form] = Form.useForm();

  const handleFileUpload = async (value: any) => {
    updateMeeting({
      id: meetingId,
      attachment: [
        {
          audio: value?.audio?.[0]?.response || '',
          document: value?.document?.[0]?.response || '',
        },
      ],
    });
  };

  const audioUrl = meeting?.attachment?.[0]?.audio || '';
  const documentUrl = meeting?.attachment?.[0]?.document || '';

  return (
    <Form layout="vertical" form={form} onFinish={handleFileUpload}>
      {/* Preview Existing Attachments */}
      {(audioUrl || documentUrl) && (
        <div className="flex flex-col gap-6 p-4 rounded-md mb-4">
          {audioUrl && (
            <div>
              <Text className="block font-semibold mb-1 text-gray-800">
                Meeting Recording
              </Text>
              <div className="border border-blue-400 rounded-md p-2 w-full flex items-center justify-between text-blue-500 bg-white">
                <span>Recording 1</span>
                <audio controls src={audioUrl} className="h-6" />
              </div>
            </div>
          )}

          {documentUrl && (
            <div>
              <Text className="block font-semibold mb-1 text-gray-800">
                Attached Documents
              </Text>
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border rounded-md p-3 w-full  hover:bg-gray-100 transition text-gray-700"
              >
                <FaRegFileLines />
                <span>Meeting Details PDF File</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Upload Section */}
      {canEdit && (
        <>
          <div className="flex flex-col lg:flex-row items-center gap-4 p-4 bg-white">
            <Form.Item
              name="audio"
              label="Audio"
              className="form-item"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            >
              <CustomUpload
                mode="dragWithLink"
                className="w-full mt-3"
                listType="picture"
                title="Upload Your Audio"
                accept="audio/*"
                maxCount={1}
                targetState="fileList"
              />
            </Form.Item>

            <Form.Item
              name="document"
              label="Document"
              className="form-item"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            >
              <CustomUpload
                mode="dragWithLink"
                className="w-full mt-3"
                listType="picture"
                title="Upload Your Document"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf"
                targetState="fileAttachmentList"
              />
            </Form.Item>
          </div>
          {canEdit && (
            <div className="flex justify-end mx-4 mb-2">
              <Button loading={isLoading} type="primary" htmlType="submit">
                Upload
              </Button>
            </div>
          )}
        </>
      )}
    </Form>
  );
};

export default UploadSection;
