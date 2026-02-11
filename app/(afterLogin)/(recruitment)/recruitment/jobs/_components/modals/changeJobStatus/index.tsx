import React from 'react';
import { Modal, Button, Select, Form } from 'antd';
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

  React.useEffect(() => {
    if (selectedJob) {
      form.setFieldsValue({
        status: selectedJob?.jobStatus,
      });
    }
  }, [selectedJob]);

  return (
    isChangeStatusModalVisible && (
      <Modal
        data-cy="talent-acquisition-change-job-status-modal"
        title="Change Job Status"
        open={isChangeStatusModalVisible}
        onCancel={handleChangeStatusModalClose}
        centered
        footer={null}
      >
        <Form
          id="talent-acquisition-change-job-status-form"
          data-cy="talent-acquisition-change-job-status-form"
          requiredMark={false}
          form={form}
          layout="vertical"
          onFinish={handleStatusUpdate}
        >
          <Form.Item
            name="status"
            label="Job Status"
            rules={[
              { required: true, message: 'Please select the job status!' },
            ]}
            className="px-5 mb-6 mt-2"
          >
            <Select
              id="talent-acquisition-change-job-status-select"
              data-cy="talent-acquisition-change-job-status-select"
              placeholder="Select new status"
              style={{ width: '100%' }}
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

          <Form.Item>
            <div
              data-cy="-components-modals-changejobstatus-index-tsx-index-div-97"
              className="flex space-x-3 justify-end"
            >
              <Button
                id="talent-acquisition-change-job-status-button-cancel"
                data-cy="talent-acquisition-change-job-status-button-cancel"
                key="cancel"
                onClick={handleChangeStatusModalClose}
              >
                Cancel
              </Button>
              <Button
                id="talent-acquisition-change-job-status-button-submit"
                data-cy="talent-acquisition-change-job-status-button-submit"
                htmlType="submit"
                type="primary"
              >
                Change Status
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    )
  );
};

export default ChangeStatusModal;
