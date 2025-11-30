import React from 'react';
import {
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Spin,
  InputNumber,
} from 'antd';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { useUpdateJobs } from '@/store/server/features/recruitment/job/mutation';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import TextEditor from '@/components/form/textEditor';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { EmploymentType, LocationType } from '@/types/enumTypes';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';

const { Option } = Select;

const EditJob: React.FC = () => {
  const [form] = Form.useForm();
  const updatedBy = useAuthenticationStore.getState().userId;
  const { data: departments, isLoading: isDepartmentLoading } =
    useGetDepartments();

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
      jobDeadline: dayjs(formValues?.jobDeadline).format('YYYY-MM-DD'),
      employmentType: formValues?.employmentType,
      departmentId: formValues?.department,
      yearOfExperience: Number(formValues?.yearOfExperience),
      quantity: formValues?.quantity,
      jobStatus: formValues?.jobStatus,
      compensation: formValues?.compensation,
    };
    updateJob(
      { data: updatedFormValues, id: selectedJob?.id || selectedJobId },
      {
        onSuccess: () => {
          setEditModalVisible(false);
        },
      },
    );
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
        employmentType: selectedJob.employmentType,
        department: selectedJob.departmentId,
        yearOfExperience: selectedJob.yearOfExperience,
        quantity: selectedJob.quantity,
        jobStatus: selectedJob.jobStatus,
        compensation: selectedJob.compensation,
      });
    }
  }, [form, selectedJob]);
  return (
    isEditModalVisible && (
      <CustomDrawerLayout
        data-cy="talent-acquisition-edit-job-drawer"
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
                id="talent-acquisition-edit-job-button-cancel"
                data-cy="talent-acquisition-edit-job-button-cancel"
                onClick={handleEditModalClose}
                className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-10 hover:border-gray-500 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                id="talent-acquisition-edit-job-button-update"
                data-cy="talent-acquisition-edit-job-button-update"
                onClick={() => form.submit()}
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
          id="talent-acquisition-edit-job-form"
          data-cy="talent-acquisition-edit-job-form"
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
              id="talent-acquisition-edit-job-input-job-title"
              data-cy="talent-acquisition-edit-job-input-job-title"
              size="large"
              placeholder="Job title"
              className="text-sm w-full  h-10"
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="employmentType"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Employment Type
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the employment type!',
              },
            ]}
          >
            <Select
              id="employmentType"
              data-cy="talent-acquisition-edit-job-select-employment-type"
              placeholder="Employment type"
              className="text-sm w-full h-10"
            >
              {EmploymentType &&
                Object.values(EmploymentType).map((type) => (
                  <Option
                    key={type}
                    value={type}
                    id={`talent-acquisition-edit-job-option-employment-type-${type}`}
                    data-cy={`talent-acquisition-edit-job-option-employment-type-${type}`}
                  >
                    {type}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="department"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Department
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the department!',
              },
            ]}
          >
            <Select
              id="department"
              data-cy="talent-acquisition-edit-job-select-department"
              placeholder="Department"
              className="text-sm w-full h-10"
            >
              {isDepartmentLoading && (
                <div className="flex items-center justify-center h-30">
                  <Spin size="small" />
                </div>
              )}
              {departments &&
                departments.map((dep: any) => (
                  <Option
                    key={dep?.id}
                    value={dep?.id}
                    id={`talent-acquisition-edit-job-option-department-${dep?.id}`}
                    data-cy={`talent-acquisition-edit-job-option-department-${dep?.id}`}
                  >
                    {dep?.name}
                  </Option>
                ))}
            </Select>
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
            <Select
              id="talent-acquisition-edit-job-select-location"
              data-cy="talent-acquisition-edit-job-select-location"
              placeholder="Location"
              className="text-sm w-full h-10"
            >
              {Object.values(LocationType).map((type) => (
                <Select.Option
                  key={type}
                  value={type}
                  id={`talent-acquisition-edit-job-option-location-${type}`}
                  data-cy={`talent-acquisition-edit-job-option-location-${type}`}
                >
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="yearOfExperience"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Years of Experience
              </span>
            }
            rules={[
              {
                required: true,
                type: 'number',
                message: 'Please input the years of experience!',
                transform: (value) => (value ? Number(value) : value),
              },
            ]}
          >
            <InputNumber
              id="yearOfExperience"
              data-cy="talent-acquisition-edit-job-input-year-experience"
              size="large"
              placeholder="0"
              className="text-sm w-full h-10"
            />
          </Form.Item>

          <Form.Item
            name="jobStatus"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Job Status
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the job status',
              },
            ]}
          >
            <Select
              id="jobStatus"
              data-cy="talent-acquisition-edit-job-select-job-status"
              placeholder="Job status"
              className="text-sm w-full h-10"
            >
              <Option
                value="Open"
                id="talent-acquisition-edit-job-option-status-open"
                data-cy="talent-acquisition-edit-job-option-status-open"
              >
                Open
              </Option>
              <Option
                value="Closed"
                id="talent-acquisition-edit-job-option-status-closed"
                data-cy="talent-acquisition-edit-job-option-status-closed"
              >
                Closed
              </Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="compensation"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Compensation
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the compensation!',
              },
            ]}
          >
            <Select
              id="compensation"
              data-cy="talent-acquisition-edit-job-select-compensation"
              placeholder="Compensation"
              className="text-sm w-full h-10"
            >
              {EmploymentType &&
                Object.values(EmploymentType).map((type, index) => (
                  <Option
                    id={`compensationOption-${index}`}
                    data-cy={`talent-acquisition-edit-job-option-compensation-${index}`}
                    key={type}
                    value={type}
                  >
                    {type}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Quantity
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the quantity!',
              },
            ]}
          >
            <InputNumber
              id="quantity"
              data-cy="talent-acquisition-edit-job-input-quantity"
              size="large"
              placeholder="0"
              className="text-sm w-full h-10"
            />
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
            <DatePicker
              id="jobDeadline"
              data-cy="talent-acquisition-edit-job-date-picker-deadline"
              className="text-sm w-full h-10"
            />
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
