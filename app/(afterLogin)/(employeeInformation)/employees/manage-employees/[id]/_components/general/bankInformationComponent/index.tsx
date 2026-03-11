import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { Card, Col, Input, Form, Row, Button } from 'antd';
import React from 'react';
import { LuPencil } from 'react-icons/lu';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { validateField } from '../../../../_components/formValidator';
import dayjs from 'dayjs';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

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
    tinNumber: 'TIN Number',
    branch: 'Branch',
    accountName: 'Account Name',
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

  // Get all default fields (show all, even if empty)
  const defaultFieldKeys = Object.keys(defaultFields);
  const defaultFieldItems = defaultFieldKeys.map((key) => ({
    label: getLabel(key),
    value: getDisplayValue(key, allFields[key]),
    key,
  }));

  // Get custom fields
  const customFieldItems = bankInformationFields.map((field: any) => ({
    label: customLabel(field),
    value: getDisplayValue(field.fieldName, allFields[field.fieldName]),
    key: field.fieldName,
  }));

  // Combine all items
  const allItems = [...defaultFieldItems, ...customFieldItems];

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
        !edit.bankInformation ? (
          <span
            className="text-base font-bold text-gray-900"
            data-cy="bank-information-card-title"
          >
            Bank Information
          </span>
        ) : null
      }
      extra={
        !edit.bankInformation ? (
          <AccessGuard
            permissions={[Permissions.UpdateEmployeeDetails]}
            selfShouldAccess
            id={id}
            data-cy="bank-information-edit-guard"
          >
            <button
              type="button"
              onClick={() => handleEditChange('bankInformation')}
              className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
              id="bank-information-edit-icon"
              data-cy="bank-information-edit-icon"
            >
              <LuPencil size={16} className="text-black" />
            </button>
          </AccessGuard>
        ) : null
      }
      className="bank-information-card rounded-lg border border-gray-200 my-6"
      id="bank-information-card"
      data-cy="bank-information-card"
      headStyle={{ borderBottom: 'none' }}
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
            justify="space-between"
            align="middle"
            className="mb-4 w-full"
            style={{ width: '100%' }}
            id="personal-data-update-user-info-header-row"
            data-cy="personal-data-update-user-info-header-row"
          >
            <Col>
              <span
                data-cy="bank-information-form-title"
                className="text-sm font-normal text-black"
              >
                Bank Information
              </span>
            </Col>
            <Col>
              <div
                data-cy="bank-information-form-buttons"
                className="flex items-center gap-2"
              >
                <Button
                  type="default"
                  size="small"
                  icon={<CloseIcon fontSize="small" className="text-red-500" />}
                  onClick={() => setEdit('bankInformation')}
                  id="bank-information-cancel-btn"
                  data-cy="bank-information-cancel-btn"
                  className="border border-red-500"
                  style={{ height: 32, minHeight: 32, width: 32, minWidth: 32 }}
                />
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckIcon />}
                  htmlType="submit"
                  id="bank-information-submit-btn"
                  data-cy="bank-information-submit-btn"
                  style={{ height: 32, minHeight: 32, width: 32, minWidth: 32 }}
                />
              </div>
            </Col>
          </Row>
          <Row
            gutter={[16, 24]}
            id="bank-information-form-row"
            data-cy="bank-information-form-row"
          >
            <Col
              lg={24}
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
        </Form>
      ) : (
        <Row
          gutter={[24, 0]}
          id="bank-information-display-row"
          data-cy="bank-information-display-row"
        >
          <Col
            lg={12}
            id="bank-information-display-col-left"
            data-cy="bank-information-display-col-left"
            className="flex flex-col"
          >
            {leftItems.map((item) => (
              <FieldBlock
                key={item.key}
                label={item.label}
                value={item.value}
                dataCy={`bank-information-display-${item.key}`}
              />
            ))}
          </Col>
          <Col
            lg={12}
            id="bank-information-display-col-right"
            data-cy="bank-information-display-col-right"
            className="flex flex-col"
          >
            {rightItems.map((item) => (
              <FieldBlock
                key={item.key}
                label={item.label}
                value={item.value}
                dataCy={`bank-information-display-${item.key}-right`}
              />
            ))}
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default BankInformationComponent;
