import { Modal, Button, Form, Row } from 'antd';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useCreateJobInformation } from '@/store/server/features/employees/employeeManagment/mutations';
import JobTimeLineForm from '../../../../_components/allFormData/jobTimeLineForm';
import WorkScheduleForm from '../../../../_components/allFormData/workScheduleForm';
import { CreateEmployeeJobInformationInterface } from '@/store/server/features/employees/employeeManagment/interface';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import BasicSalaryForm from '../../../../_components/allFormData/basickSalaryForm';
import { useParams } from 'next/navigation';

interface Ids {
  id: string;
  onInfoSubmition?: () => void;
  onJobInfoUpdated?: () => void;
  isNavBarModal?: boolean;
}
export const CreateEmployeeJobInformation: React.FC<Ids> = ({
  id: id,
  onInfoSubmition: onInfoSubmition,
  onJobInfoUpdated: onJobInfoUpdated,
  isNavBarModal = false,
}) => {
  const [form] = Form.useForm();
  const params = useParams();
  const userId = params.id as string;
  
  const {
    isAddEmployeeJobInfoModalVisible,
    setIsAddEmployeeJobInfoModalVisible,
    setEmployeeJobInfoModalWidth,
    employeeJobInfoModalWidth,
    isNavBarJobInfoModalVisible,
    setIsNavBarJobInfoModalVisible,
    setNavBarJobInfoModalWidth,
    navBarJobInfoModalWidth,
  } = useEmployeeManagementStore();

  const { data: employeeData } = useGetEmployee(userId);

  const { mutate: createJobInformation, isLoading } = useCreateJobInformation();

  // Use the appropriate modal state based on context
  const isModalVisible = isNavBarModal
    ? isNavBarJobInfoModalVisible
    : isAddEmployeeJobInfoModalVisible;
  const setIsModalVisible = isNavBarModal
    ? setIsNavBarJobInfoModalVisible
    : setIsAddEmployeeJobInfoModalVisible;
  const modalWidth = isNavBarModal
    ? navBarJobInfoModalWidth
    : employeeJobInfoModalWidth;
  const setModalWidth = isNavBarModal
    ? setNavBarJobInfoModalWidth
    : setEmployeeJobInfoModalWidth;

  const handleClose = () => {
    setIsModalVisible(false);
    setModalWidth(null);
  };

  const createTsks = (values: CreateEmployeeJobInformationInterface) => {
    // Get form values
    const formValues = form.getFieldsValue();
    
    // Use the URL id from params as the userId
    const correctUserId = userId;
    
    // Create the exact data structure that works in Postman
    const jobInformationData = {
      userId: correctUserId,
      positionId: formValues.positionId || '',
      branchId: formValues.branchId || '',
      departmentId: formValues.departmentId || '',
      employementTypeId: formValues.employementTypeId || '',
      workScheduleId: formValues.workScheduleId || '',
      isPositionActive: true,
      departmentLeadOrNot: formValues.departmentLeadOrNot || false,
      employmentContractType: formValues.employmentContractType || 'Permanent',
      jobAction: 'New', // Always send 'New' as string, not ID
      effectiveStartDate: formValues.effectiveStartDate ? 
        formValues.effectiveStartDate.format('YYYY-MM-DD') : '2024-01-01',
      effectiveEndDate: '2024-12-31', // Always send this as string
      basicSalary: Number(formValues.basicSalary || 0)
    };
    
    createJobInformation(jobInformationData, {
      onSuccess: (responseData) => {
        handleClose();
        
        // Call the callback to refresh job information data
        if (onJobInfoUpdated) {
          setTimeout(() => {
            onJobInfoUpdated();
          }, 500);
        }
      },
      onError: (error: any) => {
        console.error('Error creating job information:', error);
      },
    });
  };
  return (
    <>
      <Modal
        title="Add Employee Job Information"
        centered
        width={modalWidth || undefined}
        open={isModalVisible}
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
