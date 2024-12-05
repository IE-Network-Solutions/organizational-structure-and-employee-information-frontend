'use client';
import { Button, Drawer, Form, Input, Tabs } from "antd";
import { TabsProps } from "antd"; // Import TabsProps only if you need it.
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import AllRecognition from "../_components/recognition/allRecognition";
import CustomDrawerLayout from "@/components/common/customDrawer";
import { ConversationStore } from "@/store/uistate/features/conversation";
import RecognitionForm from "../_components/recognition/createRecognition";
import { useGetAllRecognitionType } from "@/store/server/features/CFR/recognition/queries";
import { useAddRecognitionType } from "@/store/server/features/CFR/recognition/mutation";

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
      children: <AllRecognition data={recognitionType?.items} all={true} />,
    },
    ...(recognitionType?.items?.map((recognitionType: any, index: number) => ({
      key: `${recognitionType?.id}`, // Ensure unique keys
      label: recognitionType?.name,
      children: <AllRecognition data={[recognitionType]}/>,
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
         <RecognitionForm createCategory={true}/> 
      </Drawer>
      </div>

  );
  };

export default Page;
