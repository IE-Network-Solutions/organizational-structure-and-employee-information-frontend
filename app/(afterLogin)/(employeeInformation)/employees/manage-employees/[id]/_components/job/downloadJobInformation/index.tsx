import jsPDF from 'jspdf';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { MdDownloadForOffline } from 'react-icons/md';
import { useGetCompanyProfileByTenantId } from '@/store/server/features/organizationStructure/companyProfile/mutation';
interface Ids {
  id: string;
}
const DownloadJobInformation: React.FC<Ids> = ({ id: id }) => {
  const { isLoading, data: employeeData } = useGetEmployee(id);
  const { data: companyInfo } = useGetCompanyProfileByTenantId(
    employeeData?.tenantId,
  );
  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    const text = 'CERTIFICATE OF SERVICE';
    const pageWidth = doc.internal.pageSize.width;
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, 20);

    doc.setFontSize(14);
    let y = 40;
    doc.text(
      `This is to certify that ${
        employeeData?.employeeInformation?.gender === 'male'
          ? 'Mr'
          : employeeData?.employeeInformation?.gender === 'female' &&
              employeeData?.employeeInformation?.maritalStatus === 'SINGLE'
            ? 'Miss'
            : 'Ms'
      } ${employeeData?.firstName ?? ''} ${employeeData?.middleName ?? ''} ${employeeData?.lastName ?? ''} has been a permanent employee of ${companyInfo?.companyName}, working as:`,
      10,
      y,
      { maxWidth: 180 },
    );

    const sortedJobInformation = employeeData.employeeJobInformation.sort(
      (a: any, b: any) => {
        const dateA = new Date(a.effectiveStartDate || 0).getTime();
        const dateB = new Date(b.effectiveStartDate || 0).getTime();
        return dateA - dateB;
      },
    );

    y += 10;
    doc.setFontSize(12);
    sortedJobInformation.forEach((employeeJobInformation: any) => {
      y += 10;
      const effectiveStartDate = employeeJobInformation.effectiveStartDate
        ? employeeJobInformation.effectiveStartDate.slice(0, 10)
        : '-';
      doc.text(
        ` From ${effectiveStartDate} as ${employeeJobInformation.position?.name ?? '-'}`,
        24,
        y,
      );
    });

    y += 20;
    doc.setFontSize(14);
    doc.text(
      `${
        employeeData?.employeeInformation?.gender === 'male'
          ? 'Mr'
          : employeeData?.employeeInformation?.gender === 'female' &&
              employeeData?.employeeInformation?.maritalStatus === 'SINGLE'
            ? 'Miss'
            : 'Ms'
      } ${employeeData?.firstName ?? ''}  ${employeeData?.middleName ?? ''} ${employeeData?.lastName ?? ''} was drawing a monthly gross salary of Birr ________ (__________) per month. Income tax & pension contributions have been duly deducted and paid to the relevant Government Authority.`,
      10,
      y,
      { maxWidth: 180 },
    );

    y += 20;
    doc.text(
      `${
        employeeData?.employeeInformation?.gender === 'male'
          ? 'Mr'
          : employeeData?.employeeInformation?.gender === 'female' &&
              employeeData?.employeeInformation?.maritalStatus === 'SINGLE'
            ? 'Miss'
            : 'Ms'
      } ${employeeData?.firstName ?? ''}  ${employeeData?.middleName ?? ''} ${employeeData?.lastName ?? ''} has resigned from our company on his/her own accord.`,
      10,
      y,
      { maxWidth: 180 },
    );

    y += 20;
    doc.text(
      `${companyInfo?.companyName} wishes ${
        employeeData?.employeeInformation?.gender === 'male'
          ? 'him'
          : employeeData?.employeeInformation?.gender === 'female'
            ? 'her'
            : ''
      } all the best in future endeavors.`,
      10,
      y,
      { maxWidth: 180 },
    );

    y += 20;
    doc.setFontSize(18);
    doc.text('Sincerely,', 10, y + 10);
    doc.addImage('/image/ie.png', 'PNG', 10, y + 20, 30, 30);

    doc.save(
      `${employeeData?.firstName ?? ''}  ${employeeData?.middleName ?? ''} ${employeeData?.lastName ?? ''} Job History.pdf`,
    );
  };

  return (
    <div>
      <button onClick={generatePDF}>
        <MdDownloadForOffline className="text-primary text-2xl" />
      </button>
    </div>
  );
};

export default DownloadJobInformation;
