import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Radio,
  DatePicker,
  TimePicker,
  Button,
  Tag,
  Checkbox,
} from "antd";
import dayjs from "dayjs";
import CustomDrawerLayout from "@/components/common/customDrawer";
import { useMeetingStore } from "@/store/uistate/features/conversation/meeting";
import { Steps } from 'antd';
import { CheckCircleOutlined } from "@ant-design/icons";
import { MdClose } from "react-icons/md";

const { Step } = Steps;
const { Option } = Select;

const peopleOptions = [
  { label: "Abraham Dulla", value: "abraham-dulla" },
  { label: "Surafel Kifle", value: "surafel-kifle" },
];

export default function AddNewMeetingForm() {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);
   const [allowGuests, setAllowGuests] = useState(false);
  const [guests, setGuests] = useState([{ name: '', email: '' }]);
  const { 
    openAddMeeting,
setOpenAddMeeting } = useMeetingStore();

  const onNext = async () => {
    try {
      await form.validateFields(step === 1 ? firstStepFields : secondStepFields);
      setStep(2);
    } catch (e) {
      // validation failed
    }
  };

  const onPrev = () => {
    setStep(1);
  };

  const onFinish = (values) => {
    console.log("Final values:", values);
    // Handle form submit
  };

  const firstStepFields = [
    "title",
    "type",
    "locationType",
    "location",
    "department",
    "date",
    "startTime",
    "endTime",
    "chairPerson",
    "facilitator",
    "attendees",
  ];

  const secondStepFields = ["meetingObjective", "template"];
  function handleClose(){
 setOpenAddMeeting(false)
  }
   const handleGuestChange = (index, field, value) => {
    const newGuests = [...guests];
    newGuests[index][field] = value;
    setGuests(newGuests);
  };

  const addGuest = () => {
    setGuests([...guests, { name: '', email: '' }]);
  };
  const footer = (
      <div className="flex justify-center gap-3 mt-6">
           <Button className="w-36" onClick={onPrev}>Cancel</Button>
          {step === 2 ? (
            <>
             
              <Button className="w-36" type="primary" htmlType="submit">
                Create
              </Button>
            </>
          ) : (
            <Button type="primary" onClick={onNext}  className="w-36">
              Next
            </Button>
          )}
        </div>
  )
  return (
<CustomDrawerLayout
      open={openAddMeeting}
      onClose={()=>handleClose()}
      modalHeader={    <h2 className="text-center font-semibold text-lg mb-2">Add New Meeting</h2>}
      width="40%"
      footer={footer}
    >      
      <p className="text-center text-gray-600 mb-6 font-medium">Meeting Information</p>

      {/* Step Indicator */}
      
 <div className="flex justify-center mb-8">
     <div className="flex justify-center ">
      <Steps
        current={step - 1}
        size="small"
        labelPlacement="vertical"
        className="w-full max-w-md"
      >
        <Step
          title="Step 1"
          icon={
            step === 1 ? (
              <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-blue">
                <span className="w-3 h-3 bg-blue rounded-full"></span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            )
          }
        />
        <Step
          title="Step 2"
          icon={
            step === 2 ? (
              <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-blue">
                <span className="w-3 h-3 bg-blue rounded-full"></span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full border border-gray-300"></div>
            )
          }
        />
      </Steps>
    </div>
    </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          date: dayjs(),
          startTime: dayjs(),
          endTime: dayjs().add(1, "hour"),
          locationType: "in-person",
          department: "SaaS",
        }}
      >
        {step === 1 && (
          <>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Please input the title" }]}
            >
              <Input placeholder="Input area" />
            </Form.Item>

            <Form.Item label="Type" name="type">
              <Select placeholder="Meeting Type" allowClear>
                <Option value="team">Team Meeting</Option>
                <Option value="client">Client Meeting</Option>
                <Option value="one-on-one">One-on-One</Option>
              </Select>
            </Form.Item>

<Form.Item
  label="Location"
  name="locationType"
  rules={[{ required: true, message: "Please select location type" }]}
>
  <Radio.Group className="flex gap-2 w-full">
    <Radio value="in-person" className="w-full items-center  rounded-md border p-2">
      <div className="flex justify-between w-full">
        <span className="text-black">In-person</span>
      </div>
    </Radio>
    <Radio value="virtual" className="w-full items-center border  rounded-md p-2">
      <div className="flex justify-between  w-full">
        <span className="text-black">Virtual</span>
      </div>
    </Radio>
    
    <Radio value="hybrid" className="w-full items-center border rounded-md p-2">
      <div className="flex justify-between w-full">
        <span className="text-black">Hybrid</span>
      </div>
    </Radio>
   
   
  </Radio.Group>
</Form.Item>




            <Form.Item
              label="Enter Location"
              name="location"
              rules={[{ required: true, message: "Please enter location" }]}
            >
              <Input placeholder="Conference Room 1" />
            </Form.Item>

            <Form.Item
              label="Department"
              name="department"
              rules={[{ required: true, message: "Please select a department" }]}
            >
              <Select>
                <Option value="SaaS">SaaS</Option>
                <Option value="Marketing">Marketing</Option>
                <Option value="HR">HR</Option>
              </Select>
            </Form.Item>

            <div className="grid grid-cols-3 gap-3">
              <Form.Item
                label="Date"
                name="date"
                className="mb-0"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>

              <Form.Item
                label="Start Time"
                name="startTime"
                className="mb-0"
                rules={[{ required: true, message: "Please select start time" }]}
              >
                <TimePicker className="w-full" />
              </Form.Item>

              <Form.Item
                label="End Time"
                name="endTime"
                className="mb-0"
                rules={[{ required: true, message: "Please select end time" }]}
              >
                <TimePicker className="w-full" />
              </Form.Item>
            </div>

            <Form.Item
              label="Select Chair person"
              name="chairPerson"
              rules={[{ required: true, message: "Please select chair person" }]}
            >
              <Select
                mode="multiple"
                options={peopleOptions}
                placeholder="Select chair person"
                maxTagCount={1}
              />
            </Form.Item>

            <Form.Item
              label="Select Facilitator"
              name="facilitator"
              rules={[{ required: true, message: "Please select facilitator" }]}
            >
              <Select
                mode="multiple"
                options={peopleOptions}
                placeholder="Select facilitator"
                maxTagCount={1}
              />
            </Form.Item>

            <Form.Item
              label="Add Attendee"
              name="attendees"
              rules={[{ required: true, message: "Please add attendees" }]}
            >
              <Select
                mode="multiple"
                options={peopleOptions}
                placeholder="Add attendees"
              />
              
            </Form.Item>
              <Form.Item>
                <div className='flex justify-end'>
                  <Checkbox
                checked={allowGuests}
                onChange={(e) => setAllowGuests(e.target.checked)}
              >
                Allow Guests
              </Checkbox>
                </div>
              {allowGuests && 
              <Form.List name="guests">
  {(fields, { add, remove }) => (
    <>
      {fields.map(({ key, name, ...restField }) => (
        <div key={key} className="flex space-x-3 ">
          <Form.Item
            {...restField}
            name={[name, 'name']}
            label="Name"
            rules={[{ required: true, message: 'Please add guest fullname' }]}
            className="w-full mt-2"
          >
            <Input placeholder="Name" />
          </Form.Item>

          <Form.Item
            {...restField}
            name={[name, 'email']}
            label={<div className="flex justify-between items-center w-64">
                                        <span>Email</span>
                                        <Button
                                          icon={<MdClose />}
                                          type="link"
                                          className="text-black ml-4"
                                          onClick={() => remove(name)}
                                        />
                                      </div>}
            rules={[{ required: true, message: 'Please add guest email' }]}
            className="w-full"
          >
            <Input placeholder="Email" type="email" />
          </Form.Item>
        </div>
      ))}
      <div className="flex justify-end">
        <Button type="primary" onClick={() => add()}>
          Add Guest
        </Button>
      </div>
    </>
  )}
</Form.List>}

            </Form.Item>
          </>
        )}

        {step === 2 && (
          <>
            <Form.Item
              label="Meeting Objective"
              name="meetingObjective"
              rules={[{ required: true, message: "Please enter meeting objective" }]}
            >
              <Input.TextArea
                placeholder="[[Meeting Type + Objective]]"
                rows={4}
              />
            </Form.Item>

            <Form.Item
              label="Templates"
              name="template"
              rules={[{ required: true, message: "Please select a template" }]}
            >
              <Select placeholder="Select template">
                <Option value="template1">Template 1</Option>
                <Option value="template2">Template 2</Option>
                <Option value="template3">Template 3</Option>
              </Select>
            </Form.Item>
          </>
        )}

        {/* Buttons */}
      
      </Form>
    </CustomDrawerLayout>
  );
}