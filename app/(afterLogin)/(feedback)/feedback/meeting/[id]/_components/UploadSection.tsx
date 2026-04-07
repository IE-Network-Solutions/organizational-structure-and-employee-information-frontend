'use client';

import React from 'react';
import { Typography, Form, Button, Spin } from 'antd';
import { useUpdateMeetingAttachment } from '@/store/server/features/CFR/meeting/mutations';
import CustomUpload from '@/components/form/customUpload';
import { FaRegFileLines } from 'react-icons/fa6';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';

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
  const audioUrl = meeting?.attachment?.[0]?.audio || '';
  const documentUrl = meeting?.attachment?.[0]?.document || '';
  const handleFileUpload = async (value: any) => {
    updateMeeting(
      {
        id: meetingId,
        attachment: [
          {
            audio: value?.audio ? value?.audio?.[0]?.response : audioUrl,
            document: value?.document
              ? value?.document?.[0]?.response
              : documentUrl,
          },
        ],
      },
      {
        onSuccess() {
          form.resetFields();
        },
      },
    );
  };
  const { isFileUploadLoading } = useTnaManagementCoursePageStore();
  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleFileUpload}
      data-cy="feedback-meeting-components-uploadsection-form"
      id="feedback-meeting-components-uploadsection-form"
    >
      {/* Preview Existing Attachments */}
      {(audioUrl || documentUrl) && (
        <div
          className="flex flex-col gap-6 p-4 rounded-md mb-4"
          data-cy="feedback-meeting-components-uploadsection-div-preview"
          id="feedback-meeting-components-uploadsection-div-preview"
        >
          {audioUrl && (
            <div
              data-cy="feedback-meeting-components-uploadsection-div-audio-preview"
              id="feedback-meeting-components-uploadsection-div-audio-preview"
            >
              <Text
                className="block font-semibold mb-1 text-gray-800"
                data-cy="feedback-meeting-components-uploadsection-text-audio-label"
                id="feedback-meeting-components-uploadsection-text-audio-label"
              >
                Meeting Recording
              </Text>
              <div
                className="border border-blue-400 rounded-md p-2 w-full flex items-center justify-between text-blue-500 bg-white"
                data-cy="feedback-meeting-components-uploadsection-div-audio-player"
                id="feedback-meeting-components-uploadsection-div-audio-player"
              >
                <span
                  data-cy="feedback-meeting-components-uploadsection-span-audio-title"
                  id="feedback-meeting-components-uploadsection-span-audio-title"
                >
                  Recording 1
                </span>
                <audio
                  controls
                  src={audioUrl}
                  className="h-6"
                  data-cy="feedback-meeting-components-uploadsection-audio"
                  id="feedback-meeting-components-uploadsection-audio"
                />
              </div>
            </div>
          )}

          {documentUrl && (
            <div
              data-cy="feedback-meeting-components-uploadsection-div-document-preview"
              id="feedback-meeting-components-uploadsection-div-document-preview"
            >
              <Text
                className="block font-semibold mb-1 text-gray-800"
                data-cy="feedback-meeting-components-uploadsection-text-document-label"
                id="feedback-meeting-components-uploadsection-text-document-label"
              >
                Attached Documents
              </Text>
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border rounded-md p-3 w-full  hover:bg-gray-100 transition text-gray-700"
                data-cy="feedback-meeting-components-uploadsection-link-document"
                id="feedback-meeting-components-uploadsection-link-document"
              >
                <FaRegFileLines
                  data-cy="feedback-meeting-components-uploadsection-icon-document"
                  id="feedback-meeting-components-uploadsection-icon-document"
                />
                <span
                  data-cy="feedback-meeting-components-uploadsection-span-document-title"
                  id="feedback-meeting-components-uploadsection-span-document-title"
                >
                  Meeting Details PDF File
                </span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Upload Section */}
      {canEdit && (
        <>
          <div
            className="flex flex-col lg:flex-row items-center gap-4 p-4 bg-white"
            data-cy="feedback-meeting-components-uploadsection-div-uploaders"
            id="feedback-meeting-components-uploadsection-div-uploaders"
          >
            <Spin
              spinning={isFileUploadLoading?.audio || false}
              data-cy="feedback-meeting-components-uploadsection-spin-audio"
            >
              <Form.Item
                name="audio"
                label="Audio"
                className="form-item"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                data-cy="feedback-meeting-components-uploadsection-form-item-audio"
                id="feedback-meeting-components-uploadsection-form-item-audio"
              >
                <CustomUpload
                  mode="dragWithLink"
                  className="w-full mt-3"
                  listType="picture"
                  title="Upload Your Audio"
                  accept="audio/*"
                  maxCount={1}
                  targetState="fileList"
                  uploadType="audio"
                  data-cy="feedback-meeting-components-uploadsection-custom-upload-audio"
                  id="feedback-meeting-components-uploadsection-custom-upload-audio"
                />
              </Form.Item>
            </Spin>
            <Spin
              spinning={isFileUploadLoading?.document || false}
              data-cy="feedback-meeting-components-uploadsection-spin-document"
            >
              <Form.Item
                name="document"
                label="Document"
                className="form-item"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                data-cy="feedback-meeting-components-uploadsection-form-item-document"
                id="feedback-meeting-components-uploadsection-form-item-document"
              >
                <CustomUpload
                  mode="dragWithLink"
                  className="w-full mt-3"
                  listType="picture"
                  title="Upload Your Document"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf"
                  targetState="fileAttachmentList"
                  uploadType="document"
                  data-cy="feedback-meeting-components-uploadsection-customupload-document"
                  id="feedback-meeting-components-uploadsection-customupload-document"
                />
              </Form.Item>
            </Spin>
          </div>
          {canEdit && (
            <div
              className="flex justify-end mx-4 mb-2"
              data-cy="feedback-meeting-components-uploadsection-div-submit"
              id="feedback-meeting-components-uploadsection-div-submit"
            >
              <Button
                loading={
                  isLoading ||
                  isFileUploadLoading?.audio ||
                  isFileUploadLoading?.document
                }
                type="primary"
                htmlType="submit"
                data-cy="feedback-meeting-components-uploadsection-button-upload"
                id="feedback-meeting-components-uploadsection-button-upload"
              >
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
