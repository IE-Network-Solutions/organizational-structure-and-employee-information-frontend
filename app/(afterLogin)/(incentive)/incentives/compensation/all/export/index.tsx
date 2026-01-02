import { Modal, Checkbox, Button, Form, Select } from 'antd';
import {
  IncentiveExportFilter,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { useExportIncentiveData } from '@/store/server/features/incentive/all/mutation';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import React from 'react';

interface ExportModalProps {
  selectedRecognition: string | null;
}
const ExportModal: React.FC<ExportModalProps> = ({ selectedRecognition }) => {
  const {
    isOpen,
    setIsOpen,
    pageSize,
    currentPage,
    filteredSessions,
    setFilteredSessions,
    selectedFiscalYear,
    setSelectedFiscalYear,
  } = useIncentiveStore();

  const { data: fiscalYear } = useGetAllFiscalYears(pageSize, currentPage);

  const [form] = Form.useForm();

  const {
    mutate: exportIncentiveData,
    isLoading: submitPending,
    reset,
  } = useExportIncentiveData();

  const handleFiscalYearChange = (fiscalYearId: string) => {
    setSelectedFiscalYear(fiscalYearId);
    const selectedYear = fiscalYear?.items?.find(
      (year: any) => year?.id === fiscalYearId,
    );
    setFilteredSessions(selectedYear?.sessions || []);
    form.setFieldsValue({ sessionId: [] });
  };

  const handleExport = (values: IncentiveExportFilter) => {
    const formattedValues = {
      ...values,
      parentRecognitionTypeId: selectedRecognition || '',
      generateAll: !!selectedRecognition,
      sessionId: values.sessionId || [],
    };
    exportIncentiveData(formattedValues, {
      onSuccess: () => {
        setIsOpen(false);
        form.resetFields();
      },
    });
  };
  const handleModalClose = () => {
    setIsOpen(false);
    form.resetFields();
    reset();
  };
  return (
    <Modal
      title="Export Incentive Data"
      data-cy="export-modal"
      open={isOpen}
      onCancel={handleModalClose}
      footer={null}
      centered
    >
      <Form
        id="export-modal-form"
        data-cy="export-modal-form"
        form={form}
        layout="vertical"
        initialValues={{
          parentRecognitionTypeId: selectedRecognition,
          generateAll: !!selectedRecognition,
        }}
        onFinish={(values) => {
          handleExport(values);
        }}
      >
        {/* Generate All (Boolean) */}
        <Form.Item
          id="export-modal-form-generate-all"
          data-cy="export-modal-form-generate-all"
          name="generateAll"
          valuePropName="checked"
        >
          <Checkbox
            id="export-modal-form-generate-all-checkbox"
            data-cy="export-modal-form-generate-all-checkbox"
          >
            <span
              id="export-modal-form-generate-all-text"
              data-cy="export-modal-form-generate-all-text"
            >
              Generate All
            </span>
          </Checkbox>
        </Form.Item>

        <Form.Item
          id="export-modal-form-fiscal-year"
          data-cy="export-modal-form-fiscal-year"
          label="Select Fiscal Year"
          name="fiscalYear"
          rules={[{ required: true, message: 'Please select a fiscal year' }]}
        >
          <Select
            id="export-modal-form-fiscal-year-select"
            data-cy="export-modal-form-fiscal-year-select"
            allowClear
            placeholder="Select Fiscal Year"
            className="w-full h-12"
            onChange={handleFiscalYearChange}
          >
            {fiscalYear?.items?.map((year: any) => (
              <Select.Option
                id={`export-modal-form-fiscal-year-option-${year.id}`}
                data-cy={`export-modal-form-fiscal-year-option-${year.id}`}
                key={year.id}
                value={year.id}
              >
                {year?.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Session IDs (comma-separated input) */}
        <Form.Item
          id="export-modal-form-sessions"
          data-cy="export-modal-form-sessions"
          label="Select Sessions"
          name="sessionId"
          rules={[
            { required: true, message: 'Please select at least one session' },
          ]}
        >
          <Select
            id="export-modal-form-sessions-select"
            data-cy="export-modal-form-sessions-select"
            mode="multiple"
            placeholder="Select session(s)"
            className="w-full h-12"
            disabled={!selectedFiscalYear || filteredSessions?.length === 0}
          >
            {filteredSessions.map((session: any) => (
              <Select.Option
                id={`export-modal-form-sessions-option-${session?.id}`}
                data-cy={`export-modal-form-sessions-option-${session?.id}`}
                key={session?.id}
                value={session?.id}
              >
                {session?.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Submit Button */}
        <Form.Item
          id="export-modal-form-actions"
          data-cy="export-modal-form-actions"
        >
          <div
            id="export-modal-form-actions-wrapper"
            data-cy="export-modal-form-actions-wrapper"
            className="flex justify-end mt-6"
          >
            <Button
              id="export-modal-cancel-button"
              data-cy="export-modal-cancel-button"
              onClick={handleModalClose}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              id="export-modal-submit-button"
              data-cy="export-modal-submit-button"
              type="primary"
              htmlType="submit"
              loading={submitPending}
            >
              Export
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExportModal;
