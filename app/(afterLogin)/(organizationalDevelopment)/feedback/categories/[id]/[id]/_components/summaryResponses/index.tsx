import React, { useState } from 'react';
import { Col, Form, Progress, Row } from 'antd';
interface Params {
  id: string;
}
function SummaryResponses({id}:Params) {
  const [questions] = useState([
    {
      id: 1,
      question: 'is the water dispenser filled ?',
      answer: '',
      choices: ['Choice A', 'Choice B', 'Choice C'],
    },
    {
      id: 2,
      question: 'is the water dispenser filled ?',
      answer: '',
      choices: ['Option 1', 'Option 2', 'Option 3'],
    },
  ]);

  return (
    <div>
      <Form layout="vertical" style={{ maxWidth: 600 }}>
        {questions.map((q) => (
          <Form.Item label={q.question} key={q.id} required>
            <Row
              gutter={16}
              style={{ marginLeft: '10px' }}
              className="flex justify-between"
            >
               {/* eslint-disable @typescript-eslint/naming-convention  */}
              {q.choices.map((choice, index) => (
                <Row key={index} style={{ marginBottom: '10px' }}>
                  <Col span={24}>
                    <Progress
                      type="circle"
                      percent={30}
                      size={120}
                      strokeColor={'green'}
                    />
                  </Col>
                </Row>
              ))}
            </Row>
          </Form.Item>
        ))}
      </Form>
    </div>
  );
}

export default SummaryResponses;
