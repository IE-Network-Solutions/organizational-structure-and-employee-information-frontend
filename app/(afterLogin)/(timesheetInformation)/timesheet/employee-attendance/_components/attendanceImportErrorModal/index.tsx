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
        <Button
          key="ok"
          type="primary"
          onClick={closeModal}
          id="time-attendance-employee-attendance-import-error-confirm-button"
          data-cy="time-attendance-employee-attendance-import-error-confirm-button"
        >
          OK
        </Button>,
      ]}
      data-cy="time-attendance-employee-attendance-import-error-modal"
    >
      <h2
        id="time-attendance-employee-attendance-import-error-modal-title"
        data-cy="time-attendance-employee-attendance-import-error-modal-title"
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
          <p
            id={`time-attendance-employee-attendance-import-error-modal-message-${index}`}
            data-cy={`time-attendance-employee-attendance-import-error-modal-message-${index}`}
            key={index}
          >
            Line {msg.line}: {msg.error}
          </p>
        ))}
      <br data-cy="time-attendance-employee-attendance-import-error-modal-br" />
      <hr data-cy="time-attendance-employee-attendance-import-error-modal-hr" />

      <div
        id="time-attendance-employee-attendance-import-error-modal-suggested-solutions-div"
        data-cy="time-attendance-employee-attendance-import-error-modal-suggested-solutions-div"
        style={{ marginBottom: '12px' }}
      >
        <h5
          id="time-attendance-employee-attendance-import-error-modal-suggested-solutions-title"
          data-cy="time-attendance-employee-attendance-import-error-modal-suggested-solutions-title"
          style={{ marginBottom: '8px' }}
        >
          Suggested Solutions:
        </h5>

        <ul
          id="time-attendance-employee-attendance-import-error-modal-suggested-solutions-ul"
          data-cy="time-attendance-employee-attendance-import-error-modal-suggested-solutions-ul"
          style={{ fontSize: '14px', lineHeight: '1.4', paddingLeft: '20px' }}
        >
          <li
            id="time-attendance-employee-attendance-import-error-modal-suggested-solutions-ul-li-1"
            data-cy="time-attendance-employee-attendance-import-error-modal-suggested-solutions-ul-li-1"
          >
            -Please set your headers in the third line of the Excel file
          </li>
          <li
            id="time-attendance-employee-attendance-import-error-modal-suggested-solutions-ul-li-2"
            data-cy="time-attendance-employee-attendance-import-error-modal-suggested-solutions-ul-li-2"
          >
            -Please start setting your records on the fourth line of the Excel
            file
          </li>
          <li
            id="time-attendance-employee-attendance-import-error-modal-suggested-solutions-ul-li-3"
            data-cy="time-attendance-employee-attendance-import-error-modal-suggested-solutions-ul-li-3"
          >
            -Check if the user ID imported exists
          </li>
        </ul>
      </div>
    </Modal>
  );
};

export default AttendanceImportErrorModal;
