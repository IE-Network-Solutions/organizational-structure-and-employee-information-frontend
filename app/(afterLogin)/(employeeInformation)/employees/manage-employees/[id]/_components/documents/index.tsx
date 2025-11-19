'use client';
import React from 'react';
import { Button, Col, Form, Row, Upload, Image, Space, Table } from 'antd';
import { MdOutlineUploadFile } from 'react-icons/md';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { AiOutlineDelete, AiOutlineDownload } from 'react-icons/ai';
import {
  useAddEmployeeDocument,
  useDeleteEmployeeDocument,
} from '@/store/server/features/employees/employeeDetail/mutations';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';

const { Dragger } = Upload;

const Documents = ({ id }: { id: string }) => {
  const { documentFileList, setDocumentFileList, removeDocument } =
    useEmployeeManagementStore();
  const { data: employeeData } = useGetEmployee(id);
  const { mutate: deleteEmployeeDocument } = useDeleteEmployeeDocument();
  const { isLoading: addEmployee, mutateAsync: AddEmployeeDocument } =
    useAddEmployeeDocument();
  const [form] = Form.useForm();

  const handleDocumentChange = (info: any) => {
    const fileList = Array.isArray(info.fileList)
      ? info.fileList.slice(-1)
      : [];
    setDocumentFileList(fileList);
  };
  const handleDelete = (id: string) => {
    deleteEmployeeDocument(id); // Call mutate with the document ID
  };
  const handleDocumentRemove = (file: any) => {
    removeDocument(file.uid);
  };

  const customRequest = ({ onSuccess }: any) => {
    setTimeout(() => {
      onSuccess('ok');
    }, 0);
  };
  const EmployeeDocumentTable = ({ employeeDocument, onDelete }: any) => {
    const columns = [
      {
        title: 'Document Name',
        dataIndex: 'documentName',
        key: 'documentName',
        render: (text: any, record: any) => (
          <a
            href={record.documentLink}
            target="_blank"
            rel="noopener noreferrer"
            id={`documents-table-document-link-${record.id}`}
            data-cy={`documents-table-document-link-${record.id}`}
          >
            {text.split('/').pop()} {/* Extract the file name from the URL */}
          </a>
        ),
      },
      {
        title: 'Uploaded At',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (text: any) => new Date(text).toLocaleDateString(), // Format date as needed
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (text: any, record: any) => (
          <Space id={`documents-table-actions-${record.id}`} data-cy={`documents-table-actions-${record.id}`}>
            <AccessGuard
              permissions={[Permissions.DownloadEmployeeDocument]}
              selfShouldAccess
              id={id}
              data-cy="documents-table-download-guard"
            >
              <Button
                type="link"
                icon={<AiOutlineDownload id='documents-table-download-icon' data-cy='documents-table-download-icon' />}
                href={record.documentLink}
                target="_blank"
                id={`documents-table-download-btn-${record.id}`}
                data-cy={`documents-table-download-btn-${record.id}`}
              />
            </AccessGuard>
            <AccessGuard permissions={[Permissions.DeleteEmployeeDocument]} id='documents-table-delete-guard' data-cy='documents-table-delete-guard'>
              <Button
                type="link"
                className="text-xl font-bold text-red-600"
                icon={<AiOutlineDelete id='documents-table-delete-icon' data-cy='documents-table-delete-icon' />}
                onClick={() => onDelete(record.id)}
                id={`documents-table-delete-btn-${record.id}`}
                data-cy={`documents-table-delete-btn-${record.id}`}
              />
            </AccessGuard>
          </Space>
        ),
      },
    ];

    return (
      <Table
        className="w-full"
        columns={columns}
        dataSource={employeeDocument?.map((doc: any, index: any) => ({
          ...doc,
          key: index,
        }))}
        pagination={false}
        id="documents-table"
        data-cy="documents-table"
      />
    );
  };

  const handleCreateUser = (values: any) => {
    const formData = new FormData();
    if (documentFileList && documentFileList.length > 0) {
      documentFileList.forEach((file) => {
        formData.append('documentName', file.originFileObj);
      });
    }
    for (const key in values) {
      if (key != 'documentName') {
        formData.append(key, values[key]);
      }
    }
    formData.append('userId', employeeData?.id);
    AddEmployeeDocument(formData).then(() => {
      setDocumentFileList([]);
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8" id="documents-container" data-cy="documents-container">
      <Row justify="center" style={{ width: '100%' }} id="documents-upload-row" data-cy="documents-upload-row">
        <AccessGuard permissions={[Permissions.UploadEmployeeDocuments]} id="documents-upload-guard" data-cy="documents-upload-guard">
          <Col span={24} id="documents-upload-col" data-cy="documents-upload-col">
            <Form
              form={form}
              name="dependencies"
              autoComplete="off"
              style={{ maxWidth: '100%' }}
              layout="vertical"
              onFinishFailed={() =>
                NotificationMessage.error({
                  message: 'Something went wrong or unfilled',
                  description: 'Please check the form again.',
                })
              }
              onFinish={handleCreateUser}
              id="documents-upload-form"
              data-cy="documents-upload-form"
            >
              <Form.Item
                className="font-semibold text-xs"
                style={{ textAlign: 'center' }}
                name="documentName"
                id="documentNameId"
                data-cy="documents-upload-form-item"
                rules={[
                  {
                    required: true,
                    message: 'Please choose the document type',
                  },
                ]}
              >
                <Dragger
                  name="documentName"
                  fileList={documentFileList}
                  onChange={handleDocumentChange}
                  onRemove={handleDocumentRemove}
                  customRequest={customRequest}
                  multiple={false}
                  listType="picture"
                  accept="*/*"
                  id="documents-upload-dragger"
                  data-cy="documents-upload-dragger"
                >
                  <div className="flex justify-between items-center text-xl font-semibold text-gray-950" id="documents-upload-header" data-cy="documents-upload-header">
                    <p id="documents-upload-title" data-cy="documents-upload-title">Document Uploads</p>
                    {/* <div className="flex py-3 px-6 my-4 items-center">
                      <Button
                        className="ant-upload-text font-semibold text-white  text-sm  bg-blue-500 hover:bg-blue-600"
                        type="primary"
                      >
                        <MdOutlineUploadFile className="text-white text-xl mr-2" />
                        Request Documents
                      </Button>
                    </div> */}
                  </div>
                  <p className="ant-upload-drag-icon" id="documents-upload-icon" data-cy="documents-upload-icon">
                    <Image
                      preview={false}
                      className="w-full max-w-xs"
                      src="/Uploading.png"
                      alt="Loading"
                      id="documents-upload-image"
                      data-cy="documents-upload-image"
                    />
                  </p>
                  <p className="ant-upload-hint text-xl font-bold text-gray-950 my-4" id="documents-upload-drag-hint" data-cy="documents-upload-drag-hint">
                    Drag & drop here to Upload
                  </p>
                  <p className="ant-upload-hint text-xs text-gray-950" id="documents-upload-select-hint" data-cy="documents-upload-select-hint">
                    or select a file from your computer
                  </p>
                  <Button
                    className="ant-upload-text font-semibold text-white py-3 px-6 text-sm my-4 bg-blue-500 hover:bg-blue-600"
                    type="primary"
                    id="documents-upload-btn"
                    data-cy="documents-upload-btn"
                  >
                    <MdOutlineUploadFile className="text-white text-xl mr-2" id="documents-upload-btn-icon" data-cy="documents-upload-btn-icon" />
                    Upload File
                  </Button>
                </Dragger>
              </Form.Item>
              <div className="flex justify-between px-2 items-center" id="documents-upload-footer" data-cy="documents-upload-footer">
                <p className="font-bold" id="documents-upload-footer-title" data-cy="documents-upload-footer-title">Uploaded Documents</p>
                <Button
                  disabled={documentFileList?.length === 0}
                  loading={addEmployee}
                  id={`sidebarActionCreateSubmit`}
                  data-cy="documents-upload-submit-btn"
                  className="px-6 py-3 mb-3 flex justify-end border-none bg-white "
                  htmlType="submit"
                >
                  <FaPlus />
                </Button>
              </div>
            </Form>
          </Col>
        </AccessGuard>
      </Row>
      <Row id="documents-table-row" data-cy="documents-table-row">
        <EmployeeDocumentTable
          employeeDocument={employeeData?.employeeDocument}
          onDelete={handleDelete}
        />
      </Row>
    </div>
  );
};

export default Documents;
