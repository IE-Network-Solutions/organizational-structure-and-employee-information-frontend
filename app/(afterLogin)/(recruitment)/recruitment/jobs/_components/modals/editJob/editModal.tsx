import React from 'react';
import { Modal, Button, Form, Input, Select } from 'antd';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { useUpdateJobs } from '@/store/server/features/recruitment/job/mutation';
import { LocationType } from '@/types/enumTypes';
import TextArea from 'antd/es/input/TextArea';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const EditJob: React.FC = () => {
  const [form] = Form.useForm();
  const updatedBy = useAuthenticationStore.getState().userId;

  const {
    isEditModalVisible,
    setEditModalVisible,
    selectedJobId,
    selectedJob,
  } = useJobState();

  const { mutate: updateJob } = useUpdateJobs();

  const handleUpdateJob = () => {
    const formValues = form.getFieldsValue();
    const updatedFormValues = {
      id: selectedJob.id,
      updatedBy,
      jobTitle: formValues?.jobTitle,
      description: formValues?.description,
      jobLocation: formValues?.jobLocation,
    };
    updateJob({ data: updatedFormValues, id: selectedJobId });
    setEditModalVisible(false);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
  };

  React.useEffect(() => {
    if (selectedJob) {
      form.setFieldsValue({
        jobTitle: selectedJob.jobTitle,
        jobLocation: selectedJob.jobLocation,
        description: selectedJob.description,
      });
    }
  }, [form, selectedJob]);
  return (
    isEditModalVisible && (
      <Modal
        title="Edit Job"
        open={isEditModalVisible}
        onCancel={handleEditModalClose}
        footer={false}
      >
        <Form
          requiredMark={false}
          form={form}
          onFinish={handleUpdateJob}
          layout="vertical"
          initialValues={selectedJob}
        >
          <Form.Item
            id="jobTitle"
            name="jobTitle"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Job Name
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the job name!',
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Job title"
              className="text-sm w-full  h-10"
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="jobLocation"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Location
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the location!',
              },
            ]}
          >
            <Select placeholder="Location" className="text-sm w-full h-10">
              {Object.values(LocationType).map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Description
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the description!',
              },
            ]}
          >
            <TextArea rows={4} placeholder="Description" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-center w-full bg-[#fff] px-6 py-6 gap-6">
              <Button
                onClick={handleEditModalClose}
                className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12"
              >
                Update Job
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    )
  );
};

export default EditJob;
