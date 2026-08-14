import { Modal, Button, Form, Row } from 'antd';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useCreateJobInformation } from '@/store/server/features/employees/employeeManagment/mutations';
import JobTimeLineForm from '../../../../_components/allFormData/jobTimeLineForm';
import { CreateEmployeeJobInformationInterface } from '@/store/server/features/employees/employeeManagment/interface';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useParams } from 'next/navigation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

import { useEffect } from 'react';
import { useAssignEmployees } from '@/store/server/features/timesheet/workSchedule/mutation';

interface Ids {
  id?: string;
  onInfoSubmition?: () => void;
  isNavBarModal?: boolean;
  onJobInfoUpdated?: () => void;
}
export const CreateEmployeeJobInformation: React.FC<Ids> = ({
  onJobInfoUpdated: onJobInfoUpdated,
  id,
}) => {
  const { userId: userId2 } = useAuthenticationStore();

  const [form] = Form.useForm();
  const params = useParams();
  // Prioritize URL parameter over prop to ensure we use the employee ID from URL, not logged-in user's ID
  const userId = (params?.id as string) ?? id ?? userId2;
  const {
    isAddEmployeeJobInfoModalVisible,
    setIsAddEmployeeJobInfoModalVisible,
    setEmployeeJobInfoModalWidth,
    setTempAllowances,
  } = useEmployeeManagementStore();

  useEffect(() => {
    if (isAddEmployeeJobInfoModalVisible) {
      form.resetFields(); // Reset form values on modal open
      setTempAllowances([]); // Clear temp allowances when modal opens
    }
  }, [isAddEmployeeJobInfoModalVisible, setTempAllowances, form]);
  const { data: employeeData } = useGetEmployee(userId);

  const { mutate: createJobInformation, isLoading } = useCreateJobInformation();
  const { mutate: assignShiftSchedule } = useAssignEmployees();

  const handleClose = () => {
    setIsAddEmployeeJobInfoModalVisible(false);
    setEmployeeJobInfoModalWidth(null);
    setTempAllowances([]); // Clear temp allowances when modal closes
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
    // Include allowances from form state
    values.allowances = form.getFieldValue('allowances') || [];

    const shiftScheduleId = form.getFieldValue('shiftScheduleId');
    const assignedShiftIds = form.getFieldValue('assignedShiftIds') || [];

    createJobInformation(values, {
      onSuccess: () => {
        if (shiftScheduleId) {
          assignShiftSchedule({
            blueprintId: shiftScheduleId,
            userIds: [userId],
            shiftIds: assignedShiftIds,
            employees: [
              {
                id: userId,
                firstName: employeeData?.firstName,
                lastName: employeeData?.lastName,
                email: employeeData?.email,
                jobTitle:
                  employeeData?.employeeJobInformation?.[0]?.position?.name,
              },
            ],
          });
        }
        setTempAllowances([]); // Clear temp allowances on successful submit
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
        open={isAddEmployeeJobInfoModalVisible}
        onCancel={handleClose}
        footer={false}
        destroyOnClose
        data-cy="job-add-job-info-modal"
        width={750}
      >
        <Form
          form={form}
          onFinish={createTsks}
          layout="vertical"
          id="job-add-job-info-form"
          data-cy="job-add-job-info-form"
        >
          <JobTimeLineForm
            employeeData={employeeData}
            form={form}
            data-cy="job-add-job-info-timeline"
          />
          <Form.Item
            id="job-add-job-info-submit-form-item"
            data-cy="job-add-job-info-submit-form-item"
          >
            <Row
              className="flex justify-end gap-3"
              id="job-add-job-info-submit-row"
              data-cy="job-add-job-info-submit-row"
            >
              <Button
                type="default"
                className="border border-[#D9D9D9] font-normal text-[#4d4d4d]"
                htmlType="button"
                value={'cancel'}
                name="cancel"
                onClick={handleClose}
                id="job-add-job-info-cancel-btn"
                data-cy="job-add-job-info-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                name="submit"
                loading={isLoading}
                id="job-add-job-info-submit-btn"
                data-cy="job-add-job-info-submit-btn"
                className="font-normal"
              >
                Save
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
