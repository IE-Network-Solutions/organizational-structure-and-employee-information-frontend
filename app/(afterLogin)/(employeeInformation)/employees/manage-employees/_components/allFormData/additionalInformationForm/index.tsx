import React from 'react';
import DynamicFormFields from '../../dynamicFormDisplayer';
import AddCustomField from '../../addCustomField';
import UseSetCategorizedFormData from '../../customField';

const AdditionalInformationForm = () => {
  const additionalInfoForm = UseSetCategorizedFormData('Addtional information');

  return (
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Additional Information
      </div>
      <DynamicFormFields
        formTitle="additionalInformation"
        fields={additionalInfoForm.form}
      />
      <AddCustomField
        formTitle="Addtional information"
        customEmployeeInformationForm={additionalInfoForm}
      />
    </div>
  );
};

export default AdditionalInformationForm;
