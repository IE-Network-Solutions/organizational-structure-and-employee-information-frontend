import React, { useState } from 'react';
import { Form, Select, Button, ConfigProvider, Popover, Modal } from 'antd';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { X } from 'lucide-react';

import {
  useGetDepartments,
  useGetLevel1Departments,
} from '@/store/server/features/employees/employeeManagment/department/queries';
import {
  PAYMENT_TYPE_ORDER,
  PaymentType,
  parsePaymentTypes,
  serializePaymentTypes,
} from '@/store/uistate/features/payroll/payroll/view';
import { GENERATION_TYPE_LABEL } from '@/store/server/features/payroll/payrollApproval/generationTypes';
import { useIsMobile } from '@/hooks/useIsMobile';

/** What the pages hold: the payment types are a comma separated string, empty = all. */
interface FilterValues {
  [key: string]: string | undefined;
  paymentTypes?: string;
  divisionId?: string;
  departmentId?: string;
}

/** What the form edits. */
interface FormValues {
  paymentTypes?: PaymentType[];
  divisionId?: string;
  departmentId?: string;
}

interface FilterPopoverProps {
  /**
   * Called with every filter key on Apply and Reset. A cleared filter is sent
   * as `undefined` so the page drops it instead of keeping the old value.
   */
  onSearch: (filters: { [key: string]: string | undefined | null }) => void;
  defaultValues?: FilterValues;
}

/** Filters that narrow the list. The pay period is chosen on the pay period list, not here. */
export const countActiveFilters = (values?: FilterValues): number =>
  [
    serializePaymentTypes(parsePaymentTypes(values?.paymentTypes)),
    values?.divisionId,
    values?.departmentId,
  ].filter(Boolean).length;

/** Keys of filters that no longer exist, cleared so old state can't linger. */
const LEGACY_CLEARED_KEYS = {
  yearId: undefined,
  sessionId: undefined,
  monthId: undefined,
  payrollView: undefined,
  payrollIncludes: undefined,
};

const FieldLabel = ({ title }: { title: string }) => (
  <span
    className="text-[13px] font-medium text-slate-600"
    data-cy="payroll-filter-popover-custom-label"
  >
    {title}
  </span>
);

const searchProps = {
  showSearch: true,
  optionFilterProp: 'label',
  size: 'large' as const,
};

/**
 * Multi-select payment types. No chip selected means "All"; picking every type
 * is the same as All, so it collapses back to it.
 */
const PaymentTypeChips: React.FC<{
  value?: PaymentType[];
  onChange?: (value: PaymentType[]) => void;
}> = ({ value = [], onChange }) => {
  const toggle = (type: PaymentType) => {
    const next = value.includes(type)
      ? value.filter((item) => item !== type)
      : [...value, type];
    onChange?.(next.length === PAYMENT_TYPE_ORDER.length ? [] : next);
  };
  const chipClass = (pressed: boolean) =>
    `h-8 cursor-pointer rounded-full border px-3 text-[13px] font-medium transition-colors ${
      pressed
        ? 'border-okr-primary bg-blue-50 text-okr-primary'
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
    }`;

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Payment type"
      data-cy="payroll-filter-popover-payment-types"
    >
      <button
        type="button"
        aria-pressed={value.length === 0}
        className={chipClass(value.length === 0)}
        onClick={() => onChange?.([])}
        data-cy="payroll-filter-popover-payment-type-ALL"
      >
        All
      </button>
      {PAYMENT_TYPE_ORDER.map((type) => (
        <button
          key={type}
          type="button"
          aria-pressed={value.includes(type)}
          className={chipClass(value.includes(type))}
          onClick={() => toggle(type)}
          data-cy={`payroll-filter-popover-payment-type-${type}`}
        >
          {GENERATION_TYPE_LABEL[type]}
        </button>
      ))}
    </div>
  );
};

