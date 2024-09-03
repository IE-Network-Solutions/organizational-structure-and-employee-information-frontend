import React, { useState } from 'react'
import {
  Checkbox,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
} from 'antd';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { useFetchedQuestions } from '@/store/server/features/organization-development/categories/queries';
const Questions=()=>{

  const  {data:questionsData}=useFetchedQuestions();
  console.log(questionsData,"***********")
  const {setSelectedAnswer,selectedAnswer}=useOrganizationalDevelopment();
  const [questions, setQuestions] = useState([
    { id: 1, question: 'Question 1', answer: '', choices: ['Choice A', 'Choice B', 'Choice C'] },
    { id: 2, question: 'Question 2', answer: '', choices: ['Option 1', 'Option 2', 'Option 3'] },
  ]);

  const handleAnswerChange = (id: number, answer: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === id ? { ...q, answer } : q))
    );
  };
  return (
    <div>
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="vertical"
        style={{ maxWidth: 600 }}
      >
          {questions.map((q) => (
          <Form.Item label={q.question} key={q.id} required>
            <Row gutter={16} style={{marginLeft:'10px'}}  >
              {q.choices.map((choice, index) => (
                <Row key={index} style={{ marginBottom: '10px' }} >
                  <Col span={4} className='mt-2 rounded'><span onClick={() => setSelectedAnswer(choice)} className={`bg-gray-200 p-2 rounded cursor-pointer ${selectedAnswer===choice&& "bg-green-400"}`}>{index + 1}</span></Col>
                  <Col span={20}>
                    <Input value={choice} onChange={(e) => handleAnswerChange(q.id, e.target.value)} />
                  </Col>
                </Row>
              ))}
            </Row>
          </Form.Item>
        ))}
      </Form>
    </div>
  )
}

export default Questions