import React from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { Steps, Form } from 'antd';
import { IoIosInformationCircleOutline } from 'react-icons/io';

import AddCustomFields from './addCustomFields';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useCreateQuestions } from '@/store/server/features/feedback/dynamicForm/queries';
import CreateQuestionsForm from './createQuestions';

const { Step } = Steps;

const DynamicForm: React.FC<any> = (props) => {
  const [form] = Form.useForm();

  const { isAddOpen, current, setCurrent } = CategoriesManagementStore();
  const { mutate: CreateQuestions } = useCreateQuestions();

  const onChange = (value: number) => {
    setCurrent(value);
  };
  const customDot = (step: number) => (
    <div
      className={`border-2 rounded-full h-8 w-8 flex items-center justify-center ${current >= step ? 'bg-white text-primary border-primary' : 'bg-white border-gray-300 text-gray-500'}`}
    >
      <div style={{ fontSize: '24px', lineHeight: '24px' }}>
        {current >= step ? '•' : ''}
      </div>
    </div>
  );
  const handleCreateQuestions = (values: any) => {
    CreateQuestions(values);
  };
  const drawerHeader = (
    <div className="flex flex-col items-center justify-center">
      <Steps
        current={current}
        size="small"
        onChange={onChange}
        className="my-2 sm:my-3 px-[100px]"
      >
        <Step icon={customDot(0)} />
        <Step icon={customDot(1)} />
      </Steps>
      <div className="flex justify-center text-xl font-extrabold text-gray-800 px-4 py-2">
        Create Your Questions
      </div>
      <div className="flex items-center justify-center gap-1 mx-2 mt-0">
        <IoIosInformationCircleOutline size={15} />
        <p className="text-gray-300 text-xs font-light">
          Add common fields when creating questions to save time
        </p>
      </div>
    </div>
  );

  return (
    isAddOpen && (
      <CustomDrawerLayout
        open={isAddOpen}
        onClose={props?.onClose}
        modalHeader={drawerHeader}
        width="40%"
      >
        <Form
          form={form}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={handleCreateQuestions}
          onFinishFailed={() =>
            NotificationMessage.error({
              message: 'Something wrong or unfilled',
              description: 'please back and check the unfilled fields',
            })
          }
        >
          <div hidden={current !== 0} className="p-4 sm:p-6">
            <AddCustomFields />
          </div>
          <div hidden={current !== 1} className="p-4 sm:p-6">
            <CreateQuestionsForm />
          </div>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default DynamicForm;
