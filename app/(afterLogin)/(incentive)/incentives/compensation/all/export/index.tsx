import { Modal, Checkbox, Button, Form, Select } from 'antd';
import { IncentiveExportFilter, useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
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
      open={isOpen}
      onCancel={handleModalClose}
      footer={null}
      centered
    >
      <Form
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
        <Form.Item name="generateAll" valuePropName="checked">
          <Checkbox>Generate All</Checkbox>
        </Form.Item>

        <Form.Item
          label="Select Fiscal Year"
          name="fiscalYear"
          rules={[{ required: true, message: 'Please select a fiscal year' }]}
        >
          <Select
            allowClear
            placeholder="Select Fiscal Year"
            className="w-full h-12"
            onChange={handleFiscalYearChange}
          >
            {fiscalYear?.items?.map((year: any) => (
              <Select.Option key={year.id} value={year.id}>
                {year?.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Session IDs (comma-separated input) */}
        <Form.Item
          label="Select Sessions"
          name="sessionId"
          rules={[
            { required: true, message: 'Please select at least one session' },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select session(s)"
            className="w-full h-12"
            disabled={!selectedFiscalYear || filteredSessions?.length === 0}
          >
            {filteredSessions.map((session: any) => (
              <Select.Option key={session?.id} value={session?.id}>
                {session?.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <div className="flex justify-end mt-6">
            <Button onClick={handleModalClose} className="mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={submitPending}>
              Export
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExportModal;
