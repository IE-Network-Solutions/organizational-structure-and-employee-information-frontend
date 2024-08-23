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
  message,
} from 'antd';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';
import { InboxOutlined } from '@ant-design/icons';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';

const { Option } = Select;
const { Dragger } = Upload;

const BasicInformationForm = ({ form }: any) => {
  const { profileFileList, setProfileFileList } = useEmployeeManagmentStore();
  const { data: nationalities } = useGetNationalities();

  const beforeProfileUpload = (file: any) => {
    const isImage = file.type?.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    return isImage || Upload.LIST_IGNORE;
  };

  const handleProfileChange = (info: any) => {
    setProfileFileList(info.fileList);
    if (info.file.status === 'done') {
      form.setFieldsValue({ profileImage: info.fileList });
    }
  };

  const handleProfileRemove = (file: any) => {
    const filterData = profileFileList.filter((item) => item.uid !== file.uid);
    setProfileFileList(filterData);
    form.setFieldsValue({
      profileImage: filterData.length > 0 ? filterData : null,
    });
  };

  const getImageUrl = (fileList: any) => {
    if (fileList.length > 0) {
      return URL.createObjectURL(fileList[0].originFileObj);
    }
    return '';
  };

  return (
    <div className="">
      <Row justify="center" style={{ width: '100%' }}>
        <Col span={24}>
          <Form.Item
            className="font-semibold text-xs"
            label="Upload Profile"
            style={{ textAlign: 'center' }}
            name="profileImage"
            id="profileImageId"
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
            name="userFirstName"
            label="First Name"
            id="userFirstNameId"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            className="font-semibold text-xs"
            name="userMiddleName"
            label="Middle Name"
            id="userMiddleNameId"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            className="font-semibold text-xs"
            name="userLastName"
            label="Last Name"
            id="userLastNameId"
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
            name="userEmail"
            label="Email Address"
            id="userEmailId"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name="employeeGender"
            label="Gender"
            id="userEmployeeGenderId"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select an option" allowClear>
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
            name="dateOfBirth"
            label="Date of Birth"
            id="userDateOfBirthId"
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name="nationalityId"
            label="Nationality"
            id="userNationalityId"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select an option" allowClear>
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
            name="martialStatus"
            label="Marital Status"
            id="userMartialStatusId"
            rules={[
              { required: true, message: 'Please select a marital status!' },
            ]}
          >
            <Select placeholder="Select an option" allowClear>
              <Option value="single">Single</Option>
              <Option value="married">Married</Option>
              <Option value="divorced">Divorced</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default BasicInformationForm;
