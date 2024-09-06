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
import { QuestionsType } from '@/store/server/features/organization-development/categories/interface';
 
const Questions=()=>{

  const  {data:questionsData}=useFetchedQuestions();

  const {setSelectedAnswer,selectedAnswer}=useOrganizationalDevelopment();



  return (
    <div>
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="vertical"
        style={{ width: '100%' }}
      >
          {questionsData?.items?.map((q:QuestionsType) => (
             <Row gutter={16} key={q.id}>
             <Col xs={24} sm={24}>
               <Form.Item
                 label={q.question} key={q.id}
                 required
                 labelCol={{ span: 24 }} // Label spans full width
                 wrapperCol={{ span: 24 }} // Wrapper spans full width (if needed)
               >
                {q?.fieldType==="multiple_choice" &&
                <Row gutter={16} className='ml-1 mt-2'  >
                  {q?.field?.map((choice:string, index:number) => (
                    <Row key={index} style={{ marginBottom: '10px' }} className='flex justify-start w-full'>
                      <Col span={1} onClick={()=>setSelectedAnswer(choice)} className={`${selectedAnswer?.includes(choice) ? "bg-green-400 text-white":"bg-gray-200"} flex justify-center items-center rounded`}>
                      {index + 1}</Col>
                      <Col span={22} className='flex justify-start items-center rounded  ml-2 border-2 px-1 py-1 w-1/2' >
                        {choice}
                      </Col>
                    </Row>
                  ))}
                </Row>
                } 
               </Form.Item>
          </Col>
          </Row>
        ))}
      </Form>
    </div>
  )
}

export default Questions