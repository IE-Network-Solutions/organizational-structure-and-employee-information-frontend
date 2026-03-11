import { useForm } from 'antd/es/form/Form';
import React, { useEffect, useState } from 'react';
import { Col, Form, Row, Input, Button, DatePicker, Select } from 'antd';
import {
  useUpdateEmployeeInformation,
  useUpdateEmployee,
} from '@/store/server/features/employees/employeeDetail/mutations';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import dayjs from 'dayjs';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

function UpdateUserInfo({ employeeData }: any) {
  const { mutate: updateEmployeeInformation, isLoading: isLoadingUser } =
    useUpdateEmployeeInformation();
  const { mutate: updateEmployee, isLoading: isLoadingEmployee } =
    useUpdateEmployee();
  const { setEdit, setBirthDate, birthDate } = useEmployeeManagementStore();
  const { data: nationalities, isLoading: isLoadingNationality } =
    useGetNationalities();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form] = useForm();

  const handleSaveChanges = (values: any) => {
    setIsSubmitting(true);

    // Separate user fields from employee information fields
    const userFields = {
      firstName: values.firstName,
      middleName: values.middleName,
      lastName: values.lastName,
    };

    const employeeInfoFields = {
      dateOfBirth: values.dateOfBirth
        ? dayjs(values.dateOfBirth).format('YYYY-MM-DD')
        : null,
      nationalityId: values.nationalityId,
      maritalStatus: values.maritalStatus,
      gender: values.gender,
      joinedDate: values.joinedDate
        ? dayjs(values.joinedDate).format('YYYY-MM-DD')
        : null,
    };

    // Update user information (firstName, middleName, lastName)
    updateEmployeeInformation(
      {
        id: employeeData?.id,
        values: userFields,
      },
      {
        onSuccess: () => {
          // After user update succeeds, update employee information
          updateEmployee(
            {
              id: employeeData?.employeeInformation?.id,
              values: employeeInfoFields,
            },
            {
              onSuccess: () => {
                setIsSubmitting(false);
                setEdit('general');
              },
              onError: () => {
                setIsSubmitting(false);
              },
            },
          );
        },
        onError: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  useEffect(() => {
    if (employeeData) {
      form.setFieldsValue({
        firstName: employeeData?.firstName ?? '',
        middleName: employeeData?.middleName ?? '',
        lastName: employeeData?.lastName ?? '',
        dateOfBirth: employeeData?.employeeInformation?.dateOfBirth
          ? dayjs(employeeData.employeeInformation.dateOfBirth)
          : null,
        nationalityId: employeeData?.employeeInformation?.nationalityId,
        maritalStatus: employeeData?.employeeInformation?.maritalStatus,
        joinedDate: employeeData?.employeeInformation?.joinedDate
          ? dayjs(employeeData.employeeInformation.joinedDate)
          : null,
        gender: employeeData?.employeeInformation?.gender,
      });
    }
  }, [employeeData, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => handleSaveChanges(values)}
      id="personal-data-update-user-info-form"
      data-cy="personal-data-update-user-info-form"
      className="w-full"
    >
      {/* Header: Title + circular action buttons */}
      <Row
        justify="space-between"
        align="middle"
        className="mb-4 w-full"
        style={{ width: '100%' }}
        id="personal-data-update-user-info-header-row"
        data-cy="personal-data-update-user-info-header-row"
      >
        <Col>
          <span
            data-cy="personal-data-update-user-info-title"
            className="text-sm font-normal text-black"
          >
            Personal Information
          </span>
        </Col>
        <Col>
          <div
            data-cy="personal-data-update-user-info-buttons"
            className="flex items-center gap-2"
          >
            <Button
              type="default"
              size="small"
              icon={<CloseIcon fontSize="small" className="text-red-500" />}
              onClick={() => setEdit('general')}
              id="personal-data-update-user-info-cancel-btn"
              data-cy="personal-data-update-user-info-cancel-btn"
              className="border border-red-500"
              style={{ height: 32, minHeight: 32, width: 32, minWidth: 32 }}
            />
            <Button
              type="primary"
              size="small"
              icon={<CheckIcon />}
              htmlType="submit"
              loading={isSubmitting || isLoadingUser || isLoadingEmployee}
              id="personal-data-update-user-info-submit-btn"
              data-cy="personal-data-update-user-info-submit-btn"
              style={{ height: 32, minHeight: 32, width: 32, minWidth: 32 }}
            />
          </div>
        </Col>
      </Row>

      <Row
        gutter={16}
        className="w-full"
        style={{ width: '100%' }}
        id="personal-data-update-user-info-row"
        data-cy="personal-data-update-user-info-row"
      >
        {/* Left Column */}
        <Col xs={24} sm={24} md={12} lg={12} className="w-full">
          <Form.Item
            name="firstName"
            label="First name"
            className="text-gray-950 text-xs w-full"
            rules={[
              {
                required: true,
                message: 'Please enter the first name',
              },
            ]}
            id="personal-data-update-user-info-first-name-form-item"
            data-cy="personal-data-update-user-info-first-name-form-item"
          >
            <Input
              id="personal-data-update-user-info-first-name-input"
              data-cy="personal-data-update-user-info-first-name-input"
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            className="text-gray-950 text-xs w-full"
            rules={[
              {
                required: true,
                message: 'Please enter the last name',
              },
            ]}
            id="personal-data-update-user-info-last-name-form-item"
            data-cy="personal-data-update-user-info-last-name-form-item"
          >
            <Input
              id="personal-data-update-user-info-last-name-input"
              data-cy="personal-data-update-user-info-last-name-input"
            />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            className="text-gray-950 text-xs w-full"
            id="personal-data-update-user-info-gender-form-item"
            data-cy="personal-data-update-user-info-gender-form-item"
            rules={[{ required: true, message: 'Please enter the gender' }]}
          >
            <Select
              placeholder="Select Gender"
              id="personal-data-update-user-info-gender-select"
              data-cy="personal-data-update-user-info-gender-select"
            >
              <Select.Option
                value="female"
                id="personal-data-update-user-info-gender-option-female"
                data-cy="personal-data-update-user-info-gender-option-female"
              >
                Female
              </Select.Option>
              <Select.Option
                value="male"
                id="personal-data-update-user-info-gender-option-male"
                data-cy="personal-data-update-user-info-gender-option-male"
              >
                Male
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="maritalStatus"
            label="Marital Status"
            className="text-gray-950 text-xs w-full"
            id="personal-data-update-user-info-marital-status-form-item"
            data-cy="personal-data-update-user-info-marital-status-form-item"
            rules={[
              {
                required: true,
                message: 'Please enter the marital status',
              },
            ]}
          >
            <Select
              placeholder="Select Marital Status"
              id="personal-data-update-user-info-marital-status-select"
              data-cy="personal-data-update-user-info-marital-status-select"
            >
              <Select.Option
                value="MARRIED"
                id="personal-data-update-user-info-marital-status-option-married"
                data-cy="personal-data-update-user-info-marital-status-option-married"
              >
                Married
              </Select.Option>
              <Select.Option
                value="SINGLE"
                id="personal-data-update-user-info-marital-status-option-single"
                data-cy="personal-data-update-user-info-marital-status-option-single"
              >
                Single
              </Select.Option>
              <Select.Option
                value="DIVORCED"
                id="personal-data-update-user-info-marital-status-option-divorced"
                data-cy="personal-data-update-user-info-marital-status-option-divorced"
              >
                Divorced
              </Select.Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Right Column */}
        <Col xs={24} sm={24} md={12} lg={12} className="w-full">
          <Form.Item
            name="middleName"
            label="Middle Name"
            className="text-gray-950 text-xs w-full"
            rules={[
              {
                required: true,
                message: 'Please enter the middle name',
              },
            ]}
            id="personal-data-update-user-info-middle-name-form-item"
            data-cy="personal-data-update-user-info-middle-name-form-item"
          >
            <Input
              id="personal-data-update-user-info-middle-name-input"
              data-cy="personal-data-update-user-info-middle-name-input"
            />
          </Form.Item>

          <Form.Item
            name="dateOfBirth"
            label="Date of Birth"
            className="text-gray-950 text-xs w-full"
            id="personal-data-update-user-info-dob-form-item"
            data-cy="personal-data-update-user-info-dob-form-item"
            rules={[
              {
                required: true,
                message: 'Please enter the date of birth',
              },
            ]}
          >
            <DatePicker
              className="w-full"
              onChange={(date) => setBirthDate(date)}
              defaultPickerValue={dayjs('2000-01-01')}
              disabledDate={(current) => {
                const minDate = dayjs().subtract(100, 'years');
                const maxDate = dayjs().subtract(18, 'years');
                return (
                  current &&
                  (current.isBefore(minDate) || current.isAfter(maxDate))
                );
              }}
              id="personal-data-update-user-info-dob-datepicker"
              data-cy="personal-data-update-user-info-dob-datepicker"
            />
          </Form.Item>

          <Form.Item
            name="nationalityId"
            label="Nationality"
            className="text-gray-950 text-xs w-full"
            id="personal-data-update-user-info-nationality-form-item"
            data-cy="personal-data-update-user-info-nationality-form-item"
            rules={[
              {
                required: true,
                message: 'Please enter the nationality',
              },
            ]}
          >
            <Select
              loading={isLoadingNationality}
              placeholder="Select Nationality"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children || '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              id="personal-data-update-user-info-nationality-select"
              data-cy="personal-data-update-user-info-nationality-select"
            >
              {nationalities?.items?.map((nationality: any) => (
                <Select.Option
                  key={nationality.id}
                  value={nationality.id}
                  id={`personal-data-update-user-info-nationality-option-${nationality.id}`}
                  data-cy={`personal-data-update-user-info-nationality-option-${nationality.id}`}
                >
                  {nationality.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="joinedDate"
            label="Joined Date"
            className="text-gray-950 text-xs w-full"
            id="personal-data-update-user-info-joined-date-form-item"
            data-cy="personal-data-update-user-info-joined-date-form-item"
            rules={[
              {
                required: true,
                message: 'Please enter the joined date',
              },
            ]}
          >
            <DatePicker
              disabledDate={(current) => {
                if (!birthDate) return false;

                const minJoinedDate = dayjs(birthDate)
                  .add(15, 'years')
                  .startOf('day');
                return current && current.isBefore(minJoinedDate);
              }}
              className="w-full"
              id="personal-data-update-user-info-joined-date-datepicker"
              data-cy="personal-data-update-user-info-joined-date-datepicker"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

export default UpdateUserInfo;
