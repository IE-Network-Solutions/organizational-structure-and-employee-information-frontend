import React, { useEffect } from "react";
import { Drawer, Form, Input, Select, Button, DatePicker } from "antd";
import dayjs from "dayjs";
import CustomDrawerLayout from "@/components/common/customDrawer";
import { useMeetingStore } from "@/store/uistate/features/conversation/meeting";

const { Option } = Select;

interface AddActionPlanDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const AddActionPlanDrawer: React.FC<AddActionPlanDrawerProps> = ({ visible, onClose }) => {
     const{actionPlanData,setActionPlanData}=useMeetingStore();
        const [form]=Form.useForm()
        useEffect(() => {
              form.setFieldsValue(actionPlanData);          
        }, [actionPlanData,form]);
       
  
  const onFinish = (values:any) => {
    console.log("Action Plan values:", values);
    // Handle form submission
    onClose(); // Close the drawer after submission
  };
  console.log(actionPlanData,"actionPlanData")
const footer = (
    <div className="w-full flex justify-center items-center gap-4 pt-8">
        <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
    </div>
  );
  function handleClose(){
    onClose()
    setActionPlanData(null)
  }
  return (

        <CustomDrawerLayout
      open={visible}
      onClose={()=>handleClose()}
      modalHeader={<div className='text-center'> { actionPlanData?'Edit Action Plan':'Add New Action Plan'}</div>}
      width="40%"
      footer={footer}
    >

   
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Issue" name="issue" rules={[{ required: true, message: "Please input the issue!" }]}>
          <Input placeholder="Input area" />
        </Form.Item>

        <Form.Item label="What needs to be done" name="task" rules={[{ required: true, message: "Please describe what needs to be done!" }]}>
          <Input placeholder="Something to be done" />
        </Form.Item>

        <Form.Item label="Responsible Person" name="responsiblePerson" rules={[{ required: true, message: "Please select a responsible person!" }]}>
          <Select mode="multiple" placeholder="Select person">
            <Option value="abraham-dulla">Abraham Dulla</Option>
            <Option value="surafel-kifle">Surafel Kifle</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Priority" name="priority" rules={[{ required: true, message: "Please select a priority!" }]}>
          <Select placeholder="Select priority">
            <Option value="high">High</Option>
            <Option value="medium">Medium</Option>
            <Option value="low">Low</Option>
          </Select>
        </Form.Item>

        {/* <Form.Item label="Deadline" name="deadline" rules={[{ required: true, message: "Please select add Due date!" }]}>
          <DatePicker className="w-full" />
        </Form.Item> */}

    
      </Form>
 </CustomDrawerLayout>  );
};

export default AddActionPlanDrawer;