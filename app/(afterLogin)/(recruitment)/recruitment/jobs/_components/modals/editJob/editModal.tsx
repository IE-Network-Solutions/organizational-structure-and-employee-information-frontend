import React from 'react';
import { Button, Form, Input, Select, DatePicker } from 'antd';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { useUpdateJobs } from '@/store/server/features/recruitment/job/mutation';
import { LocationType } from '@/types/enumTypes';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import TextEditor from '@/components/form/textEditor';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';

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
      jobDeadline: formValues?.jobDeadline,
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
        jobDeadline: dayjs(selectedJob.jobDeadline),
      });
    }
  }, [form, selectedJob]);
  return (
    isEditModalVisible && (
      <CustomDrawerLayout
        open={isEditModalVisible}
        onClose={handleEditModalClose}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            <span>Edit Job</span>
          </CustomDrawerHeader>
        }
        footer={
          <Form.Item>
            <div className="flex justify-center absolute w-full space-x-5 pb-2 bg-white ">
              <Button
                onClick={handleEditModalClose}
                className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-10 hover:border-gray-500 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                className="flex justify-center border-none text-sm font-medium text-white bg-primary p-4 px-10 h-10"
              >
                Update Job
              </Button>
            </div>
          </Form.Item>
        }
        width="600px"
      >
        <Form
          requiredMark={false}
          form={form}
          onFinish={handleUpdateJob}
          layout="vertical"
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
            name="jobDeadline"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Expected Closing Date
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the expected closing date!',
              },
              {
                validator({}, value) {
                  if (!value || value.isAfter(dayjs(), 'day')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      'Expected end date cannot be before the current date!',
                    ),
                  );
                },
              },
            ]}
          >
            <DatePicker id="jobDeadline" className="text-sm w-full h-10" />
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
            <TextEditor placeholder="Enter job description" />
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default EditJob;
