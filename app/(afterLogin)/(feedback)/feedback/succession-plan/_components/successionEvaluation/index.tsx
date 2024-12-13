import React, { useEffect } from 'react';
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
import {
  useCreateCriticalPosition,
  useUpdateEvaluation,
} from '@/store/server/features/organization-development/SuccessionPlan/mutation';
import { useSuccessionEvaluationStore } from '@/store/uistate/features/organizationalDevelopment/SuccessionPlan';
const { Title } = Typography;
import { useFetchSuccessionPlans } from '@/store/server/features/organization-development/SuccessionPlan/queries';

const SuccessorEvaluation = () => {
  const [form] = Form.useForm();
  const { isLoading } = useCreateCriticalPosition();
  const { setOpen } = useSuccessionEvaluationStore();
  const { open } = useSuccessionEvaluationStore.getState();
  const { data: SuccessionPlan } = useFetchSuccessionPlans();
  const { mutate: updateEvaluations } = useUpdateEvaluation();

  interface FormValues {
    additionalComments: string;
    evaluations: Record<string, { score: number }>;
  }

  interface EvaluationItem {
    id: string;
    title: string;
    score: number;
    description?: string;
  }

  useEffect(() => {
    if (open && SuccessionPlan) {
      form.setFieldsValue({
        evaluations: SuccessionPlan.evaluations.reduce(
          (acc: Record<string, any>, evaluation: any) => {
            acc[evaluation.id] = { score: evaluation.score };
            return acc;
          },
          {},
        ),
        additionalComments: SuccessionPlan.evaluations[0]?.description,
      });
    }
  }, [open, SuccessionPlan, form]);

  const handleFinish = (values: FormValues) => {
    const flattenedData = Object.entries(values.evaluations).map(
      ([id, { score }]) => ({
        id,
        score,
        comment: values.additionalComments || '',
      }),
    );
    updateEvaluations({ data: flattenedData });
    form.resetFields();
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={handleCancel}
        modalHeader={
          <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
            Evaluate Successor
          </div>
        }
        width="40%"
      >
        <Form
          form={form}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Card>
            <Form.Item>
              <Title level={5}>Evaluation Criteria</Title>
            </Form.Item>

            {SuccessionPlan?.evaluations.map((evaluation: EvaluationItem) => (
              <Row gutter={16} key={evaluation.id}>
                <Col xs={24} sm={24}>
                  <Form.Item
                    className="font-semibold text-xs"
                    name={['evaluations', evaluation.id, 'score']}
                    label={evaluation.title}
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
                  name="additionalComments"
                  label={'Additional Comments'}
                  rules={[
                    { required: true, message: 'Please add some comment' },
                  ]}
                >
                  <Input.TextArea className="mt-4" rows={6} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Row gutter={16} className="mt-40">
            <Col xs={24} sm={12} className="flex justify-end items-end">
              <Popconfirm
                title="Reset all fields"
                description="Are you sure to reset all fields value?"
                okText="Yes"
                onConfirm={handleCancel}
                cancelText="No"
              >
                <Button className="px-6 py-3 text-xs font-bold rounded-md">
                  Cancel
                </Button>
              </Popconfirm>
            </Col>
            <Col xs={24} sm={12}>
              <Button
                loading={isLoading}
                htmlType="submit"
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
