import jsPDF from 'jspdf';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { MdDownloadForOffline } from 'react-icons/md';
import { useGetCompanyProfileByTenantId } from '@/store/server/features/organizationStructure/companyProfile/mutation';
import dayjs from 'dayjs';
import { message } from 'antd';

interface Ids {
  id: string;
}

// Utility function to convert number to words
const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];
  const teens = [
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const convertHundreds = (n: number): string => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    }
    return (
      ones[Math.floor(n / 100)] +
      ' Hundred' +
      (n % 100 ? ' ' + convertHundreds(n % 100) : '')
    );
  };

  if (num < 1000) return convertHundreds(num);
  if (num < 1000000) {
    return (
      convertHundreds(Math.floor(num / 1000)) +
      ' Thousand' +
      (num % 1000 ? ' ' + convertHundreds(num % 1000) : '')
    );
  }
  if (num < 1000000000) {
    return (
      convertHundreds(Math.floor(num / 1000000)) +
      ' Million' +
      (num % 1000000 ? ' ' + numberToWords(num % 1000000) : '')
    );
  }
  return num.toLocaleString();
};

// Utility function to get employee title
const getEmployeeTitle = (
  gender?: string,
  maritalStatus?: string,
): string => {
  if (gender === 'male') return 'Mr';
  if (gender === 'female' && maritalStatus === 'SINGLE') return 'Miss';
  return 'Ms';
};

// Utility function to get pronoun
const getPronoun = (
  gender?: string,
  type: 'subject' | 'object' | 'possessive' = 'object',
): string => {
  if (gender === 'male') {
    return type === 'subject' ? 'He' : type === 'object' ? 'him' : 'his';
  }
  return type === 'subject' ? 'She' : type === 'object' ? 'her' : 'her';
};

