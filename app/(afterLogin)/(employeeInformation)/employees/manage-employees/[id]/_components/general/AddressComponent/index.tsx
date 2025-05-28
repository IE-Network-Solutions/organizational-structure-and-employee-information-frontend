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

const AddressComponent = ({
  mergedFields,
  id,
  handleSaveChanges,
}: {
  mergedFields: any;
  id: string;
  handleSaveChanges: any;
}) => {
  const { setEdit, edit } = useEmployeeManagementStore();
  const { isLoading, data: employeeData } = useGetEmployee(id);
  const [form] = Form.useForm();
  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };

  const getFieldValidation = (fieldName: string) => {
    return (
      mergedFields?.find((field: any) => field?.fieldName === fieldName)
        ?.fieldValidation ?? 'any'
    );
  };

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
          initialValues={employeeData?.employeeInformation?.addresses || {}}
        >
          <Row gutter={[16, 24]}>
            <Col lg={16}>
              {Object.entries(
                employeeData?.employeeInformation?.addresses || {
                  country: '',
                  city: '',
                },
              ).map(([key, val]) => (
                <Form.Item
                  key={key}
                  name={key}
                  label={key}
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
                          case 'subCity':
                            fieldValidation = 'any';
                            break;

                          case 'country':
                          case 'city':
                            fieldValidation = 'text';
                            break;

                          default:
                            fieldValidation = getFieldValidation(key);
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
                  <Input placeholder={key} defaultValue={val?.toString()} />
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
            {Object.entries(
              employeeData?.employeeInformation?.addresses || {},
            ).map(([key, val]) => (
              <InfoLine
                key={key}
                title={(titleMap[key] || key).replace('address', '')}
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
