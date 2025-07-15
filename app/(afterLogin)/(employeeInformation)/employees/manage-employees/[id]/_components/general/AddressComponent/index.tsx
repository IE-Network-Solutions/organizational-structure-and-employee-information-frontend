import React from 'react';
import { Card, Col, Input, Form, Row, Button } from 'antd';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { LuPencil } from 'react-icons/lu';
import { InfoLine } from '../../common/infoLine';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { validateField } from '../../../../_components/formValidator';

// Define interfaces for better type safety
interface FormField {
  fieldName: string;
  fieldType: string;
  fieldValidation?: string;
  isActive: boolean;
  id: string;
  options?: string[];
  formTitle: string;
}

interface AddressData {
  country: string;
  city: string;
  [key: string]: string | undefined;
}

interface AddressComponentProps {
  mergedFields: FormField[];
  id: string;
  handleSaveChanges: (
    editKey: keyof EditState,
    values: Record<string, unknown>,
  ) => void;
}

const AddressComponent: React.FC<AddressComponentProps> = ({
  mergedFields,
  id,
  handleSaveChanges,
}) => {
  const { setEdit, edit } = useEmployeeManagementStore();
  const { isLoading, data: employeeData } = useGetEmployee(id);
  const [form] = Form.useForm();
  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };

  const getFieldValidation = (fieldName: string): string => {
    return (
      mergedFields?.find((field: FormField) => field?.fieldName === fieldName)
        ?.fieldValidation ?? 'any'
    );
  };

  // Filter custom fields for address section
  const addressFields: FormField[] =
    mergedFields?.filter(
      (field: FormField) => field?.formTitle === 'address',
    ) || [];

  // Merge existing employee data with custom fields
  const existingData = employeeData?.employeeInformation?.addresses || {};
  const defaultFields: AddressData = {
    country: '',
    city: '',
  };
  const allFields: AddressData = { ...defaultFields, ...existingData };

  // Add custom fields to allFields if they don't exist
  addressFields.forEach((field: FormField) => {
    if (!(field.fieldName in allFields)) {
      allFields[field.fieldName] = '';
    }
  });

  const titleMap: Record<string, string> = {
    phoneNumber: 'Phone Number',
  };

  return (
    <Card
      loading={isLoading}
      title="Address"
      extra={
        <AccessGuard
          permissions={[Permissions.UpdateEmployeeDetails]}
          selfShouldAccess
          id={id}
        >
          <LuPencil
            className="cursor-pointer"
            onClick={() => handleEditChange('addresses')}
          />
        </AccessGuard>
      }
      className="my-6"
    >
      {edit.addresses ? (
        <Form
          form={form}
          onFinish={(values) => handleSaveChanges('addresses', values)}
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
                      validator: (_rule: unknown, value: unknown) => {
                        /*  eslint-enable-next-line @typescript-eslint/naming-convention */
                        let fieldValidation = getFieldValidation(key);

                        switch (key) {
                          case 'phoneNumber':
                            fieldValidation = 'number';
                            break;
                          case 'firstName':
                          case 'middleName':
                          case 'lastName':
                          case 'subCity':
                            fieldValidation = 'any';
                            break;

                          case 'country':
                          case 'city':
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
                title={(
                  titleMap[key] ||
                  key
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
                ).replace('address', '')}
                value={val?.toString() || '-'}
              />
            ))}
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default AddressComponent;
