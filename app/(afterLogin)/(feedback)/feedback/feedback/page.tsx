'use client';
import { Button, Drawer, Tabs } from 'antd';
import { TabsProps } from 'antd'; // Import TabsProps only if you need it.
import { FaPlus } from 'react-icons/fa';
import { ConversationStore } from '@/store/uistate/features/conversation';

import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import TabLandingLayout from '@/components/tabLanding';

const Page = () => {
  const { open, setOpen } =
    ConversationStore();
//   const { data: recognitionType } = useGetAllRecognitionType();

  const onChange = () => {};

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Add New Recognition
    </div>
  );

//   const items: TabsProps['items'] = [
//     {
//       key: '1',
//       label: 'All Recognitions',
//       children: <AllRecognition data={recognitionType?.items} all={true} />,
//     },
//     ...(recognitionType?.items?.map((recognitionType: any) => ({
//       key: `${recognitionType?.id}`, // Ensure unique keys
//       label: recognitionType?.name,
//       children: <AllRecognition data={[recognitionType]} />,
//     })) || []),
//     {
//       key: 'last',
//       label: (
//         <AccessGuard permissions={[Permissions.CreateRecognition]}>
//         <Button
//           onClick={() => setOpenRecognitionType(true)}
//           icon={<FaPlus />}
//           type="primary"
//           className="flex gap-2"
//         >
//           Category
//         </Button>
//         </AccessGuard>
//       ),
//     },
//   ];

  return (
  <TabLandingLayout
    buttonTitle="Generate report"
    id="conversationLayoutId"
    enableButton={false}
    onClickHandler={() => {}}
    title="Feedback"
    subtitle="Manage your Feedback"
    allowSearch={false}
  >
    {/* <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {cardsData?.map((item: any, index: number) => (
        <ConversationTypeList key={index} data={item} />
      ))}
    </div> */}
    <div>
      {/* <Tabs
        className="max-w-[850px] overflow-x-scrollable"
        defaultActiveKey="1"
        items={items}
        onChange={onChange}
      /> */}
      {/* <CustomDrawerLayout
        open={open}
        onClose={() => setOpen(false)}
        modalHeader={modalHeader}
        width="50%"
      >
        <RecognitionForm />
      </CustomDrawerLayout> */}
      {/* <Drawer
        title={modalHeader}
        onClose={() => setOpenRecognitionType(false)}
        open={openRecognitionType}
      >
        <RecognitionForm createCategory={true} />
      </Drawer> */}
    </div>
  </TabLandingLayout>

  );
};

export default Page;