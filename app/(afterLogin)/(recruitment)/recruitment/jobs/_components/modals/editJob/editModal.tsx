import React, { useMemo } from 'react';
import {
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Skeleton,
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
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { TaRequiredMark } from '../../../../_components/taRequiredMark';

interface OrgUser {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

const getUserFullName = (user: OrgUser) =>
  `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim();

const { Option } = Select;

const EditJob: React.FC = () => {
  const [form] = Form.useForm();
  const updatedBy = useAuthenticationStore.getState().userId;
  const { data: departments, isLoading: isDepartmentLoading } =
    useGetDepartments();
  const { data: usersData, isLoading: isUsersLoading } = useGetAllUsers();

  const hiringManagerOptions = useMemo(
    () =>
      (usersData?.items || []).map((user: OrgUser) => ({
        value: user.id,
        label: getUserFullName(user),
      })),
    [usersData?.items],
  );

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
      hiringManagerId: formValues?.hiringManagerId,
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
        hiringManagerId: selectedJob.hiringManagerId,
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
            <span data-cy="-components-modals-editjob-editmodal-tsx-editmodal-span-92">
              Edit Job
            </span>
          </CustomDrawerHeader>
        }
        footer={
          <Form.Item>
            <div
              data-cy="-components-modals-editjob-editmodal-tsx-editmodal-div-97"
              className="flex justify-center gap-2 pb-2 pt-1"
            >
              <Button
                id="talent-acquisition-edit-job-button-cancel"
                data-cy="talent-acquisition-edit-job-button-cancel"
                onClick={handleEditModalClose}
                className="!h-9 !min-w-[120px] !border-[#D9D9D9] !bg-white !px-4 !text-[14px] !font-normal !text-[rgba(0,0,0,0.7)] hover:!border-[#1E40AF] hover:!text-[#1E40AF]"
              >
                Cancel
              </Button>
              <Button
                id="talent-acquisition-edit-job-button-update"
                data-cy="talent-acquisition-edit-job-button-update"
                type="primary"
                onClick={() => form.submit()}
                className="!h-9 !min-w-[120px] !border !border-solid !border-[#1E40AF] !bg-[#1E40AF] !px-4 !text-[14px] !font-normal !text-white hover:!border-[#1D4ED8] hover:!bg-[#1D4ED8]"
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
              <span
                data-cy="-components-modals-editjob-editmodal-tsx-editmodal-span-131"
                className="my-2 inline-flex items-center gap-1.5 text-md font-semibold text-gray-700"
              >
                Job Name
                <TaRequiredMark data-cy="talent-acquisition-edit-job-required-job-title" />
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
            name="hiringManagerId"
            label={
              <span
                data-cy="talent-acquisition-edit-job-label-hiring-manager"
                className="my-2 inline-flex items-center gap-1.5 text-md font-semibold text-gray-700"
              >
                Hiring Manager
                <TaRequiredMark data-cy="talent-acquisition-edit-job-required-hiring-manager" />
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please select a hiring manager!',
              },
            ]}
          >
            <Select
              id="talent-acquisition-edit-job-select-hiring-manager"
              data-cy="talent-acquisition-edit-job-select-hiring-manager"
              showSearch
              placeholder="Select hiring manager"
              optionFilterProp="label"
              className="text-sm w-full h-10"
              loading={isUsersLoading}
              allowClear
              options={hiringManagerOptions}
            />
          </Form.Item>
          <Form.Item
            name="employmentType"
            label={
              <span
                data-cy="-components-modals-editjob-editmodal-tsx-editmodal-span-154"
                className="my-2 inline-flex items-center gap-1.5 text-md font-semibold text-gray-700"
              >
                Employment Type
                <TaRequiredMark data-cy="talent-acquisition-edit-job-required-employment-type" />
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
              <span
                data-cy="-components-modals-editjob-editmodal-tsx-editmodal-span-187"
                className="my-2 inline-flex items-center gap-1.5 text-md font-semibold text-gray-700"
              >
                Department
                <TaRequiredMark data-cy="talent-acquisition-edit-job-required-department" />
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
                <div
                  data-cy="-components-modals-editjob-editmodal-tsx-editmodal-div-205"
                  className="flex items-center justify-center h-30"
                >
                  <Skeleton.Button active size="small" />
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
              <span
                data-cy="-components-modals-editjob-editmodal-tsx-editmodal-span-225"
                className="my-2 inline-flex items-center gap-1.5 text-md font-semibold text-gray-700"
              >
                Location
                <TaRequiredMark data-cy="talent-acquisition-edit-job-required-location" />
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
              <span
                data-cy="-components-modals-editjob-editmodal-tsx-editmodal-span-257"
                className="my-2 inline-flex items-center gap-1.5 text-md font-semibold text-gray-700"
              >
                Years of Experience
                <TaRequiredMark data-cy="talent-acquisition-edit-job-required-years" />
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
              <span
                data-cy="-components-modals-editjob-editmodal-tsx-editmodal-span-282"
                className="my-2 inline-flex items-center gap-1.5 text-md font-semibold text-gray-700"
              >
                Job Status
                <TaRequiredMark data-cy="talent-acquisition-edit-job-required-status" />
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
              <span
                data-cy="-components-modals-editjob-editmodal-tsx-editmodal-span-318"
                className="my-2 inline-flex items-center gap-1.5 text-md font-semibold text-gray-700"
              >
                Compensation
                <TaRequiredMark data-cy="talent-acquisition-edit-job-required-compensation" />
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
              <span
                data-cy="-components-modals-editjob-editmodal-tsx-editmodal-span-352"
                className="my-2 inline-flex items-center gap-1.5 text-md font-semibold text-gray-700"
              >
                Quantity
                <TaRequiredMark data-cy="talent-acquisition-edit-job-required-quantity" />
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
              <span
                data-cy="-components-modals-editjob-editmodal-tsx-editmodal-span-375"
                className="my-2 inline-flex items-center gap-1.5 text-md font-semibold text-gray-700"
              >
                Expected Closing Date
                <TaRequiredMark data-cy="talent-acquisition-edit-job-required-deadline" />
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the expected closing date!',
              },
              {
                validator({}, value) {
                  const today = dayjs();
                  if (
                    !value ||
                    value.isAfter(today, 'day') ||
                    value.isSame(today, 'day')
                  ) {
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
              <span
                data-cy="-components-modals-editjob-editmodal-tsx-editmodal-span-408"
                className="my-2 inline-flex items-center gap-1.5 text-md font-semibold text-gray-700"
              >
                Description
                <TaRequiredMark data-cy="talent-acquisition-edit-job-required-description" />
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
