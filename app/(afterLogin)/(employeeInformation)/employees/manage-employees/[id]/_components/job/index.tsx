import dayjs from 'dayjs';
import { Button, Card, Col, DatePicker, Form, Row, Table } from 'antd';
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

function Job({ id }: { id: string }) {
  const { isLoading, data: employeeData } = useGetEmployee(id);
  const { setIsAddEmployeeJobInfoModalVisible } = useEmployeeManagementStore();
  const handleAddEmployeeJobInformation = () => {
    setIsAddEmployeeJobInfoModalVisible(true);
  };
  const { mutate: updateEmployeeInformation } = useUpdateEmployee();
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
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
      key: 'address',
      render: (ruleData: any, record: any) => (
        <>{record?.department?.name ?? '-'}</>
      ),
    },
    {
      title: 'Job Status',
      dataIndex: 'jobAction',
      key: 'jobAction',
      render: (text: string) => (text ? text : '-'),
    },
  ];

  const handleEditClick = () => {
    form.setFieldsValue({
      joinedDate: dayjs(employeeData?.employeeInformation?.joinedDate),
    });
    setIsEditing((isEditing) => !isEditing);
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
        <Table
          dataSource={employeeData?.employeeJobInformation}
          columns={columns}
          className="w-full overflow-auto"
          pagination={{ hideOnSinglePage: true }}
        />
      </Card>
      <WorkScheduleComponent id={id} />
      <CreateEmployeeJobInformation id={id} isNavBarModal={false} />
      <BasicSalary id={id} />
    </>
  );
}

export default Job;
