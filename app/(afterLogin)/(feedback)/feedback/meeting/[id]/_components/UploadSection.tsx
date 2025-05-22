import React from 'react';
import { Upload, Typography, message, Spin } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useUpdateMeetingAttachment } from '@/store/server/features/CFR/meeting/mutations';

const { Dragger } = Upload;
const { Text } = Typography;

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB in bytes

interface UploadSectionProps {
  meetingId: string;
}

const UploadSection: React.FC<UploadSectionProps> = ({ meetingId }) => {
  const { mutate: updateMeeting, isLoading } = useUpdateMeetingAttachment();

  const handleFileUpload = async (
    file: File,
    fileType: 'audio' | 'document',
  ) => {
    if (file.size > MAX_FILE_SIZE) {
      message.error(`${file.name} is larger than 500MB.`);
      return Upload.LIST_IGNORE;
    }

    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('meetingId', meetingId);
    formData.append('fileType', fileType);

    updateMeeting(formData);
    return false; // Prevent default upload
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6 p-6 bg-white">
      <Dragger
        accept="audio/*"
        beforeUpload={(file) => handleFileUpload(file, 'audio')}
        className="w-full h-40 rounded-lg border border-gray-300  text-center shadow-sm"
      >
        {isLoading ? (
          <Spin />
        ) : (
          <>
            <InboxOutlined className="text-2xl text-blue mb-2" />
            <p className="text-base font-medium">Upload Your Audio</p>
            <Text type="secondary">or drag and drop it here</Text>
          </>
        )}
      </Dragger>

      <Dragger
        accept=".pdf,.doc,.docx,.txt"
        beforeUpload={(file) => handleFileUpload(file, 'document')}
        className="w-full h-40 rounded-lg border border-gray-300 text-center shadow-sm"
      >
        <InboxOutlined className="text-2xl text-blue mb-2" />
        <p className="text-base font-medium">Upload Your Documents</p>
        <Text type="secondary">or drag and drop it here</Text>
      </Dragger>
    </div>
  );
};

export default UploadSection;
