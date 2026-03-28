import React, { useEffect } from 'react';
import { Button, Form, Modal, Select } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import { useUpdateAllowance } from '@/store/server/features/payroll/employeeInformation/mutation';
import { useGetAllowance } from '@/store/server/features/payroll/employeeInformation/queries';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Option } = Select;

const PayrollModal: React.FC = () => {
  const [form] = Form.useForm();
  const entitledAllowances = Form.useWatch('entitled_allowance', form);
  const { isMobile } = useIsMobile();

  const {
    isDrawerVisible,
    closeDrawer,
    selectedPayrollData,
    setSelectedPayrollData,
    isEditMode,
  } = useDrawerStore();

  const { mutate: update } = useUpdateAllowance();
  const { data: AllowanceData } = useGetAllowance();

  const onFinish = async () => {
    const updatedFormValues = form.getFieldsValue();
    const formattedData = updatedFormValues?.entitled_allowance;
    const employeeId = selectedPayrollData?.key || selectedPayrollData?.id;

    update(
      { data: formattedData, employeeId: employeeId },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  const handleClose = () => {
    setSelectedPayrollData(null);
    closeDrawer();
    form.resetFields();
  };

  useEffect(() => {
    if (selectedPayrollData && isEditMode) {
      form.setFieldsValue({
        entitled_allowance: selectedPayrollData?.allowances
          ?.filter((item: any) => item.entitlementId || item.id)
          ?.map((item: any) => item.id || item.entitlementId),
      });
    } else {
      form.resetFields();
    }
  }, [selectedPayrollData, isEditMode, form]);

  const firstName = selectedPayrollData?.name?.split(' ')[0] || 'Employee';

  return (
    <Modal
      open={isDrawerVisible && !!selectedPayrollData}
      onCancel={handleClose}
      footer={null}
      closeIcon={
        <CloseOutlined style={{ fontSize: '18px', color: '#8c8c8c' }} />
      }
      width={isMobile ? 'calc(100vw - 24px)' : 600}
      centered
      bodyStyle={{ padding: isMobile ? 0 : '16px 24px' }}
      data-cy="payroll-allowance-modal"
      title={
        <span
          style={{ fontSize: '20px', fontWeight: 600, color: '#262626' }}
          data-cy="payroll-allowance-modal-title-text"
        >
          {`${firstName}'s Payroll Information`}
        </span>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ entitled_allowance: [] }}
        style={{ marginTop: '12px' }}
        data-cy="payroll-allowance-form"
      >
        <div
          style={{
            border: '1px solid #f0f0f0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            backgroundColor: '#fff',
          }}
          data-cy="payroll-allowance-section"
        >
          <Form.Item
            label={
              <span
                style={{ fontSize: '14px', fontWeight: 500, color: '#262626' }}
                data-cy="payroll-allowance-label"
              >
                Entitled Allowance{' '}
                <span
                  style={{ color: '#ff4d4f' }}
                  data-cy="payroll-allowance-required-indicator"
                >
                  *
                </span>
              </span>
            }
            name="entitled_allowance"
            required={false}
            rules={[{ required: true, message: 'Please select Allowance' }]}
            style={{ marginBottom: entitledAllowances?.length > 0 ? 12 : 0 }}
            data-cy="payroll-allowance-form-item"
          >
            <div
              className="custom-centered-select-wrapper"
              style={{ position: 'relative' }}
              data-cy="payroll-allowance-select-wrapper"
            >
              <Select
                className="always-show-placeholder"
                mode="multiple"
                placeholder=""
                style={{ width: '100%', height: '44px' }}
                size="large"
                dropdownStyle={{ borderRadius: '8px' }}
                maxTagCount={0}
                maxTagPlaceholder={() => null}
                value={entitledAllowances}
                dropdownClassName="custom-allowance-dropdown"
                onChange={(values) => {
                  form.setFieldsValue({ entitled_allowance: values });
                }}
                data-cy="payroll-allowance-select"
              >
                {AllowanceData?.filter(
                  (items: any) =>
                    items.type === 'ALLOWANCE' &&
                    items?.applicableTo !== 'GLOBAL',
                )?.map((item: any) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8c8c8c',
                  fontSize: '14px',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
                data-cy="payroll-allowance-select-manual-placeholder"
              >
                Select Allowance
              </span>
              <style jsx global data-cy="payroll-allowance-select-styles">{`
                .custom-centered-select-wrapper .ant-select-selector {
                  display: flex !important;
                  align-items: center !important;
                  height: 44px !important;
                }
                .custom-centered-select-wrapper
                  .always-show-placeholder
                  .ant-select-selection-placeholder {
                  display: none !important;
                }
                .custom-centered-select-wrapper
                  .always-show-placeholder
                  .ant-select-selection-item {
                  display: none !important;
                }
                .custom-centered-select-wrapper
                  .always-show-placeholder
                  .ant-select-selection-search {
                  display: none !important;
                }
                .custom-centered-select-wrapper
                  .always-show-placeholder
                  .ant-select-selection-overflow {
                  display: none !important;
                }
                .custom-allowance-dropdown .ant-select-item-option-selected {
                  background-color: #e6f7ff !important;
                  font-weight: 500;
                }
                .custom-allowance-dropdown
                  .ant-select-item-option-selected
                  .ant-select-item-option-state {
                  color: #1890ff;
                }
              `}</style>
            </div>
          </Form.Item>

          {/* Manual Tag Display below the search field */}
          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
            data-cy="payroll-allowance-selected-tags-wrapper"
          >
            {entitledAllowances?.map((id: string) => {
              const allowance = AllowanceData?.find((a: any) => a.id === id);
              if (!allowance) return null;
              return (
                <div
                  key={id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #d9d9d9',
                    padding: '4px 12px',
                    borderRadius: '6px',
                  }}
                  data-cy="payroll-allowance-selected-tag"
                >
                  <span
                    style={{ fontSize: '14px', color: '#595959' }}
                    data-cy="payroll-allowance-selected-tag-name"
                  >
                    {allowance.name}
                  </span>
                  <CloseOutlined
                    style={{
                      fontSize: '10px',
                      color: '#8c8c8c',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      const newValues = entitledAllowances.filter(
                        (val: string) => val !== id,
                      );
                      form.setFieldsValue({ entitled_allowance: newValues });
                    }}
                    data-cy="payroll-allowance-tag-remove-icon"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}
          data-cy="payroll-allowance-modal-actions"
        >
          <Button
            onClick={handleClose}
            style={{
              height: '40px',
              padding: '0 24px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#595959',
              border: '1px solid #d9d9d9',
            }}
            data-cy="payroll-allowance-cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            style={{
              height: '40px',
              padding: '0 24px',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#1d39c4',
              border: 'none',
              fontWeight: 500,
            }}
            data-cy="payroll-allowance-continue-button"
          >
            Continue
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default PayrollModal;
