import React from 'react';
import { Button, Col, Form, Row, Upload } from 'antd';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Inbox } from 'lucide-react';
import dayjs from 'dayjs';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const { Dragger } = Upload;

const DocumentUploadForm = () => {
  const { documentFileList, setDocumentFileList, removeDocument } =
    useEmployeeManagementStore();

  const handleDocumentChange = (info: any) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    // We need to keep the existing files and add new ones if they are valid
    // But Dragger onChange gives the potential new fileList state
    // We should filter the new list

    // Ant Design Upload behavior: info.fileList is the target list.
    const fileList = Array.isArray(info.fileList)
      ? info.fileList.filter((file: any) => {
          // Check if the file is valid type.
          // Note: file.type might be empty for some files depending on browser, but usually populated.
          // If the file is already in the list (uplaoded), we keep it.
          if (file.status === 'done' || file.status === 'error') return true;
          return allowedTypes.includes(file.type);
        })
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
      id="document-upload-form"
      data-cy="document-upload-form"
    >
      <div
        data-cy="document-upload-form-container"
        className="mb-8 border rounded-lg p-3 bg-white shadow-sm"
      >
        <h5
          data-cy="document-upload-form-title"
          className="text-gray-600 mb-4 font-medium"
        >
          Upload Document
        </h5>
        <Row
          justify="center"
          style={{ width: '100%' }}
          id="document-upload-row"
          data-cy="document-upload-row"
        >
          <Col span={24} id="document-upload-col" data-cy="document-upload-col">
            <Form.Item
              name="documentName"
              id="documentNameId"
              data-cy="documentNameId"
              rules={[
                { required: false, message: 'Please choose the document type' },
              ]}
              className="mb-0"
            >
              <Dragger
                name="documentName"
                fileList={documentFileList}
                onChange={handleDocumentChange}
                onRemove={handleDocumentRemove}
                customRequest={customRequest}
                height={144}
                showUploadList={false}
                multiple
                accept="image/jpeg,image/png,application/pdf,application/msword,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                id="document-upload-dragger"
                data-cy="document-upload-dragger"
                className="bg-gray-50 border-dashed border-gray-200 hover:border-blue-500 rounded-lg transition-colors"
                style={{ backgroundColor: '#fafafa', padding: '0 0' }} // Overriding antd default styles if needed
              >
                <div
                  data-cy="document-upload-form-drag-div"
                  className="flex flex-col items-center justify-center"
                >
                  <div
                    data-cy="document-upload-form-drag-icon-div"
                    className="mb-2"
                  >
                    <Inbox className="w-10 h-10 text-gray-400" />
                  </div>
                  <p
                    data-cy="document-upload-form-drag-hint"
                    className="text-gray-500 text-base mb-2"
                  >
                    Click or drag file to this area to upload
                  </p>
                  <p
                    data-cy="document-upload-form-select-hint"
                    className="text-gray-400 text-xs"
                  >
                    Support for a single or bulk upload.
                  </p>
                </div>
              </Dragger>
            </Form.Item>
          </Col>
        </Row>
      </div>

      <div
        data-cy="document-upload-form-documents-div"
        className="mt-8 border-[1px] border-[#D9D9D9] rounded-lg p-4"
      >
        <h5
          data-cy="document-upload-form-documents-title"
          className="text-gray-600 mb-4 font-medium"
        >
          Documents
        </h5>
        <div
          data-cy="document-upload-form-files-div"
          className="flex flex-col space-y-2"
        >
          {documentFileList.map((file: any) => (
            <div
              data-cy="document-upload-form-file-div"
              key={file.uid}
              className="flex items-center p-4 border-[1px] border-[#D9D9D9] rounded-lg"
            >
              {/* <div
                data-cy="document-upload-form-file-icon-div"
                className="p-2 border border-gray-100 rounded mr-4 bg-white"
              > */}
              {/* Placeholder for file icon, maybe dynamic based on type if needed */}
              {/* <div
                  data-cy="document-upload-form-file-icon-div"
                  className="w-8 h-8 flex items-center justify-center bg-red-50 rounded text-red-500"
                >
                  <FileText className="w-5 h-5" />
                </div>
              </div> */}
              <div
                data-cy="document-upload-form-file-details-div"
                className="flex-1"
              >
                <p
                  data-cy="document-upload-form-file-name"
                  className="text-gray-900 font-medium text-sm"
                >
                  {file.name}
                </p>
                <p
                  data-cy="document-upload-form-file-date"
                  className="text-gray-400 text-xs"
                >
                  {file.lastModifiedDate
                    ? dayjs(file.lastModifiedDate).format('DD MMM YYYY')
                    : dayjs().format('DD MMM YYYY')}
                </p>
              </div>
              <div
                data-cy="document-upload-form-buttons-div"
                className="flex items-center space-x-2"
              >
                <Button
                  data-cy="document-upload-form-download-button"
                  type="default"
                  className="border border-[#D9D9D9]"
                  icon={
                    <SaveAltIcon fontSize="small" className="text-[#737a86]" />
                  }
                  onClick={() => {
                    // Implement download logic here
                    // For now just logging or using Antd's default onPreview if available
                    /* 
                           If there's a real URL: window.open(file.url, '_blank');
                           Or creating a blob URL.
                        */
                  }}
                />
                <Button
                  data-cy="document-upload-form-delete-button"
                  type="default"
                  danger
                  icon={
                    <DeleteOutlineIcon
                      fontSize="small"
                      className="text-[#ff8384]"
                    />
                  }
                  onClick={() => handleDocumentRemove(file)}
                  className="border border-[#ff8384]"
                />
              </div>
            </div>
          ))}
          {documentFileList.length === 0 && (
            <div
              data-cy="document-upload-form-no-documents-uploaded"
              className="text-gray-400 text-sm italic text-center py-4"
            >
              No documents uploaded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadForm;
