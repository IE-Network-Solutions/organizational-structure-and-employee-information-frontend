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
          data-cy="bank-information-edit-guard"
        >
          <LuPencil
            className="cursor-pointer"
            onClick={() => handleEditChange('bankInformation')}
            id="bank-information-edit-icon"
            data-cy="bank-information-edit-icon"
          />
        </AccessGuard>
      }
      className="my-6"
      id="bank-information-card"
      data-cy="bank-information-card"
    >
      {edit.bankInformation ? (
        <Form
          form={form}
          onFinish={(values) => handleSaveChanges('bankInformation', values)}
          layout="vertical"
          style={{ display: edit ? 'block' : 'none' }} // Hide form when not in edit mode
          initialValues={allFields}
          id="bank-information-form"
          data-cy="bank-information-form"
        >
          <Row
            gutter={[16, 24]}
            id="bank-information-form-row"
            data-cy="bank-information-form-row"
          >
            <Col
              lg={16}
              id="bank-information-form-col"
              data-cy="bank-information-form-col"
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
                  id={`bank-information-${key}-form-item`}
                  data-cy={`bank-information-${key}-form-item`}
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
                    id={`bank-information-${key}-input`}
                    data-cy={`bank-information-${key}-input`}
                  />
                </Form.Item>
              ))}
            </Col>
          </Row>
          <Row
            id="bank-information-submit-row"
            data-cy="bank-information-submit-row"
          >
            <Col
              span={24}
              style={{ textAlign: 'right' }}
              id="bank-information-submit-col"
              data-cy="bank-information-submit-col"
            >
              <Button
                type="primary"
                htmlType="submit"
                id="bank-information-submit-btn"
                data-cy="bank-information-submit-btn"
              >
                Save Changes
              </Button>
            </Col>
          </Row>
        </Form>
      ) : (
        <Row
          gutter={[16, 24]}
          id="bank-information-display-row"
          data-cy="bank-information-display-row"
        >
          <Col
            lg={16}
            id="bank-information-display-col"
            data-cy="bank-information-display-col"
          >
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
                data-cy={`bank-information-display-${key}-info-line`}
              />
            ))}
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default BankInformationComponent;
