import React from 'react';
import { Card, Col, Input, Form, Row, Button } from 'antd';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { LuPencil } from 'react-icons/lu';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { validateField } from '../../../../_components/formValidator';
import dayjs from 'dayjs';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

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

  // Filter custom fields for address section
  const addressFields =
    mergedFields?.filter((field: any) => field?.formTitle === 'address') || [];

  // Merge existing employee data with custom fields
  const existingData = employeeData?.employeeInformation?.addresses || {};
  const defaultFields = {
    country: '',
    city: '',
  };
  const allFields = { ...defaultFields, ...existingData };

  // Add custom fields to allFields if they don't exist
  addressFields.forEach((field: any) => {
    if (!(field.fieldName in allFields)) {
      allFields[field.fieldName] = '';
    }
  });

  const titleMap: Record<string, string> = {
    phoneNumber: 'Phone Number',
    country: 'Country',
    city: 'City',
    subCity: 'Sub City',
  };

  const getDisplayValue = (key: string, val: unknown): string => {
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

  const customLabel = (field: any) => field.label || getLabel(field.fieldName);

  // Get all fields from allFields (including default and custom)
  const allFieldKeys = Object.keys(allFields);

  // Create items for all fields
  const allItems = allFieldKeys.map((key) => {
    // Check if it's a custom field
    const customField = addressFields.find(
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
        !edit.addresses ? (
        <span
          className="text-base font-bold text-gray-900"
          data-cy="address-card-title"
        >
          Address
        </span>
        ) : null
      }
      extra={
        !edit.addresses ? (
        <AccessGuard
          permissions={[Permissions.UpdateEmployeeDetails]}
          selfShouldAccess
          id={id}
          data-cy="address-edit-guard"
        >
          <button
            type="button"
            onClick={() => handleEditChange('addresses')}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
            id="address-edit-icon"
            data-cy="address-edit-icon"
          >
            <LuPencil size={16} className="text-black" />
          </button>
        </AccessGuard>
        ) : null
      }
      className="address-card rounded-lg border border-gray-200 my-6"
      id="address-card"
      data-cy="address-card"
      headStyle={{ borderBottom: 'none' }}
    >
      {edit.addresses ? (
        <Form
          form={form}
          onFinish={(values) => handleSaveChanges('addresses', values)}
          layout="vertical"
          style={{ display: edit ? 'block' : 'none' }} // Hide form when not in edit mode
          initialValues={allFields}
          id="address-form"
          data-cy="address-form"
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
          <span className="text-sm font-normal text-black">
            Address
          </span>
        </Col>
        <Col>
          <div className="flex items-center gap-2">
          <Button
            type="default"
            size="small"
            icon={<CloseIcon fontSize="small" className="text-red-500" />}
            onClick={() => setEdit('addresses')}
            id="address-cancel-btn"
            data-cy="address-cancel-btn"
            className="border border-red-500"
            style={{ height: 32, minHeight: 32, width: 32, minWidth: 32 }}
          />
          <Button
            type="primary"
            size="small"
            icon={<CheckIcon  />}
            htmlType="submit"
            id="address-submit-btn"
            data-cy="address-submit-btn"
            style={{ height: 32, minHeight: 32, width: 32, minWidth: 32 }}
          />
          </div>
        </Col>
      </Row>
          <Row
            gutter={[16, 24]}
            id="address-form-row"
            data-cy="address-form-row"
          >
            <Col lg={24} id="address-form-col" data-cy="address-form-col">
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
                  id={`address-${key}-form-item`}
                  data-cy={`address-${key}-form-item`}
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
                    id={`address-${key}-input`}
                    data-cy={`address-${key}-input`}
                  />
                </Form.Item>
              ))}
            </Col>
          </Row>
        </Form>
      ) : (
        <Row
          gutter={[24, 0]}
          id="address-display-row"
          data-cy="address-display-row"
        >
          <Col
            lg={12}
            id="address-display-col-left"
            data-cy="address-display-col-left"
            className="flex flex-col"
          >
            {leftItems.map((item) => (
              <FieldBlock
                key={item.key}
                label={item.label}
                value={item.value}
                dataCy={`address-display-${item.key}`}
              />
            ))}
          </Col>
          <Col
            lg={12}
            id="address-display-col-right"
            data-cy="address-display-col-right"
            className="flex flex-col"
          >
            {rightItems.map((item) => (
              <FieldBlock
                key={item.key}
                label={item.label}
                value={item.value}
                dataCy={`address-display-${item.key}-right`}
              />
            ))}
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default AddressComponent;
