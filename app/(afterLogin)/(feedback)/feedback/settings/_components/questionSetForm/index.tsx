import React, { useState } from "react";
import { Form, Input, Button, Select, Checkbox, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";

const { Option } = Select;

const QuestionSetForm = () => {
  const [questions, setQuestions] = useState<any>([]);

  const handleAddQuestion = () => {
    setQuestions((prev:any) => [
      ...prev,
      {
        id: uuidv4(),
        question: "",
        fieldType: "",
        field: [],
        required: false,
        order: prev.length + 1,
      },
    ]);
  };

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
    const payload = { ...values, questions };
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
                <Option value="multiple_choice">Multiple Choice</Option>
                <Option value="checkbox">Checkbox</Option>
                <Option value="short_text">Short Text</Option>
                <Option value="paragraph">Paragraph</Option>
                <Option value="time">Time</Option>
                <Option value="dropdown">Dropdown</Option>
                <Option value="radio">Radio</Option>
              </Select>

              <Checkbox
                checked={q.required}
                onChange={(e) =>
                  handleChangeQuestion(q.id, "required", e.target.checked)
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
            {(q.fieldType === "dropdown" ||
              q.fieldType === "multiple_choice" ||
              q.fieldType === "radio") && (
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
