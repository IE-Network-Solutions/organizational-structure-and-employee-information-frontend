import React, { useEffect } from 'react';
import { Card, Col, Row, Button, Form, DatePicker, Select, Input } from 'antd';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { LuPencil } from 'react-icons/lu';
import dayjs from 'dayjs';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PermissionWrapper from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import ChangePasswordModal from './_components/changePasswordModal';
import { useModalStore } from '@/store/uistate/features/authentication/changePasswordModal';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import { useUpdateEmployeeInformation } from '@/store/server/features/employees/employeeDetail/mutations';

function PersonalDataComponent({
  id,
  handleSaveChanges,
}: {
  id: string;
  handleSaveChanges: any;
}) {
  const [form] = Form.useForm();
  const [nameForm] = Form.useForm();

  const { setEdit, edit, setBirthDate, birthDate } =
    useEmployeeManagementStore();
  const { openModal } = useModalStore();
  const { isLoading, data: employeeData } = useGetEmployee(id);
  const { userId } = useAuthenticationStore();
  const { mutate: updateEmployeeInformation, isLoading: isLoadingUser } =
    useUpdateEmployeeInformation();

  const { data: nationalities, isLoading: isLoadingNationality } =
    useGetNationalities();

  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };

  useEffect(() => {
    if (edit.general && employeeData) {
      nameForm.setFieldsValue({
        firstName: employeeData?.firstName ?? '',
        middleName: employeeData?.middleName ?? '',
        lastName: employeeData?.lastName ?? '',
      });
      form.setFieldsValue({
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
  }, [edit.general, employeeData, nameForm, form]);

  const handleSaveEdit = () => {
    Promise.all([nameForm.validateFields(), form.validateFields()])
      .then(() => {
        const nameValues = nameForm.getFieldsValue();
        const otherValues = form.getFieldsValue();
        updateEmployeeInformation(
          {
            id: employeeData?.id,
            values: nameValues,
          },
          {
            onSuccess: () => {
              handleSaveChanges('general', {
                ...otherValues,
                dateOfBirth: otherValues.dateOfBirth
                  ? dayjs(otherValues.dateOfBirth).format('YYYY-MM-DD')
                  : null,
                joinedDate: otherValues.joinedDate
                  ? dayjs(otherValues.joinedDate).format('YYYY-MM-DD')
                  : null,
              });
            },
          },
        );
      })
      .catch(() => {});
  };

  return (
    <>
      <Card
        loading={isLoading}
        bodyStyle={{ padding: '10px 0px 0px 10px' }}
        title={
          !edit.general ? (
            <span
              className="text-base font-bold text-gray-900"
              data-cy="personal-data-card-title"
            >
              Personal Information
            </span>
          ) : null
        }
        extra={
          !edit.general ? (
            <PermissionWrapper
              permissions={[Permissions.UpdateEmployeeDetails]}
              selfShouldAccess
              id={id}
              data-cy="personal-data-edit-guard"
            >
              <button
                type="button"
                onClick={() => handleEditChange('general')}
                className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
                id="personal-data-edit-icon"
                data-cy="personal-data-edit-icon"
              >
                <LuPencil size={16} className="text-black" />
              </button>
            </PermissionWrapper>
          ) : null
        }
        className="my-6 mt-0"
        id="personal-data-card"
        data-cy="personal-data-card"
        headStyle={{ borderBottom: 'none' }}
      >
        <Row
          gutter={16}
          id="personal-data-content-row"
          data-cy="personal-data-content-row"
          className="w-full"
          style={{ width: '100%' }}
        >
          {edit.general ? (
            <Col span={24} className="w-full">
              {/* Header: Personal Information + circular cancel/save (match attached UI) */}
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
                    data-cy="personal-data-form-title"
                    className="text-sm font-normal text-black"
                  >
                    Personal Information
                  </span>
                </Col>
                <Col>
                  <div
                    data-cy="personal-data-form-buttons"
                    className="flex items-center gap-2"
                  >
                    <Button
                      type="default"
                      size="small"
                      icon={
                        <CloseIcon fontSize="small" className="text-red-500" />
                      }
                      onClick={() => setEdit('general')}
                      id="personal-data-cancel-btn"
                      data-cy="personal-data-cancel-btn"
                      className="border border-red-500"
                      style={{
                        height: 32,
                        minHeight: 32,
                        width: 32,
                        minWidth: 32,
                      }}
                    />
                    <Button
                      type="primary"
                      size="small"
                      icon={<CheckIcon />}
                      onClick={handleSaveEdit}
                      loading={isLoadingUser}
                      id="personal-data-submit-btn"
                      data-cy="personal-data-submit-btn"
                      style={{
                        height: 32,
                        minHeight: 32,
                        width: 32,
                        minWidth: 32,
                      }}
                    />
                  </div>
                </Col>
              </Row>

              {/* Two-column layout: Left = First name, Last Name, Gender, Marital Status | Right = Middle Name, Date of Birth, Nationality, Joined Date */}
              <Row
                gutter={16}
                id="personal-data-form-row"
                data-cy="personal-data-form-row"
              >
                <Col
                  className="w-full"
                  lg={12}
                  sm={24}
                  xs={24}
                  id="personal-data-form-col-1"
                  data-cy="personal-data-form-col-1"
                >
                  <Form form={nameForm} layout="vertical" className="w-full">
                    <Form.Item
                      name="firstName"
                      label="First name"
                      className="text-gray-950 text-xs w-full"
                      id="personal-data-first-name-form-item"
                      data-cy="personal-data-first-name-form-item"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter the first name',
                        },
                      ]}
                    >
                      <Input
                        id="personal-data-first-name-input"
                        data-cy="personal-data-first-name-input"
                      />
                    </Form.Item>
                    <Form.Item
                      name="lastName"
                      label="Last Name"
                      className="text-gray-950 text-xs w-full"
                      id="personal-data-last-name-form-item"
                      data-cy="personal-data-last-name-form-item"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter the last name',
                        },
                      ]}
                    >
                      <Input
                        id="personal-data-last-name-input"
                        data-cy="personal-data-last-name-input"
                      />
                    </Form.Item>
                  </Form>
                  <Form
                    form={form}
                    layout="vertical"
                    id="personal-data-form"
                    data-cy="personal-data-form"
                    className="w-full"
                  >
                    <Form.Item
                      name="gender"
                      label="Gender"
                      className="text-gray-950 text-xs w-full"
                      id="personal-data-gender-form-item"
                      data-cy="personal-data-gender-form-item"
                      rules={[
                        { required: true, message: 'Please enter the gender' },
                      ]}
                    >
                      <Select
                        placeholder="Select Gender"
                        id="personal-data-gender-select"
                        data-cy="personal-data-gender-select"
                      >
                        <Select.Option
                          value="female"
                          id="personal-data-gender-option-female"
                          data-cy="personal-data-gender-option-female"
                        >
                          Female
                        </Select.Option>
                        <Select.Option
                          value="male"
                          id="personal-data-gender-option-male"
                          data-cy="personal-data-gender-option-male"
                        >
                          Male
                        </Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="maritalStatus"
                      label="Marital Status"
                      className="text-gray-950 text-xs w-full"
                      id="personal-data-marital-status-form-item"
                      data-cy="personal-data-marital-status-form-item"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter the marital status',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select Marital Status"
                        id="personal-data-marital-status-select"
                        data-cy="personal-data-marital-status-select"
                      >
                        <Select.Option
                          value="MARRIED"
                          id="personal-data-marital-status-option-married"
                          data-cy="personal-data-marital-status-option-married"
                        >
                          Married
                        </Select.Option>
                        <Select.Option
                          value="SINGLE"
                          id="personal-data-marital-status-option-single"
                          data-cy="personal-data-marital-status-option-single"
                        >
                          Single
                        </Select.Option>
                        <Select.Option
                          value="DIVORCED"
                          id="personal-data-marital-status-option-divorced"
                          data-cy="personal-data-marital-status-option-divorced"
                        >
                          Divorced
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Form>
                </Col>
                <Col
                  className="w-full"
                  lg={12}
                  sm={24}
                  xs={24}
                  id="personal-data-form-col-2"
                  data-cy="personal-data-form-col-2"
                >
                  <Form form={nameForm} layout="vertical" className="w-full">
                    <Form.Item
                      name="middleName"
                      label="Middle Name"
                      className="text-gray-950 text-xs w-full"
                      id="personal-data-middle-name-form-item"
                      data-cy="personal-data-middle-name-form-item"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter the middle name',
                        },
                      ]}
                    >
                      <Input
                        id="personal-data-middle-name-input"
                        data-cy="personal-data-middle-name-input"
                      />
                    </Form.Item>
                  </Form>
                  <Form
                    form={form}
                    layout="vertical"
                    id="personal-data-form-right"
                    className="w-full"
                  >
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
                        defaultPickerValue={dayjs('2000-01-01')}
                        disabledDate={(current) => {
                          const minDate = dayjs().subtract(100, 'years');
                          const maxDate = dayjs().subtract(18, 'years');
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
                      className="text-gray-950 text-xs w-full"
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
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          String(option?.children || '')
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
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
                          if (!birthDate) return false;
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
                  </Form>
                </Col>
              </Row>
            </Col>
          ) : (
            <>
              <Col
                lg={12}
                id="personal-data-display-col-1"
                data-cy="personal-data-display-col-1"
                className="flex flex-col gap-5"
              >
                <div
                  id="personal-data-display-full-name"
                  data-cy="personal-data-display-full-name"
                >
                  <p
                    className="text-xs text-gray-500 font-medium m-0 mb-0.5"
                    data-cy="personal-data-full-name-label"
                  >
                    Full Name
                  </p>
                  <p
                    className="text-base font-semibold text-gray-500 m-0"
                    data-cy="personal-data-full-name-value"
                  >
                    {`${employeeData?.firstName || ''} ${employeeData?.middleName || ''} ${employeeData?.lastName || ''}`.trim() ||
                      '-'}
                  </p>
                </div>
                <div
                  id="personal-data-display-gender"
                  data-cy="personal-data-display-gender"
                >
                  <p
                    className="text-xs text-gray-500 font-medium m-0 mb-0.5"
                    data-cy="personal-data-gender-label"
                  >
                    Gender
                  </p>
                  <p
                    className="text-base font-semibold text-gray-500 m-0"
                    data-cy="personal-data-gender-value"
                  >
                    {employeeData?.employeeInformation?.gender
                      ? String(employeeData.employeeInformation.gender)
                          .charAt(0)
                          .toUpperCase() +
                        String(employeeData.employeeInformation.gender)
                          .slice(1)
                          .toLowerCase()
                      : '-'}
                  </p>
                </div>
                <div
                  id="personal-data-display-marital-status"
                  data-cy="personal-data-display-marital-status"
                >
                  <p
                    className="text-xs text-gray-500 font-medium m-0 mb-0.5"
                    data-cy="personal-data-marital-status-label"
                  >
                    Marital Status
                  </p>
                  <p
                    className="text-base font-semibold text-gray-500 m-0"
                    data-cy="personal-data-marital-status-value"
                  >
                    {employeeData?.employeeInformation?.maritalStatus
                      ? String(
                          employeeData.employeeInformation.maritalStatus,
                        ).charAt(0) +
                        String(employeeData.employeeInformation.maritalStatus)
                          .slice(1)
                          .toLowerCase()
                      : '-'}
                  </p>
                </div>
                {userId === id ? (
                  <Button
                    type="primary"
                    htmlType="submit"
                    onClick={openModal}
                    id="personal-data-change-password-btn"
                    data-cy="personal-data-change-password-btn"
                  >
                    Change Password?
                  </Button>
                ) : (
                  ''
                )}
              </Col>
              <Col
                lg={12}
                id="personal-data-display-col-2"
                data-cy="personal-data-display-col-2"
                className="flex flex-col gap-5"
              >
                <div
                  id="personal-data-display-date-of-birth"
                  data-cy="personal-data-display-date-of-birth"
                >
                  <p
                    className="text-xs text-gray-500 font-medium m-0 mb-0.5"
                    data-cy="personal-data-dob-label"
                  >
                    Date of Birth
                  </p>
                  <p
                    className="text-base font-semibold text-gray-500 m-0"
                    data-cy="personal-data-dob-value"
                  >
                    {employeeData?.employeeInformation?.dateOfBirth
                      ? dayjs(
                          employeeData.employeeInformation.dateOfBirth,
                        ).format('DD MMMM, YYYY')
                      : '-'}
                  </p>
                </div>
                <div
                  id="personal-data-display-nationality"
                  data-cy="personal-data-display-nationality"
                >
                  <p
                    className="text-xs text-gray-500 font-medium m-0 mb-0.5"
                    data-cy="personal-data-nationality-label"
                  >
                    Nationality
                  </p>
                  <p
                    className="text-base font-semibold text-gray-500 m-0"
                    data-cy="personal-data-nationality-value"
                  >
                    {employeeData?.employeeInformation?.nationality?.name ||
                      '-'}
                  </p>
                </div>
                <div
                  id="personal-data-display-joined-date"
                  data-cy="personal-data-display-joined-date"
                >
                  <p
                    className="text-xs text-gray-500 font-medium m-0 mb-0.5"
                    data-cy="personal-data-joined-date-label"
                  >
                    Joined Date
                  </p>
                  <p
                    className="text-base font-semibold text-gray-500 m-0"
                    data-cy="personal-data-joined-date-value"
                  >
                    {employeeData?.employeeInformation?.joinedDate
                      ? dayjs(
                          employeeData.employeeInformation.joinedDate,
                        ).format('DD MMMM, YYYY')
                      : '-'}
                  </p>
                </div>
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
