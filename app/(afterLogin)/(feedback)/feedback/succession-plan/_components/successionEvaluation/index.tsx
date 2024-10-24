'use client';
import React from 'react';
import {
  Button,
  Card,
  Slider,
  Col,
  Typography,
  Form,
  Input,
  Popconfirm,
  Row,
} from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useCreateCriticalPosition } from '@/store/server/features/organization-development/SuccessionPlan/mutation';
import {
  useSuccessionEvaluationStore,
  useCriticalPositionStore,
} from '@/store/uistate/features/organizationalDevelopment/SuccessionPlan';
const { Title } = Typography;
import { Criteria } from '@/store/uistate/features/organizationalDevelopment/SuccessionPlan';

const SuccessorEvaluation = (props: any) => {
  const [form] = Form.useForm();
  const { isLoading } = useCreateCriticalPosition();
  const { criterias } = useCriticalPositionStore();

  const { setOpen } = useSuccessionEvaluationStore();

  const { open } = useSuccessionEvaluationStore.getState();

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Evaluate Successor
    </div>
  );

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={props?.onClose}
        modalHeader={modalHeader}
        width="40%"
      >
        <Form
          form={form}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
        >
          <Card>
            <Form.Item>
              <Title level={5}>Evaluation criterias</Title>
            </Form.Item>
            {criterias.map((criteria: Criteria) => (
              <Row gutter={16} key={criteria.id}>
                <Col xs={24} sm={24}>
                  <Form.Item
                    className="font-semibold text-xs"
                    name={`criteria_${criteria.id}`}
                    label={criteria.responsibility}
                  >
                    <Slider min={0} max={100} />
                  </Form.Item>
                </Col>
              </Row>
            ))}
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name="description"
                  label={'Additional Comments'}
                >
                  <Input.TextArea
                    placeholder={'Enter comments'}
                    className="mt-4"
                    rows={6}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Row gutter={16} className="mt-40">
            <Col xs={24} sm={12} className="flex justify-end items-end">
              <Popconfirm
                title="reset all you filled"
                description="Are you sure to reset all fields value ?"
                okText="Yes"
                onConfirm={handleCancel}
                cancelText="No"
              >
                <Button
                  name="cancelSidebarButtonId"
                  className="px-6 py-3 text-xs font-bold rounded-md"
                >
                  Cancel
                </Button>
              </Popconfirm>
            </Col>
            <Col xs={24} sm={12}>
              <Button
                loading={isLoading}
                htmlType="submit"
                name="createActionButton"
                id="createActionButtonId"
                className="px-6 py-3 text-xs font-bold rounded-md"
                type="primary"
              >
                Submit
              </Button>
            </Col>
          </Row>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default SuccessorEvaluation;
