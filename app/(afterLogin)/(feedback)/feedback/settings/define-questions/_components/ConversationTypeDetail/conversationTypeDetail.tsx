
    // const { data: conversationType, isLoading } = useGetConversationById(id);
    import React, { useState } from "react";
    import { Card, Collapse, Switch, Button, Modal, Input, Form, message, Tooltip } from "antd";
    import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useGetConversationById } from "@/store/server/features/conversation/queries";
import { Popconfirm } from "antd/lib";
import { useDeleteConversationQuestionSet, useUpdateConversationQuestionSet } from "@/store/server/features/conversation/questionSet/mutation";
    
    const { Panel } = Collapse;
    
    type Question = {
      id: string;
      question: string;
      fieldType: string;
      mandatory: boolean;
      field:any[]
    };
    
    type QuestionSet = {
      id: string;
      name: string;
      active: boolean;
      conversationsQuestions: Question[];
    };
    
    type Props = {
      questionSets: QuestionSet[];
    };
    
    const ConversationTypeDetail= ({ id }:{id:string}) => {
      const { data: conversationType, isLoading } = useGetConversationById(id);
      const { mutate: deleteConversationQuestionSet, isLoading:questionSetDeleteLoading } = useDeleteConversationQuestionSet();
      const { mutate: updateConversationQuestionSet, isLoading:questionSetUpdateLoading } = useUpdateConversationQuestionSet();


      const [isModalVisible, setIsModalVisible] = useState(false);
      const [editingSet, setEditingSet] = useState<QuestionSet | null>(null);
      const [form] = Form.useForm();
    
      const toggleActive = (id: string, active: boolean) => {
        updateConversationQuestionSet({id, active});
      };
    
      const deleteQuestionSet = (id: string) => {
        // setData((prev) => prev.filter((qs) => qs.id !== id));
        // message.success("Question set deleted successfully");
      };
    
      const handleEdit = (set: QuestionSet) => {
        setEditingSet(set);
        form.setFieldsValue(set);
        setIsModalVisible(true);
      };
    
      const handleAddNew = () => {
        setEditingSet(null);
        form.resetFields();
        setIsModalVisible(true);
      };
    
      const handleSave = (values: { name: string }) => {
        // if (editingSet) {
        //   setData((prev) =>
        //     prev.map((qs) => (qs.id === editingSet.id ? { ...qs, ...values } : qs))
        //   );
        //   message.success("Question set updated successfully");
        // } else {
        //   const newSet: QuestionSet = {
        //     id: `${Date.now()}`,
        //     name: values.name,
        //     active: true,
        //     conversationsQuestions: [],
        //   };
        //   setData((prev) => [...prev, newSet]);
        //   message.success("Question set added successfully");
        // }
        // setIsModalVisible(false);
      };
    
      return (
        <div className="p-4">
          {conversationType?.questionSets?.map((set:QuestionSet) => (
          <Collapse>
            <Card
              key={set?.id}
              className="mb-4"
              title={set?.name}
              extra={
                <div className="flex items-center space-x-2">
                  <Tooltip title={set?.active ? "Active" : "Inactive"}>
                    <Switch
                      size="small"
                      className="text-xs text-gray-950"
                      checked={set?.active}
                      onChange={(value:boolean) => toggleActive(set.id,value)}
                    />
                  </Tooltip>
                  <Button
                    disabled={!set?.active}
                    size="small"
                    icon={<EditOutlined className="text-xs text-gray-950"/>}
                    onClick={() => handleEdit(set)}
                  />
                <Popconfirm
                 
                  title="Are you sure you want to delete this?"
                  onConfirm={() => deleteConversationQuestionSet(set?.id)} // Action on confirm
                  okText="Yes"
                  cancelText="No"
                  placement="topRight"
                >
                  <Button  disabled={!set?.active} size="small" icon={<DeleteOutlined />} danger />
                </Popconfirm>
                </div>
              }
            >
                  {set.conversationsQuestions.map((question:Question) => (
                    <div key={question.id} className="mb-2">
                      <p className="font-semibold text-xs">{question?.question}</p>
                      {question?.field?.length > 0 && (
                        <ul className="list-none text-gray-600 text-sm">
                          {question?.field.map((option, index) => (
                            <li key={option?.key} className="flex items-start">
                              <span className="font-bold mr-2">{String.fromCharCode(97 + index)}.</span>
                              <span>{option?.value}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
            </Card>
            </Collapse>

          ))}
    
          <Modal
            visible={isModalVisible}
            title={editingSet ? "Edit Question Set" : "Add Question Set"}
            onCancel={() => setIsModalVisible(false)}
            onOk={() => form.submit()}
            okText="Save"
          >
            <Form form={form} onFinish={handleSave} layout="vertical">
              <Form.Item
                name="name"
                label="Question Set Name"
                rules={[{ required: true, message: "Please enter a name" }]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      );
    };
    
    export default ConversationTypeDetail;
    

// export default ConversationTypeDetail