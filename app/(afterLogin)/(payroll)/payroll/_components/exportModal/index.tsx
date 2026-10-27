import React from 'react';
import { Modal, Button, ConfigProvider } from 'antd';
import { IoCloseOutline } from 'react-icons/io5';
import OptionRow from '../optionRow';

export interface PayrollExportOptions {
  bankLetter: boolean;
  exportPayroll: boolean;
  exportBank: boolean;
}

interface Props {
  open: boolean;
  loading?: boolean;
  /** Bank files need the payroll behind the current list to be approved. */
  isApproved: boolean;
  options: PayrollExportOptions;
  onOptionChange: (key: keyof PayrollExportOptions, checked: boolean) => void;
  /** Who the export covers, e.g. "12 selected employees". */
  scopeLabel: string;
  onClose: () => void;
  onExport: () => void;
}

const NEEDS_APPROVAL = { label: 'Needs approval', tone: 'warning' } as const;

const ExportPayrollModal: React.FC<Props> = ({
  open,
  loading = false,
  isApproved,
  options,
  onOptionChange,
  scopeLabel,
  onClose,
  onExport,
}) => {
  const nothingSelected = !Object.values(options).some(Boolean);
  const approvalHint = 'Available once the payroll is approved';

  return (
    // eslint-disable-next-line local-rules/data-cy-required
    <ConfigProvider
      data-cy="payroll-export-modal-config-provider"
      theme={{
        token: {
          colorPrimary: '#1E40AF',
          borderRadius: 6,
          fontFamily: 'inherit',
        },
        components: { Button: { fontWeight: 500 } },
      }}
    >
      <Modal
        data-cy="payroll-export-modal-view-modal"
        title={
          <h2
            className="m-0 text-base font-semibold leading-tight text-[#161A2C]"
            data-cy="payroll-export-modal-title-view-text"
          >
            Export payroll
          </h2>
        }
        open={open}
        maskClosable={!loading}
        onCancel={() => {
          if (!loading) onClose();
        }}
        closeIcon={
          <IoCloseOutline
            size={22}
            className="text-slate-500 hover:text-[#161A2C]"
          />
        }
        width={480}
        centered
        footer={[
          <Button
            key="cancel"
            data-cy="payroll-export-modal-cancel-click-button"
            type="default"
            htmlType="button"
            size="large"
            disabled={loading}
            onClick={onClose}
            className="px-6"
          >
            Cancel
          </Button>,
          <Button
            key="export"
            data-cy="payroll-export-modal-submit-click-button"
            type="primary"
            htmlType="button"
            size="large"
            className="px-6 shadow-none"
            onClick={onExport}
            disabled={loading || nothingSelected}
            loading={loading}
          >
            Export
          </Button>,
        ]}
      >
        <div
          className="mt-4"
          data-cy="payroll-export-modal-options-view-container"
        >
          <p
            className="m-0 mb-4 text-[13px] text-slate-500"
            data-cy="payroll-export-modal-description"
          >
            Choose what to export for {scopeLabel}.
          </p>

          <div
            className="flex flex-col gap-3"
            data-cy="payroll-export-modal-options"
          >
            <OptionRow
              title="Payroll details"
              description="Excel workbook with earnings, allowances, benefits and deductions"
              checked={options.exportPayroll}
              onChange={(checked) => onOptionChange('exportPayroll', checked)}
              dataCy="payroll-export-payroll"
            />
            <OptionRow
              title="Bank transfer list"
              description={
                isApproved
                  ? 'Excel list of employee bank accounts with net pay'
                  : approvalHint
              }
              checked={options.exportBank}
              onChange={(checked) => onOptionChange('exportBank', checked)}
              disabled={!isApproved}
              status={isApproved ? undefined : NEEDS_APPROVAL}
              dataCy="payroll-export-bank"
            />
            <OptionRow
              title="Bank letter"
              description={
                isApproved
                  ? 'Letter to the bank for the total net pay'
                  : approvalHint
              }
              checked={options.bankLetter}
              onChange={(checked) => onOptionChange('bankLetter', checked)}
              disabled={!isApproved}
              status={isApproved ? undefined : NEEDS_APPROVAL}
              dataCy="payroll-export-bank-letter"
            />
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default ExportPayrollModal;
