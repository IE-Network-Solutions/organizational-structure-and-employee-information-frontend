'use client';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { OrganizationalDevelopmentSettingsStore } from '@/store/uistate/features/feedback/settings';
import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import CustomButton from '@/components/common/buttons/customButton';
import QuestionForm from './QuestionForm';

const OrganizationalDevelopmentSettingsDrawer: React.FC<any> = (props) => {
  const { isOpen, questions, updateOption, updateQuestion, addQuestion } =
    OrganizationalDevelopmentSettingsStore();

  const drawerHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Create New Field
    </div>
  );

  const CustomFooter = () => (
    <div className="flex justify-center absolute w-full bg-[#fff] px-6 py-6 gap-8">
      <CustomButton
        title="Cancel"
        className="flex justify-center text-sm font-light text-gray-600 p-4 px-6 bg-white border-gray-600"
      />
      <CustomButton
        title="Create"
        className="flex justify-center text-sm font-light text-white p-4 px-6"
      />
    </div>
  );

  const handleTypeChange = (value: string, questionId: number) => {
    updateQuestion(questionId, { type: value });
  };

  const handleOptionChange = (
    value: string,
    questionId: number,
    optionIndex: number,
  ) => {
    updateOption(questionId, optionIndex, value);
  };

  return (
    isOpen && (
      <CustomDrawerLayout
        open={isOpen}
        onClose={props?.onClose}
        modalHeader={drawerHeader}
        width="40%"
        footer={<CustomFooter />}
      >
        <div className="pb-[60px]">
          <QuestionForm
            questions={questions}
            handleTypeChange={handleTypeChange}
            updateQuestion={updateQuestion}
            handleOptionChange={handleOptionChange}
          />
        </div>
        <div className="flex flex-col items-center justify-center my-8">
          <div
            className="rounded-full bg-primary w-8 h-8 flex items-center justify-center"
            onClick={addQuestion}
          >
            <PlusOutlined size={30} className="text-white" />
          </div>
          <p className="text-xs font-light text-gray-400"> Add Question</p>
        </div>
      </CustomDrawerLayout>
    )
  );
};

export default OrganizationalDevelopmentSettingsDrawer;
