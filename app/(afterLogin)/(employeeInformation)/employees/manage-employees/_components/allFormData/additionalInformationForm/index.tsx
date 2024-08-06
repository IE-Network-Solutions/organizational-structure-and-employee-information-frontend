import React from 'react'
import DynamicFormFields from '../../dynamicFormDisplayer';
import AddCustomField from '../../addCustomField';
import { AdditionalInformation } from '../../dummyData';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';

const AdditionalInformationForm=()=>{
    const {additionalInformation,setAdditionalInformation}=useEmployeeManagmentStore();

  return (
    <div>   
        <div className='flex justify-center items-center text-gray-950 text-sm font-semibold my-2'>Additional Information</div>
        <DynamicFormFields fields={AdditionalInformation.form} />
        <AddCustomField formTitle='address' setNewValue={setAdditionalInformation} customEmployeeInformationForm={additionalInformation}/>
    </div>
  )
}

export default AdditionalInformationForm;