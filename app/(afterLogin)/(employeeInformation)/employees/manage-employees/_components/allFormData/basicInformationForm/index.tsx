'use client';

import React, { useState } from 'react';
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
  Button,
  Popover,
} from 'antd';
import { CloseOutlined, InboxOutlined } from '@ant-design/icons';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import { validateEmail, validateName } from '@/utils/validation';
import { UploadFile } from 'antd/lib';
import { RcFile } from 'antd/es/upload';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import dayjs from 'dayjs';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';

const { Option } = Select;
const { Dragger } = Upload;

const BasicInformationForm = ({ form }: any) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { profileFileList, setBirthDate, setProfileFileList } =
    useEmployeeManagementStore();
  const { data: nationalities, isLoading: isLoadingNationality } =
    useGetNationalities();

  type FileInfo = {
    file: UploadFile; // File being uploaded
    fileList: UploadFile[]; // List of all files
  };

  const beforeProfileUpload = (file: RcFile): boolean => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    return isImage;
  };

  const handleProfileChange = (info: FileInfo) => {
    // Only keep the most recent file
    const latestFile = info.fileList.slice(-1);
    setProfileFileList(latestFile);

    if (info.file.status !== 'removed') {
      form.setFieldsValue({ profileImage: info });
    }
  };

  const handleProfileRemove = () => {
    // Clear the file list completely
    setProfileFileList([]);

    // Reset form field
    form.setFieldsValue({
      profileImage: null,
    });
  };

  const getImageUrl = (fileList: UploadFile[]): string => {
    if (fileList.length > 0) {
      const imageFile = fileList[0];
      return (
        imageFile?.url ||
        imageFile?.thumbUrl ||
        URL.createObjectURL(imageFile.originFileObj as RcFile) ||
        ''
      );
    }
    return '';
  };

  return (
    <div className="" id="basic-info-form" data-cy="basic-info-form">
      <Row
        justify="center"
        style={{ width: '100%' }}
        id="basic-info-row-profile"
        data-cy="basic-info-row-profile"
      >
        <Col
          span={24}
          id="basic-info-col-profile"
          data-cy="basic-info-col-profile"
        >
          <Form.Item
            className="font-semibold text-xs"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                id="basic-info-upload-label"
                data-cy="basic-info-upload-label"
              >
                Upload Avatar <span className="text-gray-400">(optional)</span>
              </span>
            }
            // style={{ textAlign: 'center' }}
            name="profileImage"
            id="profileImageId"
            data-cy="profileImageId"
          >
            <Popover
              trigger="click"
              open={isPopoverOpen}
              onOpenChange={setIsPopoverOpen}
              placement="bottomRight"
              content={
                <div 
                  className="p-1 w-[450px]"
                  id="avatar-popover-container"
                  data-cy="avatar-popover-container"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700 font-semibold text-sm">Upload Profile</span>
                    <CloseOutlined 
                      className="text-gray-400 cursor-pointer text-xs" 
                      onClick={() => setIsPopoverOpen(false)}
                      id="avatar-popover-close"
                      data-cy="avatar-popover-close"
                    />
                  </div>

                  {/* Upload Area */}
                  {profileFileList.length > 0 ? (
                    <div
                      className="flex justify-center items-center py-4 px-3 border-2 border-dashed border-gray-300 rounded-lg"
                      id="basic-info-upload-preview"
                      data-cy="basic-info-upload-preview"
                    >
                      <div
                        className="relative inline-block"
                        id="basic-info-upload-preview-image"
                        data-cy="basic-info-upload-preview-image"
                      >
                        <Image
                          src={getImageUrl(profileFileList)}
                          alt="Profile Preview"
                          width={400}
                          height={200}
                          className="object-cover rounded-lg"
                          preview={true}
                          style={{
                            minWidth: '400px',
                            minHeight: '200px',
                            maxWidth: '100%',
                          }}
                        />
                        <Button
                          type="primary"
                          danger
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={handleProfileRemove}
                          className="absolute -top-2 -right-2 shadow-md"
                          style={{ zIndex: 10 }}
                          title="Remove image"
                        />
                      </div>
                    </div>
                  ) : (
                    <Dragger
                      name="files"
                      fileList={[]}
                      beforeUpload={beforeProfileUpload}
                      onChange={(info) => {
                        handleProfileChange(info);
                      }}
                      className="bg-gray-50 border-gray-300 border-dashed rounded-lg py-8"
                      accept="image/*"
                      maxCount={1}
                      showUploadList={false}
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-3 bg-white border border-blue-600 rounded-lg">
                          <InboxOutlined className="text-blue-600 text-3xl" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Click or drag file to this area to upload
                          </p>
                          <p className="text-xs text-gray-400">
                            Support for a single or bulk upload.
                          </p>
                        </div>
                      </div>
                    </Dragger>
                  )}

                  {/* Footer */}
                  <div className="flex justify-end mt-4 gap-2">
                    <Button 
                      className="px-6 rounded-lg text-xs font-semibold"
                      onClick={() => setIsPopoverOpen(false)}
                      id="avatar-popover-cancel"
                      data-cy="avatar-popover-cancel"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="primary" 
                      className="px-6 rounded-lg bg-blue-700 text-xs font-semibold"
                      onClick={() => setIsPopoverOpen(false)}
                      id="avatar-popover-upload"
                      data-cy="avatar-popover-upload"
                    >
                      Upload
                    </Button>
                  </div>
                </div>
              }
            >
              <div 
                className="flex items-center justify-center bg-gray-300 rounded-full p-2 border border-gray-300 w-16 h-16 cursor-pointer relative overflow-visible"
                id="avatar-trigger-circle"
                data-cy="avatar-trigger-circle"
              >
                {profileFileList.length > 0 ? (
                  <Image
                    src={getImageUrl(profileFileList)}
                    alt="Avatar"
                    width={64}
                    height={64}
                    className="rounded-full w-full h-full object-cover"
                    preview={false}
                  />
                ) : (
                  <PersonOutlinedIcon style={{ fontSize: '32px', color: '#6b7280' }} />
                )}
                {/* The X button to remove image outside popover if needed, 
                    but per image it shows the placeholder icon */}
              </div>
            </Popover>
                
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16} id="basic-info-row-names" data-cy="basic-info-row-names">
        <Col
          xs={24}
          sm={8}
          id="basic-info-col-first-name"
          data-cy="basic-info-col-first-name"
        >
          <Form.Item
            className="font-semibold text-xs"
            name="userFirstName"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                id="basic-info-first-name-label"
                data-cy="basic-info-first-name-label"
              >
                First Name
              </span>
            }
            id="userFirstNameId"
            data-cy="userFirstNameId"
            rules={[
              {
                required: true,
                validator: (rule, value) =>
                  !validateName('name', value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('name', value) || ''),
                      ),
              },
            ]}
          >
            <Input
              id="basic-info-first-name-input"
              data-cy="basic-info-first-name-input"
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={8}
          id="basic-info-col-middle-name"
          data-cy="basic-info-col-middle-name"
        >
          <Form.Item
            className="font-semibold text-xs"
            name="userMiddleName"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="basic-info-middle-name-label"
              >
                Middle Name
              </span>
            }
            id="userMiddleNameId"
            data-cy="userMiddleNameId"
            rules={[
              {
                required: true,
                validator: (rule, value) =>
                  !validateName('Middle Name', value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('Middle Name', value) || ''),
                      ),
              },
            ]}
          >
            <Input
              id="basic-info-middle-name-input"
              data-cy="basic-info-middle-name-input"
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={8}
          id="basic-info-col-last-name"
          data-cy="basic-info-col-last-name"
        >
          <Form.Item
            className="font-semibold text-xs"
            name="userLastName"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="basic-info-last-name-label"
              >
                Last Name
              </span>
            }
            id="userLastNameId"
            data-cy="userLastNameId"
            rules={[
              {
                required: true,
                validator: (rule, value) =>
                  !validateName('Last Name', value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('Last Name', value) || ''),
                      ),
              },
            ]}
          >
            <Input
              id="basic-info-last-name-input"
              data-cy="basic-info-last-name-input"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row
        gutter={16}
        id="basic-info-row-contact"
        data-cy="basic-info-row-contact"
      >
        <Col
          xs={24}
          sm={12}
          id="basic-info-col-email"
          data-cy="basic-info-col-email"
        >
          <Form.Item
            className="font-semibold text-xs"
            name="userEmail"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="basic-info-email-label"
              >
                Email Address
              </span>
            }
            id="userEmailId"
            data-cy="userEmailId"
            rules={[
              {
                required: true,
                validator: (rule, value) =>
                  !validateEmail(value)
                    ? Promise.resolve()
                    : Promise.reject(new Error(validateEmail(value) || '')),
              },
            ]}
          >
            <Input
              id="basic-info-email-input"
              data-cy="basic-info-email-input"
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={12}
          id="basic-info-col-gender"
          data-cy="basic-info-col-gender"
        >
          <Form.Item
            className="font-semibold text-xs"
            name="employeeGender"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="basic-info-gender-label"
              >
                Gender
              </span>
            }
            id="userEmployeeGenderId"
            data-cy="userEmployeeGenderId"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select an option"
              allowClear
              id="basic-info-gender-select"
              data-cy="basic-info-gender-select"
            >
              <Option
                value="male"
                id="basic-info-gender-option-male"
                data-cy="basic-info-gender-option-male"
              >
                Male
              </Option>
              <Option
                value="female"
                id="basic-info-gender-option-female"
                data-cy="basic-info-gender-option-female"
              >
                Female
              </Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row
        gutter={16}
        id="basic-info-row-birth-marital"
        data-cy="basic-info-row-birth-marital"
      >
        <Col
          xs={24}
          sm={12}
          id="basic-info-col-dob"
          data-cy="basic-info-col-dob"
        >
          <Form.Item
            className="font-semibold text-xs"
            name="dateOfBirth"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="basic-info-dob-label"
              >
                Date of Birth
              </span>
            }
            id="userDateOfBirthId"
            data-cy="userDateOfBirthId"
          >
            <DatePicker
              className="w-full"
              id="basic-info-date-picker"
              data-cy="basic-info-date-picker"
              onChange={(date) => setBirthDate(date)}
              defaultPickerValue={dayjs().subtract(18, 'years')}
              disabledDate={(current) => {
                const minDate = dayjs().subtract(100, 'years');
                const maxDate = dayjs().subtract(18, 'years');
                return (
                  current &&
                  (current.isBefore(minDate) || current.isAfter(maxDate))
                );
              }}
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={12}
          id="basic-info-col-marital-status"
          data-cy="basic-info-col-marital-status"
        >
          <Form.Item
            className="font-semibold text-xs"
            name="maritalStatus"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="basic-info-marital-status-label"
              >
                Marital Status
              </span>
            }
            id="userMaritalStatusId"
            data-cy="userMaritalStatusId"
          >
            <Select
              placeholder="Select an option"
              allowClear
              id="basic-info-marital-select"
              data-cy="basic-info-marital-select"
            >
              <Option
                value="SINGLE"
                id="basic-info-marital-option-single"
                data-cy="basic-info-marital-option-single"
              >
                Single
              </Option>
              <Option
                value="MARRIED"
                id="basic-info-marital-option-married"
                data-cy="basic-info-marital-option-married"
              >
                Married
              </Option>
              <Option
                value="DIVORCED"
                id="basic-info-marital-option-divorced"
                data-cy="basic-info-marital-option-divorced"
              >
                Divorced
              </Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      {/* <Row
        gutter={16}
        id="basic-info-row-nationality"
        data-cy="basic-info-row-nationality"
      >
        <Col
          xs={24}
          sm={24}
          id="basic-info-col-nationality"
          data-cy="basic-info-col-nationality"
        >
          <Form.Item
            className="font-semibold text-xs"
            name="nationalityId"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="basic-info-nationality-label"
              >
                Nationality <span className="text-gray-400">(optional)</span>
              </span>
            }
            id="userNationalityId"
            data-cy="userNationalityId"
          >
            <Select
              loading={isLoadingNationality}
              placeholder="Select Nationality"
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children || '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              id="basic-info-nationality-select"
              data-cy="basic-info-nationality-select"
            >
              {nationalities?.items?.map((nationality: any, index: number) => (
                <Option
                  key={index}
                  value={nationality?.id}
                  id={`basic-info-nationality-option-${index}`}
                  data-cy={`basic-info-nationality-option-${index}`}
                >
                  {nationality?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row
        gutter={16}
        id="basic-info-row-address"
        data-cy="basic-info-row-address"
      >
        <Col
          xs={24}
          sm={24}
          id="basic-info-col-address"
          data-cy="basic-info-col-address"
        >
          <Form.Item
            className="font-semibold text-xs"
            name="address"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="basic-info-address-label"
              >
                Address <span className="text-gray-400">(optional)</span>
              </span>
            }
            id="userAddressId"
            data-cy="userAddressId"
          >
            <Input.TextArea
              placeholder="Add your address as address, city, country"
              rows={3}
              id="basic-info-address-textarea"
              data-cy="basic-info-address-textarea"
            />
          </Form.Item>
        </Col>
      </Row> */}
    </div>
  );
};

export default BasicInformationForm;
