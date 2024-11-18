import React from 'react';
import { Card, Col, Input, Form, Row, Button } from 'antd';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { LuPencil } from 'react-icons/lu';
import { InfoLine } from '../../common/infoLine';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

function EmergencyContact({ handleSaveChanges, id }: any) {
  const { setEdit, edit } = useEmployeeManagementStore();
  const { isLoading, data: employeeData } = useGetEmployee(id);

  const [form] = Form.useForm();
  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };

  return (
    <Card
      loading={isLoading}
      title="Emergency Contact"
      extra={
        <AccessGuard
          permissions={[Permissions.UpdateEmployeeDetails]}
          selfShouldAccess
          id={id}
        >
          <LuPencil
            className="cursor-pointer"
            onClick={() => handleEditChange('emergencyContact')}
          />
        </AccessGuard>
      }
      className="my-6"
    >
      {edit.emergencyContact ? (
        <Form
          form={form}
          onFinish={(values) => handleSaveChanges('emergencyContact', values)}
          layout="vertical"
          style={{ display: edit ? 'block' : 'none' }} // Hide form when not in edit mode
          initialValues={
            employeeData?.employeeInformation?.emergencyContact || {}
          }
        >
          <Row gutter={[16, 24]}>
            <Col lg={16}>
              {Object.entries(
                employeeData?.employeeInformation?.emergencyContact || {},
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
              employeeData?.employeeInformation?.emergencyContact || {},
            ).map(([key, val]) => (
              <InfoLine key={key} title={key} value={val?.toString() || '-'} />
            ))}
          </Col>
        </Row>
      )}
    </Card>
  );
}

export default EmergencyContact;
