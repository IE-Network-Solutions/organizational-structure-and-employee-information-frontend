import React from 'react';
import { Button, Col, Form, Row, Upload, Image, UploadFile } from 'antd';
import { MdOutlineUploadFile } from 'react-icons/md';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';

const { Dragger } = Upload;

const DocumentUploadForm = () => {
  const { documentFileList, setDocumentFileList } = useEmployeeManagmentStore();

  const beforeDocumentUpload = () => {
    // Allow all file types by default
    return true;
  };

  const handleDocumentChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setDocumentFileList(fileList);
  };

  const customRequest = async ({ file, onSuccess, onError }: any) => {
    try {
      // Simulate file upload process
      const url = URL.createObjectURL(file);
      file.url = url;
      onSuccess('ok');
    } catch (error) {
      onError(error);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Row justify="center" style={{ width: '100%' }}>
        <Col span={24}>
          <Form.Item
            className="font-semibold text-xs"
            style={{ textAlign: 'center' }}
            name="documentName"
            id="documentNameId"
            rules={[
              { required: true, message: 'Please choose the document type' },
            ]}
          >
            <Dragger
              name="documentName"
              beforeUpload={beforeDocumentUpload}
              onChange={handleDocumentChange}
              customRequest={customRequest}
              listType="picture"
              accept="*/*"
            >
              <div className="flex justify-start items-center text-xl font-semibold text-gray-950">
                <p>Documents Upload</p>
              </div>
              <p className="ant-upload-drag-icon">
                <Image
                  preview={false}
                  className="w-full max-w-xs"
                  src="../Uploading.png"
                  alt="Loading"
                />
              </p>
              <p className="ant-upload-hint text-xl font-bold text-gray-950 my-4">
                Drag & drop here to Upload
              </p>
              <p className="ant-upload-hint text-xs text-gray-950">
                or select a file from your computer
              </p>
              <Button
                className="ant-upload-text font-semibold text-white py-3 px-6 text-sm my-4 bg-blue-500 hover:bg-blue-600"
                type="primary"
              >
                <MdOutlineUploadFile className="text-white text-xl mr-2" />
                Upload File
              </Button>
            </Dragger>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default DocumentUploadForm;
