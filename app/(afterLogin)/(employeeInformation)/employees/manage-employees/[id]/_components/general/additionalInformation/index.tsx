import React from 'react';
import { Card, Col, Input, Form, Row, Button, Select } from 'antd';

import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { LuPencil } from 'react-icons/lu';
import { InfoLine } from '../../common/infoLine';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import { validateField } from '../../../../_components/formValidator';
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

        <Form.Item
          className="mt-6"
          id="additional-information-submit-form-item"
          data-cy="additional-information-submit-form-item"
        >
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            id="additional-information-submit-btn"
            data-cy="additional-information-submit-btn"
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const titleMap: Record<string, string> = {
    educationalStatusDegree: 'Educational Status',
    educationalStatusMaster: 'Educational Status Master',
    pensionNumber: 'Pension Number',
    tinNumber: 'TIN',
  };

  return (
    <Card
      loading={isLoading}
      title="Additional Information"
      extra={
        <AccessGuard
          permissions={[Permissions.UpdateEmployeeDetails]}
          selfShouldAccess
          id={id}
          data-cy="additional-information-edit-guard"
        >
          <LuPencil
            className="cursor-pointer"
            onClick={() => handleEditChange('additionalInformation')}
            id="additional-information-edit-icon"
            data-cy="additional-information-edit-icon"
          />
        </AccessGuard>
      }
      className="my-6"
      id="additional-information-card"
      data-cy="additional-information-card"
    >
      {edit.additionalInformation ? (
        <AdditionalInformationForm data-cy="additional-information-form" />
      ) : (
        <Row
          gutter={[16, 24]}
          id="additional-information-display-row"
          data-cy="additional-information-display-row"
        >
          <Col
            lg={16}
            id="additional-information-display-col"
            data-cy="additional-information-display-col"
          >
            {Object.entries(allFields).map(([key, val]) => {
              const displayValue =
                key === 'nationality'
                  ? nationalities?.items?.find((item) => item.id === val)
                      ?.name || '-'
                  : val?.toString() || '-';
              const title =
                titleMap[key] ||
                key
                  .split('_')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
              return (
                <InfoLine
                  key={key}
                  title={title}
                  value={displayValue}
                  data-cy={`additional-information-display-${key}`}
                />
              );
            })}
          </Col>
        </Row>
      )}
    </Card>
  );
}

export default AdditionalInformation;
