import React from 'react';
import { Button, Col, Form, Row, Upload, Image } from 'antd';
import { MdOutlineUploadFile } from 'react-icons/md';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';

const { Dragger } = Upload;

const DocumentUploadForm = () => {
  const { documentFileList, setDocumentFileList, removeDocument } =
    useEmployeeManagementStore();

  // const handleDocumentChange = (info: any) => {
  //   const fileList = Array.isArray(info.fileList) ? info.fileList : [];
  //   setDocumentFileList(fileList);
  // };
  const handleDocumentChange = (info: any) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const fileList = Array.isArray(info.fileList)
      ? info.fileList.filter((file: any) => allowedTypes.includes(file.type))
      : [];
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
    <div
      className="p-4 sm:p-6 lg:p-8"
      id="document-upload-form"
      data-cy="document-upload-form"
    >
      <Row
        justify="center"
        style={{ width: '100%' }}
        id="document-upload-row"
        data-cy="document-upload-row"
      >
        <Col span={24} id="document-upload-col" data-cy="document-upload-col">
          <Form.Item
            className="font-semibold text-xs"
            style={{ textAlign: 'center' }}
            name="documentName"
            id="documentNameId"
            data-cy="documentNameId"
            rules={[
              { required: false, message: 'Please choose the document type' },
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
              accept="image/*, text/*, application/pdf, application/msword, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              id="document-upload-dragger"
              data-cy="document-upload-dragger"
            >
              <div
                className="flex justify-start items-center text-xl font-semibold text-gray-950"
                id="document-upload-header"
                data-cy="document-upload-header"
              >
                <p
                  id="document-upload-header-text"
                  data-cy="document-upload-header-text"
                >
                  Documents Upload
                </p>
              </div>
              <p
                className="ant-upload-drag-icon"
                id="document-upload-icon-wrapper"
                data-cy="document-upload-icon-wrapper"
              >
                <Image
                  preview={false}
                  className="w-full max-w-xs"
                  src="../Uploading.png"
                  alt="Loading"
                  id="document-upload-icon"
                  data-cy="document-upload-icon"
                />
              </p>
              <p
                className="ant-upload-hint text-xl font-bold text-gray-950 my-4"
                id="document-upload-drop-text"
                data-cy="document-upload-drop-text"
              >
                Drag & drop here to Upload
              </p>
              <p
                className="ant-upload-hint text-xs text-gray-950"
                id="document-upload-hint-text"
                data-cy="document-upload-hint-text"
              >
                or select a file from your computer
              </p>
              <Button
                className="ant-upload-text font-semibold text-white py-3 px-6 text-sm my-4 bg-blue-500 hover:bg-blue-600"
                type="primary"
                id="document-upload-button"
                data-cy="document-upload-button"
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
