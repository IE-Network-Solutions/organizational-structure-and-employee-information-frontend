import React from 'react';
import { Card, Col, Form, Row, Button, DatePicker, Select } from 'antd';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { LuPencil } from 'react-icons/lu';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import { InfoLine } from '../../common/infoLine';
import dayjs from 'dayjs';
import UpdateUserInfo from './updateUserInfo';
import PermissionWrapper from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import ChangePasswordModal from './_components/changePasswordModal';
import { useModalStore } from '@/store/uistate/features/authentication/changePasswordModal';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

function PersonalDataComponent({
  id,
  handleSaveChanges,
}: {
  id: string;
  handleSaveChanges: any;
}) {
  const { setEdit, edit, setBirthDate, birthDate } =
    useEmployeeManagementStore();
  const { openModal } = useModalStore();
  const [form] = Form.useForm();
  const { isLoading, data: employeeData } = useGetEmployee(id);
  const { data: nationalities, isLoading: isLoadingNationality } =
    useGetNationalities();
  const { userId } = useAuthenticationStore();

  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };

  return (
    <>
      <Card
        loading={isLoading}
        title="Personal Info"
        extra={
          <PermissionWrapper
            permissions={[Permissions.UpdateEmployeeDetails]}
            selfShouldAccess
            id={id}
            data-cy="personal-data-edit-guard"
          >
            <LuPencil
              className="cursor-pointer text-black"
              color="#BFBFBF"
              onClick={() => handleEditChange('general')}
              id="personal-data-edit-icon"
              data-cy="personal-data-edit-icon"
            />
          </PermissionWrapper>
        }
        className="my-6 mt-0"
        id="personal-data-card"
        data-cy="personal-data-card"
      >
        <Row gutter={16} id="personal-data-content-row" data-cy="personal-data-content-row">
          {edit.general ? (
            <>
              <Row id="personal-data-update-user-info-row" data-cy="personal-data-update-user-info-row">
                <UpdateUserInfo employeeData={employeeData} data-cy="personal-data-update-user-info" />
              </Row>
              <Form
                form={form}
                layout="vertical"
                onFinish={(values) => handleSaveChanges('general', values)}
                initialValues={{
                  dateOfBirth: employeeData?.employeeInformation?.dateOfBirth
                    ? dayjs(employeeData.employeeInformation.dateOfBirth)
                    : null,
                  nationalityId:
                    employeeData?.employeeInformation?.nationalityId,
                  maritalStatus:
                    employeeData?.employeeInformation?.maritalStatus,
                  joinedDate: employeeData?.employeeInformation?.joinedDate
                    ? dayjs(employeeData.employeeInformation.joinedDate)
                    : null,
                  gender: employeeData?.employeeInformation?.gender,
                }}
                id="personal-data-form"
                data-cy="personal-data-form"
              >
                <Row gutter={[16, 24]} id="personal-data-form-row" data-cy="personal-data-form-row">
                  <Col lg={12} id="personal-data-form-col-1" data-cy="personal-data-form-col-1">
                    <Form.Item
                      name="dateOfBirth"
                      label="Date of Birth"
                      className="text-gray-950 text-xs w-full"
                      id="personal-data-dob-form-item"
                      data-cy="personal-data-dob-form-item"
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
                        defaultPickerValue={dayjs('2000-01-01')} // Opens the calendar with the year 2000
                        disabledDate={(current) => {
                          const minDate = dayjs().subtract(100, 'years'); // Minimum date is 100 years ago
                          const maxDate = dayjs().subtract(18, 'years'); // Maximum date is 18 years ago
                          return (
                            current &&
                            (current.isBefore(minDate) ||
                              current.isAfter(maxDate))
                          );
                        }}
                        id="personal-data-dob-datepicker"
                        data-cy="personal-data-dob-datepicker"
                      />
                    </Form.Item>
                    <Form.Item
                      name="nationalityId"
                      label="Nationality"
                      className="text-gray-950 text-xs"
                      id="personal-data-nationality-form-item"
                      data-cy="personal-data-nationality-form-item"
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
                        id="personal-data-nationality-select"
                        data-cy="personal-data-nationality-select"
                      >
                        {nationalities?.items?.map((nationality: any) => (
                          <Select.Option
                            key={nationality.id}
                            value={nationality.id}
                            id={`personal-data-nationality-option-${nationality.id}`}
                            data-cy={`personal-data-nationality-option-${nationality.id}`}
                          >
                            {nationality.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="maritalStatus"
                      label="Marital Status"
                      className="text-gray-950 text-xs"
                      id="personal-data-marital-status-form-item"
                      data-cy="personal-data-marital-status-form-item"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter the marital status',
                        },
                      ]}
                    >
                      <Select placeholder="Select Marital Status" id="personal-data-marital-status-select" data-cy="personal-data-marital-status-select">
                        <Select.Option value="MARRIED" id="personal-data-marital-status-option-married" data-cy="personal-data-marital-status-option-married">Married</Select.Option>
                        <Select.Option value="SINGLE" id="personal-data-marital-status-option-single" data-cy="personal-data-marital-status-option-single">Single</Select.Option>
                        <Select.Option value="DIVORCED" id="personal-data-marital-status-option-divorced" data-cy="personal-data-marital-status-option-divorced">Divorced</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col lg={10} id="personal-data-form-col-2" data-cy="personal-data-form-col-2">
                    <Form.Item
                      name="gender"
                      label="Gender"
                      className="text-gray-950 text-xs"
                      id="personal-data-gender-form-item"
                      data-cy="personal-data-gender-form-item"
                      rules={[
                        { required: true, message: 'Please enter the gender' },
                      ]}
                    >
                      <Select placeholder="Select Gender" id="personal-data-gender-select" data-cy="personal-data-gender-select">
                        <Select.Option value="female" id="personal-data-gender-option-female" data-cy="personal-data-gender-option-female">Female</Select.Option>
                        <Select.Option value="male" id="personal-data-gender-option-male" data-cy="personal-data-gender-option-male">Male</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="joinedDate"
                      label="Joined Date"
                      className="text-gray-950 text-xs w-full"
                      id="personal-data-joined-date-form-item"
                      data-cy="personal-data-joined-date-form-item"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter the joined date',
                        },
                      ]}
                    >
                      <DatePicker
                        disabledDate={(current) => {
                          if (!birthDate) return false; // Ensure birthDate exists

                          const minJoinedDate = dayjs(birthDate)
                            .add(15, 'years')
                            .startOf('day');
                          return current && current.isBefore(minJoinedDate);
                        }}
                        className="w-full"
                        id="personal-data-joined-date-datepicker"
                        data-cy="personal-data-joined-date-datepicker"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24} style={{ textAlign: 'right' }} id="personal-data-submit-col" data-cy="personal-data-submit-col">
                    <Button type="primary" htmlType="submit" id="personal-data-submit-btn" data-cy="personal-data-submit-btn">
                      Save Changes
                    </Button>
                  </Col>
                </Row>
              </Form>
            </>
          ) : (
            <>
              <Col lg={12} id="personal-data-display-col-1" data-cy="personal-data-display-col-1">
                <InfoLine
                  title="Full Name"
                  value={`${employeeData?.firstName} ${employeeData?.middleName} ${employeeData?.lastName}`}
                  data-cy="personal-data-display-full-name"
                />
                <InfoLine
                  title="Date of Birth"
                  value={
                    dayjs(
                      employeeData?.employeeInformation?.dateOfBirth,
                    ).format('DD MMMM, YYYY') || '-'
                  }
                  data-cy="personal-data-display-date-of-birth"
                />
                <InfoLine
                  title="Nationality"
                  value={
                    employeeData?.employeeInformation?.nationality?.name || '-'
                  }
                  data-cy="personal-data-display-nationality"
                />
                {userId === id ? (
                  <Button type="primary" htmlType="submit" onClick={openModal} id="personal-data-change-password-btn" data-cy="personal-data-change-password-btn">
                    Change Password?
                  </Button>
                ) : (
                  ''
                )}
              </Col>
              <Col lg={10} id="personal-data-display-col-2" data-cy="personal-data-display-col-2">
                <InfoLine
                  title="Gender"
                  value={employeeData?.employeeInformation?.gender || '-'}
                  data-cy="personal-data-display-gender"
                />
                <InfoLine
                  title="Marital Status"
                  value={
                    employeeData?.employeeInformation?.maritalStatus || '-'
                  }
                  data-cy="personal-data-display-marital-status"
                />
                <InfoLine
                  title="Joined Date"
                  value={
                    employeeData?.employeeInformation?.joinedDate
                      ? dayjs(
                          employeeData?.employeeInformation?.joinedDate,
                        )?.format('DD MMMM, YYYY')
                      : '-'
                  }
                  data-cy="personal-data-display-joined-date"
                />
              </Col>
            </>
          )}
        </Row>
      </Card>

      <ChangePasswordModal data-cy="personal-data-change-password-modal" />
    </>
  );
}

export default PersonalDataComponent;
