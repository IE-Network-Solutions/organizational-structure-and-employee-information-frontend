import React, { useState } from "react";
import { Modal, Button, Input, Mentions } from "antd";

const { TextArea } = Input;
const { Option } = Mentions;

interface MeetingAgendaModalProps {
  visible: boolean;
  onClose: () => void;
}

const users = [
  { name: "Samuel Tesfaye", username: "samuel" },
  { name: "Gelila Bekele", username: "gelila" },
  { name: "Tesfahun Mekuria", username: "tesfahun" },
  { name: "Selamawit Abebe", username: "selamawit" },
];

const MeetingAgendaModal: React.FC<MeetingAgendaModalProps> = ({ visible, onClose }) => {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    console.log("Agenda Content:", content);
    // Handle the submission logic here
    onClose(); // Close the modal after submission
  };

  return (
    <Modal
      title="[[Agenda Title as default value]]"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <p>Please add everything said for this agenda here</p>
      <Mentions
        style={{ width: "100%", minHeight: 100 }}
        placeholder="Type @ to mention someone"
        onChange={(value) => setContent(value)}
        prefix="@"
      >
        {users.map((user) => (
          <Option key={user.username} value={user.username}>
            {user.name}
          </Option>
        ))}
      </Mentions>
      <div className="flex justify-end mt-4">
        <Button onClick={onClose} style={{ marginRight: "8px" }}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </Modal>
  );
};

export default MeetingAgendaModal;
