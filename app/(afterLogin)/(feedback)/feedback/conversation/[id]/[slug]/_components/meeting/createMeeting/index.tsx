'use client';

import React from 'react';
import { Form, Steps, Button } from 'antd';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useGetQuestionSetByConversationId } from '@/store/server/features/CFR/conversation/questionSet/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useCreateConversationResponse } from '@/store/server/features/CFR/conversation/conversation-response/mutation';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import ConversationInstanceForm from '../conversationInstanceForm';
import QuestionResponseForm from '../questionResponseForm';
import ActionPlanDrawer from '../actionPlanDrawer';

const { Step } = Steps;

const CreateMeeting = ({
  id,
  slug,
  onClose,
}: {
  id: string;
  slug: string;
  onClose: any;
}) => {
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const { userId } = useAuthenticationStore();
  const { current, setSetOfUser } = ConversationStore();
  const {
    setOpen,
    currentStep,
    setCurrentStep,
    setNumberOfActionPlan,
    setSelectedEditActionPlan,
    setChildrenDrawer,
    setAnsweredAttendee,
    selectedUsers,
    setSelectedUsers,
  } = useOrganizationalDevelopment();

  const { data: questionSet } = useGetQuestionSetByConversationId(slug);
  const { data: allUserData, isLoading: userDataLoading } = useGetAllUsers();
  const { data: allDepartmentWithData } = useGetDepartmentsWithUsers();
  const { mutate: createConversationResponse } =
    useCreateConversationResponse();

  const handleCreateBiWeeklyWithActionPlan = async () => {
    try {
      await form1.validateFields();
      const form1Values = form1.getFieldsValue(true);

      await form2.validateFields();
      const form2Values = form2.getFieldsValue(true);
      const updatedData = Object.values(form2Values).map((value: any) => ({
        ...value,
        deadline: value.deadline
          ? dayjs(value.deadline).format('YYYY-MM-DD')
          : null, // Format deadline
      }));

      const groupedData = groupDataByUserId(form1Values);

      const transformedData = groupedData
        .map((item: any) => {
          return item.response
            .map((res: any) => {
              if (Array.isArray(res.values)) {
                return {
                  userId: item.userId,
                  questionId: res.questionId,
                  response: res.values.map((value: any) => ({
                    id: uuidv4(),
                    value: value,
                  })),
                };
              } else {
                return {
                  userId: item.userId,
                  questionId: res.questionId,
                  response: [{ id: uuidv4(), value: res.values }],
                };
              }
            })
            .flat(); // Flatten the array if there are multiple objects for the same question
        })
        .flat();
      const formattedData = {
        response: transformedData,
        meetingInstance: {
          name: form1Values?.name,
          questionSetId: slug,
          facilitatorId: userId,
          conversationTypeId: id,
          userId: form1Values?.userId,
          timeOfMeeting: form1Values?.timeOfMeeting
            ? dayjs(form1Values.timeOfMeeting).format('HH:mm:ss') // Time in HH:mm:ss format
            : null,
          dateOfMeeting: form1Values?.dateOfMeeting
            ? dayjs(form1Values.dateOfMeeting).format('YYYY-MM-DD') // Date in YYYY-MM-DD format
            : null,
          departmentId: form1Values?.departmentId,
          agenda: form1Values?.agenda,
        },
        actionPlan: updatedData,
      };
      createConversationResponse(formattedData, {
        onSuccess: () => {
          form1.resetFields();
          form2.resetFields();
          onClose();
          setChildrenDrawer(false);
          setCurrentStep(0);
        },
      });
    } catch (error) {
      NotificationMessage.error({
        message: 'something error',
      });
    }
  };
  const customDot = (step: number) => (
    <div
      className={`border-2 rounded-full h-8 w-8 flex items-center justify-center
         ${
           current >= step
             ? 'bg-indigo-700 text-white'
             : 'bg-white border-gray-300 text-gray-500'
         }`}
    >
      <div style={{ fontSize: '24px', lineHeight: '24px' }}>
        {current >= step ? (
          <IoCheckmarkSharp className="text-xs font-bold" />
        ) : (
          '•'
        )}
      </div>
    </div>
  );
  const onChangeHandler = (selectedDepartmentIds: string[]) => {
    if (selectedDepartmentIds?.length === 0) {
      // form1?.setFieldValue('userId', [])
      setSetOfUser([]);
    } else {
      const usersInSelectedDepartments = allUserData?.items?.filter(
        (user: any) => {
          const departmentId = user.employeeJobInformation?.find(
            (job: any) => job?.departmentId && job?.isPositionActive === true,
          )?.departmentId;

          return departmentId && selectedDepartmentIds.includes(departmentId);
        },
      );

      setSetOfUser(usersInSelectedDepartments);
    }
  };

  const onUserChange = (selectedUserIds: string[]) => {
    setSelectedUsers(selectedUserIds); // Update selected users in the form
  };

  const handleContinue = async () => {
    try {
      await form1.validateFields();
      setCurrentStep(1); // Move to the next step if validation passes
    } catch (error) {
      NotificationMessage.error({
        message: 'something unfilled check the field',
        description: 'check back and try again !!',
      });
    }
  };
  const showChildrenDrawer = () => {
    setChildrenDrawer(true);
  };
  const attendeesOptions = selectedUsers?.map((attendee: any) => {
    const matchingUser = allUserData?.items?.find(
      (user: any) => user.id === attendee,
    );
    return {
      value: matchingUser?.id,
      label: matchingUser
        ? `${matchingUser.firstName} ${matchingUser.lastName}`
        : null,
    };
  });

  const handleCancel = () => {
    form1.resetFields();
    setOpen(false);
    setSelectedEditActionPlan(null);
    setNumberOfActionPlan(1);
  };

  const handleAttendeeChange = (userId: any) => {
    setAnsweredAttendee(userId);
  };

  const groupDataByUserId = (data: any) => {
    // Initialize an object to hold the grouped responses by userId
    const groupedResult = [] as any;

    // Get the userId keys from the data
    const userIds = Object.keys(data).filter(
      (key) => key.startsWith('userId_') && !key.includes('__'),
    );

    // Process each userId
    userIds.forEach((userIdKey) => {
      const userId = data[userIdKey];
      const responses = [];

      // Collecting responses by question index (userId__index)
      let index = 0;
      while (data[`${userIdKey}__${index}`]) {
        const questionData = data[`${userIdKey}__${index}`];
        const questionId = Object.keys(questionData)[0]; // Get the questionId
        const values = questionData[questionId];

        responses.push({ questionId, values });
        index++;
      }

      // Add the grouped data for each userId to the result
      groupedResult.push({ userId, response: responses });
    });

    return groupedResult;
  };

  return (
    <>
      <Steps
        current={currentStep}
        size="small"
        className="flex justify-center my-6 sm:my-10"
      >
        <Step icon={customDot(0)} />
        <Step icon={customDot(1)} />
      </Steps>

      <Form
        form={form1}
        name="createMeetingForm"
        autoComplete="off"
        layout="vertical"
        onFinish={handleCreateBiWeeklyWithActionPlan}
        style={{ maxWidth: '100%' }}
        className="text-black"
      >
        {currentStep === 0 && (
          <ConversationInstanceForm
            form={form1}
            allDepartmentWithData={allDepartmentWithData}
            onUserChange={onUserChange}
            onDepartmentChange={onChangeHandler}
            handleContinue={handleContinue}
          />
        )}
        {currentStep === 1 && (
          <>
            {attendeesOptions?.map((attendee: any, attendeeIndex: number) => (
              <QuestionResponseForm
                key={`attendee_${attendee.id}_${attendeeIndex}`}
                attendee={attendee}
                formData={form1.getFieldsValue}
                attendeeIndex={attendeeIndex}
                attendeesOptions={attendeesOptions}
                questionSet={questionSet}
                handleAttendeeChange={handleAttendeeChange}
                form={form1}
              />
            ))}

            <div className="flex justify-center items-center gap-4 space-x-2 my-7">
              <Button
                htmlType="button"
                type="primary"
                className="px-8 text-xs"
                onClick={showChildrenDrawer}
              >
                Action Plan
              </Button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center items-center gap-4 space-x-2">
              <Button onClick={() => setCurrentStep(0)}>Back</Button>
              <Button htmlType="submit" type="primary">
                Create
              </Button>
            </div>
          </>
        )}
      </Form>
      <ActionPlanDrawer
        form={form2}
        handleCreateBiWeeklyWithActionPlan={handleCreateBiWeeklyWithActionPlan}
        handleCancel={handleCancel}
        allUserData={allUserData}
        userDataLoading={userDataLoading}
      />
    </>
  );
};

export default CreateMeeting;
