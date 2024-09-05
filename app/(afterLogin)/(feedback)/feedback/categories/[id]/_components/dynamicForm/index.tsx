'use client';
import React from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { Steps, Form, Button, Modal } from 'antd';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { CopyOutlined } from '@ant-design/icons';
import AddCustomFields from './addCustomFields';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import CreateQuestionsForm from './createQuestions';
import { useCreateDynamicForm } from '@/store/server/features/feedback/dynamicForm/mutation';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';

const { Step } = Steps;

const DynamicForm: React.FC<any> = (props) => {
  const [form] = Form.useForm();
  const { isAddOpen, current, setCurrent, setIsAddOpen } =
    CategoriesManagementStore();

  const { mutate: CreateQuestions } = useCreateDynamicForm();

  const { isModalVisible, setIsModalVisible, setGeneratedUrl } =
    useDynamicFormStore();

  const { questions, customFields, generatedUrl, publishSurvey } =
    useDynamicFormStore((state) => ({
      questions: state.questions,
      customFields: state.customFields || [],
      publishSurvey: state.publishSurvey,
      generatedUrl: state.generatedUrl,
    }));

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

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generatedUrl);
    NotificationMessage.success({
      message: 'URL Copied',
      description: 'The generated URL has been copied to your clipboard.',
    });
  };

  const handlePublish = async () => {
    try {
      const formattedValues = {
        formId: props?.selectedFormId,
        questions: [
          ...questions.map((question: any, index: number) => ({
            id: question.id,
            question: question.question,
            type: question.type,
            options: question.options.length > 0 ? question.options : [],
            required: true,
            order: question.order || index + 1,
          })),
          ...customFields
            .filter((field: any) => field.selected)
            .map((field: any) => ({
              id: field.id,
              question: field.name,
              type: 'Custom',
              options: field.options || [],
              required: false,
            })),
        ],
      };

      CreateQuestions(formattedValues);
      const generatedUrl = `${window.location.origin}/questions/${props?.selectedFormId}`;

      publishSurvey();
      setIsModalVisible(true);

      setGeneratedUrl(generatedUrl);

      NotificationMessage.success({
        message: 'Survey Published',
        description: `Your survey has been published successfully. URL: ${generatedUrl}`,
      });

      navigator.clipboard.writeText(generatedUrl);
    } catch (error) {
      console.error('Error publishing survey:', error);
      NotificationMessage.error({
        message: 'Publish Failed',
        description: 'There was an error publishing the survey.',
      });
    }
  };

  const handleCreateQuestions = (e: any) => {
    // handlePublish();
    console.log(e);
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

  const handleNext = () => {
    setCurrent(1);
  };

  const handleBack = () => {
    setCurrent(0);
  };

  const renderFooter = () => {
    switch (current) {
      case 0:
        return (
          <div className="flex justify-center absolute w-full bg-[#fff] px-6 py-6 gap-8">
            <Button
              className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
              type="link"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12"
              type="link"
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
        );
      case 1:
        return (
          <div className="flex justify-center absolute w-full bg-[#fff] px-6 py-6 gap-8">
            <Button
              className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
              type="link"
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12"
              type="primary"
              onClick={handleCreateQuestions}
            >
              Publish
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    isAddOpen && (
      <>
        <CustomDrawerLayout
          open={isAddOpen}
          onClose={props?.onClose}
          modalHeader={drawerHeader}
          width="40%"
          footer={renderFooter()}
        >
          {/* <AddCustomFields onSkip={handleNext} onNext={handleNext} />{' '} */}
          <CreateQuestionsForm onBack={() => setCurrent(0)} />

          {/* <div hidden={current !== 1} className="p-4 sm:p-6"></div> */}
        </CustomDrawerLayout>
        <Modal
          title="Survey Published"
          open={isModalVisible}
          onOk={() => setIsModalVisible(false)}
          onCancel={() => setIsModalVisible(false)}
        >
          <p>Your survey has been published. Here&apos;s the URL:</p>
          <p>
            <strong>{generatedUrl}</strong>
            <CopyOutlined
              onClick={handleCopyUrl}
              className="ml-2 cursor-pointer"
            />
          </p>
        </Modal>
      </>
    )
  );
};

export default DynamicForm;
