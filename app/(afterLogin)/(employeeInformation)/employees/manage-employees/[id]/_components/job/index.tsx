import dayjs from 'dayjs';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Table,
  Modal,
  Select,
  Switch,
  TimePicker,
} from 'antd';
import { InfoLine } from '../common/infoLine';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import WorkScheduleComponent from './workSchedule';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { CreateEmployeeJobInformation } from './addEmployeeJobInfrmation';
import { FaPlus } from 'react-icons/fa';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import DownloadJobInformation from './downloadJobInformation';
import BasicSalary from './basicSalary';
import { LuPencil } from 'react-icons/lu';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useUpdateEmployee } from '@/store/server/features/employees/employeeDetail/mutations';
import { useUpdateEmployeeJobInformation } from '@/store/server/features/employees/employeeDetail/mutations';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetBranches } from '@/store/server/features/employees/employeeManagment/branchOffice/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import { useGetWorkSchedules } from '@/store/server/features/employees/employeeManagment/workSchedule/queries';

function Job({ id }: { id: string }) {
  const params = useParams();
  const userId = params.id as string;
  const { userId: loggedInUserId } = useAuthenticationStore();
  const { isLoading, data: employeeData, refetch } = useGetEmployee(userId);
  const { setIsAddEmployeeJobInfoModalVisible } = useEmployeeManagementStore();

  // API queries for form options
  const { data: departmentData } = useGetDepartments();
  const { data: employementType } = useGetEmployementTypes();
  const { data: branchOfficeData } = useGetBranches();
  const { data: positions } = useGetAllPositions();
  const { data: workSchedules } = useGetWorkSchedules();

  // Sort job information with active jobs at the top
  const sortedJobInformation = useMemo(() => {
    if (!employeeData?.employeeJobInformation) return [];

    return [...employeeData.employeeJobInformation].sort((a, b) => {
      // First sort by active status (active jobs first)
      if (a.isPositionActive && !b.isPositionActive) return -1;
      if (!a.isPositionActive && b.isPositionActive) return 1;

      // Then sort by effective start date (newest first)
      const dateA = new Date(a.effectiveStartDate || 0).getTime();
      const dateB = new Date(b.effectiveStartDate || 0).getTime();
      return dateB - dateA;
    });
  }, [employeeData?.employeeJobInformation]);

  const handleAddEmployeeJobInformation = () => {
    setIsAddEmployeeJobInfoModalVisible(true);
  };

  // Callback to refresh job information data
  const handleJobInfoUpdated = () => {
    refetch();
  };
  const { mutate: updateEmployeeInformation } = useUpdateEmployee();
  const { mutate: updateEmployeeJobInformation, isLoading: isUpdating } =
    useUpdateEmployeeJobInformation();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedJobRecord, setSelectedJobRecord] = useState<any>(null);
  const [selectedWorkSchedule, setSelectedWorkSchedule] = useState<any>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const handleEditClick = () => {
    form.setFieldsValue({
      joinedDate: dayjs(employeeData?.employeeInformation?.joinedDate),
    });
    setIsEditing((isEditing) => !isEditing);
  };

  const handleJobEditClick = (record: any) => {
    setSelectedJobRecord(record);
    setSelectedWorkSchedule(record.workSchedule);
    editForm.setFieldsValue({
      effectiveStartDate: dayjs(record.effectiveStartDate),
      positionId: record.positionId,
      employementTypeId: record.employementTypeId,
      departmentId: record.departmentId,
      branchId: record.branchId,
      workScheduleId: record.workScheduleId,
      departmentLeadOrNot: record.departmentLeadOrNot,
    });
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setSelectedJobRecord(null);
    setSelectedWorkSchedule(null);
    editForm.resetFields();
  };

  const editJoinedDate = (values: any) => {
    updateEmployeeInformation(
      {
        id: employeeData?.employeeInformation?.id,
        values,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          handleJobInfoUpdated(); // Refresh data after successful update
        },
      },
    );
  };

  const editJobInformation = (values: any) => {
    if (!selectedJobRecord) return;

    const updatedValues = {
      effectiveStartDate: values.effectiveStartDate?.format('YYYY-MM-DD'),
      positionId: values.positionId,
      employementTypeId: values.employementTypeId,
      departmentId: values.departmentId,
      branchId: values.branchId,
      workScheduleId: values.workScheduleId,
      departmentLeadOrNot: values.departmentLeadOrNot || false,
    };

    updateEmployeeJobInformation(
      {
        id: selectedJobRecord.id,
        values: updatedValues,
        changeMakerUserId: loggedInUserId,
      },
      {
        onSuccess: () => {
          handleEditModalClose();
          handleJobInfoUpdated(); // Refresh data after successful update
        },
      },
    );
  };

  const handleWorkScheduleChange = (value: string) => {
    const selectedValue = workSchedules?.items?.find(
      (schedule) => schedule.id === value,
    );
    setSelectedWorkSchedule(selectedValue || null);
  };

  // Function to disable dates before creation date
  const disabledDate = (current: dayjs.Dayjs) => {
    // Use the main employee record's createdAt, not nested objects
    const createdAt = employeeData?.createdAt;
    if (!createdAt) return false;

    // Disable dates before the creation date (exact day, month, year)
    const creationDate = dayjs(createdAt);
    return current && current.isBefore(creationDate, 'day');
  };

  const columns = [
    {
      title: 'Effective Date',
      dataIndex: 'effectiveStartDate',
      key: 'effectiveStartDate',
      render: (text: string) => (text ? text.slice(0, 10) : '-'),
    },
    {
      title: 'Job Title',
      dataIndex: 'position',
      key: 'position',
      render: (ruleData: any, record: any) => (
        <>{record?.position?.name ?? '-'}</>
      ),
    },
    {
      title: 'Employment Type',
      dataIndex: 'employementTypeId',
      key: 'employementTypeId',
      render: (ruleData: any, record: any) => (
        <>{record?.employementType?.name ?? '-'}</>
      ),
    },
    {
      title: 'Manager',
      dataIndex: 'address',
      key: 'address',
      render: (text: string) => (text ? text : '-'),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (ruleData: any, record: any) => (
        <>{record?.department?.name ?? '-'}</>
      ),
    },
    {
      title: 'Branch Office',
      dataIndex: 'branch',
      key: 'branch',
      render: (ruleData: any, record: any) => (
        <>{record?.branch?.name ?? '-'}</>
      ),
    },
    {
      title: 'Job Status',
      dataIndex: 'jobAction',
      key: 'jobAction',
      render: (text: string) => (text ? text : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: any) => {
        if (!record.isPositionActive) return null;

        return (
          <Button
            icon={<LuPencil />}
            size="small"
            onClick={() => handleJobEditClick(record)}
            id={`job-table-edit-btn-${record.id}`}
            data-cy={`job-table-edit-btn-${record.id}`}
          />
        );
      },
    },
  ];

  return (
    <>
      <Card
        loading={isLoading}
        title="Employment Information"
        extra={
          <Button
            icon={<LuPencil />}
            onClick={handleEditClick}
            id="job-employment-edit-btn"
            data-cy="job-employment-edit-btn"
          />
        }
        className="my-6 mt-0"
        id="job-employment-card"
        data-cy="job-employment-card"
      >
        <Row
          gutter={[16, 24]}
          id="job-employment-row"
          data-cy="job-employment-row"
        >
          <Col lg={16} id="job-employment-col" data-cy="job-employment-col">
            <InfoLine
              data-cy="job-employment-service-year"
              title="Service Year"
              value={
                employeeData?.employeeInformation?.joinedDate ? (
                  <>
                    {Math.floor(
                      dayjs().diff(
                        dayjs(employeeData?.employeeInformation?.joinedDate),
                        'months',
                      ) / 12,
                    )}
                    {' Years, '}
                    {dayjs().diff(
                      dayjs(employeeData?.employeeInformation?.joinedDate),
                      'months',
                    ) % 12}{' '}
                    Months
                  </>
                ) : (
                  '-'
                )
              }
            />
            <InfoLine
              title="Joined Date"
              value={
                isEditing ? (
                  <Form
                    onFinish={editJoinedDate}
                    form={form}
                    layout="inline"
                    id="job-joined-date-form"
                    data-cy="job-joined-date-form"
                  >
                    <Form.Item
                      name="joinedDate"
                      id="job-joined-date-form-item"
                      data-cy="job-joined-date-form-item"
                      rules={[
                        { required: true, message: 'Please select a date!' },
                      ]}
                    >
                      <DatePicker
                        format="YYYY-MM-DD"
                        id="job-joined-date-datepicker"
                        data-cy="job-joined-date-datepicker"
                      />
                    </Form.Item>
                    <Form.Item
                      id="job-joined-date-submit-form-item"
                      data-cy="job-joined-date-submit-form-item"
                    >
                      <Button
                        type="primary"
                        htmlType="submit"
                        id="job-joined-date-submit-btn"
                        data-cy="job-joined-date-submit-btn"
                      >
                        Save
                      </Button>
                    </Form.Item>
                  </Form>
                ) : (
                  dayjs(employeeData?.employeeInformation?.joinedDate)?.format(
                    'DD MMMM, YYYY',
                  ) || '-'
                )
              }
            />
          </Col>
        </Row>
      </Card>
      <Card
        className="my-6 mt-0"
        title={'Job Information'}
        extra={
          <div
            className=" flex justify-center items-center gap-3"
            id="job-information-extra"
            data-cy="job-information-extra"
          >
            <AccessGuard
              permissions={[Permissions.UpdateEmployeeJobInformation]}
              id="job-information-add-guard"
              data-cy="job-information-add-guard"
            >
              <FaPlus
                onClick={handleAddEmployeeJobInformation}
                id="job-information-add-btn"
                data-cy="job-information-add-btn"
              />
            </AccessGuard>
            <div
              className="pt-2"
              id="job-information-download-wrapper"
              data-cy="job-information-download-wrapper"
            >
              <DownloadJobInformation
                id={id}
                data-cy="job-information-download"
              />
            </div>
          </div>
        }
        id="job-information-card"
        data-cy="job-information-card"
      >
        <Table
          dataSource={sortedJobInformation}
          columns={columns}
          className="w-full overflow-auto"
          pagination={{ hideOnSinglePage: true }}
          rowKey="id"
          id="job-information-table"
          data-cy="job-information-table"
        />
      </Card>
      <WorkScheduleComponent data-cy="job-work-schedule" />
      <CreateEmployeeJobInformation
        id={userId}
        onJobInfoUpdated={handleJobInfoUpdated}
        data-cy="job-create-job-info"
      />
      <BasicSalary id={userId} data-cy="job-basic-salary" />

      {/* Edit Job Information Modal */}
      <Modal
        title="Edit Employee Job Information"
        centered
        open={isEditModalVisible}
        onCancel={handleEditModalClose}
        footer={false}
        destroyOnClose
        data-cy="job-edit-modal"
      >
        <Form
          form={editForm}
          onFinish={editJobInformation}
          layout="vertical"
          id="job-edit-form"
          data-cy="job-edit-form"
        >
          {/* Job Timeline Section */}
          <div
            className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2"
            id="job-edit-timeline-header"
            data-cy="job-edit-timeline-header"
          >
            Job Timeline
          </div>

          {/* Effective Start Date */}
          <Row
            gutter={16}
            id="job-edit-effective-date-row"
            data-cy="job-edit-effective-date-row"
          >
            <Col
              xs={24}
              id="job-edit-effective-date-col"
              data-cy="job-edit-effective-date-col"
            >
              <Form.Item
                className="font-semibold text-xs"
                name={'effectiveStartDate'}
                id="job-edit-effective-date-form-item"
                data-cy="job-edit-effective-date-form-item"
                label={
                  <span
                    className="mb-1 font-semibold text-xs"
                    id="job-edit-effective-date-label"
                    data-cy="job-edit-effective-date-label"
                  >
                    Effective Start Date *
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select the joined date' },
                ]}
              >
                <DatePicker
                  className="w-full"
                  format="DD MMM YYYY"
                  disabledDate={disabledDate}
                  id="job-edit-effective-date-datepicker"
                  data-cy="job-edit-effective-date-datepicker"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Position and Employment Type */}
          <Row
            gutter={16}
            id="job-edit-position-employment-row"
            data-cy="job-edit-position-employment-row"
          >
            <Col
              xs={12}
              id="job-edit-position-col"
              data-cy="job-edit-position-col"
            >
              <Form.Item
                className="font-semibold text-xs"
                name={'positionId'}
                id="job-edit-position-form-item"
                data-cy="job-edit-position-form-item"
                label={
                  <span
                    className="mb-1 font-semibold text-xs"
                    data-cy="job-edit-position-label"
                  >
                    Position *
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select a position' },
                ]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select position"
                  allowClear
                  id="job-edit-position-select"
                  data-cy="job-edit-position-select"
                  options={positions?.items?.map((position: any) => ({
                    value: position?.id,
                    label: position?.name || '',
                  }))}
                />
              </Form.Item>
            </Col>
            <Col
              xs={12}
              id="job-edit-employment-type-col"
              data-cy="job-edit-employment-type-col"
            >
              <Form.Item
                className="font-semibold text-xs"
                name={'employementTypeId'}
                id="job-edit-employment-type-form-item"
                data-cy="job-edit-employment-type-form-item"
                label={
                  <span
                    className="mb-1 font-semibold text-xs"
                    data-cy="job-edit-employment-type-label"
                  >
                    Employment Type *
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: 'Please select an employment type',
                  },
                ]}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select an employment type"
                  id="job-edit-employment-type-select"
                  data-cy="job-edit-employment-type-select"
                  options={employementType?.items?.map((type: any) => ({
                    value: type?.id,
                    label: type?.name || '',
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Department and Branch Office in single column */}
          <Row
            gutter={16}
            id="job-edit-department-row"
            data-cy="job-edit-department-row"
          >
            <Col
              xs={24}
              id="job-edit-department-col"
              data-cy="job-edit-department-col"
            >
              <Form.Item
                className="w-full font-semibold text-xs"
                name={'departmentId'}
                id="job-edit-department-form-item"
                data-cy="job-edit-department-form-item"
                label={
                  <span
                    className="mb-1 font-semibold text-xs"
                    data-cy="job-edit-department-label"
                  >
                    Department *
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select a department' },
                ]}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select a department"
                  id="job-edit-department-select"
                  data-cy="job-edit-department-select"
                  options={departmentData?.map((department: any) => ({
                    value: department?.id,
                    label: department?.name || '',
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row
            gutter={16}
            id="job-edit-branch-row"
            data-cy="job-edit-branch-row"
          >
            <Col xs={24} id="job-edit-branch-col" data-cy="job-edit-branch-col">
              <Form.Item
                className="w-full font-semibold text-xs"
                name={'branchId'}
                id="job-edit-branch-form-item"
                data-cy="job-edit-branch-form-item"
                label={
                  <span
                    className="mb-1 font-semibold text-xs"
                    data-cy="job-edit-branch-label"
                  >
                    Branch Office *
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select a branch office' },
                ]}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select a branch office"
                  id="job-edit-branch-select"
                  data-cy="job-edit-branch-select"
                  options={branchOfficeData?.items?.map((branch: any) => ({
                    value: branch?.id,
                    label: branch?.name || '',
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Team Lead */}
          <Row
            gutter={16}
            id="job-edit-team-lead-row"
            data-cy="job-edit-team-lead-row"
          >
            <Col
              xs={16}
              sm={8}
              id="job-edit-team-lead-label-col"
              data-cy="job-edit-team-lead-label-col"
            >
              <div
                className="font-semibold text-sm"
                id="job-edit-team-lead-label"
                data-cy="job-edit-team-lead-label"
              >
                Team Lead
              </div>
            </Col>
            <Col
              xs={8}
              sm={16}
              id="job-edit-team-lead-switch-col"
              data-cy="job-edit-team-lead-switch-col"
            >
              <Form.Item
                name="departmentLeadOrNot"
                valuePropName="checked"
                id="job-edit-team-lead-form-item"
                data-cy="job-edit-team-lead-form-item"
              >
                <Switch
                  id="job-edit-team-lead-switch"
                  data-cy="job-edit-team-lead-switch"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Work Schedule Section */}
          <div
            className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2"
            id="job-edit-work-schedule-header"
            data-cy="job-edit-work-schedule-header"
          >
            Work Schedule
          </div>

          <Row
            gutter={16}
            id="job-edit-work-schedule-row"
            data-cy="job-edit-work-schedule-row"
          >
            <Col
              xs={24}
              sm={24}
              id="job-edit-work-schedule-col"
              data-cy="job-edit-work-schedule-col"
            >
              <Form.Item
                className="font-semibold text-xs"
                name="workScheduleId"
                id="workScheduleId"
                data-cy="job-edit-work-schedule-form-item"
                label={
                  <span
                    className="mb-1 font-semibold text-xs"
                    data-cy="job-edit-work-schedule-label"
                  >
                    Work Schedule Category *
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select a work schedule!' },
                ]}
              >
                <Select
                  placeholder="Select an option"
                  onChange={handleWorkScheduleChange}
                  allowClear
                  className="bg-white"
                  id="job-edit-work-schedule-select"
                  data-cy="job-edit-work-schedule-select"
                  options={workSchedules?.items?.map((schedule: any) => ({
                    value: schedule?.id,
                    label: schedule?.name || '',
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {selectedWorkSchedule && (
            <Row
              gutter={16}
              id="job-edit-work-schedule-table-row"
              data-cy="job-edit-work-schedule-table-row"
            >
              <Col
                xs={24}
                sm={24}
                id="job-edit-work-schedule-table-col"
                data-cy="job-edit-work-schedule-table-col"
              >
                <Table
                  columns={[
                    {
                      title: 'Working Day',
                      dataIndex: 'workingDay',
                      key: 'workingDay',
                    },
                    {
                      title: 'Time',
                      dataIndex: 'time',
                      key: 'time',
                    },
                  ]}
                  dataSource={(selectedWorkSchedule?.detail || []).map(
                    (schedule: any, index: number) => ({
                      key: index.toString(),
                      workingDay: (
                        <div
                          className="flex space-x-2 justify-start"
                          id={`job-edit-work-schedule-day-${index}`}
                          data-cy={`job-edit-work-schedule-day-${index}`}
                        >
                          <Switch
                            checked={schedule?.status || schedule?.workday}
                            disabled
                            id={`job-edit-work-schedule-switch-${index}`}
                            data-cy={`job-edit-work-schedule-switch-${index}`}
                          />
                          <span
                            id={`job-edit-work-schedule-day-name-${index}`}
                            data-cy={`job-edit-work-schedule-day-name-${index}`}
                          >
                            {schedule?.dayOfWeek || schedule?.day}
                          </span>
                        </div>
                      ),
                      time: (
                        <TimePicker
                          defaultValue={dayjs(
                            schedule?.hours ||
                              (schedule?.startTime && schedule?.endTime
                                ? `${dayjs(schedule?.startTime, 'h:mm A').format('HH:mm:ss')} - ${dayjs(
                                    schedule?.endTime,
                                    'h:mm A',
                                  ).format('HH:mm:ss')}`
                                : '00:00:00'),
                            'HH:mm:ss',
                          )}
                          disabled
                          id={`job-edit-work-schedule-time-${index}`}
                          data-cy={`job-edit-work-schedule-time-${index}`}
                        />
                      ),
                    }),
                  )}
                  pagination={false}
                  id="job-edit-work-schedule-table"
                  data-cy="job-edit-work-schedule-table"
                />
              </Col>
            </Row>
          )}

          <Form.Item
            id="job-edit-submit-form-item"
            data-cy="job-edit-submit-form-item"
          >
            <Row
              className="flex justify-end gap-3"
              id="job-edit-submit-row"
              data-cy="job-edit-submit-row"
            >
              <Button
                type="primary"
                htmlType="submit"
                name="submit"
                loading={isUpdating}
                id="job-edit-submit-btn"
                data-cy="job-edit-submit-btn"
              >
                Update
              </Button>
              <Button
                className="text-indigo-500"
                htmlType="button"
                value={'cancel'}
                name="cancel"
                onClick={handleEditModalClose}
                id="job-edit-cancel-btn"
                data-cy="job-edit-cancel-btn"
              >
                Cancel
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default Job;