/** The form. Mounted only while the filter is open, so nothing is fetched before then. */
const FilterPanel: React.FC<{
  defaultValues?: FilterValues;
  onSearch: FilterPopoverProps['onSearch'];
  onClose: () => void;
}> = ({ defaultValues, onSearch, onClose }) => {
  const [form] = Form.useForm<FormValues>();

  const { data: departmentData } = useGetDepartments();
  const { data: level1Departments } = useGetLevel1Departments();

  const toOptions = (items?: any[]) =>
    (Array.isArray(items) ? items : []).map((item) => ({
      value: item.id,
      label: item?.name,
    }));

  const onFinish = (values: FormValues) => {
    onSearch({
      paymentTypes: serializePaymentTypes(values.paymentTypes ?? []),
      divisionId: values.divisionId || undefined,
      departmentId: values.departmentId || undefined,
      ...LEGACY_CLEARED_KEYS,
    });
    onClose();
  };

  // Reset clears everything that narrows the list.
  const onReset = () => {
    form.setFieldsValue({
      paymentTypes: [],
      divisionId: undefined,
      departmentId: undefined,
    });
    onSearch({
      paymentTypes: undefined,
      divisionId: undefined,
      departmentId: undefined,
      ...LEGACY_CLEARED_KEYS,
    });
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'inherit',
          borderRadius: 6,
          colorPrimary: '#1E40AF',
        },
        components: { Form: { itemMarginBottom: 16 } },
      }}
    >
      <div
        className="relative max-h-[calc(100vh-160px)] w-[min(420px,calc(100vw-32px))] overflow-auto rounded-xl bg-white p-4 sm:p-5"
        data-cy="payroll-filter-popover-content"
      >
        <button
          type="button"
          aria-label="Close filters"
          className="absolute right-3 top-3 cursor-pointer border-none bg-transparent text-slate-400 transition-colors hover:text-slate-600"
          onClick={onClose}
          data-cy="payroll-filter-popover-close-btn"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        <div className="mb-4 pr-6" data-cy="payroll-filter-popover-header">
          <h2
            className="m-0 text-base font-semibold leading-tight text-[#161A2C]"
            data-cy="payroll-filter-popover-header-title"
          >
            Filters
          </h2>
          <p
            className="m-0 mt-1 text-[12px] text-slate-500"
            data-cy="payroll-filter-popover-header-subtitle"
          >
            Narrow down the payroll list
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          initialValues={{
            paymentTypes: parsePaymentTypes(defaultValues?.paymentTypes),
            divisionId: defaultValues?.divisionId,
            departmentId: defaultValues?.departmentId,
          }}
          data-cy="payroll-filter-popover-form"
        >
          <Form.Item
            name="paymentTypes"
            label={<FieldLabel title="Payment type" />}
            data-cy="payroll-filter-popover-payment-type"
          >
            <PaymentTypeChips />
          </Form.Item>

          <div
            className="grid grid-cols-1 gap-x-4 sm:grid-cols-2"
            data-cy="payroll-filter-popover-org-row"
          >
            <Form.Item
              name="divisionId"
              label={<FieldLabel title="Division" />}
              data-cy="payroll-filter-popover-division"
            >
              <Select
                {...searchProps}
                allowClear
                placeholder="All divisions"
                options={toOptions(level1Departments)}
                // A department belongs to one division; start over when it changes.
                onChange={() => form.setFieldValue('departmentId', undefined)}
                data-cy="payroll-filter-popover-division-select"
              />
            </Form.Item>
            <Form.Item
              name="departmentId"
              label={<FieldLabel title="Department" />}
              data-cy="payroll-filter-popover-department"
            >
              <Select
                {...searchProps}
                allowClear
                placeholder="All departments"
                options={toOptions(departmentData)}
                data-cy="payroll-filter-popover-department-select"
              />
            </Form.Item>
          </div>

          <div
            className="mt-1 flex items-center justify-between gap-3 border-t border-slate-100 pt-4"
            data-cy="payroll-filter-popover-footer"
          >
            <Button
              type="text"
              htmlType="button"
              onClick={onReset}
              className="!px-2 !text-slate-500"
              data-cy="payroll-filter-popover-reset-btn"
            >
              Reset
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="px-6 shadow-none"
              data-cy="payroll-filter-popover-save-btn"
            >
              Apply
            </Button>
          </div>
        </Form>
      </div>
    </ConfigProvider>
  );
};

const FilterPopover: React.FC<FilterPopoverProps> = ({
  onSearch,
  defaultValues,
}) => {
  const [open, setOpen] = useState(false);
  // A new key per opening remounts the form so it starts from the current filters.
  const [panelKey, setPanelKey] = useState(0);
  const { isMobile, isTablet } = useIsMobile();
  const changeOpen = (next: boolean) => {
    if (next) setPanelKey((key) => key + 1);
    setOpen(next);
  };
  const activeCount = countActiveFilters(defaultValues);

  const trigger = (onClick?: () => void) => (
    <Button
      id="payroll-open-filter-modal-click-button"
      data-cy="payroll-open-filter-modal-click-button"
      className="flex h-10 items-center gap-2 rounded-[6px] border-gray-200 px-3 font-medium text-gray-600 md:px-4"
      size="large"
      icon={
        <FilterAltOutlinedIcon className="text-gray-600" fontSize="small" />
      }
      onClick={onClick}
    >
      <span
        className="hidden sm:inline"
        data-cy="payroll-filter-popover-button-text"
      >
        Filter
      </span>
      {activeCount > 0 && (
        <span
          className="rounded-full bg-blue-50 px-1.5 text-[11px] font-medium leading-5 text-okr-primary"
          data-cy="payroll-filter-popover-active-count"
        >
          {activeCount}
        </span>
      )}
    </Button>
  );

  const panel = (
    <FilterPanel
      key={panelKey}
      defaultValues={defaultValues}
      onSearch={onSearch}
      onClose={() => setOpen(false)}
    />
  );

  // Mobile/tablet: a centered modal so the filter can't be clipped.
  if (isMobile || isTablet) {
    return (
      <>
        {trigger(() => changeOpen(true))}
        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
          centered
          closable={false}
          width="calc(100vw - 32px)"
          styles={{
            body: { padding: 0 },
            content: { padding: 0, borderRadius: 12 },
          }}
          data-cy="payroll-filter-mobile-modal"
        >
          {panel}
        </Modal>
      </>
    );
  }

  return (
    <Popover
      content={panel}
      trigger="click"
      open={open}
      onOpenChange={changeOpen}
      placement="bottomRight"
      overlayClassName="pixel-perfect-popover"
      getPopupContainer={() => document.body}
      data-cy="payroll-filter-popover"
    >
      {trigger()}
    </Popover>
  );
};

export default FilterPopover;
