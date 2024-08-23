import { useGetEmployeInformationForms } from '@/store/server/features/employees/employeeManagment/employeInformationForm/queries';
import { useEffect, useState } from 'react';

const UseSetCategorizedFormData = (formTitle: string) => {
  const { data: employeeInformationForm } = useGetEmployeInformationForms();
  const [filteredForm, setFilteredForm] = useState<any>(null);

  useEffect(() => {
    if (employeeInformationForm && employeeInformationForm.items) {
      const form = employeeInformationForm.items.find(
        (item: any) => item.formTitle.trim() === formTitle,
      );
      if (form) {
        setFilteredForm(form);
      }
    }
  }, [formTitle, employeeInformationForm]);

  return filteredForm || [];
};

export default UseSetCategorizedFormData;
