import React from 'react';
import { Form, Select } from 'antd';
import DynamicQuestionField from '@/components/dynamicQuestionField';

const QuestionResponseForm = ({
  attendeeIndex,
  attendeesOptions,
  questionSet,
  handleAttendeeChange,
}: any) => {
  return (
    <React.Fragment>
      <Form.Item
        name={`userId_${attendeeIndex}`}
        label={
          <span className="text-black text-sm font-semibold">Attendee</span>
        }
        rules={[{ required: true, message: 'Please select an attendee' }]}
      >
        <Select
          placeholder="Select attendee"
          className="text-black text-sm font-semibold"
          options={attendeesOptions}
          onChange={handleAttendeeChange}
        />
      </Form.Item>

      {questionSet?.conversationsQuestions?.map(
        (q: any, questionIndex: number) => (
          <DynamicQuestionField
            key={`question_${q.id}_${attendeeIndex}_${questionIndex}`}
            name={[`userId_${attendeeIndex}__${questionIndex}`, `${q.id}`]}
            label={q.question}
            fieldType={q.fieldType}
            fieldOptions={q.field}
          />
        ),
      )}
    </React.Fragment>
  );
};

export default QuestionResponseForm;
