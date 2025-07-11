import { Modal, Button, Form, Row } from 'antd';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useCreateJobInformation } from '@/store/server/features/employees/employeeManagment/mutations';
import JobTimeLineForm from '../../../../_components/allFormData/jobTimeLineForm';
import WorkScheduleForm from '../../../../_components/allFormData/workScheduleForm';
import { CreateEmployeeJobInformationInterface } from '@/store/server/features/employees/employeeManagment/interface';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import BasicSalaryForm from '../../../../_components/allFormData/basickSalaryForm';

interface Ids {
  id: string;
  onInfoSubmition?: () => void;
}
export const CreateEmployeeJobInformation: React.FC<Ids> = ({
  id: id,
  onInfoSubmition: onInfoSubmition,
}) => {
  const [form] = Form.useForm();
  const {
    isAddEmployeeJobInfoModalVisible,
    setIsAddEmployeeJobInfoModalVisible,
    setEmployeeJobInfoModalWidth,
    employeeJobInfoModalWidth,
  } = useEmployeeManagementStore();

  const { data: employeeData } = useGetEmployee(id);

  const { mutate: createJobInformation, isLoading } = useCreateJobInformation();

  const handleClose = () => {
    setIsAddEmployeeJobInfoModalVisible(false);
    setEmployeeJobInfoModalWidth(null);
  };

  const createTsks = (values: CreateEmployeeJobInformationInterface) => {
    values.positionId = form.getFieldValue('positionId') || '';
    values.employementTypeId = form.getFieldValue('employementTypeId') || '';
    values.departmentId = form.getFieldValue('departmentId') || '';
    values.branchId = form.getFieldValue('branchId') || '';
    values.workScheduleId = form.getFieldValue('workScheduleId') || '';
    values.userId = id;
    values.basicSalary = parseInt(values.basicSalary.toString(), 10);
    values.departmentLeadOrNot
      ? values.departmentLeadOrNot
      : (values.departmentLeadOrNot = false);
    createJobInformation(values, {
      onSuccess: () => {
        handleClose();
        onInfoSubmition && onInfoSubmition();
      },
    });
  };
  return (
    <>
      <Modal
        title="Add Employee Job Information"
        centered
        width={employeeJobInfoModalWidth || undefined}
        open={isAddEmployeeJobInfoModalVisible}
        onCancel={handleClose}
        footer={false}
        destroyOnClose
      >
        <Form form={form} onFinish={createTsks} layout="vertical">
          <JobTimeLineForm />
          <BasicSalaryForm />
          <WorkScheduleForm
            selectedWorkScheduleDetails={
              employeeData?.employeeJobInformation?.[0]?.workSchedule?.detail
            }
          />
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
                Cancel
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
