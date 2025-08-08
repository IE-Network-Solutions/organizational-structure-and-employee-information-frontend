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
import { useGetBranches } from '@/store/server/features/employees/employeeManagment/branchOffice/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import { useGetWorkSchedules } from '@/store/server/features/employees/employeeManagment/workSchedule/queries';

function Job() {
  const params = useParams();
  const userId = params.id as string;
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
        extra={<Button icon={<LuPencil />} onClick={handleEditClick} />}
        className="my-6 mt-0"
      >
        <Row gutter={[16, 24]}>
          <Col lg={16}>
            <InfoLine
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
                  <Form onFinish={editJoinedDate} form={form} layout="inline">
                    <Form.Item
                      name="joinedDate"
                      rules={[
                        { required: true, message: 'Please select a date!' },
                      ]}
                    >
                      <DatePicker format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
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
          <div className=" flex justify-center items-center gap-3">
            <AccessGuard
              permissions={[Permissions.UpdateEmployeeJobInformation]}
            >
              <FaPlus onClick={handleAddEmployeeJobInformation} />
            </AccessGuard>
            <div className="pt-2">
              <DownloadJobInformation id={id} />
            </div>
          </div>
        }
      >
        <Table
          dataSource={sortedJobInformation}
          columns={columns}
          className="w-full overflow-auto"
          pagination={{ hideOnSinglePage: true }}
          rowKey="id"
        />
      </Card>
      <WorkScheduleComponent id={userId} />
      <CreateEmployeeJobInformation id={userId} onJobInfoUpdated={handleJobInfoUpdated} />
      <BasicSalary id={userId} />

      {/* Edit Job Information Modal */}
      <Modal
        title="Edit Employee Job Information"
        centered
        open={isEditModalVisible}
        onCancel={handleEditModalClose}
        footer={false}
        destroyOnClose
      >
        <Form form={editForm} onFinish={editJobInformation} layout="vertical">
          {/* Job Timeline Section */}
          <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
            Job Timeline
          </div>

          {/* Effective Start Date */}
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                className="font-semibold text-xs"
                name={'effectiveStartDate'}
                label={
                  <span className="mb-1 font-semibold text-xs">
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
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Position and Employment Type */}
          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item
                className="font-semibold text-xs"
                name={'positionId'}
                label={
                  <span className="mb-1 font-semibold text-xs">Position *</span>
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
                  options={positions?.items?.map((position: any) => ({
                    value: position?.id,
                    label: position?.name || '',
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item
                className="font-semibold text-xs"
                name={'employementTypeId'}
                label={
                  <span className="mb-1 font-semibold text-xs">
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
                  options={employementType?.items?.map((type: any) => ({
                    value: type?.id,
                    label: type?.name || '',
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Department and Branch Office in single column */}
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                className="w-full font-semibold text-xs"
                name={'departmentId'}
                label={
                  <span className="mb-1 font-semibold text-xs">
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
                  options={departmentData?.map((department: any) => ({
                    value: department?.id,
                    label: department?.name || '',
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                className="w-full font-semibold text-xs"
                name={'branchId'}
                label={
                  <span className="mb-1 font-semibold text-xs">
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
                  options={branchOfficeData?.items?.map((branch: any) => ({
                    value: branch?.id,
                    label: branch?.name || '',
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Team Lead */}
          <Row gutter={16}>
            <Col xs={16} sm={8}>
              <div className="font-semibold text-sm">Team Lead</div>
            </Col>
            <Col xs={8} sm={16}>
              <Form.Item name="departmentLeadOrNot" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          {/* Work Schedule Section */}
          <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
            Work Schedule
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                className="font-semibold text-xs"
                name="workScheduleId"
                id="workScheduleId"
                label={
                  <span className="mb-1 font-semibold text-xs">
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
                  options={workSchedules?.items?.map((schedule: any) => ({
                    value: schedule?.id,
                    label: schedule?.name || '',
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {selectedWorkSchedule && (
            <Row gutter={16}>
              <Col xs={24} sm={24}>
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
                        <div className="flex space-x-2 justify-start">
                          <Switch
                            checked={schedule?.status || schedule?.workday}
                            disabled
                          />
                          <span>{schedule?.dayOfWeek || schedule?.day}</span>
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
                        />
                      ),
                    }),
                  )}
                  pagination={false}
                />
              </Col>
            </Row>
          )}

          <Form.Item>
            <Row className="flex justify-end gap-3">
              <Button
                type="primary"
                htmlType="submit"
                name="submit"
                loading={isUpdating}
              >
                Update
              </Button>
              <Button
                className="text-indigo-500"
                htmlType="button"
                value={'cancel'}
                name="cancel"
                onClick={handleEditModalClose}
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
