import { Modal, Button, Form, Row } from 'antd';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useCreateJobInformation } from '@/store/server/features/employees/employeeManagment/mutations';
import JobTimeLineForm from '../../../../_components/allFormData/jobTimeLineForm';
import WorkScheduleForm from '../../../../_components/allFormData/workScheduleForm';
import { CreateEmployeeJobInformationInterface } from '@/store/server/features/employees/employeeManagment/interface';
import BasicSalaryForm from '../../../../_components/allFormData/basickSalaryForm';
import { useEffect } from 'react';

interface Ids {
  id: string;
}
export const CreateEmployeeJobInformation: React.FC<Ids> = ({ id: id }) => {
  const [form] = Form.useForm();
  const {
    isAddEmployeeJobInfoModalVisible,
    setIsAddEmployeeJobInfoModalVisible,
  } = useEmployeeManagementStore();

  const {
    isLoading,
    isSuccess,
    mutate: createJobInformation,
  } = useCreateJobInformation();

  const handleClose = () => {
    setIsAddEmployeeJobInfoModalVisible(false);
  };

  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      handleClose();
    }
  }, [isSuccess]);

  const createTsks = (values: CreateEmployeeJobInformationInterface) => {
    values.userId = id;
    values.basicSalary = parseInt(values.basicSalary.toString(), 10);

    values.departmentLeadOrNot
      ? values.departmentLeadOrNot
      : (values.departmentLeadOrNot = false);
    createJobInformation(values);
  };

  return (
    <>
      <Modal
        title="Add Employee Job Information"
        centered
        open={isAddEmployeeJobInfoModalVisible}
        onCancel={handleClose}
        footer={false}
        destroyOnClose
      >
        <Form form={form} onFinish={createTsks} layout="vertical">
          <JobTimeLineForm />
          <BasicSalaryForm />
          <WorkScheduleForm />
          <Form.Item>
            <Row className="flex justify-end gap-3">
              <Button
                type="primary"
                htmlType="submit"
                name="submit"
                loading={isLoading}
              >
                Submit
              </Button>
              <Button
                className="text-indigo-500"
                htmlType="button"
                value={'cancel'}
                name="cancel"
                onClick={handleClose}
              >
                Cancel{' '}
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
