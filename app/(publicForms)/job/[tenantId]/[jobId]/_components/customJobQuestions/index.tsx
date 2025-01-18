'use client';
import React from 'react';
import { Checkbox, Col, Form, FormInstance, Input, Row, Spin } from 'antd';
import { useJobFormStore } from '@/store/uistate/features/recruitment/publicJobForm';
import { useGetJobsByID } from '@/store/server/features/recruitment/job/queries';
import { FieldType } from '@/types/enumTypes';
import { v4 as uuidv4 } from 'uuid';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useDebounce } from '@/utils/useDebounce';

interface JobDisplayParams {
  form: FormInstance;
  id: string;
}

const CustomJobQuestionsDisplay: React.FC<JobDisplayParams> = ({
  id,
  form,
}) => {
  const userId = useAuthenticationStore.getState().userId || null;

  const { data: JobPublicForm, isLoading } = useGetJobsByID(id);

  const { setSelectedAnswer, selectedAnswer } = useJobFormStore();

  const handleSelection = (
    questionId: string,
    choice: Record<string, string>[],
  ) => {
    setSelectedAnswer({
      questionId,
      respondentId: userId,
      responseDetail: choice,
    });
    form.setFieldsValue({
      [`question_${questionId}`]: choice[0]?.value,
    });
  };
  const onValuesChange = useDebounce(handleSelection, 1500);

  return (
    <div>
      {isLoading ?? <Spin className="flex justify-center align-middle" />}

      {JobPublicForm?.jobApplicationQuestionsForm?.form?.map((q: any) => (
        <Row gutter={16} key={q.id}>
          <Col xs={24} sm={24}>
            <Form.Item
              key={q.id}
              label={<div className="my-2 font-semibold">{q.question}</div>}
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
              <div key={q.id}>
                {q?.fieldType === 'multiple_choice' && (
                  <Row key={q.id} gutter={16} className="ml-1 mt-2">
                    {q.field?.map((choice: any, index: string) => {
                      let isSelected = false;
                      if (selectedAnswer) {
                        for (const answer of selectedAnswer) {
                          for (const detail of answer.responseDetail) {
                            if (
                              detail.value === choice.value &&
                              answer.questionId === q?.id
                            ) {
                              isSelected = true;
                              break;
                            }
                          }
                          if (isSelected) {
                            break;
                          }
                        }
                      }

                      return (
                        <>
                          <Row
                            key={index + q.id}
                            className="flex justify-start mb-3 w-full border-primary cursor-pointer"
                            onClick={() => handleSelection(q.id, [choice])}
                          >
                            <Col
                              span={1}
                              className={`${
                                isSelected
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-200'
                              } flex justify-center items-center rounded bg-green`}
                            >
                              {index + 1}
                            </Col>
                            <Col
                              span={22}
                              className={`${
                                isSelected
                                  ? 'border-primary'
                                  : 'border-gray-200'
                              } flex justify-start items-center rounded ml-1 border-[1px] px-1 py-2 w-1/2`}
                            >
                              {choice.value}
                            </Col>
                          </Row>
                        </>
                      );
                    })}
                  </Row>
                )}
                {q.fieldType === FieldType.CHECKBOX && (
                  <Checkbox.Group
                    key={q.id}
                    style={{ width: '100%' }}
                    onChange={(e: string[]) => {
                      const checkedValues = e?.map((el) => {
                        return {
                          value: el,
                          id: uuidv4(),
                        };
                      });
                      handleSelection(q.id, checkedValues);
                    }}
                  >
                    <Row>
                      {q.field?.map((choice: any, index: string) => {
                        return (
                          <Col span={24} key={index}>
                            <Checkbox value={choice.value}>
                              {choice.value}
                            </Checkbox>
                          </Col>
                        );
                      })}
                    </Row>
                  </Checkbox.Group>
                )}
                {q.fieldType === FieldType.SHORT_TEXT && (
                  <Row key={q.id}>
                    <Col span={24}>
                      <Input
                        placeholder="Put your answers here"
                        onChange={(e) => {
                          onValuesChange(q.id, [
                            {
                              value: e.target.value,
                              id: uuidv4(),
                            },
                          ]);
                        }}
                      />
                    </Col>
                  </Row>
                )}
                {q.fieldType === FieldType.PARAGRAPH && (
                  <Input.TextArea
                    key={q.id}
                    rows={5}
                    placeholder="Put your answers here"
                    onChange={(e) => {
                      onValuesChange(q.id, [
                        {
                          value: e.target.value,
                          id: uuidv4(),
                        },
                      ]);
                    }}
                  />
                )}
              </div>
            </Form.Item>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default CustomJobQuestionsDisplay;
