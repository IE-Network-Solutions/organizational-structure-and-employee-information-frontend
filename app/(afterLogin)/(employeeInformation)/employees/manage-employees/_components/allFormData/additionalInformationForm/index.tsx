import React from 'react';
import DynamicFormFields from '../../dynamicFormDisplayer';
import AddCustomField from '../../addCustomField';
import UseSetCategorizedFormData from '../../customField';

const AdditionalInformationForm = () => {
  const additionalInfoForm = UseSetCategorizedFormData(
    'Additional information',
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="text-gray-950 text-sm font-semibold mb-4 text-center">
        Additional Information
      </div>
      <DynamicFormFields
        formTitle="additionalInformation"
        fields={additionalInfoForm.form}
      />
      <AddCustomField
        formTitle="Additional information"
        customEmployeeInformationForm={additionalInfoForm}
      />
    </div>
  );
};

export default AdditionalInformationForm;
