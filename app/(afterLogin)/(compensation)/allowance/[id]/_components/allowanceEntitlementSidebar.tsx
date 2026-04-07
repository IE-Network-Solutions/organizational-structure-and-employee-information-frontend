import { Button, Checkbox, Form, Modal, Select, Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useMemo, useEffect } from 'react';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import { useCreateAllowanceEntitlement } from '@/store/server/features/compensation/allowance/mutations';
import { useParams } from 'next/navigation';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useFetchAllowance } from '@/store/server/features/compensation/allowance/queries';

const AllowanceEntitlementSideBar = () => {
  const {
    isAllowanceEntitlementSidebarOpen,
    resetStore,
    setSelectedDepartment,
  } = useAllowanceEntitlementStore();

  const { mutate: createAllowanceEntitlement, isLoading: isCreating } =
    useCreateAllowanceEntitlement();

  const [form] = Form.useForm();
  const params = useParams();
  const idParam = params?.['id'];
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const { data: allUsers, isLoading: allUserLoading } = useGetAllUsers();
  const { data: allowanceData } = useFetchAllowance(id ?? '');

  const showDepartmentLeadsOnly =
    Form.useWatch('showDepartmentLeadsOnly', form) ?? false;
  const showNonLeadsOnly = Form.useWatch('showNonLeadsOnly', form) ?? false;

  const filteredUsers = useMemo(() => {
    return allUsers?.items?.filter((user: any) => {
      if (!showDepartmentLeadsOnly && !showNonLeadsOnly) return true;

      const jobs = user?.employeeJobInformation;
      const activeJob = Array.isArray(jobs)
        ? (jobs.find((job: any) => job.isPositionActive) ?? jobs[0])
        : undefined;
      const isDepartmentLead = activeJob?.departmentLeadOrNot;

      if (showDepartmentLeadsOnly) {
        return isDepartmentLead === true;
      }

      if (showNonLeadsOnly) {
        return isDepartmentLead !== true;
      }

      return true;
    });
  }, [allUsers?.items, showDepartmentLeadsOnly, showNonLeadsOnly]);

  const employeeSelectOptions = useMemo(
    () =>
      filteredUsers?.map((item: any) => ({
        value: item?.id,
        label:
          `${item?.firstName || ''} ${item?.middleName || ''} ${item?.lastName || ''}`
            .replace(/\s+/g, ' ')
            .trim(),
      })) ?? [],
    [filteredUsers],
  );

  useEffect(() => {
    const selectedId = form.getFieldValue('employee');
    if (!selectedId || !filteredUsers) return;
    const stillVisible = filteredUsers.some((u: any) => u?.id === selectedId);
    if (!stillVisible) {
      form.setFieldValue('employee', undefined);
    }
  }, [filteredUsers, form]);

  const onClose = () => {
    form.resetFields();
    resetStore();
    setSelectedDepartment(null);
  };

  // Single-step create for BOTH fixed and rate allowances
  const onSubmit = (formValues: any) => {
    createAllowanceEntitlement(
      {
        compensationItemId: id ?? '',
        employeeIds: [formValues.employee].filter(Boolean),
        totalAmount: Number(allowanceData?.defaultAmount || 0),
        active: true,
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <>
      <style data-cy="compensation-allowance-entitlement-employee-select-styles">{`
        .compensation-allowance-entitlement-employee-select-popup.ant-select-dropdown
          .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: #e6f7ff !important;
          font-weight: 600;
        }
        .compensation-allowance-entitlement-employee-select-popup.ant-select-dropdown
          .ant-select-item-option-selected:not(.ant-select-item-option-disabled):hover {
          background-color: #d6efff !important;
        }
        .compensation-allowance-entitlement-employee-select-popup.ant-select-dropdown
          .ant-select-item-option-selected
          .ant-select-item-option-state {
          color: #2f54eb !important;
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          opacity: 1 !important;
          visibility: visible !important;
        }
        .compensation-allowance-entitlement-employee-select-popup.ant-select-dropdown
          .ant-select-item-option-selected
          .anticon-check {
          color: #2f54eb !important;
          font-size: 12px;
          font-weight: 700;
        }
        .compensation-allowance-entitlement-employee-select-popup.ant-select-dropdown
          .ant-select-item-option-selected
          .ant-select-item-option-content {
          font-weight: 600;
        }
      `}</style>
      <Modal
        title={
          <div
            className="flex w-full items-center justify-between gap-4"
            data-cy="compensation-allowance-sidebar-modal-title-row"
          >
            <span
              className="inline-flex min-h-6 min-w-0 flex-1 items-center text-left text-base font-semibold leading-6 text-gray-900"
              id="compensation-allowance-sidebar-title-text"
              data-cy="compensation-allowance-sidebar-title-text"
            >
              Add Allowance Entitlement
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
              data-cy="compensation-allowance-sidebar-close"
            >
              <CloseOutlined style={{ fontSize: 16, color: '#262626' }} />
            </button>
          </div>
        }
        open={isAllowanceEntitlementSidebarOpen}
        onCancel={onClose}
        closable={false}
        mask
        maskClosable={false}
        zIndex={10002}
        width={560}
        centered
        style={{ maxWidth: 'calc(100vw - 32px)' }}
        footer={
          <div
            className="flex w-full justify-end gap-3"
            id="compensation-allowance-sidebar-footer"
            data-cy="compensation-allowance-sidebar-footer"
          >
            <Button
              type="default"
              className="h-10 px-4 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-normal hover:bg-gray-50"
              loading={allUserLoading || isCreating}
              onClick={onClose}
              disabled={allUserLoading || isCreating}
              id="compensation-allowance-sidebar-cancel-button"
              data-cy="compensation-allowance-sidebar-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="h-10 px-4 rounded-md text-sm font-normal"
              loading={allUserLoading || isCreating}
              disabled={allUserLoading || isCreating}
              onClick={() => form.submit()}
              id="compensation-allowance-sidebar-create-button"
              data-cy="compensation-allowance-sidebar-create-button"
            >
              Continue
            </Button>
          </div>
        }
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
        data-cy="compensation-allowance-sidebar-modal"
      >
        <Spin
          spinning={allUserLoading || isCreating}
          data-cy="compensation-allowance-sidebar-loading"
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={onSubmit}
            requiredMark={CustomLabel}
            id="compensation-allowance-sidebar-form"
            data-cy="compensation-allowance-sidebar-form"
            className="[&_.ant-form-item-label>label]:text-sm [&_.ant-form-item-label>label]:font-normal [&_.ant-form-item-label>label]:text-[#262626]"
          >
            <div
              className="rounded-lg border border-gray-200 px-4 py-3 mb-4"
              data-cy="compensation-allowance-sidebar-filter-card"
            >
              <div
                className="flex items-center gap-6"
                data-cy="compensation-allowance-sidebar-filter-card-content"
              >
                <Form.Item
                  name="showDepartmentLeadsOnly"
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox
                    onChange={(e) => {
                      if (e.target.checked) {
                        form.setFieldValue('showNonLeadsOnly', false);
                      }
                    }}
                    data-cy="compensation-allowance-sidebar-filter-leads"
                  >
                    Team Lead
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name="showNonLeadsOnly"
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox
                    onChange={(e) => {
                      if (e.target.checked) {
                        form.setFieldValue('showDepartmentLeadsOnly', false);
                      }
                    }}
                    data-cy="compensation-allowance-sidebar-filter-subordinates"
                  >
                    Subordinates
                  </Checkbox>
                </Form.Item>
              </div>

              <Form.Item
                className="mb-0 mt-4"
                name="employee"
                label="Employee"
                rules={[
                  { required: true, message: 'Please select an employee' },
                ]}
                data-cy="compensation-allowance-sidebar-employee-item"
              >
                <Select
                  showSearch
                  placeholder="Select employee"
                  className="w-full h-10"
                  allowClear
                  menuItemSelectedIcon={
                    <span
                      className="text-[#2f54eb] font-semibold"
                      data-cy="compensation-allowance-sidebar-employee-selected-icon"
                    >
                      ✓
                    </span>
                  }
                  popupClassName="compensation-allowance-entitlement-employee-select-popup"
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? '')
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={employeeSelectOptions}
                  loading={allUserLoading}
                  id="compensation-allowance-sidebar-employee-select"
                  data-cy="compensation-allowance-sidebar-employee-select"
                />
              </Form.Item>
            </div>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default AllowanceEntitlementSideBar;
