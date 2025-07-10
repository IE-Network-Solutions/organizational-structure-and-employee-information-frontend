import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { Card, Col, Input, Form, Row, Button } from 'antd';
import React from 'react';
import { LuPencil } from 'react-icons/lu';
import { InfoLine } from '../../common/infoLine';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { validateField } from '../../../../_components/formValidator';

const BankInformationComponent = ({
  mergedFields,
  handleSaveChanges,
  id,
}: any) => {
  const { setEdit, edit } = useEmployeeManagementStore();
  const { isLoading, data: employeeData } = useGetEmployee(id);

  const [form] = Form.useForm();

  const getFieldValidation = (fieldName: string) => {
    return (
      mergedFields?.find((field: any) => field?.fieldName === fieldName)
        ?.fieldValidation ?? null
    );
  };

  // Filter custom fields for bankInformation section
  const bankInformationFields =
    mergedFields?.filter(
      (field: any) => field?.formTitle === 'bankInformation',
    ) || [];

  // Merge existing employee data with custom fields
  const existingData = employeeData?.employeeInformation?.bankInformation || {};
  const defaultFields = {
    bankName: '',
    branch: '',
    accountName: '',
    accountNumber: '',
  };
  const allFields = { ...defaultFields, ...existingData };

  // Add custom fields to allFields if they don't exist
  bankInformationFields.forEach((field: any) => {
    if (!(field.fieldName in allFields)) {
      allFields[field.fieldName] = '';
    }
  });

  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };
  const titleMap: Record<string, string> = {
    bankName: 'Bank Name',
    accountNumber: 'Account Number',
  };

  return (
    <Card
      loading={isLoading}
      title="Bank Information"
      extra={
        <AccessGuard
          permissions={[Permissions.UpdateEmployeeDetails]}
          selfShouldAccess
          id={id}
        >
          <LuPencil
            className="cursor-pointer"
            onClick={() => handleEditChange('bankInformation')}
          />
        </AccessGuard>
      }
      className="my-6"
    >
      {edit.bankInformation ? (
        <Form
          form={form}
          onFinish={(values) => handleSaveChanges('bankInformation', values)}
          layout="vertical"
          style={{ display: edit ? 'block' : 'none' }} // Hide form when not in edit mode
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
                          case 'accountNumber':
                            fieldValidation = 'any';
                            break;
                          // case 'accountNumber':
                          case 'accountName':
                          case 'branch':
                          case 'bankName':
                            fieldValidation = 'text';
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
                  // rules={
                  //   ['bankName', 'accountNumber'].includes(key)
                  //     ? [{ required: true, message: `Please enter the ${key}` }]
                  //     : []
                  // }
                >
                  <Input
                    placeholder={key.replace(/_/g, ' ')}
                    defaultValue={val?.toString()}
                  />
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
            {Object.entries(allFields).map(([key, val]) => (
              <InfoLine
                key={key}
                title={
                  titleMap[key] ||
                  key
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
                }
                value={val?.toString() || '-'}
              />
            ))}
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default BankInformationComponent;
