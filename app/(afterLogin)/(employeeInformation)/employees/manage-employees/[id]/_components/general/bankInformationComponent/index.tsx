import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { Card, Col, Input, Form, Row, Button } from 'antd';
import React from 'react';
import { LuPencil } from 'react-icons/lu';
import { InfoLine } from '../../common/infoLine';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const BankInformationComponent = ({ handleSaveChanges, id }: any) => {
  const { setEdit, edit } = useEmployeeManagementStore();
  const { isLoading, data: employeeData } = useGetEmployee(id);

  const [form] = Form.useForm();

  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };
  return (
    <Card
      loading={isLoading}
      title="Bank Information"
      extra={
        <AccessGuard
          permissions={[Permissions.UpdateEmployeeDetails]}
          selfShouldAccess
          id={id}
        >
          <LuPencil
            className="cursor-pointer"
            onClick={() => handleEditChange('bankInformation')}
          />
        </AccessGuard>
      }
      className="my-6"
    >
      {edit.bankInformation ? (
        <Form
          form={form}
          onFinish={(values) => handleSaveChanges('bankInformation', values)}
          layout="vertical"
          style={{ display: edit ? 'block' : 'none' }} // Hide form when not in edit mode
          initialValues={
            employeeData?.employeeInformation?.bankInformation || {}
          }
        >
          <Row gutter={[16, 24]}>
            <Col lg={16}>
              {Object.entries(
                employeeData?.employeeInformation?.bankInformation || {},
              ).map(([key, val]) => (
                <Form.Item
                  key={key}
                  name={key}
                  label={key}
                  rules={[
                    { required: true, message: `Please enter the ${key}` },
                  ]} // Example validation
                >
                  <Input placeholder={key} defaultValue={val?.toString()} />
                </Form.Item>
              ))}
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
            </Col>
          </Row>
        </Form>
      ) : (
        <Row gutter={[16, 24]}>
          <Col lg={16}>
            {Object.entries(
              employeeData?.employeeInformation?.bankInformation || {},
            ).map(([key, val]) => (
              <InfoLine key={key} title={key} value={val?.toString() || '-'} />
            ))}
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default BankInformationComponent;
