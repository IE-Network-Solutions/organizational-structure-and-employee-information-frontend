import React, { useState } from "react";
import { Form, Input, Button, Select, Checkbox, Space, Switch } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { FieldType } from "@/types/enumTypes";
import { ConversationStore } from "@/store/uistate/features/conversation";
import { useAddQuestionSetOnConversationType } from "@/store/server/features/conversation/questionSet/mutation";

const { Option } = Select;

const QuestionSetForm = () => {
  const [questions, setQuestions] = useState<any>([]);
  const { activeTab,setActiveTab,setOpen} = ConversationStore();
  const { mutate:createConversationQuestionSet}=useAddQuestionSetOnConversationType();

  const handleAddQuestion = () => {
    setQuestions((prev: any) => [
      ...prev,
      {
        id: uuidv4(), // Unique question ID
        conversationTypeId: activeTab, // Link question to the active conversation
        question: "", // Default question text
        fieldType: FieldType.SHORT_TEXT, // Default to SHORT_TEXT
        field: [], // Default empty options for fields requiring options
        required: false, // Default not mandatory
      },
    ]);
  };


  console.log(activeTab,"activeTab")
  const handleRemoveQuestion = (id:any) => {
    setQuestions((prev:any) => prev.filter((q:any) => q.id !== id));
  };

  const handleChangeQuestion = (id:any, key:any, value:any) => {
    setQuestions((prev:any) =>
      prev.map((q:any) => (q.id === id ? { ...q, [key]: value } : q))
    );
  };

  const handleAddOption = (questionId:any) => {
    setQuestions((prev:any) =>
      prev.map((q:any) =>
        q.id === questionId
          ? {
              ...q,
              field: [...q.field, { id: uuidv4(), value: "" }],
            }
          : q
      )
    );
  };

  const handleChangeOption = (questionId:any, optionId:any, value:any) => {
    setQuestions((prev:any) =>
      prev.map((q:any) =>
        q.id === questionId
          ? {
              ...q,
              field: q.field.map((opt:any) =>
                opt.id === optionId ? { ...opt, value } : opt
              ),
            }
          : q
      )
    );
  };

  const handleRemoveOption = (questionId:any, optionId:any) => {
    setQuestions((prev:any) =>
      prev.map((q:any) =>
        q.id === questionId
          ? {
              ...q,
              field: q.field.filter((opt:any) => opt.id !== optionId),
            }
          : q
      )
    );
  };

  const handleSubmit = (values:any) => {
    const payload = { ...values,conversationTypeId:activeTab, questions };
    createConversationQuestionSet(payload,{
      onSuccess:()=>{
        setOpen(false);
      }
    })
    console.log("Submitted Data:", payload);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "Please enter a name" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Meeting Agenda"
        name="meetingAgenda"
        rules={[{ required: true, message: "Please enter a meeting agenda" }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        label="Is Active"
        name="active"
        initialValue={true}
        rules={[{ required: true, message: "Please enter a m" }]}
      >
        <Switch />
      </Form.Item>

      <Form.Item label="Questions">
        {questions.map((q:any) => (
          <div key={q.id} style={{ marginBottom: "16px" }}>
            {/* First Row: Question Input */}
            <div style={{ display: "flex", marginBottom: "8px" }}>
              <Input
                placeholder="Enter question"
                value={q.question}
                onChange={(e) =>
                  handleChangeQuestion(q.id, "question", e.target.value)
                }
                style={{ flex: 1, marginRight: "8px" }}
              />
            </div>

            {/* Second Row: Field Type, Required, Remove */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Select
                placeholder="Select Field Type"
                value={q.fieldType}
                onChange={(value) =>
                  handleChangeQuestion(q.id, "fieldType", value)
                }
                style={{ flex: 1 }}
              >
                <Option value={FieldType.MULTIPLE_CHOICE}>Multiple Choice</Option>
                <Option value={FieldType.CHECKBOX}>Checkbox</Option>
                <Option value={FieldType.SHORT_TEXT}>Short Text</Option>
                <Option value={FieldType.PARAGRAPH}>Paragraph</Option>
                <Option value={FieldType.TIME}>Time</Option>
                <Option value={FieldType.DROPDOWN}>Dropdown</Option>
                <Option value={FieldType.RADIO}>Radio</Option>
              </Select>

              <Checkbox
                checked={q.mandatory}
                onChange={(e) =>
                  handleChangeQuestion(q.id, "mandatory", e.target.checked)
                }
              >
                Required
              </Checkbox>

              <MinusCircleOutlined
                onClick={() => handleRemoveQuestion(q.id)}
                style={{ color: "red", fontSize: "16px" }}
              />
            </div>

            {/* Options (Visible Only for Certain Field Types) */}
            {(q.fieldType === FieldType.DROPDOWN ||
              q.fieldType ===  FieldType.MULTIPLE_CHOICE ||
              q.fieldType ===  FieldType.RADIO) && (
              <div style={{ marginTop: "8px" }}>
                <p>Options:</p>
                {q.field.map((opt:any) => (
                  <Space key={opt.id} align="baseline" style={{ marginBottom: "8px" }}>
                    <Input
                      placeholder="Enter option value"
                      value={opt.value}
                      onChange={(e) =>
                        handleChangeOption(q.id, opt.id, e.target.value)
                      }
                    />
                    <MinusCircleOutlined
                      onClick={() => handleRemoveOption(q.id, opt.id)}
                      style={{ color: "red" }}
                    />
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={() => handleAddOption(q.id)}
                  icon={<PlusOutlined />}
                  style={{ marginTop: "8px" }}
                >
                  Add Option
                </Button>
              </div>
            )}
          </div>
        ))}

        <Button
          type="dashed"
          onClick={handleAddQuestion}
          icon={<PlusOutlined />}
          style={{ width: "100%" }}
        >
          Add Question
        </Button>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default QuestionSetForm;
