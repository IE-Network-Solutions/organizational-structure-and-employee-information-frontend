import { Col, Row } from 'antd';
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
import AdditionalInformation from './additionalInformation';
import { prepareJsonFieldForPatch } from '@/utils/employeeBankInformation';

function General({ id }: { id: string }) {
  const { data: employeeData } = useGetEmployee(id);

  const { setEdit } = useEmployeeManagementStore();
  const { data: employeeInformationForm } = useGetEmployeInformationForms();

  const mergedFields =
    (employeeInformationForm?.items ?? []).flatMap((form) =>
      (form.form ?? []).map((field) => {
        // Handle both FormField and FormFieldWithFieldProperty types
        if ('field' in field) {
          // FormFieldWithFieldProperty case
          return {
            ...field.field,
            formTitle: form.formTitle,
            id: field.id,
          };
        } else {
          // FormField case
          return {
            ...field,
            formTitle: form.formTitle,
          };
        }
      }),
    ) || [];

  const { mutate: updateEmployeeInformation } = useUpdateEmployee();
  useGetNationalities();

  const handleSaveChanges = (
    editKey: keyof EditState,
    values: any,
    options?: { onSuccess?: () => void; onError?: () => void },
  ) => {
    const employeeInfoId = employeeData?.employeeInformation?.id;
    if (!employeeInfoId) return;

    let payload: Record<string, unknown>;
    switch (editKey) {
      case 'general':
        payload = values;
        break;
      case 'addresses':
        payload = {
          addresses: prepareJsonFieldForPatch(
            employeeData?.employeeInformation?.addresses,
            values,
          ),
        };
        break;
      case 'emergencyContact':
        payload = {
          emergencyContact: prepareJsonFieldForPatch(
            employeeData?.employeeInformation?.emergencyContact,
            values,
          ),
        };
        break;
      case 'bankInformation':
        payload = {
          bankInformation: prepareJsonFieldForPatch(
            employeeData?.employeeInformation?.bankInformation,
            values,
          ),
        };
        break;
      case 'additionalInformation':
        payload = {
          additionalInformation: prepareJsonFieldForPatch(
            employeeData?.employeeInformation?.additionalInformation,
            values,
          ),
        };
        break;
      default:
        return;
    }

    updateEmployeeInformation(
      { id: employeeInfoId, values: payload, userId: id },
      {
        onSuccess: () => {
          options?.onSuccess?.();
          setEdit(editKey);
        },
        onError: () => {
          options?.onError?.();
        },
      },
    );
  };

  return (
    <>
      <Row gutter={16}>
        <Col lg={12} sm={24} xs={24}>
          <PersonalDataComponent
            id={id}
            data-cy="general-personal-data-component"
            handleSaveChanges={handleSaveChanges}
          />
          <AddressComponent
            mergedFields={mergedFields}
            id={id}
            handleSaveChanges={handleSaveChanges}
            data-cy="general-address-component"
          />
          <AdditionalInformation
            mergedFields={mergedFields}
            id={id}
            handleSaveChanges={handleSaveChanges}
            data-cy="general-additional-information-component"
          />
        </Col>
        <Col lg={12} sm={24} xs={24}>
          <EmergencyContact
            mergedFields={mergedFields}
            id={id}
            handleSaveChanges={handleSaveChanges}
            data-cy="general-emergency-contact-component"
          />
          <BankInformationComponent
            mergedFields={mergedFields}
            id={id}
            handleSaveChanges={handleSaveChanges}
            data-cy="general-bank-information-component"
          />
        </Col>
      </Row>
    </>
  );
}

export default General;
