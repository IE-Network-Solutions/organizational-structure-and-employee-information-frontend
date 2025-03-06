import React from 'react';
import { Modal, Button } from 'antd';
import useAttendanceImportErrorModalStore from '@/store/uistate/features/timesheet/employeeAttendanceImport';

const AttendanceImportErrorModal: React.FC = () => {
  const { isVisible, message, closeModal } =
    useAttendanceImportErrorModalStore();

  return (
    <Modal
      title="Import Error"
      visible={isVisible}
      onOk={closeModal}
      onCancel={closeModal}
      footer={[
        <Button key="ok" type="primary" onClick={closeModal}>
          OK
        </Button>,
      ]}
    >
      <h2
        style={{
          color: 'red',
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '16px',
        }}
      >
        Error
      </h2>

      {message &&
        message.map((msg, index) => (
          <p key={index}>
            Line {msg.line}: {msg.error}
          </p>
        ))}
      <br />
      <hr />

      <div style={{ marginBottom: '12px' }}>
        <h5 style={{ marginBottom: '8px' }}>Suggested Solutions:</h5>

        <ul
          style={{ fontSize: '14px', lineHeight: '1.4', paddingLeft: '20px' }}
        >
          <li>-Please set your headers in the third line of the Excel file</li>
          <li>
            -Please start setting your records on the fourth line of the Excel
            file
          </li>
          <li>-Check if the user ID imported exists</li>
        </ul>
      </div>
    </Modal>
  );
};

export default AttendanceImportErrorModal;
