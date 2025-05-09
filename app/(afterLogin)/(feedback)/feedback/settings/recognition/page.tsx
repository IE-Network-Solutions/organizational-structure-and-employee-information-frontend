'use client';
import { Button, Spin, Tabs } from 'antd';
import { TabsProps } from 'antd'; // Import TabsProps only if you need it.
import { FaPlus } from 'react-icons/fa';
import AllRecognition from '../_components/recognition/allRecognition';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { ConversationStore } from '@/store/uistate/features/conversation';

import RecognitionForm from '../_components/recognition/createRecognition';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetAllRecognitionWithRelations } from '@/store/server/features/CFR/recognitionCriteria/queries';

const Page = () => {
  const { open, setOpen, setOpenRecognitionType, openRecognitionType } =
    ConversationStore();
  // const { data: recognitionType } = useGetAllRecognitionType();
  const { data: recognitionType, isLoading } =
    useGetAllRecognitionWithRelations();

  const onChange = () => {};

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      {openRecognitionType ? 'Update Recognition' : 'Add New Recognition'}
    </div>
  );

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'All Recognitions',
      children: (
        <AllRecognition
          data={recognitionType?.items?.filter(
            (item: any) => item.parentTypeId === null,
          )}
          all={true}
        />
      ),
    },
    ...(recognitionType?.items
      ?.filter((item: any) => item.parentTypeId === null)
      ?.map((recognitionType: any) => ({
        key: `${recognitionType?.id}`, // Ensure unique keys
        label: recognitionType?.name,
        children: <AllRecognition data={[recognitionType]} />,
      })) || []),
  ];

  return (
    <div className="p-5 rounded-2xl bg-white h-full">
      <Spin spinning={isLoading}>
        <div className="flex md:flex-row flex-col-reverse justify-between">
          <Tabs
            className="max-w-full overflow-x-auto "
            defaultActiveKey="1"
            items={items}
            onChange={onChange}
          />
          <AccessGuard permissions={[Permissions.CreateRecognition]}>
            <Button
              onClick={() => setOpenRecognitionType(true)}
              icon={<FaPlus />}
              type="primary"
              className="flex gap-2 ml-2 mt-3"
            >
              Category
            </Button>
          </AccessGuard>
        </div>
      </Spin>

      <CustomDrawerLayout
        open={open}
        onClose={() => setOpen(false)}
        modalHeader={modalHeader}
        width="50%"
      >
        <RecognitionForm onClose={() => setOpen(false)} />
      </CustomDrawerLayout>
      {/* <Drawer
        width={600} // Adjust the width as needed
        title={modalHeader}
        onClose={() => setOpenRecognitionType(false)}
        open={openRecognitionType}
      > */}
      <RecognitionForm
        createCategory={true}
        onClose={() => setOpenRecognitionType(false)}
      />
      {/* </Drawer> */}
    </div>
  );
};

export default Page;
