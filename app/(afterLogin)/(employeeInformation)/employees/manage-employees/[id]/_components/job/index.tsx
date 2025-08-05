import dayjs from 'dayjs';
import { Button, Card, Col, DatePicker, Form, Row, Table, Select } from 'antd';
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
import { useState } from 'react';
import { useUpdateEmployee } from '@/store/server/features/employees/employeeDetail/mutations';
import { useUpdateEmployeeJobInformation } from '@/store/server/features/employees/employeeDetail/mutations';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import { JobActionStatus } from '@/types/enumTypes';

function Job({ id }: { id: string }) {
  const { isLoading, data: employeeData } = useGetEmployee(id);
  const { setIsAddEmployeeJobInfoModalVisible } = useEmployeeManagementStore();

  // API queries for form options
  const { data: departmentData } = useGetDepartments();
  const { data: employementType } = useGetEmployementTypes();
  const { data: positions } = useGetAllPositions();

  const handleAddEmployeeJobInformation = () => {
    setIsAddEmployeeJobInfoModalVisible(true);
  };

  // Callback to refresh employee data after job information changes
  const handleJobInfoUpdate = () => {};

  const { mutate: updateEmployeeInformation } = useUpdateEmployee();
  const { mutate: updateEmployeeJobInformation } =
    useUpdateEmployeeJobInformation();
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [jobForm] = Form.useForm();

  const handleEditClick = () => {
    form.setFieldsValue({
      joinedDate: dayjs(employeeData?.employeeInformation?.joinedDate),
    });
    setIsEditing((isEditing) => !isEditing);
  };

  const handleJobEditClick = (record: any) => {
    setEditingJobId(record.id);
    jobForm.setFieldsValue({
      effectiveStartDate: dayjs(record.effectiveStartDate),
      positionId: record.positionId,
      employementTypeId: record.employementTypeId,
      departmentId: record.departmentId,
      jobAction: record.jobAction,
    });
  };

  const editJoinedDate = (values: any) => {
    updateEmployeeInformation(
      {
        id: employeeData?.employeeInformation?.id,
        values,
      },
      {
        onSuccess: () => setIsEditing(false),
      },
    );
  };

  const editJobInformation = (values: any) => {
    if (!editingJobId) return;

    updateEmployeeJobInformation(
      {
        id: editingJobId,
        values: {
          ...values,
          effectiveStartDate: values.effectiveStartDate?.format('YYYY-MM-DD'),
        },
      },
      {
        onSuccess: () => {
          setEditingJobId(null);
          jobForm.resetFields();
        },
      },
    );
  };

  const columns = [
    {
      title: 'Effective Date',
      dataIndex: 'effectiveStartDate',
      key: 'effectiveStartDate',
      render: (text: string, record: any) => {
        if (editingJobId === record.id) {
          return (
            <Form.Item
              name="effectiveStartDate"
              rules={[{ required: true, message: 'Please select a date!' }]}
            >
              <DatePicker format="YYYY-MM-DD" className="w-full" />
            </Form.Item>
          );
        }
        return text ? text.slice(0, 10) : '-';
      },
    },
    {
      title: 'Job Title',
      dataIndex: 'position',
      key: 'position',
      render: (ruleData: any, record: any) => {
        if (editingJobId === record.id) {
          return (
            <Form.Item
              name="positionId"
              rules={[{ required: true, message: 'Please select a position!' }]}
            >
              <Select
                placeholder="Select position"
                showSearch
                optionFilterProp="label"
                allowClear
                className="w-full"
                options={positions?.items?.map((position: any) => ({
                  value: position?.id,
                  label: position?.name || '',
                }))}
              />
            </Form.Item>
          );
        }
        return <>{record?.position?.name ?? '-'}</>;
      },
    },
    {
      title: 'Employment Type',
      dataIndex: 'employementTypeId',
      key: 'employementTypeId',
      render: (ruleData: any, record: any) => {
        if (editingJobId === record.id) {
          return (
            <Form.Item
              name="employementTypeId"
              rules={[
                { required: true, message: 'Please select employment type!' },
              ]}
            >
              <Select
                placeholder="Select employment type"
                showSearch
                optionFilterProp="label"
                allowClear
                className="w-full"
                options={employementType?.items?.map((type: any) => ({
                  value: type?.id,
                  label: type?.name || '',
                }))}
              />
            </Form.Item>
          );
        }
        return <>{record?.employementType?.name ?? '-'}</>;
      },
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
      render: (ruleData: any, record: any) => {
        if (editingJobId === record.id) {
          return (
            <Form.Item
              name="departmentId"
              rules={[
                { required: true, message: 'Please select a department!' },
              ]}
            >
              <Select
                placeholder="Select department"
                showSearch
                optionFilterProp="label"
                allowClear
                className="w-full"
                options={departmentData?.map((department: any) => ({
                  value: department?.id,
                  label: department?.name || '',
                }))}
              />
            </Form.Item>
          );
        }
        return <>{record?.department?.name ?? '-'}</>;
      },
    },
    {
      title: 'Job Status',
      dataIndex: 'jobAction',
      key: 'jobAction',
      render: (text: string, record: any) => {
        if (editingJobId === record.id) {
          return (
            <Form.Item
              name="jobAction"
              rules={[{ required: true, message: 'Please select job status!' }]}
            >
              <Select
                placeholder="Select job status"
                showSearch
                optionFilterProp="label"
                allowClear
                className="w-full"
                options={JobActionStatus?.map((status: any) => ({
                  value: status?.id,
                  label: status?.name || '',
                }))}
              />
            </Form.Item>
          );
        }
        return text ? text : '-';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: any) => {
        if (!record.isPositionActive) return null;

        if (editingJobId === record.id) {
          return (
            <div className="flex gap-2">
              <Button
                type="primary"
                size="small"
                onClick={() => jobForm.submit()}
              >
                Save
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setEditingJobId(null);
                  jobForm.resetFields();
                }}
              >
                Cancel
              </Button>
            </div>
          );
        }

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
      {' '}
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
        <Form form={jobForm} onFinish={editJobInformation}>
          <Table
            dataSource={employeeData?.employeeJobInformation}
            columns={columns}
            className="w-full overflow-auto"
            pagination={{ hideOnSinglePage: true }}
            rowKey="id"
          />
        </Form>
      </Card>
      <WorkScheduleComponent id={id} />
      <CreateEmployeeJobInformation
        id={id}
        onInfoSubmition={handleJobInfoUpdate}
      />
      <BasicSalary id={id} />
    </>
  );
}

export default Job;
