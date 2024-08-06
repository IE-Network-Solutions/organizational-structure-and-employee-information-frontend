'use client';

import React from 'react';
import {
  Col,
  DatePicker,
  Form,
  Input,
  Image,
  Row,
  Select,
  Upload,
  UploadFile,
  message,
} from 'antd';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';
import { InboxOutlined } from '@ant-design/icons';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';

const { Option } = Select;
const { Dragger } = Upload;
const BasicInformationForm = () => {
  const [form] = Form.useForm();
  const { profileFileList, setProfileFileList } = useEmployeeManagmentStore();
  const { data: nationalities } = useGetNationalities();
  const beforeProfileUpload = (file: any) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    return isImage;
  };

  const handleProfileChange = ({ fileList }: any) => {
    setProfileFileList(fileList);
  };
  const handleProfileRemove = (file: any) => {
    setProfileFileList((prevFileList: any) =>
      prevFileList.filter((item: any) => item.uid !== file.uid),
    );
    form.setFieldsValue({ profileImage: null });
  };
  const getImageUrl = (fileList: UploadFile[]) => {
    const imageFile = fileList[0];
    return imageFile?.url || imageFile?.thumbUrl || '';
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
    <>
      <Row justify="center" style={{ width: '100%' }}>
        <Col span={24}>
          <Form.Item
            className="font-semibold text-xs"
            label="Upload Profile"
            style={{ textAlign: 'center' }}
            name="profileImage"
            rules={[
              { required: true, message: 'Please upload your profile image!' },
            ]}
          >
            <Dragger
              name="files"
              fileList={profileFileList}
              beforeUpload={beforeProfileUpload}
              onChange={handleProfileChange}
              onRemove={handleProfileRemove}
              customRequest={customRequest}
              accept="image/*"
              maxCount={1}
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
              }}
            >
              {profileFileList.length > 0 ? (
                <Image
                  src={getImageUrl(profileFileList)}
                  alt="Uploaded Preview"
                  className="w-full h-auto max-h-64 object-cover rounded-xl"
                />
              ) : (
                <>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text font-semibold text-xs">
                    Upload Your Profile
                  </p>
                  <p className="ant-upload-hint text-xs">
                    or drag and drop it here.
                  </p>
                </>
              )}
            </Dragger>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            className="font-semibold text-xs"
            name={'userFirstName'}
            label="First Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            className="font-semibold text-xs"
            name={'userMiddleName'}
            label=" Middle Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            className="font-semibold text-xs"
            name={'userLastName'}
            label="Last Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'userEmail'}
            label="Email Address"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'employeeGender'}
            label=" Gender"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select an option and change input text above"
              allowClear
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'dateOfBirth'}
            label="Date of Birth"
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'nationalityId'}
            label=" Nationality"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select an option and change input text above"
              allowClear
            >
              {nationalities?.items?.map((nationality: any, index: number) => (
                <Option key={index} value={nationality?.id}>
                  {nationality?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={24}>
          <Form.Item
            className="font-semibold text-xs"
            name={'martialStatus'}
            label="Martial status"
            rules={[
              { required: true, message: 'Please select a marital status!' },
            ]}
          >
            <Select
              placeholder="Select an option and change input text above"
              allowClear
            >
              <Option value="single">Single</Option>
              <Option value="married">Married</Option>
              <Option value="divorced">Divorced</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default BasicInformationForm;
