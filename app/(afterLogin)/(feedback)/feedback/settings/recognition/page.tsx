'use client';
import { Button, Drawer, Form, Input, Tabs } from "antd";
import { TabsProps } from "antd"; // Import TabsProps only if you need it.
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import AllRecognition from "../_components/recognition/allRecognition";
import CustomDrawerLayout from "@/components/common/customDrawer";
import { ConversationStore } from "@/store/uistate/features/conversation";
import RecognitionForm from "../_components/recognition/createRecognition";
import { useGetAllRecognitionType } from "@/store/server/features/recognition/queries";
import { useAddRecognitionType } from "@/store/server/features/recognition/mutation";

const Page = () => {
    const { open, setOpen,setOpenRecognitionType,openRecognitionType, setSearchField } = ConversationStore();
    const {data:recognitionType}=useGetAllRecognitionType();
    const {mutate:createRecognitionType}=useAddRecognitionType();


  const onChange = (key: string) => {
    console.log("Active Tab Key:", key);
  };
  const onFinish = (values: any) => {
    console.log("Active Tab Key:", values);
    createRecognitionType(values)
  };
  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Add New Recognition
    </div>
  );

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'All Recognitions',
      children: <AllRecognition />,
    },
    ...(recognitionType?.items?.map((recognitionType: any, index: number) => ({
      key: `middle-${index}`, // Ensure unique keys
      label: recognitionType?.name,
      children: <AllRecognition />,
    })) || []),
    {
      key: 'last',
      label: (
        <Button
          onClick={() => setOpenRecognitionType(true)}
          icon={<FaPlus />}
          type="primary"
          className="flex gap-2"
        >
          Category
        </Button>
      ),
      children: 'Content of Tab Pane 5',
    },
  ];


  return ( 
    <div>
      <Tabs className="max-w-[850px] overflow-x-scrollable" defaultActiveKey="1" items={items} onChange={onChange} />
      <CustomDrawerLayout
        open={open}
        onClose={() => setOpen(false)}
        modalHeader={modalHeader}
        width="50%"
      >
        <RecognitionForm /> 

      </CustomDrawerLayout>
      <Drawer title={modalHeader} onClose={()=>setOpenRecognitionType(false)} open={openRecognitionType}>
        <Form
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={(errorInfo) => {
            console.log("Validation Failed:", errorInfo);
          }}
        >
          <Form.Item
            label="Recognition Name"
            name="name"
            rules={[
              { required: true, message: "Please enter the recognition name" },
              { max: 50, message: "Name cannot exceed 50 characters" },
            ]}
          >
            <Input placeholder="Enter recognition name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter the description" },
              { max: 200, message: "Description cannot exceed 200 characters" },
            ]}
          >
            <Input.TextArea
              placeholder="Enter description"
              rows={4}
              maxLength={200}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
      </div>

  );
  };

export default Page;
