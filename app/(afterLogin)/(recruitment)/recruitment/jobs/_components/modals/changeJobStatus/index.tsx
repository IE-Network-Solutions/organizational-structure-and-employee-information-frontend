import React from 'react';
import { Modal, Button, Select, Form } from 'antd';
import type { SelectProps } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { useUpdateJobStatus } from '@/store/server/features/recruitment/job/mutation';
import { JobStatus } from '@/types/enumTypes';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const ChangeStatusModal: React.FC = () => {
  const [form] = Form.useForm();
  const updatedBy = useAuthenticationStore.getState().userId;

  const {
    isChangeStatusModalVisible,
    setChangeStatusModalVisible,
    selectedJobId,
    selectedJob,
  } = useJobState();

  const { mutate: updateJobStatus } = useUpdateJobStatus();
  const handleChangeStatusModalClose = () => {
    setChangeStatusModalVisible(false);
  };

  const handleStatusUpdate = (values: any) => {
    const updatedStatus = {
      updatedBy,
      id: selectedJob?.id,
      jobStatus: values?.status,
    };

    updateJobStatus(
      { data: updatedStatus, id: selectedJobId },
      {
        onSuccess: () => {
          setChangeStatusModalVisible(false);
          form.resetFields();
        },
      },
    );
  };

  const currentStatus = Form.useWatch('status', form);

  React.useEffect(() => {
    if (selectedJob) {
      form.setFieldsValue({
        status: selectedJob?.jobStatus,
      });
    }
  }, [selectedJob, form]);

  const modalTitle = <span className="text-lg font-semibold text-gray-900">Change Job Status</span>;

  const optionRender: SelectProps['optionRender'] = (option) => (
    <div className="flex items-center justify-between w-full">
      <span>{option.label}</span>
      {option.value === currentStatus && (
        <CheckOutlined className="text-[#6366F1] text-sm shrink-0 ml-2" />
      )}
    </div>
  );

  return (
    isChangeStatusModalVisible && (
      <>
        <style>{`
          #change-job-status-modal .ant-select .ant-select-selector {
            border: 1px solid #d9d9d9;
            border-radius: 6px;
          }
          #change-job-status-modal .ant-select:hover .ant-select-selector {
            border-color: #93C5FD;
          }
          #change-job-status-modal .ant-select-focused .ant-select-selector,
          #change-job-status-modal .ant-select-open .ant-select-selector {
            border-color: #93C5FD !important;
            box-shadow: 0 0 0 2px rgba(147, 197, 253, 0.25) !important;
          }
          #change-job-status-modal .ant-select-dropdown .ant-select-item-option-selected {
            background-color: #EFF6FF !important;
          }
          #change-job-status-modal .ant-select-dropdown .ant-select-item-option-active {
            background-color: #EFF6FF !important;
          }
          #change-job-status-modal .ant-select-item-option-selected .ant-select-item-option-state {
            color: #6366F1;
          }
        `}</style>
        <Modal
          id="change-job-status-modal"
          data-cy="talent-acquisition-change-job-status-modal"
          title={modalTitle}
          open={isChangeStatusModalVisible}
          onCancel={handleChangeStatusModalClose}
          centered
          footer={null}
          classNames={{ content: 'rounded-lg' }}
        >
        <Form
          id="talent-acquisition-change-job-status-form"
          data-cy="talent-acquisition-change-job-status-form"
          form={form}
          layout="vertical"
          onFinish={handleStatusUpdate}
          className="border border-gray-200 rounded-lg p-4"
        >
          <Form.Item
            name="status"
            label="Job Status"
            rules={[
              { required: true, message: 'Please select the job status!' },
            ]}
            className="mb-6 mt-2"
          >
            <Select
              id="talent-acquisition-change-job-status-select"
              data-cy="talent-acquisition-change-job-status-select"
              placeholder="Open"
              style={{ width: '100%' }}
              suffixIcon={<span className="text-gray-400">▼</span>}
              getPopupContainer={() => document.getElementById('change-job-status-modal') || document.body}
              optionRender={optionRender}
            >
              {JobStatus &&
                Object?.values(JobStatus).map((status) => (
                  <Select.Option
                    key={status}
                    value={status}
                    id={`talent-acquisition-change-job-status-option-${status}`}
                    data-cy={`talent-acquisition-change-job-status-option-${status}`}
                  >
                    {status}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <div
              data-cy="-components-modals-changejobstatus-index-tsx-index-div-97"
              className="flex gap-3 justify-end"
            >
              <Button
                id="talent-acquisition-change-job-status-button-cancel"
                data-cy="talent-acquisition-change-job-status-button-cancel"
                key="cancel"
                onClick={handleChangeStatusModalClose}
                className="border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                id="talent-acquisition-change-job-status-button-submit"
                data-cy="talent-acquisition-change-job-status-button-submit"
                htmlType="submit"
                type="primary"
                className="!bg-[#6366F1] hover:!bg-[#4F46E5] border-0"
              >
                Change
              </Button>
            </div>
          </Form.Item>
        </Form>
        </Modal>
      </>
    )
  );
};

export default ChangeStatusModal;
