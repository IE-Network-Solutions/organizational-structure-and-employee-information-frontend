import React from 'react';
import { Card, Col, Input, Form, Row, Button, Select } from 'antd';

import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import { validateField } from '../../../../_components/formValidator';
import dayjs from 'dayjs';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

const { Option } = Select;

function AdditionalInformation({ mergedFields, handleSaveChanges, id }: any) {
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

  // Filter custom fields for additionalInformation section
  const additionalInformationFields =
    mergedFields?.filter(
      (field: any) => field?.formTitle === 'additionalInformation',
    ) || [];

  // Merge existing employee data with custom fields
  const existingData =
    employeeData?.employeeInformation?.additionalInformation || {};
  const allFields = { ...existingData };

  // Add custom fields to allFields if they don't exist
  additionalInformationFields.forEach((field: any) => {
    if (!(field.fieldName in allFields)) {
      allFields[field.fieldName] = '';
    }
  });

  const AdditionalInformationForm = () => {
    return (
      <Form
        form={form}
        layout="vertical"
        initialValues={allFields}
        onFinish={(values) =>
          handleSaveChanges('additionalInformation', values)
        }
        id="additional-information-form"
        data-cy="additional-information-form"
      >
        <Row
          justify="space-between"
          align="middle"
          className="mb-4 w-full"
          style={{ width: '100%' }}
          id="additional-information-header-row"
          data-cy="additional-information-header-row"
        >
          <Col>
            <span
              data-cy="additional-information-form-title"
              className="text-sm font-normal text-[#4d4d4d]"
            >
              Additional Information
            </span>
          </Col>
          <Col>
            <div
              data-cy="additional-information-form-buttons"
              className="flex items-center gap-2"
            >
              <Button
                type="default"
                size="small"
                onClick={() => setEdit('additionalInformation')}
                id="additional-information-cancel-btn"
                data-cy="additional-information-cancel-btn"
                className="border border-red-500 h-6 w-6"
              >
                <CloseIcon className="text-red-500 text-[10px]" />
              </Button>
              <Button
                type="primary"
                size="small"
                loading={isLoading}
                htmlType="submit"
                id="additional-information-submit-btn"
                data-cy="additional-information-submit-btn"
                className="h-6 w-6"
              >
                <CheckIcon className="text-white text-[10px]" />
              </Button>
            </div>
          </Col>
        </Row>
        {Object.entries(allFields).map(([key, val]) => (
          <Form.Item
            key={key}
            name={key}
            label={key
              .split('_')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
            id={`additional-information-${key}-form-item`}
            data-cy={`additional-information-${key}-form-item`}
            rules={[
              {
                /*  eslint-disable-next-line @typescript-eslint/naming-convention */
                validator: (_rule: any, value: any) => {
                  /*  eslint-enable-next-line @typescript-eslint/naming-convention */
                  let fieldValidation = getFieldValidation(key);

                  if (key.toLowerCase().includes('number')) {
                    fieldValidation = 'number';
                  } else {
                    switch (key) {
                      case 'firstName':
                      case 'middleName':
                      case 'lastName':
                      case 'gender':
                        fieldValidation = 'text';
                        break;
                      case 'nationality':
                        fieldValidation = 'any'; // You can change to 'text' if stricter validation is needed
                        break;
                      default:
                        fieldValidation = getFieldValidation(key) || 'any'; // fallback function
                    }
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
            {(() => {
              // Determine input type based on key and value
              switch (key) {
                case 'gender':
                  return (
                    <Select
                      placeholder={`Select ${key}`}
                      allowClear
                      defaultValue={val}
                      id={`additional-information-${key}-select`}
                      data-cy={`additional-information-${key}-select`}
                    >
                      <Option
                        value="male"
                        id={`additional-information-${key}-option-male`}
                        data-cy={`additional-information-${key}-option-male`}
                      >
                        Male
                      </Option>
                      <Option
                        value="female"
                        id={`additional-information-${key}-option-female`}
                        data-cy={`additional-information-${key}-option-female`}
                      >
                        Female
                      </Option>
                    </Select>
                  );

                case 'nationality':
                  return (
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
                      id={`additional-information-${key}-select`}
                      data-cy={`additional-information-${key}-select`}
                    >
                      {nationalities?.items?.map(
                        (nationality: any, index: number) => (
                          <Option
                            key={index}
                            value={nationality?.id}
                            id={`additional-information-${key}-option-${nationality?.id}`}
                            data-cy={`additional-information-${key}-option-${nationality?.id}`}
                          >
                            {nationality?.name}
                          </Option>
                        ),
                      )}
                    </Select>
                  );

                default:
                  return (
                    <Input
                      placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                      defaultValue={val?.toString()}
                      id={`additional-information-${key}-input`}
                      data-cy={`additional-information-${key}-input`}
                    />
                  );
              }
            })()}
          </Form.Item>
        ))}
      </Form>
    );
  };

  const titleMap: Record<string, string> = {
    educationalStatusDegree: 'Educational Status',
    educationalStatusMaster: 'Educational Status Master',
    pensionNumber: 'Pension Number',
    tinNumber: 'TIN',
    maritalStatus: 'Marital Status',
    joinedDate: 'Joined Date',
  };

  const getDisplayValue = (key: string, val: unknown): string => {
    if (key === 'nationality') {
      return (
        nationalities?.items?.find((item: any) => item.id === val)?.name || '-'
      );
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

  const customLabel = (field: any) =>
    field.label || getLabel(field.fieldName) + ' (Custom)';

  // Get all fields from allFields (including custom)
  const allFieldKeys = Object.keys(allFields);

  // Create items for all fields
  const allItems = allFieldKeys.map((key) => {
    // Check if it's a custom field
    const customField = additionalInformationFields.find(
      (field: any) => field.fieldName === key,
    );
    const isCustomField = !!customField;

    return {
      label: isCustomField ? customLabel(customField) : getLabel(key),
      value: getDisplayValue(key, allFields[key]),
      key,
    };
  });

  // Split into two columns - distribute evenly
  const midPoint = Math.ceil(allItems.length / 2);
  const leftItems = allItems.slice(0, midPoint);
  const rightItems = allItems.slice(midPoint);

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
        className="text-sm text-[#4d4d4d] font-normal m-0 mb-0.5"
        data-cy={`${dataCy}-label`}
      >
        {label}
      </p>
      <p
        className="text-base font-normal text-[#4d4d4d] m-0"
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
        !edit.additionalInformation ? (
          <span
            className="text-base font-bold text-[#4d4d4d]"
            data-cy="additional-information-card-title"
          >
            Additional Information
          </span>
        ) : null
      }
      extra={
        !edit.additionalInformation ? (
          <AccessGuard
            permissions={[Permissions.UpdateEmployeeDetails]}
            selfShouldAccess
            id={id}
            data-cy="additional-information-edit-guard"
          >
            <button
              onClick={() => handleEditChange('additionalInformation')}
              className="w-6 h-6 border-[1px] border-[#D9D9D9] rounded-md"
              id="additional-information-edit-icon"
              data-cy="additional-information-edit-icon"
            >
              <EditOutlinedIcon className="text-sm" />
            </button>
          </AccessGuard>
        ) : null
      }
      className="additional-information-card rounded-lg my-6"
      bordered={false}
      style={{ background: '#F9FAFB', boxShadow: 'none' }}
      id="additional-information-card"
      data-cy="additional-information-card"
      headStyle={{
        borderBottom: 'none',
        paddingLeft: '16px',
        paddingRight: '16px',
        background: '#F9FAFB',
      }}
      bodyStyle={{ padding: '12px 16px 12px 16px', background: '#F9FAFB' }}
    >
      {edit.additionalInformation ? (
        <AdditionalInformationForm data-cy="additional-information-form" />
      ) : (
        <Row
          gutter={[24, 0]}
          id="additional-information-display-row"
          data-cy="additional-information-display-row"
        >
          <Col
            lg={12}
            id="additional-information-display-col-left"
            data-cy="additional-information-display-col-left"
            className="flex flex-col"
          >
            {leftItems.map((item) => (
              <FieldBlock
                key={item.key}
                label={item.label}
                value={item.value}
                dataCy={`additional-information-display-${item.key}`}
              />
            ))}
          </Col>
          <Col
            lg={12}
            id="additional-information-display-col-right"
            data-cy="additional-information-display-col-right"
            className="flex flex-col"
          >
            {rightItems.map((item) => (
              <FieldBlock
                key={item.key}
                label={item.label}
                value={item.value}
                dataCy={`additional-information-display-${item.key}-right`}
              />
            ))}
          </Col>
        </Row>
      )}
    </Card>
  );
}

export default AdditionalInformation;
