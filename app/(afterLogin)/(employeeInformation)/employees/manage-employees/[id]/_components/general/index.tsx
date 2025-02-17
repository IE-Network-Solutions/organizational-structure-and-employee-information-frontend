import { Form } from 'antd';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useUpdateEmployee } from '@/store/server/features/employees/employeeDetail/mutations';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import BankInformationComponent from './bankInformationComponent';
import PersonalDataComponent from './personalDataComponent';
import EmergencyContact from './emergencyContact';
import AddressComponent from './AddressComponent';
import { useGetEmployeInformationForms } from '@/store/server/features/employees/employeeManagment/employeInformationForm/queries';

function General({ id }: { id: string }) {
  const { data: employeeData } = useGetEmployee(id);
  
  const { setEdit } = useEmployeeManagementStore();
  const [form] = Form.useForm();
  const { data: employeeInformationForm } = useGetEmployeInformationForms();

  const mergedFields = employeeInformationForm?.items.flatMap(form =>
    form.form.map(field => ({
      ...field,
      formTitle: form.formTitle, // Add formTitle to each field
    }))
  );

  const getFieldValidation=(fieldName:string)=>{
    return mergedFields?.find((field:any)=>field?.name===fieldName) ?? null
  }


  const { mutate: updateEmployeeInformation } = useUpdateEmployee();
  useGetNationalities();
  const handleSaveChanges = (editKey: keyof EditState, values: any) => {
    form
      .validateFields()
      .then(() => {
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
      <PersonalDataComponent  id={id} handleSaveChanges={handleSaveChanges} />
      <EmergencyContact mergedFields={mergedFields} id={id} handleSaveChanges={handleSaveChanges} />
      <AddressComponent mergedFields={mergedFields} id={id} handleSaveChanges={handleSaveChanges} />
      <BankInformationComponent mergedFields={mergedFields} id={id} handleSaveChanges={handleSaveChanges} />
    </>
  );
}

export default General;
