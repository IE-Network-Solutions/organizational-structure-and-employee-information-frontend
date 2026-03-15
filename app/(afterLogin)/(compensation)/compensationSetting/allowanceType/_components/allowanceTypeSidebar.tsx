'use client';

import CustomDrawerFooterButton, {
  type CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Button, Form, Input, Modal, Select, Spin, Switch } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useEffect } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import {
  useCreateAllowanceType,
  useEditAllowanceType,
} from '@/store/server/features/compensation/settings/mutations';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

const { TextArea } = Input;

export const COMPENSATION_MODE = ['CREDIT', 'DEBIT']; // CREDIT IS CONSIDERED AS TO BE PAID TO THE EMPLOYEE, LIKE A GIFT
export const COMPENSATION_PERIOD = ['MONTHLY', 'WEEKLY'];

interface AllowanceTypeSideBarProps {
  asModal?: boolean;
  modalWidth?: string | number;
  onAddToSelect?: (allowanceData: any) => void; // Callback to add allowance to select without creating it
}

const AllowanceTypeSideBar = ({
  asModal = false,
  modalWidth = 500,
  onAddToSelect,
}: AllowanceTypeSideBarProps = {}) => {
  const {
    isAllowanceOpen,
    isRateAllowance,
    isAllEmployee,
    setIsAllEmployee,
    setIsRateAllowance,
    resetStore,
    selectedAllowanceRecord,
  } = useCompensationSettingStore();

  const { mutate: createAllowanceType, isLoading: isCreating } =
    useCreateAllowanceType();
  const { mutate: editAllowanceType, isLoading: isEditing } =
    useEditAllowanceType();

  const [form] = Form.useForm();
  const { data: allUsers, isLoading: allUserLoading } = useGetAllUsers();

  const isLoading = isCreating || isEditing;

  useEffect(() => {
    if (selectedAllowanceRecord) {
      setIsAllEmployee(selectedAllowanceRecord.applicableTo == 'GLOBAL');
      form.setFieldsValue({
        name: selectedAllowanceRecord.name,
        description: selectedAllowanceRecord.description,
        isRate: selectedAllowanceRecord.isRate,
        defaultAmount: selectedAllowanceRecord.defaultAmount,
        nonTaxableAmount: selectedAllowanceRecord.notTaxableAmount || 0,
        isAllEmployee:
          selectedAllowanceRecord.applicableTo == 'GLOBAL' ? true : false,
      });
    }
  }, [selectedAllowanceRecord, form, setIsAllEmployee]);

  const onClose = () => {
    form.resetFields();
    resetStore();
  };

  const onRateToggle = (checked: any) => {
    setIsRateAllowance(checked);
  };

  const onFormSubmit = (formValues: any) => {
    const payload = {
      name: formValues.name,
      description: formValues.description,
      type: 'ALLOWANCE',
      mode: 'CREDIT',
      isRate: formValues.isRate,
      defaultAmount: Number(formValues.defaultAmount),
      nonTaxableAmount: Number(formValues.nonTaxableAmount || 0),
      applicableTo: formValues.isAllEmployee ? 'GLOBAL' : 'PER-EMPLOYEE',
      employeeIds: !formValues.isAllEmployee ? formValues.employees : [],
    };

    // If onAddToSelect is provided (e.g., from jobTimeLineForm), just add to select without creating
    if (onAddToSelect && !selectedAllowanceRecord) {
      // Generate a temporary ID for the new allowance
      const tempAllowanceData = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: payload.name,
        description: payload.description,
        isRate: payload.isRate,
        defaultAmount: payload.defaultAmount,
        notTaxableAmount: payload.nonTaxableAmount,
        type: payload.type,
      };
      onAddToSelect(tempAllowanceData);
      onClose();
      return;
    }

    if (selectedAllowanceRecord) {
      // Edit existing allowance type
      editAllowanceType(
        {
          id: selectedAllowanceRecord.id,
          data: payload,
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    } else {
      // Create new allowance type
      createAllowanceType(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const handleAllEmployeeChange = (checked: any) => {
    setIsAllEmployee(checked);
  };

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-12',
      size: 'large',
      loading: false,
      onClick: () => onClose(),
    },
    {
      label: selectedAllowanceRecord ? (
        <span data-cy="allowance-sidebar-update-button-label">Update</span>
      ) : (
        <span data-cy="allowance-sidebar-create-button-label">Create</span>
      ),
      key: 'create',
      className: 'h-12',
      type: 'primary',
      size: 'large',
      loading: isLoading,
      onClick: () => form.submit(),
    },
  ];

  const formContent = (
    <Spin
      spinning={isLoading}
      data-cy="compensation-settings-allowance-sidebar-loading"
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFormSubmit}
        requiredMark={CustomLabel}
        id="compensation-settings-allowance-sidebar-form"
        data-cy="compensation-settings-allowance-sidebar-form"
      >
        <Form.Item
          name="name"
          label={
            <span
              data-cy="compensation-settings-allowance-sidebar-name-label"
              className="text-sm font-normal"
            >
              Name{' '}
            </span>
          }
          rules={[{ required: true, message: 'Required' }]}
          className="form-item"
          id="compensation-settings-allowance-sidebar-name-item"
          data-cy="compensation-settings-allowance-sidebar-name-item"
        >
          <Input
            placeholder="Allowance Name"
            className="h-10"
            id="compensation-settings-allowance-sidebar-name-input"
            data-cy="compensation-settings-allowance-sidebar-name-input"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <span
              data-cy="compensation-settings-allowance-sidebar-description-label"
              className="text-sm font-normal mb-1"
            >
              Description{' '}
              <span
                data-cy="compensation-settings-allowance-sidebar-description-optional-span"
                className="text-sm text-[#8c8c8c]"
              >
                (optional)
              </span>{' '}
            </span>
          }
          id="compensation-settings-allowance-sidebar-description-item"
          data-cy="compensation-settings-allowance-sidebar-description-item"
          className="form-item"
        >
          <TextArea
            className="h-14"
            autoSize={{ minRows: 3, maxRows: 5 }}
            placeholder="Description"
            id="compensation-settings-allowance-sidebar-description-input"
            data-cy="compensation-settings-allowance-sidebar-description-input"
          />
        </Form.Item>

        {/* Amount type toggle + helper text */}
        <div
          data-cy="compensation-settings-allowance-sidebar-amount-type-toggle-wrapper"
          className="flex flex-col gap-1 mb-2"
        >
          <div
            data-cy="compensation-settings-allowance-sidebar-amount-type-toggle-buttons-div"
            className="flex gap-2 justify-center"
          >
            <button
              type="button"
              data-cy="compensation-settings-allowance-sidebar-amount-type-toggle-fixed-amount-button"
              onClick={() => {
                form.setFieldValue('isRate', false);
                onRateToggle(false);
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md border ${
                !isRateAllowance
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-[#d9d9d9]'
              }`}
            >
              Fixed Amount
            </button>
            <button
              type="button"
              data-cy="compensation-settings-allowance-sidebar-amount-type-toggle-rate-amount-button"
              onClick={() => {
                form.setFieldValue('isRate', true);
                onRateToggle(true);
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md border ${
                isRateAllowance
                  ? 'bg-primary text-white border-[#1D4ED8]'
                  : 'bg-white text-gray-700 border border-[#d9d9d9]'
              }`}
            >
              Rate Amount
            </button>
          </div>
          <span
            data-cy="compensation-settings-allowance-sidebar-amount-type-toggle-helper-text-span"
            className="text-center text-xs text-gray-500"
          >
            Please select how the allowance amount is represented
          </span>
        </div>

        {/* Hidden field to keep using existing validation logic based on isRate */}
        <Form.Item name="isRate" initialValue={isRateAllowance} hidden>
          <Input type="hidden" />
        </Form.Item>

        {asModal ? null : (
          <Form.Item
            name="isAllEmployee"
            label="All Employees are entitled"
            className="form-item"
            initialValue={true}
            id="compensation-settings-allowance-sidebar-all-item"
            data-cy="compensation-settings-allowance-sidebar-all-item"
          >
            <Switch
              checkedChildren={
                <CheckOutlined data-cy="compensation-settings-allowance-sidebar-all-switch-checked" />
              }
              unCheckedChildren={
                <CloseOutlined data-cy="compensation-settings-allowance-sidebar-all-switch-unchecked" />
              }
              onChange={handleAllEmployeeChange}
              checked={isAllEmployee}
              disabled={selectedAllowanceRecord}
              id="compensation-settings-allowance-sidebar-all-switch"
              data-cy="compensation-settings-allowance-sidebar-all-switch"
            />
          </Form.Item>
        )}

        {/* Amount inputs side by side */}
        <div
          id="compensation-settings-allowance-sidebar-default-amount-container"
          data-cy="compensation-settings-allowance-sidebar-default-amount-container"
          style={{ display: 'flex', gap: '20px' }}
        >
          <Form.Item
            id="compensation-settings-allowance-sidebar-default-amount-item"
            data-cy="compensation-settings-allowance-sidebar-default-amount-item"
            name="defaultAmount"
            label={isRateAllowance ? 'Rate Amount' : 'Fixed Amount'}
            rules={[
              { required: true, message: 'Amount is Required' },
              {
                validator: (notused, value) => {
                  if (value && value < 0) {
                    return Promise.reject(
                      new Error('Amount cannot be negative'),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            className="form-item"
            style={{ flex: 1 }}
          >
            <Input
              id="compensation-settings-allowance-sidebar-default-amount-input"
              data-cy="compensation-settings-allowance-sidebar-default-amount-input"
              className="control"
              type="number"
              min={0}
              placeholder={
                isRateAllowance
                  ? 'Enter Rate Amount'
                  : 'Enter Fixed Allowance Amount'
              }
              style={{ height: '40px', padding: '4px 8px' }}
            />
          </Form.Item>

          <Form.Item
            name="nonTaxableAmount"
            label={
              <span
                data-cy="compensation-settings-allowance-sidebar-non-taxable-amount-label"
                className="text-sm font-normal mb-1"
              >
                Non Taxable Amount{' '}
                <span
                  data-cy="compensation-settings-allowance-sidebar-non-taxable-amount-required-span"
                  className="text-sm text-red-500"
                >
                  *
                </span>{' '}
              </span>
            }
            dependencies={['defaultAmount', 'isRate']}
            id="compensation-settings-allowance-sidebar-non-taxable-amount-item"
            data-cy="compensation-settings-allowance-sidebar-non-taxable-amount-item"
            rules={[
              {
                validator: (notused, value) => {
                  if (value && value < 0) {
                    return Promise.reject(
                      new Error('Non-taxable amount cannot be negative'),
                    );
                  }
                  return Promise.resolve();
                },
              },
              {
                validator: (notused, value) => {
                  const defaultAmount = form.getFieldValue('defaultAmount');
                  const isRate = form.getFieldValue('isRate');
                  // Only validate if it's not a rate allowance
                  if (
                    !isRate &&
                    value &&
                    defaultAmount &&
                    Number(value) > Number(defaultAmount)
                  ) {
                    return Promise.reject(
                      new Error(
                        'Non-taxable amount cannot exceed the fixed amount',
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            className="form-item"
            style={{ flex: 1 }}
          >
            <Input
              id="compensation-settings-allowance-sidebar-non-taxable-amount-input"
              data-cy="compensation-settings-allowance-sidebar-non-taxable-amount-input"
              className="control"
              type="number"
              min={0}
              placeholder="Enter Non-Taxable Amount"
              style={{ height: '40px', padding: '4px 8px' }}
            />
          </Form.Item>
        </div>

        {!isAllEmployee && !selectedAllowanceRecord && !asModal && (
          <Form.Item
            id="compensation-settings-allowance-sidebar-employees-item"
            data-cy="compensation-settings-allowance-sidebar-employees-item"
            className="form-item"
            name="employees"
            label="Select Employees"
          >
            <Select
              showSearch
              placeholder="Select a person"
              mode="multiple"
              id="compensation-settings-allowance-sidebar-employees-select"
              data-cy="compensation-settings-allowance-sidebar-employees-select"
              className="w-full h-14"
              allowClear
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={allUsers?.items?.map((item: any) => ({
                ...item,
                value: item?.id,
                label:
                  item?.firstName +
                  ' ' +
                  item?.middleName +
                  ' ' +
                  item?.lastName,
              }))}
              loading={allUserLoading}
            />
          </Form.Item>
        )}
      </Form>
    </Spin>
  );

  if (asModal) {
    return (
      isAllowanceOpen && (
        <Modal
          data-cy="compensation-settings-allowance-sidebar-modal"
          title={
            <span
              data-cy="compensation-settings-allowance-sidebar-modal-title-span"
              className="text-base font-bold text-[#4d4d4d]"
            >
              {selectedAllowanceRecord
                ? 'Edit Allowance Type'
                : 'Create Allowance Type'}
            </span>
          }
          open={isAllowanceOpen}
          onCancel={() => onClose()}
          footer={
            <div
              data-cy="compensation-settings-allowance-sidebar-modal-footer-div"
              className="flex justify-end gap-4"
            >
              <Button
                type="default"
                className="h-8 border border-[#d9d9d9]"
                data-cy="compensation-settings-allowance-sidebar-modal-footer-cancel-button"
                size="large"
                onClick={() => onClose()}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                className="h-8"
                size="large"
                onClick={() => form.submit()}
              >
                {selectedAllowanceRecord ? 'Update' : 'Create'}
              </Button>
            </div>
          }
          width={modalWidth}
          centered
          destroyOnClose
          getContainer={() => {
            // Find the drawer body element to center modal within the drawer
            const drawerBody = document.querySelector(
              '.ant-drawer-body',
            ) as HTMLElement;
            return drawerBody || document.body;
          }}
          mask={true}
          maskClosable={false}
        >
          {formContent}
        </Modal>
      )
    );
  }

  return (
    isAllowanceOpen && (
      <CustomDrawerLayout
        data-cy="compensation-settings-allowance-sidebar-drawer"
        open={isAllowanceOpen}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader
            data-cy="compensation-settings-allowance-sidebar-header"
            className="flex justify-center"
          >
            {selectedAllowanceRecord ? (
              <span
                id="compensation-settings-allowance-sidebar-header-title"
                data-cy="compensation-settings-allowance-sidebar-header-title"
              >
                Edit Allowance Type
              </span>
            ) : (
              <span
                id="compensation-settings-allowance-sidebar-header-title"
                data-cy="compensation-settings-allowance-sidebar-header-title"
              >
                Add Allowance Type
              </span>
            )}
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            data-cy="compensation-settings-allowance-sidebar-footer"
            className="w-full bg-[#fff] flex justify-between space-x-5 p-4"
            buttons={footerModalItems}
          />
        }
        width="30%"
        customMobileHeight="70vh"
      >
        {formContent}
      </CustomDrawerLayout>
    )
  );
};

export default AllowanceTypeSideBar;
