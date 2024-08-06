import React from 'react';
import { Button, Col, Form, Row, Upload, UploadFile } from 'antd';
import { MdOutlineUploadFile } from 'react-icons/md';
import { InboxOutlined } from '@ant-design/icons';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';

const { Dragger } = Upload;
const DocumentUploadForm = () => {
  const { documentFileList, setDocumentFileList } = useEmployeeManagmentStore();

  const beforeDocumentUpload = () => {
    return true; // Allow all file types by default
  };
  const handleDocumentChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setDocumentFileList(fileList);
  };
  const handleDocumentRemove = (file: UploadFile) => {
    setDocumentFileList((prevFileList: any) =>
      prevFileList.filter((item: any) => item.uid !== file.uid),
    );
  };
  const customRequest = async ({ file, onSuccess, onError }: any) => {
    try {
      // Simulating file upload process
      const url = URL.createObjectURL(file);
      file.url = url;
      onSuccess('ok');
    } catch (error) {
      onError(error);
    }
  };
  return (
    <div>
      <Row justify="center" style={{ width: '100%' }} className="mx-10">
        <Col span={24}>
          <Form.Item
            className="font-semibold text-xs bg-white"
            style={{ textAlign: 'center' }}
            name="documentName"
            rules={[{ required: true, message: 'Please choose the type' }]}
          >
            <Dragger
              name="documentName"
              fileList={documentFileList}
              beforeUpload={beforeDocumentUpload}
              onChange={handleDocumentChange}
              onRemove={handleDocumentRemove}
              customRequest={customRequest}
              listType="picture" // List type can be adjusted based on your needs
              accept="*/*" // Accept all file types
            >
              <div className="flex justify-start text-xl font-semibold text-gray-950">
                Documents Upload
              </div>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-hint text-xl font-bold text-gray-950 my-4">
                Drag & drop here to Upload.
              </p>
              <p className="ant-upload-hint text-xs text-gray-950">
                or select file from your computer.
              </p>
              <Button
                className="ant-upload-text font-semibold text-white py-6 text-sm my-4"
                type="primary"
              >
                <MdOutlineUploadFile className="text-white text-xl" />
                Upload file
              </Button>
            </Dragger>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default DocumentUploadForm;
