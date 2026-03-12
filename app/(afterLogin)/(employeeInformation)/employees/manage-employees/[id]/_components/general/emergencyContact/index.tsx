import React from 'react';
import { Card, Col, Input, Form, Row, Button, Select } from 'antd';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { LuPencil } from 'react-icons/lu';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import { validateField } from '../../../../_components/formValidator';
import dayjs from 'dayjs';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const { Option } = Select;

function EmergencyContact({ mergedFields, handleSaveChanges, id }: any) {
  const { setEdit, edit } = useEmployeeManagementStore();
  const { isLoading, data: employeeData } = useGetEmployee(id);
  const { data: nationalities } = useGetNationalities();

  const [form] = Form.useForm();
  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };

  const getFieldValidation = (fieldName: string) => {
    return (
      mergedFields?.find((field: any) => field?.fieldName === fieldName)
        ?.fieldValidation ?? null
    );
  };

  // Filter custom fields for emergencyContact section
  const emergencyContactFields =
    mergedFields?.filter(
      (field: any) => field?.formTitle === 'emergencyContact',
    ) || [];

  // Merge existing employee data with custom fields
  const existingData =
    employeeData?.employeeInformation?.emergencyContact || {};
  const defaultFields = {
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
    nationality: '',
  };
  const allFields = { ...defaultFields, ...existingData };

  // Add custom fields to allFields if they don't exist
  emergencyContactFields.forEach((field: any) => {
    if (!(field.fieldName in allFields)) {
      allFields[field.fieldName] = '';
    }
  });

  const titleMap: Record<string, string> = {
    firstName: 'First Name',
    middleName: 'Middle Name',
    lastName: 'Last Name',
    phoneNumber: 'Phone Number',
    gender: 'Gender',
    nationality: 'Nationality',
  };

  const getDisplayValue = (key: string, val: unknown): string => {
    if (key === 'nationality') {
      return (
        nationalities?.items?.find((item: any) => item.id === val)?.name || '-'
      );
    }
    if (key === 'gender' && val) {
      const s = String(val);
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }
    if (val === null || val === undefined || val === '') return '-';
    const str = String(val);
    if (dayjs(str, ['YYYY-MM-DD', 'DD/MM/YYYY'], true).isValid()) {
      return dayjs(str).format('DD MMMM, YYYY');
    }
    return str;
  };

  const getLabel = (key: string, customLabel?: string): string => {
    if (customLabel) return customLabel;
    return (
      titleMap[key] ||
      key
        .split(/_|(?=[A-Z])/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ')
    );
  };

  const fullName =
    `${allFields.firstName || ''} ${allFields.middleName || ''} ${allFields.lastName || ''}`.trim() ||
    '-';
  const customLabel = (field: any) => field.label || getLabel(field.fieldName);
  const leftItems: { label: string; value: string }[] = [
    { label: 'Full Name', value: fullName },
    { label: 'Gender', value: getDisplayValue('gender', allFields.gender) },
    ...emergencyContactFields.slice(0, 1).map((field: any) => ({
      label: customLabel(field),
      value: getDisplayValue(field.fieldName, allFields[field.fieldName]),
    })),
  ];
  const rightItems: { label: string; value: string }[] = [
    {
      label: 'Phone Number',
      value: getDisplayValue('phoneNumber', allFields.phoneNumber),
    },
    {
      label: 'Nationality',
      value: getDisplayValue('nationality', allFields.nationality),
    },
    ...emergencyContactFields.slice(1).map((field: any) => ({
      label: customLabel(field),
      value: getDisplayValue(field.fieldName, allFields[field.fieldName]),
    })),
  ];

  const FieldBlock = ({
    label,
    value,
    dataCy,
  }: {
    label: string;
    value: string;
    dataCy: string;
  }) => (
    <div className="mb-5" id={dataCy} data-cy={dataCy}>
      <p
        className="text-xs text-gray-500 font-medium m-0 mb-0.5"
        data-cy={`${dataCy}-label`}
      >
        {label}
      </p>
      <p
        className="text-base font-semibold text-gray-500 m-0"
        data-cy={`${dataCy}-value`}
      >
        {value}
      </p>
    </div>
  );

  return (
    <Card
      loading={isLoading}
      title={
        !edit.emergencyContact ? (
          <span
            className="text-base font-bold text-gray-900"
            data-cy="emergency-contact-card-title"
          >
            Emergency Contact Information
          </span>
        ) : null
      }
      extra={
        !edit.emergencyContact ? (
          <AccessGuard
            permissions={[Permissions.UpdateEmployeeDetails]}
            selfShouldAccess
            id={id}
            data-cy="emergency-contact-edit-guard"
          >
            <button
              type="button"
              onClick={() => handleEditChange('emergencyContact')}
              className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
              id="emergency-contact-edit-icon"
              data-cy="emergency-contact-edit-icon"
            >
              <LuPencil size={16} className="text-black" />
            </button>
          </AccessGuard>
        ) : null
      }
      className="emergency-contact-card rounded-lg border border-gray-200"
      id="emergency-contact-card"
      data-cy="emergency-contact-card"
      headStyle={{ borderBottom: 'none' }}
    >
      {edit.emergencyContact ? (
        <Form
          form={form}
          onFinish={(values) => handleSaveChanges('emergencyContact', values)}
          layout="vertical"
          style={{ display: edit ? 'block' : 'none' }}
          initialValues={allFields}
          id="emergency-contact-form"
          data-cy="emergency-contact-form"
        >
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
                data-cy="emergency-contact-form-title"
                className="text-sm font-normal text-black"
              >
                Emergency Contact Information
              </span>
            </Col>
            <Col>
              <div
                data-cy="emergency-contact-form-buttons"
                className="flex items-center gap-2"
              >
                <Button
                  type="default"
                  size="small"
                  icon={<CloseIcon fontSize="small" className="text-red-500" />}
                  onClick={() => setEdit('emergencyContact')}
                  id="emergency-contact-cancel-btn"
                  data-cy="emergency-contact-cancel-btn"
                  className="border border-red-500"
                  style={{ height: 32, minHeight: 32, width: 32, minWidth: 32 }}
                />
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckIcon />}
                  htmlType="submit"
                  id="emergency-contact-submit-btn"
                  data-cy="emergency-contact-submit-btn"
                  style={{ height: 32, minHeight: 32, width: 32, minWidth: 32 }}
                />
              </div>
            </Col>
          </Row>
          <Row
            gutter={[16, 24]}
            id="emergency-contact-form-row"
            data-cy="emergency-contact-form-row"
          >
            <Col
              className="w-full"
              lg={24}
              sm={24}
              xs={24}
              id="emergency-contact-form-col"
              data-cy="emergency-contact-form-col"
            >
              {Object.entries(allFields).map(([key, val]) => (
                <Form.Item
                  key={key}
                  name={key}
                  label={
                    titleMap[key] ||
                    key
                      .split('_')
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(' ')
                  }
                  id={`emergency-contact-${key}-form-item`}
                  data-cy={`emergency-contact-${key}-form-item`}
                  rules={[
                    {
                      /*  eslint-disable-next-line @typescript-eslint/naming-convention */
                      validator: (_rule: any, value: any) => {
                        /*  eslint-enable-next-line @typescript-eslint/naming-convention */
                        let fieldValidation = getFieldValidation(key);

                        switch (key) {
                          case 'phoneNumber':
                            fieldValidation = 'number';
                            break;
                          case 'firstName':
                          case 'middleName':
                          case 'lastName':
                          case 'gender':
                            fieldValidation = 'text';
                            break;
                          case 'nationality':
                            fieldValidation = 'any'; // Assuming nationality should be text-based
                            break;
                          default:
                            fieldValidation = getFieldValidation(key) || 'any';
                        }

                        const validationError = validateField(
                          key,
                          value,
                          fieldValidation,
                        );
                        if (validationError)
                          return Promise.reject(new Error(validationError));
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  {key === 'gender' ? (
                    <Select
                      placeholder={`Select ${key}`}
                      allowClear
                      defaultValue={val}
                      id={`emergency-contact-${key}-select`}
                      data-cy={`emergency-contact-${key}-select`}
                    >
                      <Option
                        value="male"
                        id={`emergency-contact-${key}-option-male`}
                        data-cy={`emergency-contact-${key}-option-male`}
                      >
                        Male
                      </Option>
                      <Option
                        value="female"
                        id={`emergency-contact-${key}-option-female`}
                        data-cy={`emergency-contact-${key}-option-female`}
                      >
                        Female
                      </Option>
                    </Select>
                  ) : key === 'nationality' ? (
                    <Select
                      placeholder={`Select ${key}`}
                      allowClear
                      defaultValue={val}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        String(option?.children || '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      id={`emergency-contact-${key}-select`}
                      data-cy={`emergency-contact-${key}-select`}
                    >
                      {nationalities?.items?.map(
                        (nationality: any, index: number) => (
                          <Option
                            key={index}
                            value={nationality?.id}
                            id={`emergency-contact-${key}-option-${nationality?.id}`}
                            data-cy={`emergency-contact-${key}-option-${nationality?.id}`}
                          >
                            {nationality?.name}
                          </Option>
                        ),
                      )}
                    </Select>
                  ) : (
                    <Input
                      placeholder={key.replace(/_/g, ' ')}
                      defaultValue={val?.toString()}
                      id={`emergency-contact-${key}-input`}
                      data-cy={`emergency-contact-${key}-input`}
                    />
                  )}
                </Form.Item>
              ))}
            </Col>
          </Row>
        </Form>
      ) : (
        <Row
          gutter={[24, 0]}
          id="emergency-contact-display-row"
          data-cy="emergency-contact-display-row"
        >
          <Col
            lg={12}
            sm={24}
            id="emergency-contact-display-col-left"
            data-cy="emergency-contact-display-col-left"
            className="flex flex-col"
          >
            {leftItems.map((item, index) => (
              <FieldBlock
                key={item.label + index}
                label={item.label}
                value={item.value}
                dataCy={`emergency-contact-display-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
              />
            ))}
          </Col>
          <Col
            lg={12}
            sm={24}
            id="emergency-contact-display-col-right"
            data-cy="emergency-contact-display-col-right"
            className="flex flex-col"
          >
            {rightItems.map((item, index) => (
              <FieldBlock
                key={item.label + index}
                label={item.label}
                value={item.value}
                dataCy={`emergency-contact-display-${item.label.replace(/\s+/g, '-').toLowerCase()}-right`}
              />
            ))}
          </Col>
        </Row>
      )}
    </Card>
  );
}

export default EmergencyContact;
