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
      id: selectedJob.id,
      jobStatus: values?.status,
    };
    setChangeStatusModalVisible(false);
    updateJobStatus({ data: updatedStatus, id: selectedJobId });
  };

  React.useEffect(() => {
    if (selectedJob) {
      form.setFieldsValue({
        jobStatus: selectedJob.jobStatus,
      });
    }
  }, [form, selectedJob]);
  return (
    isChangeStatusModalVisible && (
      <Modal
        title="Change Job Status"
        open={isChangeStatusModalVisible}
        onCancel={handleChangeStatusModalClose}
        centered
        footer={[
          <>
            <Button key="cancel" onClick={handleChangeStatusModalClose}>
              Cancel
            </Button>
            <Button key="submit" type="primary" onClick={() => form.submit()}>
              Change Status
            </Button>
          </>,
        ]}
      >
        <Form
          requiredMark={false}
          form={form}
          layout="vertical"
          initialValues={selectedJob}
          onFinish={handleStatusUpdate}
        >
          <Form.Item
            name="status"
            label="Job Status"
            rules={[
              { required: true, message: 'Please select the job status!' },
            ]}
            className="px-5"
          >
            <Select placeholder="Select new status" style={{ width: '100%' }}>
              {JobStatus &&
                Object?.values(JobStatus).map((status) => (
                  <Select.Option key={status} value={status}>
                    {status}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    )
  );
};

export default ChangeStatusModal;
