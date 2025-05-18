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
  return (
<CustomDrawerLayout
      open={openAddMeeting}
      onClose={()=>handleClose()}
      modalHeader={<div className='text-center'>Add New Meeting Template</div>}
      width="40%"
    >      
    <h2 className="text-center font-semibold text-lg mb-2">Add New Meeting</h2>
      <p className="text-center text-gray-600 mb-6 font-medium">Meeting Information</p>

      {/* Step Indicator */}
      <div className="flex justify-center items-center mb-8 space-x-4">
        <div className={`flex flex-col items-center`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step === 1 ? "border-blue-600 bg-blue-600" : "border-gray-300"
            }`}
          >
            {step === 1 ? (
              <div className="w-3 h-3 rounded-full bg-white"></div>
            ) : (
              <div className="w-3 h-3 rounded-full bg-transparent"></div>
            )}
          </div>
          <span className="mt-1 text-xs font-medium text-gray-700">1</span>
        </div>
        <div className="flex-1 border-t-2 border-gray-300"></div>
        <div className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step === 2 ? "border-blue-600 bg-blue-600" : "border-gray-300"
            }`}
          >
            {step === 2 ? (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              <div className="w-3 h-3 rounded-full bg-transparent"></div>
            )}
          </div>
          <span className="mt-1 text-xs font-medium text-gray-700">2</span>
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
              <Radio.Group buttonStyle="solid" className="space-x-3">
                <Radio.Button value="in-person" className="border-blue-600 text-blue-600">
                  In-person
                </Radio.Button>
                <Radio.Button value="virtual">Virtual</Radio.Button>
                <Radio.Button value="hybrid">Hybrid</Radio.Button>
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
              
               {allowGuests && (
              <>
                {guests.map((guest, index) => (
                  <div key={index} className="flex space-x-3 mb-4">
                     <Form.Item
              label="Name"
              name="guestFullName"
              rules={[{ required: true, message: "Please add Guest fullname" }]}
                            className="w-full"

            >
              <Input
                      placeholder="Name"
                      value={guest.name}
                      onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                      
                    />
            </Form.Item>
              <Form.Item
              label="Email"
              name="guestEmail"
              rules={[{ required: true, message: "Please add Guest email" }]}
              className="w-full"
            >
               <Input
                      placeholder="Email"
                      type="email"
                      value={guest.email}
                      onChange={(e) => handleGuestChange(index, 'email', e.target.value)}
                      
                    />
            </Form.Item>
                   
                  </div>
                ))}
                 <div className='flex justify-end'>
                  <Button type="primary" onClick={addGuest}>
                  Add Guest
                </Button>
                 </div>
                
              </>
            )}
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
        <div className="flex justify-between mt-6">
          {step === 2 ? (
            <>
              <Button onClick={onPrev}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </>
          ) : (
            <Button type="primary" onClick={onNext} className="w-full">
              Next
            </Button>
          )}
        </div>
      </Form>
    </CustomDrawerLayout>
  );
}