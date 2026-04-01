'use client';

import { Button, Form, Input, Modal, Spin, Switch } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import {
  useCreateAllowanceType,
  useEditAllowanceType,
} from '@/store/server/features/compensation/settings/mutations';

const { TextArea } = Input;

const DeductiontypeSideBar = () => {
  const {
    isDeductionOpen,
    setIsRateDeduction,
    setIsAllEmployee,
    resetStore,
    selectedDeductionRecord,
    departmentUsers,
  } = useCompensationSettingStore();
  const { mutate: createAllowanceType, isLoading } = useCreateAllowanceType();
  const { mutate: editDeductionType, isLoading: editIsLoading } =
    useEditAllowanceType();
  const isSubmitting = isLoading || editIsLoading;

  const [form] = Form.useForm();
  const isRated = Form.useWatch('isRate', form);

  useEffect(() => {
    if (selectedDeductionRecord) {
      setIsAllEmployee(selectedDeductionRecord.applicableTo == 'GLOBAL');
      setIsRateDeduction(selectedDeductionRecord.isRate || false);
      form.setFieldsValue({
        name: selectedDeductionRecord.name,
        description: selectedDeductionRecord.description,
        isRate: selectedDeductionRecord.isRate,
        defaultAmount: selectedDeductionRecord.defaultAmount,
        isAllEmployee:
          selectedDeductionRecord.applicableTo == 'GLOBAL' ? true : false,
        mode: selectedDeductionRecord.mode,
      });
    } else {
      form.resetFields();
      setIsRateDeduction(false);
    }
  }, [selectedDeductionRecord, form, setIsAllEmployee, setIsRateDeduction]);

  useEffect(() => {
    if (departmentUsers.length === 0) {
      form.setFieldsValue({
        employees: [],
      });
    }
    if (departmentUsers && departmentUsers.length > 0) {
      form.setFieldsValue({
        employees: departmentUsers.map((user) => user.id),
      });
    }
  }, [departmentUsers, form]);

  const onClose = () => {
    form.resetFields();
    resetStore();
  };

  const onRatedDeductionChange = (checked: boolean) => {
    setIsRateDeduction(checked);
    if (!checked) {
      form.setFieldsValue({ defaultAmount: undefined });
    }
  };

  const onFormSubmit = (formValues: any) => {
    const rated = Boolean(formValues.isRate);
    const value = {
      name: formValues.name,
      description: formValues.description,
      type: 'DEDUCTION',
      mode: 'DEBIT',
      isRate: rated,
      defaultAmount: rated ? Number(formValues.defaultAmount) : 0,
      applicableTo: 'PER-EMPLOYEE',
    };
    if (selectedDeductionRecord?.id) {
      editDeductionType(
        { id: selectedDeductionRecord.id, data: value },
        {
          onSuccess: () => {
            form.resetFields();
            onClose();
          },
        },
      );
    } else {
      createAllowanceType(value, {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      });
    }
  };

  return (
    isDeductionOpen && (
      <Modal
        title={
          <div
            className="flex w-full items-center justify-between gap-4"
            data-cy="compensation-settings-deduction-sidebar-modal-title-row"
          >
            <span
              className="inline-flex min-h-6 items-center text-base font-semibold leading-6 text-[#000000]"
              data-cy="compensation-settings-deduction-sidebar-header-title"
            >
              {selectedDeductionRecord?.id
                ? 'Edit Deduction Type'
                : 'Add Deduction Type'}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
              data-cy="compensation-settings-deduction-sidebar-close"
            >
              <CloseOutlined style={{ fontSize: 16, color: '#262626' }} />
            </button>
          </div>
        }
        open={isDeductionOpen}
        onCancel={onClose}
        closable={false}
        mask
        maskClosable={false}
        zIndex={10002}
        footer={
          <div
            className="flex w-full justify-end gap-3"
            data-cy="compensation-settings-deduction-sidebar-footer"
          >
            <Button
              type="default"
              className="h-8 rounded-md border border-gray-300 bg-white px-4 text-sm font-normal text-gray-900 hover:bg-gray-50"
              onClick={onClose}
              data-cy="compensation-settings-deduction-sidebar-cancel"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="h-8 rounded-md px-4 text-sm font-normal"
              loading={isSubmitting}
              onClick={() => form.submit()}
              data-cy="compensation-settings-deduction-sidebar-submit"
            >
              {selectedDeductionRecord?.id ? 'Update' : 'Continue'}
            </Button>
          </div>
        }
        width={560}
        centered
        style={{ maxWidth: 'calc(100vw - 32px)' }}
        data-cy="compensation-settings-deduction-sidebar-modal"
        rootClassName="[&_.ant-modal-title]:!block [&_.ant-modal-title]:!w-full [&_.ant-form-item-label>label]:!font-normal [&_.ant-form-item-label>label]:text-[#262626] [&_.ant-form-item-required]:before:!hidden [&_.ant-form-item-required]:after:!hidden max-sm:[&_.ant-modal-body]:[-ms-overflow-style:none] max-sm:[&_.ant-modal-body]:[scrollbar-width:none] max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!hidden max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!w-0 max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!h-0"
        classNames={{
          header:
            '!mb-0 flex !items-center !rounded-t-lg border-0 !px-6 !py-4 !min-h-0',
          body: '!px-6 !pb-0 !pt-0 hide-scrollbar hide-scrollbar-mobile',
          footer: '!mt-0 border-0 !px-6 !pb-6 !pt-4',
        }}
        styles={{
          content: { borderRadius: 8, padding: 0 },
          header: { borderBottom: 'none' },
          body: {
            borderBottom: 'none',
            maxHeight: 'calc(100vh - 240px)',
            overflowY: 'auto',
          },
          footer: { borderTop: 'none' },
        }}
      >
        <Spin
          spinning={isSubmitting}
          data-cy="compensation-settings-deduction-sidebar-loading"
        >
          <div
            className="rounded-lg border border-solid border-[#D9D9D9] bg-white px-6 py-5"
            data-cy="compensation-settings-deduction-sidebar-form-card"
          >
            <Form
              layout="vertical"
              form={form}
              onFinish={onFormSubmit}
              requiredMark={CustomLabel}
              className="flex flex-col gap-4"
              id="compensation-settings-deduction-sidebar-form"
              data-cy="compensation-settings-deduction-sidebar-form"
            >
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Name is Required!' }]}
                className="form-item !mb-0"
                id="compensation-settings-deduction-sidebar-name-item"
                data-cy="compensation-settings-deduction-sidebar-name-item"
              >
                <Input
                  className="control rounded-md font-normal placeholder:font-normal"
                  placeholder="Deduction name"
                  style={{ height: 40, padding: '8px 12px' }}
                  id="compensation-settings-deduction-sidebar-name-input"
                  data-cy="compensation-settings-deduction-sidebar-name-input"
                />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: 'Description is Required!' },
                ]}
                className="form-item !mb-0"
                id="compensation-settings-deduction-sidebar-description-item"
                data-cy="compensation-settings-deduction-sidebar-description-item"
              >
                <TextArea
                  className="control rounded-md font-normal placeholder:font-normal"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  placeholder="Description of deduction"
                  style={{ padding: '8px 12px', minHeight: 80 }}
                  id="compensation-settings-deduction-sidebar-description-input"
                  data-cy="compensation-settings-deduction-sidebar-description-input"
                />
              </Form.Item>
              <Form.Item
                id="compensation-settings-deduction-sidebar-rated-item"
                data-cy="compensation-settings-deduction-sidebar-rated-item"
                name="isRate"
                label="Rated Deduction"
                valuePropName="checked"
                className="form-item !mb-0"
                initialValue={!selectedDeductionRecord ? false : undefined}
              >
                <Switch
                  onChange={onRatedDeductionChange}
                  id="compensation-settings-deduction-sidebar-rated-switch"
                  data-cy="compensation-settings-deduction-sidebar-rated-switch"
                />
              </Form.Item>
              {Boolean(isRated) && (
                <Form.Item
                  name="defaultAmount"
                  label="Rate"
                  className="form-item !mb-0"
                  rules={[
                    { required: true, message: 'Rate is Required!' },
                    {
                      validator: (notused, value) => {
                        void notused;
                        if (
                          value != null &&
                          value !== '' &&
                          (value < 0 || value > 100)
                        ) {
                          return Promise.reject(
                            new Error('Rate must be between 0 and 100'),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  id="compensation-settings-deduction-sidebar-rate-amount-item"
                  data-cy="compensation-settings-deduction-sidebar-rate-amount-item"
                >
                  <Input
                    className="control font-normal placeholder:font-normal"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0"
                    style={{ height: 40, padding: '8px 12px' }}
                    id="compensation-settings-deduction-sidebar-rate-amount-input"
                    data-cy="compensation-settings-deduction-sidebar-rate-amount-input"
                  />
                </Form.Item>
              )}
            </Form>
          </div>
        </Spin>
      </Modal>
    )
  );
};

export default DeductiontypeSideBar;
