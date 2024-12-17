import React, { useEffect } from "react";
import { Form, Select, Input, Button } from "antd";
import { useGetAllUsers } from "@/store/server/features/employees/employeeManagment/queries";
import { useFetchFeedbackTypeById } from "@/store/server/features/feedback/feedbackType/queries";
import { FeedbackItem } from "@/store/server/features/conversation/conversationType/interface";
import { ConversationStore } from "@/store/uistate/features/conversation";
import { useAuthenticationStore } from "@/store/uistate/features/authentication";
import { useCreateFeedbackRecord, useUpdateFeedbackRecord } from "@/store/server/features/feedback/feedbackRecord/mutation";

const { TextArea } = Input;

const CreateFeedbackForm: React.FC = () => {
  const [form] = Form.useForm();
  const {userId}=useAuthenticationStore()
  const { activeTab,setOpen,selectedFeedbackRecord,setSelectedFeedbackRecord} =ConversationStore();
  const {data:getAllUsersData}=useGetAllUsers();
  const { data: getAllFeedbackTypeById } = useFetchFeedbackTypeById(activeTab);
  const { mutate: createFeedbackRecord } = useCreateFeedbackRecord();
  const { mutate: updateFeedbackRecord } = useUpdateFeedbackRecord();




  const onFinish = (values: any) => {

    if(selectedFeedbackRecord!==null){
      const updatedValues = {
        ...values,
        points: getAllFeedbackTypeById?.feedback?.find(
          (feedback: FeedbackItem) => feedback.id === values.feedbackId
        )?.points || 0, // Default to 0 if feedback is not found or points are undefined
        issuerId: userId,
        feedbackTypeId:activeTab
      };
      updateFeedbackRecord(updatedValues,{
        onSuccess:()=>{
          setOpen(false);
          setSelectedFeedbackRecord(null)
        }
      })
    }
    else{
      const updatedValues = {
        ...values,
        points: getAllFeedbackTypeById?.feedback?.find(
          (feedback: FeedbackItem) => feedback.id === values.feedbackId
        )?.points || 0, // Default to 0 if feedback is not found or points are undefined
        issuerId: userId,
        feedbackTypeId:activeTab
      };
      createFeedbackRecord(updatedValues,{
        onSuccess:()=>{
          setOpen(false);
          setSelectedFeedbackRecord(null)
        }
      })
    }
  };


  useEffect(()=>{
    if(selectedFeedbackRecord!==null)
    form.setFieldsValue({
      id:selectedFeedbackRecord?.id,
      recipientId:selectedFeedbackRecord?.recipientId,
      feedbackId:selectedFeedbackRecord?.feedbackId,
      reason:selectedFeedbackRecord?.reason,
      action:selectedFeedbackRecord?.action,
    })
  },[])
  console.log(getAllFeedbackTypeById,"getAllFeedbackTypeById")
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        employeeId: [],
        feedbackId: undefined,
        reason: "",
        action: "",
        cc: [],
      }}
    >
     {selectedFeedbackRecord!==null &&
      <Form.Item
        name="id"
      >
      </Form.Item>}
      {/* Select Employee ID */}
      <Form.Item
        name="recipientId"
        label="Select Employee ID"
        rules={[{ required: true, message: "Please select at least one employee!" }]}
      >
        <Select
          // mode="multiple"
          placeholder="Select employee(s)"
          options={getAllUsersData?.items?.map((item:any)=>
            ({key:item?.id,value:item?.id,label:`${item?.firstName} ${item?.lastName}`})) ?? []} // Empty initially, will be updated dynamically
        />
      </Form.Item>

      {/* Select Type */}
      <Form.Item

        name="feedbackId"
        label="Select Feedback"
        rules={[{ required: true, message: "Please select at least one type!" }]}
      >
        <Select
          placeholder="Select Feedback"
          options={
            getAllFeedbackTypeById?.feedback?.map((feedback: FeedbackItem) => ({
              key: feedback.id,
              label: feedback.name,
              value: feedback?.id,
            })) ?? []
          }
        />
      </Form.Item>

      {/* Reason */}
      <Form.Item
        name="reason"
        label="Reason"
        rules={[{ required: true, message: "Please provide a reason!" }]}
      >
        <TextArea rows={4} placeholder="Enter reason or description" />
      </Form.Item>

      {/* Action to Be Taken */}
      <Form.Item
        name="action"
        label="Action to Be Taken"
        rules={[{ required: true, message: "Please describe the action to be taken!" }]}
      >
        <TextArea rows={4} placeholder="Describe the action to be taken" />
      </Form.Item>

      {/* CC */}
      {selectedFeedbackRecord===null &&
        <Form.Item
        name="cc"
        label="CC"
        rules={[{ required: true, message: "Please select at least one CC!" }]}
      >
        <Select
          mode="multiple"
          placeholder="Select CC employee(s)"
          options={getAllUsersData?.items?.map((item:any)=>
            ({key:item?.id,value:`${item?.firstName} ${item?.lastName}`})) ?? []}         />
      </Form.Item>}

      {/* Submit Button */}
      <Form.Item>
        {selectedFeedbackRecord!==null ?
        <Button type="primary" htmlType="submit">
          Update
        </Button>
      :
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      }
      </Form.Item>
    </Form>
  );
};

export default CreateFeedbackForm;
