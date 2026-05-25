import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import {
  BANK_DEFAULT_FIELD_KEYS,
  BANK_DEFAULT_FIELDS,
  bankInformationMatchesSnapshot,
  buildBankFieldsForDisplay,
} from '@/utils/employeeBankInformation';
import { Card, Col, Input, Form, Row, Button } from 'antd';
import React, { useEffect, useMemo, useRef } from 'react';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { validateField } from '../../../../_components/formValidator';
import dayjs from 'dayjs';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

const BankInformationComponent = ({
  mergedFields,
  handleSaveChanges,
  id,
}: any) => {
  const { setEdit, edit, savedBankSnapshot, setSavedBankSnapshot } =
    useEmployeeManagementStore();
  const { isLoading, data: employeeData } = useGetEmployee(id);

  const [form] = Form.useForm();

  useEffect(() => {
    setSavedBankSnapshot(null);
  }, [id, setSavedBankSnapshot]);

  const bankInformationFields = useMemo(
    () =>
      mergedFields?.filter(
        (field: any) => field?.formTitle === 'bankInformation',
      ) || [],
    [mergedFields],
  );

  const customBankFieldsOnly = useMemo(
    () =>
      bankInformationFields.filter(
        (field: any) => !BANK_DEFAULT_FIELD_KEYS.has(field.fieldName),
      ),
    [bankInformationFields],
  );

  const allFields = useMemo(
    () =>
      buildBankFieldsForDisplay(
        employeeData,
        bankInformationFields,
        savedBankSnapshot,
      ),
    [employeeData, bankInformationFields, savedBankSnapshot],
  );

  const wasEditingBankRef = useRef(false);

  // Drop local snapshot once GET /users + employee-information reflects the same bank values.
  useEffect(() => {
    if (
      savedBankSnapshot &&
      bankInformationMatchesSnapshot(
        employeeData?.employeeInformation,
        savedBankSnapshot,
      )
    ) {
      setSavedBankSnapshot(null);
    }
  }, [employeeData?.employeeInformation, savedBankSnapshot]);

  // Only seed the form when entering edit mode — not on every allFields/query change.
  useEffect(() => {
    const justOpened = edit.bankInformation && !wasEditingBankRef.current;
    wasEditingBankRef.current = edit.bankInformation;
    if (justOpened) {
      form.setFieldsValue(
        buildBankFieldsForDisplay(
          employeeData,
          bankInformationFields,
          savedBankSnapshot,
        ),
      );
    }
  }, [
    edit.bankInformation,
    employeeData,
    bankInformationFields,
    savedBankSnapshot,
    form,
  ]);

  const getFieldValidation = (fieldName: string) => {
    return (
      mergedFields?.find((field: any) => field?.fieldName === fieldName)
        ?.fieldValidation ?? null
    );
  };

  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };

  const handleBankSave = (values: Record<string, unknown>) => {
    setSavedBankSnapshot(values);
    handleSaveChanges('bankInformation', values, {
      onSuccess: () => setSavedBankSnapshot(values),
      onError: () => setSavedBankSnapshot(null),
    });
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

  const defaultFieldItems = Object.keys(BANK_DEFAULT_FIELDS).map((key) => ({
    label: getLabel(key),
    value: getDisplayValue(key, allFields[key]),
    key,
  }));

  const customFieldItems = customBankFieldsOnly.map((field: any) => ({
    label: customLabel(field),
    value: getDisplayValue(field.fieldName, allFields[field.fieldName]),
    key: field.fieldName,
  }));

  const allItems = [...defaultFieldItems, ...customFieldItems];

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
        className="text-sm text-[#4d4d4d] font-normal m-0 mb-0.5"
        data-cy={`${dataCy}-label`}
      >
        {label}
      </p>
      <p
        className="text-base font-normal text-[#4d4d4d] m-0"
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
            className="text-base font-bold text-[#4d4d4d]"
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
              onClick={() => handleEditChange('bankInformation')}
              className="w-6 h-6 border-[1px] border-[#D9D9D9] rounded-md"
              id="bank-information-edit-icon"
              data-cy="bank-information-edit-icon"
            >
              <EditOutlinedIcon className="text-sm" />
            </button>
          </AccessGuard>
        ) : null
      }
      className="bank-information-card rounded-lg my-6"
      bordered={false}
      style={{ background: '#F9FAFB', boxShadow: 'none' }}
      id="bank-information-card"
      data-cy="bank-information-card"
      headStyle={{
        borderBottom: 'none',
        paddingLeft: '16px',
        paddingRight: '16px',
        background: '#F9FAFB',
      }}
      bodyStyle={{ padding: '12px 16px 12px 16px', background: '#F9FAFB' }}
    >
      {edit.bankInformation ? (
        <Form
          form={form}
          onFinish={handleBankSave}
          layout="vertical"
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
                  onClick={() => {
                    setSavedBankSnapshot(null);
                    setEdit('bankInformation');
                  }}
                  id="bank-information-cancel-btn"
                  data-cy="bank-information-cancel-btn"
                  className="border border-red-500 h-6 w-6"
                >
                  <CloseIcon className="text-red-500 text-[10px]" />
                </Button>
                <Button
                  type="primary"
                  size="small"
                  htmlType="submit"
                  id="bank-information-submit-btn"
                  data-cy="bank-information-submit-btn"
                  className="h-6 w-6"
                >
                  <CheckIcon className="text-white text-[10px]" />
                </Button>
              </div>
            </Col>
          </Row>
          <Row
            gutter={[16, 24]}
            id="bank-information-form-row"
            data-cy="bank-information-form-row"
          >
            <Col
              className="w-full"
              lg={24}
              sm={24}
              xs={24}
              id="bank-information-form-col"
              data-cy="bank-information-form-col"
            >
              {Object.keys(allFields).map((key) => (
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
                >
                  <Input
                    placeholder={key.replace(/_/g, ' ')}
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
