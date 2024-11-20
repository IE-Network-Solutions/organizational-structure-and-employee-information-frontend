'use client';

import React, { useState } from 'react';
import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Steps,
  Button,
  Checkbox,
  Drawer,
  Row,
  Col,
  Image,
  Avatar,
  Popconfirm,
  Card,
  message,
  Radio,
  Space,
} from 'antd';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useGetQuestionSetByConversationId } from '@/store/server/features/conversation/questionSet/queries';
import { FieldType } from '@/types/enumTypes';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { CgClose } from 'react-icons/cg';
import { TiDeleteOutline, TiPlusOutline } from 'react-icons/ti';
import { FaPlus } from 'react-icons/fa';
import { useCreateConversationResponse } from '@/store/server/features/conversation/conversation-response/mutation';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import TextEditor from '@/components/form/textEditor';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

const { Step } = Steps;
const { Option } = Select;

const CreateMeeting = ({ id,slug,onClose }: { id: string,slug:string,onClose:any}) => {
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const {userId}=useAuthenticationStore();
  const { current,setOfUser,setSetOfUser } = ConversationStore();

  const {data:questionSet}=useGetQuestionSetByConversationId(slug);
  const { data: allUserData,isLoading:userDataLoading } =useGetAllUsers();
  const { data: allDepartmentWithData, } =useGetDepartmentsWithUsers();

  
  const { setOpen } = useOrganizationalDevelopment();
  const [currentStep, setCurrentStep] = useState(0);
  const {mutate:createConversationResponse}=useCreateConversationResponse();

  const handleCreateBiWeeklyWithActionPlan = async () => {
    try {
      // return
      await form1.validateFields();
      const form1Values = form1.getFieldsValue(true);

      await form2.validateFields();
      const form2Values = form2.getFieldsValue(true);
      // Process the data to wrap the deadline with Day.js
      const updatedData = Object.values(form2Values).map((value: any) => ({
        ...value,
        deadline: value.deadline ? dayjs(value.deadline).format("YYYY-MM-DD") : null, // Format deadline
      }));
    
      const groupedData=groupDataByUserId(form1Values)

      const transformedData = groupedData.map((item:any) => {
        return item.response.map((res:any) => {
          if (Array.isArray(res.values)) {
            // If values is an array, return an array of objects with an id and value
            return {
              userId: item.userId,
              questionId: res.questionId,
              response: res.values.map((value:any)=>({ id: uuidv4(), value: value }))
            };
          } else {
            // If values is not an array, return a single object
            return {
              userId: item.userId,
              questionId: res.questionId,
              response: [{ id: uuidv4(), value: res.values }]
            };
          }
        }).flat(); // Flatten the array if there are multiple objects for the same question
      }).flat();
      const formattedData={
        'response': transformedData,
        "meetingInstance": {
          "name": form1Values?.name,
          "questionSetId": slug,
          "facilitatorId":userId,
          "conversationTypeId": id,
          "userId": form1Values?.userId,
          "timeOfMeeting": form1Values?.timeOfMeeting
          ? dayjs(form1Values.timeOfMeeting).format("HH:mm:ss") // Time in HH:mm:ss format
          : null,
          "dateOfMeeting": form1Values?.dateOfMeeting
          ? dayjs(form1Values.dateOfMeeting).format("YYYY-MM-DD") // Date in YYYY-MM-DD format
          : null,
          "departmentId": form1Values?.departmentId,
          "agenda": form1Values?.agenda,
        },
      "actionPlan": updatedData,
      }
      createConversationResponse(formattedData,{
        onSuccess:()=>{
           form1.resetFields();
           form2.resetFields();
           onClose();
        }
      });
    } catch (error) {
        NotificationMessage.error({
          message:'something error',
        })
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
    if(selectedDepartmentIds?.length===0){
      setSetOfUser([]);
    }
    else{
    const usersInSelectedDepartments =allUserData?.items?.filter((user: any) => {
        const departmentId = user.employeeJobInformation?.find(
            (job: any) => job?.departmentId && job?.isPositionActive === true
        )?.departmentId;
        
        return departmentId && selectedDepartmentIds.includes(departmentId);
    });

    setSetOfUser(usersInSelectedDepartments);
  }
};
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const onUserChange = (selectedUserIds:string[]) => {
    setSelectedUsers(selectedUserIds); // Update selected users in the form
  };

  const [childrenDrawer, setChildrenDrawer] = useState(false);
  const {
    numberOfActionPlan,
    setNumberOfActionPlan,
    setSelectedEditActionPlan,
    } = useOrganizationalDevelopment();
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

  const onChildrenDrawerClose = () => {
    setChildrenDrawer(false);
  };
  const attendeesOptions = selectedUsers?.map((attendee: any) => {
    const matchingUser = allUserData?.items?.find((user: any) => user.id === attendee);
    return {
      value: matchingUser?.id,
      label: matchingUser
        ? `${matchingUser.firstName} ${matchingUser.lastName}`
        : null,
    };
  });

  const [agendaItems, setAgendaItems] = useState(['']); // Initialize with one empty agenda item

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, '']); // Add a new empty agenda item
  };
  const removeAgendaItem = (index:number) => {
    const updatedAgenda = agendaItems.filter((_, idx) => idx !== index);
    setAgendaItems(updatedAgenda);
  };
  const plusOnClickHandler = () => {
    setNumberOfActionPlan(numberOfActionPlan + 1);
  };
  const handleCancel = () => {
    form1.resetFields();
    setOpen(false);
    setSelectedEditActionPlan(null);
    setNumberOfActionPlan(1);
  };
  const handleAgendaChange = (value:string, index:number) => {
    const updatedAgenda = [...agendaItems];
    updatedAgenda[index] = value;
    setAgendaItems(updatedAgenda);
  };
  const [answeredAttendee,setAnsweredAttendee]=useState<any>([]);
