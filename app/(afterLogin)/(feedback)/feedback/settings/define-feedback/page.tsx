'use client';
import { Button, Card, Form, Input, Modal, Select, Tabs } from 'antd';
import { TabsProps } from 'antd'; // Import TabsProps only if you need it.
import CustomDrawerLayout from '@/components/common/customDrawer';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useEffect, useState } from 'react';
import { useFetchAllFeedbackTypes } from '@/store/server/features/feedback/feedbackType/queries';
import FeedbackTypeDetail from './_components/feedbackTypeDetail';
import CreateFeedback from './_components/createFeedback';
import { FeedbackTypeItems } from '@/store/server/features/CFR/conversation/action-plan/interface';
import { FaPlus } from 'react-icons/fa';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { Department } from '@/types/dashboard/organization';
import { useCreatePerspective } from '@/store/server/features/CFR/feedback/mutations';
import { useGetAllPerspectives } from '@/store/server/features/CFR/feedback/queries';
const { TextArea } = Input;

const Page = () => {
  const [form] = Form.useForm();

  const {
    selectedFeedback,
    variantType,
    activeTab,
    setActiveTab,
    open,
    setOpen,
    setSelectedFeedback,
  } = ConversationStore();
  const { data: getAllFeedbackTypes } = useFetchAllFeedbackTypes();
  const [addPerspectiveModal,setAddPerspectiveModal]=useState(false);
    const { data: departments, isLoading } = useGetDepartments();
    const { mutate: addPerspective, isLoading:createPerspectiveLoading } = useCreatePerspective();
    const { data: perspectiveData, isLoading:perspectiveDataLoading } = useGetAllPerspectives();


  
  getAllFeedbackTypes
  const onChange = (key: string) => {
    setActiveTab(key);
  };
  const onCloseHandler = () => {
    setOpen(false);
    setSelectedFeedback(null);
  };

  const getDepartment=(id:string)=>{
     return departments?.find((item:Department)=>item.id=id)
  }
  useEffect(() => {
    setActiveTab(getAllFeedbackTypes?.items?.[0]?.id);
  }, [getAllFeedbackTypes]);

  const activeTabName =
    getAllFeedbackTypes?.items?.find(
      (item: FeedbackTypeItems) => item.id === activeTab,
    )?.category || '';

  const modalHeader = (
    <div className="flex flex-col items-center justify-center text-xl font-extrabold text-gray-800 p-4">
      <p>Add New {activeTabName}</p>
      <p>{variantType} type</p>
    </div>
  );
  const items: TabsProps['items'] = [
    ...(getAllFeedbackTypes?.items || []).map((item: FeedbackTypeItems) => ({
      key: item?.id,
      label: item?.category,
      children: <FeedbackTypeDetail feedbackTypeDetail={item} />,
    })),
    {
      key: 'perspective-list',
      label: (
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          Perspective List
        </div>
      ),
      children: (
        <div>
          <div className="flex justify-end">
            <Button onClick={() => setAddPerspectiveModal(true)} icon={<FaPlus />}>
              Add Perspective
            </Button>
          </div>
          {perspectiveData?.map((item: any) => (
            <Card className="mx-2" key={item.id}>
              <div className="flex justify-between">
                <div>
                  <p className='font-bold'>{item?.name}</p>
                  <p className="flex gap-2 ml-2 text-xs">{item?.description}</p>
                </div>
                <div>
                <p className='font-bold'><strong>department</strong></p>
                <p className="flex gap-2 ml-2 text-xs">{getDepartment(item?.departmentId).name}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ),
    },
  ];
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      addPerspective(values,{
        onSuccess:()=>{
          form.resetFields();
          setAddPerspectiveModal(false);
        }
      });
    } catch (error) {
      console.error('Validation Failed:', error);
    }
  };

  const handleCancel = () => {
    setAddPerspectiveModal(false);
    form.resetFields();
  };
  return (
    <div>
      <div className="flex flex-col gap-10">
        <span className="font-bold text-lg">Feedback</span>

        <div className="mt-5">


          <Tabs
            defaultActiveKey={getAllFeedbackTypes?.items?.[0]?.id}
            items={items}
            onChange={onChange}
          />
        </div>
      </div>

      <CustomDrawerLayout
        open={open || selectedFeedback?.id}
        onClose={onCloseHandler}
        modalHeader={modalHeader}
        width="30%"
      >
        <CreateFeedback />
      </CustomDrawerLayout>
      <Modal title="Basic Modal" open={addPerspectiveModal} onOk={handleOk} onCancel={handleCancel}>
      <Form
          form={form}
          layout="vertical"
          name="addPerspectiveForm"
          initialValues={{
            name: '',
            description: '',
            department: null,
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a name!' }]}
          >
            <Input placeholder="Enter perspective name" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: 'Please enter a description!',
              },
            ]}
          >
            <TextArea
              placeholder="Enter perspective description"
              rows={4}
              maxLength={500}
            />
          </Form.Item>
          <Form.Item
              name="departmentId"
              label="Select Department"
              rules={[
                { required: true, message: 'Please select a department' },
              ]}
            >
              <Select
                placeholder="Select a department"
              >
                {departments?.map((department: any) => (
                  <Select.Option key={department.id} value={department.id}>
                    {department.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
        </Form>

      
      </Modal>
    </div>
  );
};

export default Page;
