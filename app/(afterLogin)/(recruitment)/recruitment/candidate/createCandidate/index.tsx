import CustomDrawerLayout from '@/components/common/customDrawer';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { Button, Col, Form, Image, Input, Row, Upload } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React from 'react';
import { MdOutlineUploadFile } from 'react-icons/md';

const { Dragger } = Upload;

const CreateCandidate: React.FC = () => {
  const [form] = Form.useForm();
  const {
    createJobDrawer,
    setCreateJobDrawer,
    documentFileList,
    setDocumentFileList,
    removeDocument,
  } = useCandidateState();

  const handleCloseDrawer = () => {
    setCreateJobDrawer(false);
  };

  const handleDocumentChange = (info: any) => {
    const fileList = Array.isArray(info.fileList) ? info.fileList : [];
    setDocumentFileList(fileList);
  };
  const handleDelete = (id: string) => {
    // deleteEmployeeDocument(id); // Call mutate with the document ID
  };
  const handleDocumentRemove = (file: any) => {
    removeDocument(file.uid);
  };

  const customRequest = ({ onSuccess }: any) => {
    setTimeout(() => {
      onSuccess('ok');
    }, 0);
  };

  const createJobDrawerHeader = (
    <div className="flex items-center justify-center">
      <span className="text-md font-medium">New Candidate</span>
    </div>
  );
  return (
    <CustomDrawerLayout
      open={createJobDrawer}
      onClose={handleCloseDrawer}
      modalHeader={createJobDrawerHeader}
      width="40%"
      footer={null}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={24} lg={12} md={12} xl={12}>
            <Form.Item
              label={
                <span className="text-md font-semibold text-gray-700">
                  Name
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please input full name!',
                },
              ]}
            >
              <Input placeholder="Full Name" className="w-full h-10 text-sm" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} lg={12} md={12} xl={12}>
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
          </Col>
        </Row>
        <Row>
          <Col xs={24} sm={24} lg={12} md={12} xl={12}>
            <Form.Item
              name="emailAddress"
              label={
                <span className="text-md font-semibold text-gray-700">
                  Email Address
                </span>
              }
            ></Form.Item>
          </Col>
          <Col xs={24} sm={24} lg={12} md={12} xl={12}>
            <Form.Item
              name="phoneNumber"
              label={
                <span className="text-md font-semibold text-gray-700">
                  Phone Number
                </span>
              }
            ></Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Input className="text-sm w-full h-10" placeholder="phone number" />
        </Form.Item>
        <Form.Item
          label={
            <span className="text-md font-semibold text-gray-700">
              Candidate Type
            </span>
          }
          rules={[]}
        >
          <Input className="text-sm w-full h-10" placeholder="email address" />
        </Form.Item>
        <Form.Item
          label={
            <span className="text-md font-semibold text-gray-700">CGPA</span>
          }
          rules={[]}
        >
          <Input className="text-sm w-full h-10" placeholder="email address" />
          <div className="">Put your point 4.0 scale</div>
        </Form.Item>
        <Form.Item
          label={
            <span className="text-md font-semibold text-gray-700">Job </span>
          }
          rules={[]}
        >
          <Input className="text-sm w-full h-10" placeholder="email address" />
        </Form.Item>
        <Form.Item
          name="coverLetter"
          label={
            <span className="text-md font-semibold text-gray-700">
              Cover Letter
            </span>
          }
          rules={[{ required: true, message: 'Please input cover letter' }]}
        >
          <TextArea
            rows={4}
            className="text-sm w-full h-10"
            placeholder="Please enter your cover letter here "
          />
        </Form.Item>
        <Form.Item>
          <div className="flex items-center justify-center gap-5 text-sm font-bold ">
            <Button type="primary" className="w-full h-10 text-sm font-md">
              Create
            </Button>
            <Button hidden className="w-full h-10 text-sm font-md">
              Cancel
            </Button>
          </div>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default CreateCandidate;
