import { Modal, Button, Form, Row } from 'antd';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useCreateJobInformation } from '@/store/server/features/employees/employeeManagment/mutations';
import JobTimeLineForm from '../../../../_components/allFormData/jobTimeLineForm';
import WorkScheduleForm from '../../../../_components/allFormData/workScheduleForm';
import { CreateEmployeeJobInformationInterface } from '@/store/server/features/employees/employeeManagment/interface';
import { useEffect } from 'react';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';

interface Ids {
  id: string;
}
export const CreateEmployeeJobInformation: React.FC<Ids> = ({ id: id }) => {
  const [form] = Form.useForm();
  const {
    isAddEmployeeJobInfoModalVisible,
    setIsAddEmployeeJobInfoModalVisible,
  } = useEmployeeManagementStore();

  const { data: employeeData } = useGetEmployee(id);
  const { data: basicSalary } = useGetBasicSalaryById(id);

  const { mutate: createJobInformation } = useCreateJobInformation();

  const handleClose = () => {
    setIsAddEmployeeJobInfoModalVisible(false);
  };

  const activeJob = basicSalary?.find((job: any) => job?.status === true);

  useEffect(() => {
    if (employeeData && employeeData.employeeJobInformation.length > 0) {
      const jobInfo = employeeData.employeeJobInformation[0];

      form.setFieldsValue({
        positionId: jobInfo?.position?.name || '',
        employementTypeId: jobInfo?.employementType?.name || '',
        departmentId: jobInfo?.department?.name || '',
        branchId: jobInfo?.branch?.name || '',
        departmentLeadOrNot: jobInfo?.departmentLeadOrNot,
        basicSalary: activeJob?.basicSalary.toString() || '',
        jobAction: jobInfo?.jobAction,
        employmentContractType:
          jobInfo?.employementType?.name === 'Permanent'
            ? 'Permanent'
            : 'Contractual',
        workScheduleId: jobInfo?.workSchedule?.name || '',
      });
    }
  }, [employeeData, activeJob, form]);

  const createTsks = (values: CreateEmployeeJobInformationInterface) => {
    const positionId = employeeData?.employeeJobInformation?.find(
      (job: any) => job?.position?.name === values.positionId,
    )?.position?.id;
    const employementTypeId = employeeData?.employeeJobInformation?.find(
      (job: any) => job?.employementType?.name === values.employementTypeId,
    )?.employementType?.id;
    const departmentId = employeeData?.employeeJobInformation?.find(
      (job: any) => job?.department?.name === values.departmentId,
    )?.department?.id;
    const branchId = employeeData?.employeeJobInformation?.find(
      (job: any) => job?.branch?.name === values.branchId,
    )?.branch?.id;
    const workScheduleId = employeeData?.employeeJobInformation?.find(
      (job: any) => job?.workSchedule?.name === values.workScheduleId,
    )?.workSchedule?.id;

    values.positionId = positionId || '';
    values.employementTypeId = employementTypeId || '';
    values.departmentId = departmentId || '';
    values.branchId = branchId || '';
    values.workScheduleId = workScheduleId || '';
    values.userId = id;
    // values.basicSalary = parseInt(values.basicSalary.toString(), 10);
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
          <WorkScheduleForm
            selectedWorkScheduleDetails={
              employeeData?.employeeJobInformation?.[0]?.workSchedule?.detail
            }
          />
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
