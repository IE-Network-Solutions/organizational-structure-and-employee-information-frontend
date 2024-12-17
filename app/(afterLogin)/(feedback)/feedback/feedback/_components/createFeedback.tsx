import React from "react";
import { Form, Select, Input, Button } from "antd";
import { useGetAllUsers } from "@/store/server/features/employees/employeeManagment/queries";
import { useFetchAllFeedbackTypes } from "@/store/server/features/feedback/feedbackType/queries";
import { FeedbackTypeItems } from "@/store/server/features/conversation/conversationType/interface";

const { TextArea } = Input;

const CreateFeedbackForm: React.FC = () => {
  const [form] = Form.useForm();
     const {data:getAllUsersData}=useGetAllUsers();
     const { data: getAllFeedbackTypes } = useFetchAllFeedbackTypes();

  const onFinish = (values: any) => {
    console.log("Form Values:", values);
    // Handle form submission here
  };


  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        employeeId: [],
        type: undefined,
        reason: "",
        action: "",
        cc: [],
      }}
    >
      {/* Select Employee ID */}
      <Form.Item
        name="employeeId"
        label="Select Employee ID"
        rules={[{ required: true, message: "Please select at least one employee!" }]}
      >
        <Select
          mode="multiple"
          placeholder="Select employee(s)"
          options={getAllUsersData?.items?.map((item:any)=>
            ({key:item?.id,value:`${item?.firstName} ${item?.lastName}`})) ?? []} // Empty initially, will be updated dynamically
        />
      </Form.Item>

      {/* Select Type */}
      <Form.Item
        name="type"
        label="Select Type"
        rules={[{ required: true, message: "Please select a type!" }]}
      >
        <Select
          placeholder="Select a type"
          options={getAllFeedbackTypes?.items?.map((feedbackType:FeedbackTypeItems)=>
            ({key:feedbackType?.id,value:feedbackType?.category}))??[]}
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
      </Form.Item>

      {/* Submit Button */}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateFeedbackForm;