const handleAttendeeChange=(userId:any)=>{
      setAnsweredAttendee(userId);
}

const groupDataByUserId = (data:any) => {
  // Initialize an object to hold the grouped responses by userId
  const groupedResult = [] as any;

  // Get the userId keys from the data
  let userIds = Object.keys(data).filter(key => key.startsWith('userId_') && !key.includes('__'));

  // Process each userId
  userIds.forEach(userIdKey => {
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

// Helper function to render field based on fieldType

  return (
    <>
      <Steps
        current={currentStep}
        size="small"
        // onChange={onChange}
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
          <>
            <Form.Item
              name="name"
              label={
                <span className="text-black text-sm font-semibold">
                  Bi-weekly Meeting Name
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please enter the bi-weekly meeting name',
                },
              ]}
            >
              <Input
                name="name"
                placeholder="Enter the meeting name"
                className="text-black text-sm font-semibold"
              />
            </Form.Item>

            <div className="flex gap-4">
              <Form.Item
                name="dateOfMeeting"
                label={
                  <span className="text-black text-sm font-semibold">
                    Date of Meeting
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: 'Please select the date of the meeting',
                  },
                ]}
                style={{ flex: 1 }}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                  name="timeOfMeeting"
                  label={
                    <span className="text-black text-sm font-semibold">
                      Time of Meeting
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Please select the time of the meeting',
                    },
                  ]}
                  style={{ flex: 1 }}
                >
                  <TimePicker
                    format="HH:mm" // Display only hours and minutes
                    style={{ width: '100%' }}
                    minuteStep={5} // Optional: step interval for minutes
                    showNow={false} // Optional: remove "Now" button if not needed
                  />
                </Form.Item>
            </div>

            <Form.Item
              name="departmentId"
              label={<span className="text-black text-sm font-semibold">Department</span>}
              rules={[
                { required: true, message: 'Please select at least one department' },
              ]}
            >
              <Select
                mode="multiple" // Enables multiple selections
                placeholder="Select a department"
                className="text-black text-xs font-semibold"
                onChange={onChangeHandler}
              >
                {allDepartmentWithData?.map((dep:any) => (
                  <Option cla key={dep.id} value={dep.id}>
                    <span className='text-xs font-semibold text-black'>{dep.name}</span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="userId"
              label={<span className="text-black text-sm font-semibold">Users</span>}
              rules={[{ required: true, message: 'Please select at least one user' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select users"
                className="text-black text-xs font-semibold"
                value={selectedUsers}
                showSearch
                onChange={onUserChange}
                optionLabelProp="label"
                filterOption={(input:any, option:any) => {
                  const fullName = `${option.value}`.toLowerCase(); // Combine first and last names
                  return fullName.includes(input.toLowerCase());
                }}
              >
                {setOfUser?.map((user:any) => (
                  <Option key={user.id} value={user.id} label={`${user.firstName} ${user.lastName}`}>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {user.firstName} {user.lastName}
                    </Checkbox>
                  </Option>
                ))}
              </Select>
            </Form.Item>

    <div>
  <span className="text-gray-950 font-semibold text-sm">
    Meeting Agenda
  </span>
  
  {agendaItems.map((item, index) => (
    <div key={index} className="flex items-center mt-2">
      <Form.Item
        name={["agenda", index]}
        label={null} // No individual label for each item
        className="flex-grow"
      >
        <Input
          value={item}
          onChange={(e) => handleAgendaChange(e.target.value, index)}
          placeholder={`Agenda item ${index + 1}`}
          className="text-black font-semibold text-sm"
        />
      </Form.Item>
      
      <Button
        type="text"
        icon={<CgClose />}
        onClick={() => removeAgendaItem(index)}
        disabled={agendaItems.length === 1} // Prevent removing the last item
        className="ml-2"
      />
    </div>
  ))}
</div>
    <Button
        type="dashed"
        onClick={addAgendaItem}
        className="flex items-center text-sm font-semibold mt-2"
        icon={<TiPlusOutline />}
        >
        Add Agenda Item
    </Button>
            <div className="flex justify-center mt-10">
              <Button
                onClick={() => form1.resetFields()}
                style={{ marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button type="primary" onClick={handleContinue}>
                Continue
              </Button>
            </div>
          </>
        )}
        {currentStep === 1 && (
          <>
        {attendeesOptions?.map((attendee: any, attendeeIndex: number) => (
          <React.Fragment key={`attendee_${attendee.id}_${attendeeIndex}`}>
            {/* Attendee Selection */}
            <Form.Item
              name={`userId_${attendeeIndex}`}
              label={<span className="text-black text-sm font-semibold">Attendee</span>}
              rules={[{ required: true, message: 'Please select an attendee' }]}
            >
              <Select
                placeholder="Select attendee"
                className="text-black text-sm font-semibold"
                options={attendeesOptions}
                onChange={handleAttendeeChange}
              />
            </Form.Item>

            {/* Loop through each question for the current attendee */}
            {questionSet?.conversationsQuestions?.map((q: any, questionIndex: number) => (
              <React.Fragment key={`question_${q.id}_${attendeeIndex}_${questionIndex}`}>
                {/* Answer Field for Question */}
                <Form.Item
                  name={[`userId_${attendeeIndex}__${questionIndex}`, `${q.id}`]}  // Using both attendeeIndex and questionIndex in the name
                  label={q.question}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  className="mx-3 mb-8"
                >
                  {(() => {
                    switch (q?.fieldType) {
                      case FieldType.RADIO:
                        return (
                          <Radio.Group>
                            <Space direction="vertical">
                              {q.field?.map((option: any) => (
                                <Radio key={option.value} value={option.values}>
                                  {option.value}
                                </Radio>
                              ))}
                            </Space>
                          </Radio.Group>
                        );

                      case FieldType.TIME:
                        return <TimePicker format="HH:mm" />;

                      case FieldType.DROPDOWN:
                        return (
                          <Select className="w-full">
                            {q.field?.map((option: any) => (
                              <Select.Option key={option.value} value={option.value}>
                                {option.value}
                              </Select.Option>
                            ))}
                          </Select>
                        );

                      case FieldType.CHECKBOX:
                        return <Checkbox.Group options={q.field} />;

                      case FieldType.MULTIPLE_CHOICE:
                        return (
                          <Select mode="multiple" className="w-full">
                            {q.field?.map((option: any) => (
                              <Select.Option key={option.value} value={option.value}>
                                {option.value}
                              </Select.Option>
                            ))}
                          </Select>
                        );

                      default:
                        return <TextEditor />;
                    }
                  })()}
                </Form.Item>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}

        <div className="flex justify-center items-center gap-4 space-x-2 my-7">
          <Button htmlType="button" type="primary" className="px-8 text-xs" onClick={showChildrenDrawer}>
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
      {childrenDrawer
      &&
        <Drawer
          title="Create Action Plan"
          width={'30%'}
          closable={false}
          onClose={onChildrenDrawerClose}
          open={childrenDrawer}
          
        >
        <Form
          form={form2}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={handleCreateBiWeeklyWithActionPlan}
        >
          {/* eslint-disable @typescript-eslint/naming-convention  */}
          {Array.from({ length: numberOfActionPlan }, (__, index) => (
            <Card
              key={index}
              title={
                <div
                  className="flex justify-end text-red-600 cursor-pointer"
                  onClick={() => setNumberOfActionPlan(numberOfActionPlan - 1)}
                >
                  <TiDeleteOutline />
                </div>
              }
            >
              <Row gutter={16}>
                <Col xs={24} sm={24}>
                  <Form.Item
                    className="font-semibold text-xs"
                    name={[`${index}`, 'issue']}
                    label={`Action plan ${index + 1}`}
                    id={`actionPlanId${index + 1}`}
                    rules={[
                      { required: true, message: 'action title is required' },
                      {
                        max: 40, // Set the maximum number of characters allowed
                        message: 'Action title cannot exceed 40 characters',
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={24}>
                  <Form.Item
                    className="font-semibold text-xs"
                    name={[`${index}`, 'comment']}
                    label={`Comment`}
                    id={`actionPlanDescription${index + 1}`}
                    rules={[
                      { required: true, message: 'Comment is required' },
                      {
                        max: 40, // Set the maximum number of characters allowed
                        message: 'Comment cannot exceed 40 characters',
                      },
                    ]}
                  >
                    <Input.TextArea rows={6} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={24}>
                  <Form.Item
                    className="font-semibold text-xs"
                    name={[`${index}`, 'assigneeId']}
                    label={`Responsible Person`}
                    id={`responsiblePersonId${index + 1}`}
                    rules={[
                      {
                        required: true,
                        message: 'Responsible Person is required',
                      },
                    ]}
                  >
                    <Select
                      id={`selectStatusChartType`}
                      placeholder="Responsible Person"
                      allowClear
                      loading={userDataLoading}
                      className="w-full my-4"
                    >
                      {allUserData?.items?.map((item: any) => (
                        <Option key="active" value={item.id}>
                          <div className="flex space-x-3 p-1 rounded">
                            <Image
                              src={item?.profileImage ?? Avatar}
                              alt="pep"
                              className="rounded-full w-4 h-4 mt-2"
                              width={15}
                              height={15}
                            />
                            <span className="flex justify-center items-center">
                              {item?.firstName + ' ' + ' ' + item?.middleName}
                            </span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16} align="middle" justify="start">
              <Col xs={24} sm={10}>
                <Form.Item
                  className="font-semibold text-xs w-full"
                  name={[`${index}`, 'status']}
                  label="Status"
                  id={`statusId${index + 1}`}
                  rules={[
                    {
                      required: true,
                      message: 'Status is required',
                    },
                  ]}
                >
                  <Select
                    id="selectStatusChartType"
                    placeholder="Select status"
                    allowClear
                    className="w-full"
                  >
                    <Option key="pending" value="pending">
                      Pending
                    </Option>
                    <Option key="solved" value="solved">
                      Solved
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  className="font-semibold text-xs w-full"
                  name={[`${index}`, 'deadline']}
                  label={`Deadline ${index + 1}`}
                  id={`deadlineActionId${index + 1}`}
                  rules={[
                    { required: true, message: 'deadline is required' },
                  ]}
                >
                  <DatePicker className="w-full" />
                </Form.Item>
              </Col>
            </Row>

            </Card>
          ))}
          <Row gutter={16} className="my-5">
            <Col className="flex justify-center" xs={24} sm={24}>
              <Button type="primary" className='text-xs px-8 text-white' onClick={plusOnClickHandler}>
                <FaPlus  />
              </Button>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12} className="flex justify-end">
              <Popconfirm
                title="reset all you filled"
                description="Are you sure to reset all fields value ?"
                onConfirm={handleCancel}
                okText="Yes"
                cancelText="No"
              >
                <Button name="cancelSidebarButtonId" className="p-4" danger>
                  Cancel
                </Button>
              </Popconfirm>
            </Col>
            <Col xs={24} sm={12}>
              <Button
                // loading={isLoading}
                htmlType="submit"
                name="createActionButton"
                id="createActionButtonId"
                className="px-6 py-3 text-xs font-bold"
                type="primary"
              >
                Create
              </Button>
            </Col>
          </Row>
        </Form>
        </Drawer>}
    </>
  );
};

export default CreateMeeting;
