'use client';
import React from 'react';
import { Button, Col, Form, Row, Spin } from 'antd';
import { useFetchPublicForms } from '@/store/server/features/feedback/dynamicForm/queries';
import RenderOptions from './_components/fieldTypes';
import { usePublicFormStore } from '@/store/uistate/features/feedback/publicForm';
import { useSubmitFormResponse } from '@/store/server/features/feedback/dynamicForm/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';

interface Params {
  id: string;
}

interface PublicQuestionProps {
  params: Params;
}

const Questions = ({ params: { id } }: PublicQuestionProps) => {
  const [form] = Form.useForm();
  const { data: publicForm, isLoading } = useFetchPublicForms(id);
  const { mutate: createFormResponse, isLoading: responseLoading } =
    useSubmitFormResponse();
  const { selectedAnswer } = usePublicFormStore();

  return (
    <div>
      {isLoading ?? <Spin className="flex justify-center align-middle" />}
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="vertical"
        style={{ width: '100%' }}
        onFinishFailed={() => {
          NotificationMessage.error({
            message: 'Please fill all required fields',
            description: 'Form submission Failed',
          });
        }}
        onFinish={() => {
          createFormResponse({ id: id, values: selectedAnswer });
        }}
        form={form}
      >
        <h2>{publicForm?.name}</h2>
        {publicForm?.questions?.map((q: any, index: number) => (
          <Row gutter={16} key={q.id}>
            <Col xs={24} sm={24}>
              <Form.Item
                key={q.id}
                label={
                  <div className="my-2 font-semibold">
                    <span>{index + 1}.</span> {q.question}
                  </div>
                }
                name={`question_${q.id}`}
                required={q.required}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                rules={[
                  {
                    required: q.required,
                    message: 'This field is required.',
                  },
                  {
                    min: 1,
                    message: 'This field is required.',
                  },
                ]}
              >
                <RenderOptions
                  key={q.id}
                  type={q?.fieldType}
                  questionId={q?.id}
                  field={q?.field}
                  form={form}
                />
              </Form.Item>
            </Col>
          </Row>
        ))}
        <Form.Item>
          {publicForm ? (
            <Button loading={responseLoading} htmlType="submit" type="primary">
              Submit
            </Button>
          ) : (
            <></>
          )}
        </Form.Item>
      </Form>
    </div>
  );
};

export default Questions;
