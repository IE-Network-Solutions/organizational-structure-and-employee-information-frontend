import { Modal, Button, Form, Row } from 'antd';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useCreateJobInformation } from '@/store/server/features/employees/employeeManagment/mutations';
import JobTimeLineForm from '../../../../_components/allFormData/jobTimeLineForm';
import WorkScheduleForm from '../../../../_components/allFormData/workScheduleForm';

interface Ids {
  id: string;
}
export const CreateEmployeeJobInformation: React.FC<Ids> = ({ id: id }) => {
  const [form] = Form.useForm();
  const {
    isAddEmployeeJobInfoModalVisible,
    setIsAddEmployeeJobInfoModalVisible,
  } = useEmployeeManagementStore();

  const { mutate: createJobInformation } = useCreateJobInformation();

  const handleClose = () => {
    setIsAddEmployeeJobInfoModalVisible(false);
  };

  const createTsks = (values: any) => {
    values.userId = id;
    values.departmentLeadOrNot
      ? values.departmentLeadOrNot
      : (values.departmentLeadOrNot = false);
    createJobInformation(values);
    form.resetFields();
    setIsAddEmployeeJobInfoModalVisible(false);
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
          <WorkScheduleForm />

          <Form.Item>
            <Row className="flex justify-end gap-3">
              <Button type="primary" htmlType="submit" name="submit">
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
