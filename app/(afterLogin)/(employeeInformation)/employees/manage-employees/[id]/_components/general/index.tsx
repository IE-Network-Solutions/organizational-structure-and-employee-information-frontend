import { Form } from 'antd';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useUpdateEmployee } from '@/store/server/features/employees/employeeDetail/mutations';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import {
  EditState,
  useEmployeeManagmentStore,
} from '@/store/uistate/features/employees/employeeManagment';
import BankInformationComponent from './bankInformationComponent';
import PersonalDataComponent from './personalDataComponent';
import EmergencyContact from './emergencyContact';
import AddressComponent from './AddressComponent';

function General({ id }: { id: string }) {
  const { data: employeeData } = useGetEmployee(id);
  const { setEdit } = useEmployeeManagmentStore();
  const [form] = Form.useForm();

  const { mutate: updateEmployeeInformation } = useUpdateEmployee();
  useGetNationalities();
  const handleSaveChanges = (editKey: keyof EditState) => {
    form
      .validateFields()
      .then((values) => {
        switch (editKey) {
          case 'general':
            updateEmployeeInformation({
              id: employeeData?.employeeInformation?.id,
              values,
            });
            break;
          case 'addresses':
            updateEmployeeInformation({
              id: employeeData?.employeeInformation?.id,
              values: { addresses: values },
            });
            break;
          case 'emergencyContact':
            updateEmployeeInformation({
              id: employeeData?.employeeInformation?.id,
              values: { emergencyContact: values },
            });
            break;
          case 'bankInformation':
            updateEmployeeInformation({
              id: employeeData?.employeeInformation?.id,
              values: { bankInformation: values },
            });
            break;
        }
        setEdit(editKey);
      })
      .catch();
  };

  return (
    <>
      <PersonalDataComponent id={id} handleSaveChanges={handleSaveChanges} />
      <EmergencyContact id={id} handleSaveChanges={handleSaveChanges} />
      <AddressComponent id={id} handleSaveChanges={handleSaveChanges} />
      <BankInformationComponent id={id} handleSaveChanges={handleSaveChanges} />
      <BankInformationComponent handleSaveChanges={handleSaveChanges} id={id} />
    </>
  );
}

export default General;