const DownloadJobInformation: React.FC<Ids> = ({ id: id }) => {
  const { data: employeeData } = useGetEmployee(id);
  const { data: companyInfo } = useGetCompanyProfileByTenantId(
    employeeData?.tenantId,
  );

  const generatePDF = () => {
    // Validation
    if (!employeeData || !companyInfo) {
      message.error('Employee or company information not available');
      return;
    }

    if (!employeeData.employeeJobInformation?.length) {
      message.error('No job history available');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let y = 20;

      // Extract employee data
      const gender = employeeData?.employeeInformation?.gender;
      const maritalStatus = employeeData?.employeeInformation?.maritalStatus;
      const title = getEmployeeTitle(gender, maritalStatus);
      const fullName = `${employeeData?.firstName ?? ''} ${employeeData?.middleName ?? ''} ${employeeData?.lastName ?? ''}`.trim();
      
      // Get employee status
      const employeeStatus = employeeData?.status || 
                            employeeData?.employmentStatus || 
                            employeeData?.employeeInformation?.status ||
                            'Active';
      
      const isActive = employeeStatus?.toLowerCase() === 'active' || 
                      employeeStatus?.toLowerCase() === 'null' ||
                      !employeeData?.employeeInformation?.terminationDate;

      // Get dates
      const joinedDate = employeeData?.employeeInformation?.joinedDate;
      const terminationDate = employeeData?.employeeInformation?.terminationDate;

      // Sort job information (oldest to newest)
      const sortedJobInformation = [...employeeData.employeeJobInformation].sort(
        (a: any, b: any) => {
          const dateA = new Date(a.effectiveStartDate || 0).getTime();
          const dateB = new Date(b.effectiveStartDate || 0).getTime();
          return dateA - dateB;
        },
      );

      // Get current/last position
      const activeJob = sortedJobInformation.find(
        (job: any) => job.isPositionActive,
      );
      const currentPosition = activeJob?.position?.name || 
                            sortedJobInformation[sortedJobInformation.length - 1]?.position?.name || 
                            '-';

      // Get previous positions (exclude current)
      const previousPositions = sortedJobInformation.filter(
        (job: any) => !job.isPositionActive,
      );

      // Get salary
      const currentSalary = activeJob?.basicSalary || 
                           sortedJobInformation[sortedJobInformation.length - 1]?.basicSalary || 
                           0;

      // Generate reference number
      const refDate = dayjs().format('YYYY');
      const refNumber = `HR/EXP/${refDate}/${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;

      // === HEADER SECTION ===
      // Company Logo (if available - placeholder for now)
      if (companyInfo?.logo) {
        try {
          doc.addImage(companyInfo.logo, 'PNG', 15, y, 30, 15);
        } catch (error) {
          console.log('Logo not available');
        }
      }

      // Date and Reference Number (top right)
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Date: ${dayjs().format('YYYY-MM-DD')}`, pageWidth - 15, y, {
        align: 'right',
      });
      doc.text(`Ref No: ${refNumber}`, pageWidth - 15, y + 6, {
        align: 'right',
      });

      y += 35;

      // === MAIN TITLE ===
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const mainTitle = 'TO WHOM IT MAY CONCERN';
      const mainTitleWidth = doc.getTextWidth(mainTitle);
      const mainTitleX = (pageWidth - mainTitleWidth) / 2;
      doc.text(mainTitle, mainTitleX, y);

      y += 10;

      // === SUBJECT LINE ===
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 102, 204); // Blue color
      doc.text('Subject: Issuance of work Experience Certificate', 15, y);

      y += 15;

      // === BODY - EMPLOYMENT CERTIFICATION ===
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(68, 68, 68);

      // Employment period statement (conditional based on status)
      const formattedJoinedDate = joinedDate
        ? dayjs(joinedDate).format('MMMM D, YYYY')
        : '-';
      
      let employmentStatement = '';
      if (isActive) {
        employmentStatement = `This is to certify that ${title} ${fullName} has been working in our company from ${formattedJoinedDate} and is currently employed in the position of ${currentPosition}.`;
      } else {
        const formattedTerminationDate = terminationDate
          ? dayjs(terminationDate).format('MMMM D, YYYY')
          : dayjs().format('MMMM D, YYYY');
        employmentStatement = `This is to certify that ${title} ${fullName} has been working in our company from ${formattedJoinedDate} up to ${formattedTerminationDate} in the position of ${currentPosition}.`;
      }

      const employmentLines = doc.splitTextToSize(employmentStatement, 180);
      doc.text(employmentLines, 15, y);
      y += employmentLines.length * 6 + 5;

      // === PREVIOUS POSITIONS SECTION ===
      if (previousPositions.length > 0) {
        // Add light purple background box
        doc.setFillColor(240, 235, 255); // Light purple
        const boxHeight = Math.min(previousPositions.length * 8 + 6, 40);
        doc.rect(15, y - 2, 180, boxHeight, 'F');

        doc.setTextColor(68, 68, 68);
        doc.setFontSize(10);

        previousPositions.forEach((job: any, index: number) => {
          if (y > 260) {
            // Check for page overflow
            doc.addPage();
            y = 20;
          }

          const startDate = job.effectiveStartDate
            ? dayjs(job.effectiveStartDate).format('MMM DD, YYYY')
            : '-';
          
          // Calculate end date as start of next position
          const nextJob = sortedJobInformation[sortedJobInformation.indexOf(job) + 1];
          const endDate = nextJob?.effectiveStartDate
            ? dayjs(nextJob.effectiveStartDate).format('MMM DD, YYYY')
            : dayjs().format('MMM DD, YYYY');

          const positionText = `Previous position from ${startDate} to ${endDate} of ${job.position?.name || '-'}`;
          doc.text(positionText, 20, y + index * 8);
        });

        y += boxHeight + 8;
      }

      // === SALARY SECTION ===
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(68, 68, 68);
      const salaryInWords = numberToWords(currentSalary);
      const salaryStatement = `${title.toUpperCase()} ${fullName} was drawing a monthly gross salary of birr ${currentSalary.toLocaleString()} (${salaryInWords} Birr) per month. Income tax & pension contribution have been duly deducted and paid to the Ethiopian Ministry of Revenue.`;
      
      const salaryLines = doc.splitTextToSize(salaryStatement, 180);
      doc.text(salaryLines, 15, y);
      y += salaryLines.length * 6 + 10;

      // === CONDITIONAL CLOSING STATEMENTS ===
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      if (isActive) {
        // Active employee - not a release letter
        const activeStatement = `We have issued this certificate of work experience to ${title}, ${fullName} in the testimony of the above and cannot be considered as a release letter.`;
        const activeLines = doc.splitTextToSize(activeStatement, 180);
        doc.text(activeLines, 15, y);
        y += activeLines.length * 6 + 10;
      } else {
        // Inactive employee - resignation and wishes
        const resignationStatement = `${title}, ${fullName} has chosen to resign from the company of ${getPronoun(gender, 'possessive')} own accord.`;
        const resignationLines = doc.splitTextToSize(resignationStatement, 180);
        doc.text(resignationLines, 15, y);
        y += resignationLines.length * 6 + 8;

        const wishesStatement = `${companyInfo?.companyName} wishes ${getPronoun(gender, 'object')} all the best in ${getPronoun(gender, 'possessive')} future endeavors.`;
        const wishesLines = doc.splitTextToSize(wishesStatement, 180);
        doc.text(wishesLines, 15, y);
        y += wishesLines.length * 6 + 10;
      }

      // === SIGNATURE SECTION ===
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      y += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('With Best Wishes', 15, y);

      y += 12;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 102, 204); // Blue color
      doc.text('Abebe Kebede', 15, y);

      y += 6;
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128); // Grey color
      doc.text('People Manager', 15, y);

      // Save PDF
      const fileName = `${fullName.replace(/\s+/g, '_')}_Work_Experience_Certificate.pdf`;
      doc.save(fileName);
      
      message.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      message.error('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div>
      <button onClick={generatePDF} aria-label="Download Work Experience Certificate">
        <MdDownloadForOffline className="text-primary text-2xl" />
      </button>
    </div>
  );
};

export default DownloadJobInformation;
