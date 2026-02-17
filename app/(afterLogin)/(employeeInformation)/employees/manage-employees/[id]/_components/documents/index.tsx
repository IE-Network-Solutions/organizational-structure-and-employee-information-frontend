'use client';
import React from 'react';
import { Button, Col, Form, Row, Upload, Card, Space } from 'antd';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useAddEmployeeDocument,
  useDeleteEmployeeDocument,
} from '@/store/server/features/employees/employeeDetail/mutations';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';
import SaveAltIcon from '@mui/icons-material/SaveAlt';import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import dayjs from 'dayjs';
import { Inbox } from 'lucide-react';

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
  const EmployeeDocumentList = ({ employeeDocument, onDelete, id }: any) => {
    if (!employeeDocument || employeeDocument.length === 0) {
      return (
        <div
          className="text-center text-gray-500 py-8"
          id="documents-empty"
          data-cy="documents-empty"
        >
          No documents uploaded yet
        </div>
      );
    }

    return (
      <div className="space-y-3" id="documents-list" data-cy="documents-list">
        {employeeDocument.map((doc: any) => {
          const documentName = doc.documentName?.split('/').pop() || 'Document';
          const formattedDate = doc.createdAt
            ? dayjs(doc.createdAt).format('DD MMM YYYY')
            : '-';

          return (
            <Card
              key={doc.id}
              className="rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              id={`documents-card-${doc.id}`}
              data-cy={`documents-card-${doc.id}`}
              bodyStyle={{ padding: '16px' }}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p
                    className="text-base font-semibold text-gray-900 m-0 mb-1"
                    id={`documents-card-name-${doc.id}`}
                    data-cy={`documents-card-name-${doc.id}`}
                  >
                    {documentName}
                  </p>
                  <p
                    className="text-xs text-gray-500 m-0"
                    id={`documents-card-date-${doc.id}`}
                    data-cy={`documents-card-date-${doc.id}`}
                  >
                    {formattedDate}
                  </p>
                </div>
                <Space size="small">
                  <AccessGuard
                    permissions={[Permissions.DownloadEmployeeDocument]}
                    selfShouldAccess
                    id={id}
                    data-cy="documents-download-guard"
                  >
                    <Button
                      type="default"
                      size="small"
                      icon={
                        <SaveAltIcon
                            className="text-gray-600"
                            style={{ fontSize: '16px' }}
                          id={`documents-download-icon-${doc.id}`}
                          data-cy={`documents-download-icon-${doc.id}`}
                        />
                      }
                      href={doc.documentLink}
                      target="_blank"
                      className="border-gray-300 bg-gray-50 hover:bg-gray-100"
                      id={`documents-download-btn-${doc.id}`}
                      data-cy={`documents-download-btn-${doc.id}`}
                    />
                  </AccessGuard>
                  <AccessGuard
                    permissions={[Permissions.DeleteEmployeeDocument]}
                    id="documents-delete-guard"
                    data-cy="documents-delete-guard"
                  >
                    <Button
                      type="default"
                      size="small"
                      danger
                      icon={
                        <DeleteOutlineIcon
                          className="text-[#ff8384]"
                          style={{ fontSize: '16px' }}
                          id={`documents-delete-icon-${doc.id}`}
                          data-cy={`documents-delete-icon-${doc.id}`}
                        />
                      }
                      onClick={() => onDelete(doc.id)}
                      className="border-red-300 bg-red-50 hover:bg-red-100"
                      id={`documents-delete-btn-${doc.id}`}
                      data-cy={`documents-delete-btn-${doc.id}`}
                    />
                  </AccessGuard>
                </Space>
              </div>
            </Card>
          );
        })}
      </div>
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
    <div
      id="documents-container"
      data-cy="documents-container"
    >
      <Row gutter={[24, 24]} id="documents-main-row" data-cy="documents-main-row">
        {/* Left Column - Upload Document */}
        <Col
          xs={24}
          lg={12}
          id="documents-upload-col"
          data-cy="documents-upload-col"
        >
          <AccessGuard
            permissions={[Permissions.UploadEmployeeDocuments]}
            id="documents-upload-guard"
            data-cy="documents-upload-guard"
          >
            <Card
              title={
                <span className="text-base font-bold text-gray-900">
                  Upload Document
                </span>
              }
              className="rounded-lg border border-gray-200"
              id="documents-upload-card"
              data-cy="documents-upload-card"
              headStyle={{ borderBottom: 'none', paddingBottom: '10px', paddingTop: '10px' }}
            >
              <Form
                form={form}
                name="dependencies"
                autoComplete="off"
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
                    accept="*/*"
                    id="documents-upload-dragger"
                    data-cy="documents-upload-dragger"
                    className="rounded-lg bg-[#fcfcfc]"
                  >
                    <p
                      className="ant-upload-drag-icon mb-4 flex justify-center items-center"
                      id="documents-upload-icon"
                      data-cy="documents-upload-icon"
                    >
                      <Inbox
                        className="text-gray-400 w-10 h-10"
                      />
                    </p>
                    <p
                      className="ant-upload-text text-base font-medium text-gray-700 mb-2"
                      id="documents-upload-drag-hint"
                      data-cy="documents-upload-drag-hint"
                    >
                      Click or drag file to this area to upload
                    </p>
                    <p
                      className="ant-upload-hint text-xs text-gray-500"
                      id="documents-upload-select-hint"
                      data-cy="documents-upload-select-hint"
                    >
                      Support for a single or bulk upload.
                    </p>
                  </Dragger>
                </Form.Item>
                <div
                  className="flex justify-end mt-4"
                  id="documents-upload-footer"
                  data-cy="documents-upload-footer"
                >
                  <Button
                    disabled={documentFileList?.length === 0}
                    loading={addEmployee}
                    type="primary"
                    htmlType="submit"
                    icon={<FaPlus />}
                    id="documents-upload-submit-btn"
                    data-cy="documents-upload-submit-btn"
                  >
                    Upload
                  </Button>
                </div>
              </Form>
            </Card>
          </AccessGuard>
        </Col>

        {/* Right Column - Documents List */}
        <Col
          xs={24}
          lg={12}
          id="documents-list-col"
          data-cy="documents-list-col"
        >
          <Card
            title={
              <span className="text-base font-bold text-gray-900">
                Documents
              </span>
            }
            className="rounded-lg border border-gray-200"
            id="documents-list-card"
            data-cy="documents-list-card"
            headStyle={{ borderBottom: 'none', paddingBottom: '16px' }}
          >
            <EmployeeDocumentList
              employeeDocument={employeeData?.employeeDocument}
              onDelete={handleDelete}
              id={id}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Documents;
