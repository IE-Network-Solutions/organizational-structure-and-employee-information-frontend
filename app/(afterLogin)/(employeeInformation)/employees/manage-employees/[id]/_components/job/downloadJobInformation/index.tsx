import jsPDF from 'jspdf';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { MdDownloadForOffline } from 'react-icons/md';
import { useGetCompanyProfileByTenantId } from '@/store/server/features/organizationStructure/companyProfile/mutation';

interface Ids {
  id: string;
}

const DownloadJobInformation: React.FC<Ids> = ({ id: id }) => {
  const { data: employeeData } = useGetEmployee(id);
  const { data: companyInfo } = useGetCompanyProfileByTenantId(
    employeeData?.tenantId,
  );

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor('#4da6ff');

    doc.text(companyInfo?.companyName ?? '', 10, 10);
    doc.setFontSize(12);
    doc.text(companyInfo?.address ?? '', 10, 16);
    doc.text(companyInfo?.phoneNumber ?? '', 10, 22);
    doc.setLineWidth(0.5);
    doc.line(10, 26, 200, 26);

    doc.setFontSize(22);
    doc.setTextColor('#003366');
    const title = 'CERTIFICATE OF SERVICE';
    const pageWidth = doc.internal.pageSize.width;
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(title, titleX, 40);

    doc.setFontSize(14);
    doc.setTextColor('#444444');
    let y = 60;
    doc.text(
      `This is to certify that ${
        employeeData?.employeeInformation?.gender === 'male'
          ? 'Mr'
          : employeeData?.employeeInformation?.gender === 'female' &&
              employeeData?.employeeInformation?.maritalStatus === 'SINGLE'
            ? 'Miss'
            : 'Ms'
      } ${employeeData?.firstName ?? ''} ${employeeData?.middleName ?? ''} ${employeeData?.lastName ?? ''} has been a permanent employee of ${companyInfo?.companyName}, working as:`,
      15,
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

    sortedJobInformation.forEach(
      (employeeJobInformation: any, index: number) => {
        y += 10;
        const effectiveStartDate = employeeJobInformation.effectiveStartDate
          ? employeeJobInformation.effectiveStartDate.slice(0, 10)
          : '-';

        const nextJobInformation = sortedJobInformation[index + 1];
        const endDate = nextJobInformation?.effectiveStartDate
          ? nextJobInformation.effectiveStartDate.slice(0, 10)
          : 'now';

        doc.text(
          ` Start from ${effectiveStartDate} to ${endDate} as ${employeeJobInformation.position?.name ?? '-'}`,
          24,
          y,
        );
      },
    );

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
      15,
      y,
      { maxWidth: 180 },
    );

    y += 20;
    doc.text(
      `${
        employeeData?.employeeInformation?.gender === 'male'
          ? 'Mr'
          : employeeData?.employeeInformation?.gender === 'female'
            ? 'her'
            : ''
      } ${employeeData?.firstName ?? ''}  ${employeeData?.middleName ?? ''} ${employeeData?.lastName ?? ''} has resigned from our company on his/her own accord.`,
      15,
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
      } all the best in ${
        employeeData?.employeeInformation?.gender === 'male'
          ? 'his'
          : employeeData?.employeeInformation?.gender === 'female'
            ? 'her'
            : ''
      } future endeavors.`,
      15,
      y,
      { maxWidth: 180 },
    );

    y += 35;
    doc.setFontSize(12);
    doc.text('Sincerely,', 15, y + 10);
    y += 20;
    doc.line(10, y + 30, 200, y + 30);

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
