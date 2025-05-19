import React, { useState } from "react";
import { Popconfirm, Button, Form, Input, Select, message } from "antd";
import { FaPlus } from "react-icons/fa";
import { MdClose } from "react-icons/md";

const { Option } = Select;

const AddParticipantsPopconfirm = () => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  const handleConfirm = (values) => {
    console.log("Participants:", values.participants);
    console.log("Guests:", values.guests);
    message.success("Participants and guests added successfully!");
    setVisible(false);
  };

  return (
    <div>
      <Button
        icon={<FaPlus />}
        type="primary"
        onClick={() => setVisible(true)}
      >
        Add 
      </Button>

      <Popconfirm
       placement="bottomRight"
        visible={visible}
        overlayStyle={{ width: 370 }}
        icon={false}
        description={null} // disables default message
        title={
          <Form  form={form} layout="vertical" onFinish={handleConfirm}>
            <div className='border p-2 mb-2 rounded-md w-full'>
                <Form.Item  rules={[{ required: true, message: "Participant is required" }]} label="Name" name="participants">
              <Select mode="multiple" placeholder="Select participants" allowClear>
                <Option value="abraham-dulla">Abraham Dulla</Option>
                <Option value="surafel-kifle">Surafel Kifle</Option>
              </Select>
            </Form.Item> 
            </div>
           
<div className='border p-2 mb-2 rounded-md w-full'>
 <Form.List  name="guests">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="">
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        rules={[{ required: true, message: "Name is required" }]}
                        label={
                          <div className="flex justify-between items-center w-72">
                            <span>Name</span>
                            <Button
                              icon={<MdClose />}
                              type="link"
                              className="text-black ml-4"
                              onClick={() => remove(name)}
                            />
                          </div>
                        }
                      >
                        <Input placeholder="Name" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "email"]}
                        rules={[{ required: true, message: "Email is required" }]}
                        label="Email"
                      >
                        <Input placeholder="Email" />
                      </Form.Item>
                    </div>
                  ))}
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <span>Add Guest</span>
                    <Button
                      icon={<FaPlus size={12} />}
                      type="default"
                      onClick={() => add()}
                      className="w-6 h-6 p-0 flex items-center justify-center"
                    />
                  </div>
                </>
              )}
            </Form.List>

            
</div>
           
          </Form>
        }
        onConfirm={() => form.submit()}
        onCancel={() => setVisible(false)}
        cancelText="Cancel"
        okText="Add Participants"
      >
        {/* Dummy element since Popconfirm needs a child */}
        <span />
      </Popconfirm>
    </div>
  );
};

export default AddParticipantsPopconfirm;
