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
          <Space>
            <AccessGuard permissions={[Permissions.DownloadEmployeeDocument]}>
            <Button
              type="link"
              icon={<AiOutlineDownload />}
              href={record.documentLink}
              target="_blank"
            />
            </AccessGuard>
            <AccessGuard permissions={[Permissions.DeleteEmployeeDocument]}>
              <Button
                type="link"
                className="text-xl font-bold text-red-600"
                icon={<AiOutlineDelete />}
                onClick={() => onDelete(record.id)}
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
          key: index, // Add key for each row
        }))}
        pagination={false}
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
    <div className="p-4 sm:p-6 lg:p-8">
      <Row justify="center" style={{ width: '100%' }}>
        <AccessGuard permissions={[Permissions.UploadEmployeeDocuments]}>
          <Col span={24}>
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
            >
              <Form.Item
                className="font-semibold text-xs"
                style={{ textAlign: 'center' }}
                name="documentName"
                id="documentNameId"
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
                >
                  <div className="flex justify-start items-center text-xl font-semibold text-gray-950">
                    <p>Documents Upload</p>
                  </div>
                  <p className="ant-upload-drag-icon">
                    <Image
                      preview={false}
                      className="w-full max-w-xs"
                      src="/Uploading.png"
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
              <div className="flex justify-end">
                <Button
                  disabled={documentFileList?.length === 0}
                  loading={addEmployee}
                  id={`sidebarActionCreateSubmit`}
                  className="px-6 py-3 text-xs font-bold flex justify-end"
                  htmlType="submit"
                  type="primary"
                >
                  Submit
                </Button>
              </div>
            </Form>
          </Col>
        </AccessGuard>
      </Row>
      <Row>
        <EmployeeDocumentTable
          employeeDocument={employeeData?.employeeDocument}
          onDelete={handleDelete}
        />
      </Row>
    </div>
  );
};

export default Documents;
