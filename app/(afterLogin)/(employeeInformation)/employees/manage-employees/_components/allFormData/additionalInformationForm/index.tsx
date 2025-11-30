import React from 'react';
import DynamicFormFields from '../../dynamicFormDisplayer';
import AddCustomField from '../../addCustomField';
import UseSetCategorizedFormData from '../../customField';

const AdditionalInformationForm = () => {
  const additionalInfoForm = UseSetCategorizedFormData('additionalInformation');

  return (
    <div
      className="p-4 sm:p-6 lg:p-8"
      id="additional-info-form"
      data-cy="additional-info-form"
    >
      <div
        className="text-gray-950 text-sm font-semibold mb-4 text-center"
        id="additional-info-title"
        data-cy="additional-info-title"
      >
        Additional Information
      </div>
      <DynamicFormFields
        formTitle="additionalInformation"
        fields={additionalInfoForm.form}
        data-cy="additional-info-dynamic-fields"
      />
      <AddCustomField
        formTitle="additionalInformation"
        customEmployeeInformationForm={additionalInfoForm}
        data-cy="additional-info-custom-field"
      />
    </div>
  );
};

export default AdditionalInformationForm;
