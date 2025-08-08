import { Modal, Button, Form, Row } from 'antd';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useCreateJobInformation } from '@/store/server/features/employees/employeeManagment/mutations';
import JobTimeLineForm from '../../../../_components/allFormData/jobTimeLineForm';
import WorkScheduleForm from '../../../../_components/allFormData/workScheduleForm';
import { CreateEmployeeJobInformationInterface } from '@/store/server/features/employees/employeeManagment/interface';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import BasicSalaryForm from '../../../../_components/allFormData/basickSalaryForm';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

interface Ids {
  onInfoSubmition?: () => void;
  onJobInfoUpdated?: () => void;
}
export const CreateEmployeeJobInformation: React.FC<Ids> = ({
  onJobInfoUpdated: onJobInfoUpdated,
}) => {
  const [form] = Form.useForm();
  const params = useParams();
  const userId = params.id as string;
  const {
    isAddEmployeeJobInfoModalVisible,
    setIsAddEmployeeJobInfoModalVisible,
    setEmployeeJobInfoModalWidth,
    employeeJobInfoModalWidth,
  } = useEmployeeManagementStore();


  useEffect(() => {
    if (isAddEmployeeJobInfoModalVisible) {
      form.resetFields(); // Reset form values on modal open
    }
  }, [isAddEmployeeJobInfoModalVisible]);
  const { data: employeeData } = useGetEmployee(userId);

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
    values.userId = userId;
    values.basicSalary = parseInt(values.basicSalary.toString(), 10);
    values.departmentLeadOrNot
      ? values.departmentLeadOrNot
      : (values.departmentLeadOrNot = false);
    createJobInformation(values, {
      onSuccess: () => {
        handleClose();
        
        // Call the callback to refresh job information data
        if (onJobInfoUpdated) {
          setTimeout(() => {
            onJobInfoUpdated();
          }, 500);
        }
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
          <JobTimeLineForm employeeData={employeeData} />
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
