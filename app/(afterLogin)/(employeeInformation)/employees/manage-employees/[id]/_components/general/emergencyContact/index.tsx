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

function EmergencyContact({mergedFields, handleSaveChanges, id }: any) {
  const { setEdit, edit } = useEmployeeManagementStore();
  const { isLoading, data: employeeData } = useGetEmployee(id);
  const { data: nationalities } = useGetNationalities();

  const [form] = Form.useForm();
  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };

  const getFieldValidation=(fieldName:string)=>{
    return mergedFields?.find((field:any)=>field?.fieldName===fieldName)?.fieldValidation ?? null
  }

  // console.log(getFieldValidation('test_field_name'),"getFieldValidation")

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
          initialValues={
            employeeData?.employeeInformation?.emergencyContact || {}
          }
        >
          <Row gutter={[16, 24]}>
            <Col lg={16}>
              {Object.entries(
                employeeData?.employeeInformation?.emergencyContact || {
                  firstName: '',
                  middleName: '',
                  lastName: '',
                  phoneNumber: '',
                  gender: '',
                  nationality: '',
                },
              ).map(([key, val]) => (
                <Form.Item
                  key={key}
                  name={key}
                  label={key}
                  rules={[
                    {
                      validator: (_rule: any, value: any) => {
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
                            fieldValidation = getFieldValidation(key);
                        }
                  
                        const validationError = validateField(key, value, fieldValidation);
                        if (validationError) return Promise.reject(new Error(validationError));
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
                    <Input placeholder={key} defaultValue={val?.toString()} />
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
            {Object.entries(
              employeeData?.employeeInformation?.emergencyContact || {},
            ).map(([key, val]) => {
              const displayValue =
                key === 'nationality'
                  ? nationalities?.items?.find((item) => item.id === val)
                      ?.name || '-'
                  : val?.toString() || '-';
              return <InfoLine key={key} title={key} value={displayValue} />;
            })}
          </Col>
        </Row>
      )}
    </Card>
  );
}

export default EmergencyContact;
