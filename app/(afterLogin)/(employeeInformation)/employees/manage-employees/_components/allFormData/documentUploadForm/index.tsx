import React from 'react';
import { Button, Col, Form, Row, Upload, Image } from 'antd';
import { MdOutlineUploadFile } from 'react-icons/md';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';

const { Dragger } = Upload;

const DocumentUploadForm = () => {
  const { documentFileList, setDocumentFileList, removeDocument } =
    useEmployeeManagementStore();

  const handleDocumentChange = (info: any) => {
    const fileList = Array.isArray(info.fileList) ? info.fileList : [];
    setDocumentFileList(fileList);
  };

  const handleDocumentRemove = (file: any) => {
    removeDocument(file.uid);
  };

  const customRequest = ({ onSuccess }: any) => {
    setTimeout(() => {
      onSuccess('ok');
    }, 0);
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
              fileList={documentFileList}
              onChange={handleDocumentChange}
              onRemove={handleDocumentRemove}
              customRequest={customRequest}
              listType="picture"
              // accept="*/*"
              accept="/*"
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
