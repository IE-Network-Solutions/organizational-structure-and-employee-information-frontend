'use client';
import {  Button, Tabs } from "antd";
import { TabsProps } from "antd"; // Import TabsProps only if you need it.
import CustomDrawerLayout from "@/components/common/customDrawer";
import { ConversationStore } from "@/store/uistate/features/conversation";
import { FaPlus } from "react-icons/fa";
import { QuestionSet } from "../../conversation/[id]/_components/question-set";
import QuestionSetForm from "../_components/questionSetForm";

const Page = () => {
    const { open, setOpen, setSearchField } = ConversationStore();

  const onChange = (key: string) => {
    console.log("Active Tab Key:", key);
  };
  const onFinish = (key: string) => {
    console.log("Active Tab Key:", key);
  };
  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Add New Bi-Weekly
    </div>
  );
  const items: TabsProps['items'] = [
    {
        key: '1',
        label: 'Bi-weekly',
        children: '',
      },
      {
        key: '2',
        label: 'One-on-one',
        children: '',
      },
      {
        key: '3',
        label: 'Healthy check-up',
        children: '',
      },
      {
        key: '4',
        label: 'Survey',
        children: '',
      },
      
  ];

  return ( 
    <div>
        
      <div className="flex justify-between">
        <span className="font-bold text-lg">Questions</span>
        <Button icon={<FaPlus/>} onClick={()=>setOpen(true)} type="primary"  className="h-10 text-xs">Add new Bi-Weekly</Button>
      </div>

      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      <CustomDrawerLayout
        open={open}
        onClose={() => setOpen(false)}
        modalHeader={modalHeader}
        width="40%"
      >
        <QuestionSetForm/>

      </CustomDrawerLayout>

      </div>

  );
  };

export default Page;