'use client';

import CustomDrawerFooterButton, {
  type CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Input, Modal, Select, Spin, Switch } from 'antd';
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

const AllowanceTypeSideBar = ({ asModal = false, modalWidth = 500, onAddToSelect }: AllowanceTypeSideBarProps = {}) => {
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
      notTaxableAmount: Number(formValues.nonTaxableAmount || 0),
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
        notTaxableAmount: payload.notTaxableAmount,
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
        <span>Update</span>
      ) : (
        <span>Create</span>
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
        <Spin spinning={isLoading}>
          <Form
            layout="vertical"
            form={form}
            onFinish={onFormSubmit}
            requiredMark={CustomLabel}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Required' }]}
              className="form-item"
            >
              <Input
                className="control"
                placeholder="Allowance Name"
                style={{ height: '40px', padding: '4px 8px' }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Required' }]}
              className="form-item"
            >
              <TextArea
                className="control"
                autoSize={{ minRows: 3, maxRows: 5 }}
                placeholder="Description"
                style={{ height: '32px', padding: '4px 8px' }}
              />
            </Form.Item>

            {asModal ? (
              // Modal layout: "Amount is in rate" only, amounts side by side
              <>
                <Form.Item
                  name="isRate"
                  label="Amount is in rate"
                  className="form-item"
                  initialValue={false}
                >
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    onChange={onRateToggle}
                  />
                </Form.Item>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <Form.Item
                    name="defaultAmount"
                    label={isRateAllowance ? 'Rate' : 'Fixed Amount'}
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
                      className="control"
                      type="number"
                      min={0}
                      placeholder="Enter Allowance Amount"
                      style={{ height: '40px', padding: '4px 8px' }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="nonTaxableAmount"
                    label="Not Taxable Amount"
                    dependencies={['defaultAmount', 'isRate']}
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
                          if (!isRate && value && defaultAmount && Number(value) > Number(defaultAmount)) {
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
                      className="control"
                      type="number"
                      min={0}
                      placeholder="Enter Non-Taxable Amount"
                      style={{ height: '40px', padding: '4px 8px' }}
                    />
                  </Form.Item>
                </div>
              </>
            ) : (
              // Drawer layout: Original layout with "Is Rate" and "All Employees" side by side, amounts stacked
              <>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Form.Item
                name="isRate"
                label={'Is Rate'}
                className="form-item"
                initialValue={false}
              >
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  onChange={onRateToggle}
                />
              </Form.Item>

              <Form.Item
                name="isAllEmployee"
                label="All Employees are entitled"
                className="form-item"
                initialValue={true}
              >
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  onChange={handleAllEmployeeChange}
                  checked={isAllEmployee}
                  disabled={selectedAllowanceRecord}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="defaultAmount"
              label={isRateAllowance ? 'Rate' : 'Fixed Amount'}
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
            >
              <Input
                className="control"
                type="number"
                min={0}
                placeholder="Enter Allowance Amount"
                style={{ height: '40px', padding: '4px 8px' }}
              />
            </Form.Item>

            <Form.Item
              name="nonTaxableAmount"
              label="Non-Taxable Amount"
              dependencies={['defaultAmount']}
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
                    if (
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
            >
              <Input
                className="control"
                type="number"
                min={0}
                placeholder="Enter Non-Taxable Amount"
                style={{ height: '40px', padding: '4px 8px' }}
              />
            </Form.Item>
              </>
            )}

            {!isAllEmployee && !selectedAllowanceRecord && !asModal && (
              <Form.Item
                className="form-item"
                name="employees"
                label="Select Employees"
              >
                <Select
                  showSearch
                  placeholder="Select a person"
                  mode="multiple"
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
          title={selectedAllowanceRecord ? 'Edit Allowance Type' : 'Allowance Type'}
          open={isAllowanceOpen}
          onCancel={() => onClose()}
          footer={
            <CustomDrawerFooterButton
              className="w-full bg-[#fff] flex justify-between space-x-5 p-4"
              buttons={footerModalItems}
            />
          }
          width={modalWidth}
          centered
          destroyOnClose
          getContainer={() => {
            // Find the drawer body element to center modal within the drawer
            const drawerBody = document.querySelector('.ant-drawer-body') as HTMLElement;
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
        open={isAllowanceOpen}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            {selectedAllowanceRecord ? (
              <span>Edit Allowance Type</span>
            ) : (
              <span>Add Allowance Type</span>
            )}
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
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
