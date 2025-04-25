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

  const AdditionalInformationForm = () => {
    return (
      <Form
        form={form}
        layout="vertical"
        initialValues={
          employeeData?.employeeInformation?.additionalInformation || {}
        }
        onFinish={(values) =>
          handleSaveChanges('additionalInformation', values)
        }
      >
        {Object.entries(
          employeeData?.employeeInformation?.additionalInformation || {},
        ).map(([key, val]) => (
          <Form.Item
            key={key}
            name={key}
            label={key
              .split('_')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
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
                        fieldValidation = 'any'; // fallback function
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
                    >
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                    </Select>
                  );

                case 'nationality':
                  return (
                    <Select
                      placeholder={`Select ${key}`}
                      allowClear
                      defaultValue={val}
                    >
                      {nationalities?.items?.map(
                        (nationality: any, index: number) => (
                          <Option key={index} value={nationality?.id}>
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
                    />
                  );
              }
            })()}
          </Form.Item>
        ))}

        <Form.Item className="mt-6">
          <Button type="primary" htmlType="submit" loading={isLoading} block>
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
        >
          <LuPencil
            className="cursor-pointer"
            onClick={() => handleEditChange('additionalInformation')}
          />
        </AccessGuard>
      }
      className="my-6"
    >
      {edit.additionalInformation ? (
        <AdditionalInformationForm />
      ) : (
        <Row gutter={[16, 24]}>
          <Col lg={16}>
            {Object.entries(
              employeeData?.employeeInformation?.additionalInformation || {},
            ).map(([key, val]) => {
              const displayValue =
                key === 'nationality'
                  ? nationalities?.items?.find((item) => item.id === val)
                      ?.name || '-'
                  : val?.toString() || '-';
              const title = titleMap[key] || key;
              return <InfoLine key={key} title={title} value={displayValue} />;
            })}
          </Col>
        </Row>
      )}
    </Card>
  );
}

export default AdditionalInformation;
