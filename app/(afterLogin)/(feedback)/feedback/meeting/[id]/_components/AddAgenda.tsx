import React from "react";
import { Modal, Input, Button, Form } from "antd";
import { MdClose } from "react-icons/md";
import { useMeetingStore } from "@/store/uistate/features/conversation/meeting";

interface AgendaModalProps {
  visible: boolean;
  onClose: () => void;
}

const   AgendaModal: React.FC<AgendaModalProps> = ({ visible, onClose }) => {
    function onFinish(){

    }
  return (
    <Modal
      title="Agenda items"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form layout="vertical" onFinish={onFinish}>
        <Form.List name="agendaItems">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <div key={key} className="flex items-center mb-2">
                  <Form.Item
                     
                    {...restField}
                    name={[name, "item"]}
                    fieldKey={[(fieldKey ?? 0), "item"]}
                    rules={[{ required: true, message: "Agenda is required" }]}
                    className="w-full"
                    label={"Agenda"}
                  >
                    <Input placeholder="Agenda" />
                  </Form.Item>
                  <Button className="text-black mt-2" type="link" onClick={() => remove(name)}>
                    <MdClose size={16}/>
                  </Button>
                </div>
              ))}
              <div className="flex justify-end">
                <Button className="w-24" type="primary" onClick={() => add()} block>
                Add 
              </Button>
              </div>
              
            </>
          )}
        </Form.List>
        <div className="flex justify-center gap-4 mt-4">
          <Button className="w-48" onClick={onClose}>Cancel</Button>
          <Button className="w-48" type="primary" htmlType="submit">
            Create
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AgendaModal;