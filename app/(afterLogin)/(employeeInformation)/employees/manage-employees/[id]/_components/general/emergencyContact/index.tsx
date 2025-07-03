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

  return (
    <Card
      loading={isLoading}
      title="Emergency Contact"
      extra={
        <AccessGuard
          permissions={[Permissions.UpdateEmployeeDetails]}
          selfShouldAccess
          id={id}
        >
          <LuPencil
            className="cursor-pointer"
            onClick={() => handleEditChange('emergencyContact')}
          />
        </AccessGuard>
      }
      className="my-6"
    >
      {edit.emergencyContact ? (
        <Form
          form={form}
          onFinish={(values) => handleSaveChanges('emergencyContact', values)}
          layout="vertical"
          style={{ display: edit ? 'block' : 'none' }}
          initialValues={allFields}
        >
          <Row gutter={[16, 24]}>
            <Col lg={16}>
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
                    >
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                    </Select>
                  ) : key === 'nationality' ? (
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
                  ) : (
                    <Input
                      placeholder={key.replace(/_/g, ' ')}
                      defaultValue={val?.toString()}
                    />
                  )}
                </Form.Item>
              ))}
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
            </Col>
          </Row>
        </Form>
      ) : (
        <Row gutter={[16, 24]}>
          <Col lg={16}>
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
              return <InfoLine key={key} title={title} value={displayValue} />;
            })}
          </Col>
        </Row>
      )}
    </Card>
  );
}

export default EmergencyContact;
