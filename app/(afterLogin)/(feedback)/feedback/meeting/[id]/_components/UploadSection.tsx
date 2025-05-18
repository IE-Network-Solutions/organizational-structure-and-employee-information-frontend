import React from "react";
import { Upload, Typography } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
const { Text } = Typography;

const props = {
  name: "file",
  multiple: true,
  showUploadList: false,
  beforeUpload: () => false, // prevent auto upload
};

const UploadSection = () => {
  return (
    <div className="flex  items-center gap-6 p-6 bg-white">
      <Dragger style={{backgroundColor:"white"}} {...props} accept="audio/*" className="w-full h-40 rounded-lg  border  border-gray-300  flex items-center justify-center text-center shadow-sm">
        <InboxOutlined className="text-2xl text-blue mb-2" />
        <p className="text-base font-medium">Upload Your Audio</p>
        <Text type="secondary">or drag and drop it here</Text>
      </Dragger>

      <Dragger  style={{backgroundColor:"white"}} {...props} accept=".pdf,.doc,.docx,.txt" className="w-full h-40 rounded-lg  border border-gray-300  flex items-center justify-center text-center shadow-sm">
        <InboxOutlined className="text-2xl text-blue mb-2" />
        <p className="text-base font-medium">Upload Your Documents</p>
        <Text type="secondary">or drag and drop it here</Text>
      </Dragger>
    </div>
  );
};

export default UploadSection;
