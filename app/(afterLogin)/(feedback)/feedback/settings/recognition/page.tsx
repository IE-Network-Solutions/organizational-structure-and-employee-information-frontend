'use client';
import {  Tabs } from "antd";
import { TabsProps } from "antd"; // Import TabsProps only if you need it.
import CustomDrawerLayout from "@/components/common/customDrawer";
import { ConversationStore } from "@/store/uistate/features/conversation";

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
      Add New Recognition
    </div>
  );
  const items: TabsProps['items'] = [

  ];

  return ( 
    <div>
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      <CustomDrawerLayout
        open={open}
        onClose={() => setOpen(false)}
        modalHeader={modalHeader}
        width="50%"
      >
        <div></div>

      </CustomDrawerLayout>

      </div>

  );
  };

export default Page;