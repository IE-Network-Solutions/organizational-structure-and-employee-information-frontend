import React from 'react';
import jsPDF from 'jspdf';
import {
  useGetEmployee,
  useGetAllUsersData,
} from '@/store/server/features/employees/employeeManagment/queries';
import { MdDownloadForOffline } from 'react-icons/md';
import { useGetCompanyProfileByTenantId } from '@/store/server/features/organizationStructure/companyProfile/mutation';
import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';
import dayjs from 'dayjs';
import { message, Spin } from 'antd';

interface Ids {
  id: string;
}

// Utility function to convert number to words
const numberToWords = (num: number): string => {
  // Round to nearest integer to handle decimal values
  num = Math.round(num);

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
    n = Math.floor(n); // Ensure integer
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const tensDigit = Math.floor(n / 10);
      const onesDigit = n % 10;
      return tens[tensDigit] + (onesDigit ? ' ' + ones[onesDigit] : '');
    }
    const hundredsDigit = Math.floor(n / 100);
    const remainder = n % 100;
    return (
      ones[hundredsDigit] +
      ' Hundred' +
      (remainder ? ' ' + convertHundreds(remainder) : '')
    );
  };

  if (num < 1000) return convertHundreds(num);
  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    return (
      convertHundreds(thousands) +
      ' Thousand' +
      (remainder ? ' ' + convertHundreds(remainder) : '')
    );
  }
  if (num < 1000000000) {
    const millions = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    return (
      convertHundreds(millions) +
      ' Million' +
      (remainder ? ' ' + numberToWords(remainder) : '')
    );
  }
  return num.toLocaleString();
};

// Utility function to get employee title
const getEmployeeTitle = (gender?: string, maritalStatus?: string): string => {
  const genderLower = gender?.toLowerCase();
  if (genderLower === 'male') return 'Mr';
  if (genderLower === 'female' && maritalStatus === 'SINGLE') return 'Miss';
  if (genderLower === 'female') return 'Ms';
  // Default to Mr if gender is undefined/unknown
  return 'Mr';
};

// Utility function to get pronoun
const getPronoun = (
  gender?: string,
  type: 'subject' | 'object' | 'possessive' = 'object',
): string => {
  const genderLower = gender?.toLowerCase();
  if (genderLower === 'male') {
    return type === 'subject' ? 'He' : type === 'object' ? 'him' : 'his';
  }
  // Default to male pronouns if unknown
  return type === 'subject' ? 'He' : type === 'object' ? 'him' : 'his';
};

const DownloadJobInformation: React.FC<Ids> = ({ id: id }) => {
  const { data: employeeData } = useGetEmployee(id);
  const { data: allEmployeesData } = useGetAllUsersData(); // Fetch all employees with full data
  const { data: companyInfo } = useGetCompanyProfileByTenantId(
    employeeData?.tenantId,
  );
  const { data: basicSalaryData } = useGetBasicSalaryById(id);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    // Validation
    if (!employeeData || !companyInfo) {
      message.error('Employee or company information not available');
      setIsGenerating(false);
      return;
    }

    if (!employeeData.employeeJobInformation?.length) {
      message.error('No job history available');
      setIsGenerating(false);
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let y = 20;

      // Extract employee data
      // Note: For inactive employees, employeeInformation is null from the single employee API
      // So we fetch the full data from the all employees list which includes complete data
      let gender = employeeData?.employeeInformation?.gender;
      let maritalStatus = employeeData?.employeeInformation?.maritalStatus;

      // If no gender data (inactive employees), get it from the all employees list
      if (!gender && !employeeData?.employeeInformation && allEmployeesData) {
        // Check if data is nested (e.g., { items: [...] }) or direct array
        const employeesList = Array.isArray(allEmployeesData)
          ? allEmployeesData
          : allEmployeesData?.items ||
            allEmployeesData?.data ||
            allEmployeesData?.users ||
            [];

        // Find this employee in the all employees data
        const fullEmployeeData = employeesList.find(
          (emp: any) => emp.id === id,
        );

        if (fullEmployeeData?.employeeInformation) {
          gender = fullEmployeeData.employeeInformation.gender;
          maritalStatus = fullEmployeeData.employeeInformation.maritalStatus;
        }
      }

      const title = getEmployeeTitle(gender, maritalStatus);
      const fullName =
        `${employeeData?.firstName ?? ''} ${employeeData?.middleName ?? ''} ${employeeData?.lastName ?? ''}`.trim();

      // Determine employee status based on deletedAt field
      // If deletedAt is null = Active, if deletedAt has value = Inactive
      const isActive = !employeeData?.deletedAt;

      // Get manager information for signature section
      let managerName = '';
      let managerTitle = 'People Manager';

      if (isActive && employeeData?.reportingTo) {
        const manager = employeeData.reportingTo;
        managerName =
          `${manager.firstName ?? ''} ${manager.middleName ?? ''} ${manager.lastName ?? ''}`.trim();
        if (managerName) {
          managerTitle = 'Manager';
        }
      }

      // Get dates - for inactive users, employeeInformation might be null
      // So we need to get joinedDate from employeeJobInformation instead
      let joinedDate = employeeData?.employeeInformation?.joinedDate;

      // If no joinedDate and we have job information, use the earliest job start date
      if (!joinedDate && employeeData?.employeeJobInformation?.length > 0) {
        // Filter out jobs with null/undefined effectiveStartDate, then sort
        const jobsWithDates = employeeData.employeeJobInformation.filter(
          (job: any) => job.effectiveStartDate,
        );
        if (jobsWithDates.length > 0) {
          const earliestJob = jobsWithDates.sort(
            (a: any, b: any) =>
              new Date(a.effectiveStartDate).getTime() -
              new Date(b.effectiveStartDate).getTime(),
          )[0];
          joinedDate = earliestJob?.effectiveStartDate;
        }
      }

      // Get termination date for inactive employees
      let terminationDate = null;
      if (!isActive) {
        // Try to get from latest job's effectiveEndDate, resignationSubmittedDate, or use deletedAt
        const latestJob =
          employeeData?.employeeJobInformation?.[
            employeeData.employeeJobInformation.length - 1
          ];
        terminationDate =
          latestJob?.effectiveEndDate ||
          latestJob?.resignationSubmittedDate ||
          employeeData?.deletedAt;
      }

      // Sort job information (oldest to newest)
      const sortedJobInformation = [
        ...employeeData.employeeJobInformation,
      ].sort((a: any, b: any) => {
        const dateA = new Date(a.effectiveStartDate || 0).getTime();
        const dateB = new Date(b.effectiveStartDate || 0).getTime();
        return dateA - dateB;
      });

      // Get current/last position
      const activeJob = sortedJobInformation.find(
        (job: any) => job.isPositionActive,
      );
      const currentPosition =
        activeJob?.position?.name ||
        sortedJobInformation[sortedJobInformation.length - 1]?.position?.name ||
        '-';

      // Get previous positions (exclude current)
      const previousPositions = sortedJobInformation.filter(
        (job: any) => !job.isPositionActive,
      );

      // Get salary - try from query first, then from employeeData.basicSalaries
      let activeSalaryRecord = null;

      // Try from the query (works for active employees)
      if (Array.isArray(basicSalaryData) && basicSalaryData.length > 0) {
        activeSalaryRecord = basicSalaryData.find(
          (salary: any) => salary.status === true,
        );
      }

      // Fallback: try from employeeData.basicSalaries (for inactive employees)
      if (!activeSalaryRecord && employeeData?.basicSalaries?.length > 0) {
        activeSalaryRecord = employeeData.basicSalaries.find(
          (salary: any) => salary.status === true,
        );
      }

      const currentSalary = activeSalaryRecord?.basicSalary || 0;

      // Generate reference number
      const refDate = dayjs().format('YYYY');
      const refNumber = `HR/EXP/${refDate}/${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;

      // === HEADER SECTION ===
      // Helper function to convert image URL to base64
      const getImageAsBase64 = async (
        url: string,
      ): Promise<{ data: string; format: string } | null> => {
        try {
          const response = await fetch(url);
          if (!response.ok) return null;
          const blob = await response.blob();

          // Detect image format from blob type or URL extension
          let format = 'PNG'; // default
          if (blob.type) {
            if (blob.type.includes('jpeg') || blob.type.includes('jpg')) {
              format = 'JPEG';
            } else if (blob.type.includes('png')) {
              format = 'PNG';
            } else if (blob.type.includes('webp')) {
              format = 'WEBP';
            }
          } else if (
            url.toLowerCase().endsWith('.jpg') ||
            url.toLowerCase().endsWith('.jpeg')
          ) {
            format = 'JPEG';
          } else if (url.toLowerCase().endsWith('.png')) {
            format = 'PNG';
          }

          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () =>
              resolve({ data: reader.result as string, format });
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          return null;
        }
      };

      // Try to get logo URL from companyInfo
      const logoUrl = companyInfo?.description;

      // Try to load and display logo, fallback to company name if it fails
      let logoLoaded = false;
      if (logoUrl) {
        try {
          const imageResult = await getImageAsBase64(logoUrl);
          if (imageResult) {
            // Get image dimensions to maintain aspect ratio
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = imageResult.data;
            });

            // Calculate dimensions (max width 40mm, maintain aspect ratio)
            const maxWidth = 40;
            const aspectRatio = img.width / img.height;
            const logoWidth = maxWidth;
            const logoHeight = logoWidth / aspectRatio;

            // Add logo to PDF with detected format
            doc.addImage(
              imageResult.data,
              imageResult.format,
              15,
              y + 5,
              logoWidth,
              logoHeight,
            );
            logoLoaded = true;
          }
        } catch (error) {
          // Logo loading failed, will fallback to company name
          logoLoaded = false;
        }
      }

      // Fallback to company name if logo failed or not available
      if (!logoLoaded && companyInfo?.companyName) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(54, 54, 240); // Blue color #3636F0
        doc.text(companyInfo.companyName, 15, y + 10);
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
      const subjectText = 'Subject: Issuance of work Experience Certificate';
      const subjectWidth = doc.getTextWidth(subjectText);
      const subjectX = (pageWidth - subjectWidth) / 2;
      doc.text(subjectText, subjectX, y);

      y += 15;

      // === BODY - EMPLOYMENT CERTIFICATION ===
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(68, 68, 68);

      // Employment period statement (conditional based on status)
      const formattedJoinedDate = joinedDate
        ? dayjs(joinedDate).format('MMMM D,YYYY')
        : '-';

      // Build employment statement with bold position
      let employmentStatementPart1 = '';
      const employmentStatementPart2 = ' in the position of ';

      if (isActive) {
        employmentStatementPart1 = `This is to certify that ${title} ${fullName} has been working in our company from ${formattedJoinedDate} and is currently employed`;
      } else {
        const formattedTerminationDate = terminationDate
          ? dayjs(terminationDate).format('MMMM D,YYYY')
          : dayjs().format('MMMM D,YYYY');
        employmentStatementPart1 = `This is to certify that ${title} ${fullName} has been working in our company from ${formattedJoinedDate} up to ${formattedTerminationDate}`;
      }

      // Split and render text with bold position
      const part1Lines = doc.splitTextToSize(
        employmentStatementPart1 + employmentStatementPart2,
        180,
      );

      // Calculate where to add bold text
      const lastLineIndex = part1Lines.length - 1;
      const lastLine = part1Lines[lastLineIndex];

      // Render all lines except the last
      for (let i = 0; i < lastLineIndex; i++) {
        doc.text(part1Lines[i], 15, y);
        y += 6;
      }

      // Render last line with position
      doc.text(lastLine, 15, y);
      const lastLineWidth = doc.getTextWidth(lastLine);

      // Add bold position name
      doc.setFont('helvetica', 'bold');
      doc.text(currentPosition, 15 + lastLineWidth, y);
      const positionWidth = doc.getTextWidth(currentPosition);

      // Add period
      doc.setFont('helvetica', 'normal');
      doc.text('.', 15 + lastLineWidth + positionWidth, y);

      y += 10;

      // Add horizontal line separator
      doc.setDrawColor(203, 213, 224); // Grey color #CBD5E0
      doc.setLineWidth(0.5);
      doc.line(15, y, 195, y);

      y += 10;

      // === PREVIOUS POSITIONS SECTION ===
      if (previousPositions.length > 0) {
        // Check for page overflow before drawing the box
        if (y > 240) {
          doc.addPage();
          y = 20;
        }

        // Define spacing constants for font size 10
        const lineSpacing = 7; // Distance between baselines
        const ascenderHeight = 2.5; // Text extends above baseline (for capital letters, tall letters)
        const descenderHeight = 1.0; // Text extends below baseline (for letters like g, p, y)
        const verticalPadding = 4; // Equal padding on top and bottom

        const numberOfLines = previousPositions.length;

        // Calculate box height properly:
        // Visual height = distance from first line's top to last line's bottom
        // = (last line baseline + descender) - (first line baseline - ascender)
        // = (firstLineY + (N-1)*lineSpacing + descender) - (firstLineY - ascender)
        // = (N-1)*lineSpacing + ascender + descender
        const visualTextHeight =
          (numberOfLines - 1) * lineSpacing + ascenderHeight + descenderHeight;
        const boxHeight = visualTextHeight + verticalPadding * 2;

        // Store the starting Y position for the box
        const boxStartY = y;
        const boxCenterY = boxStartY + boxHeight / 2;

        // Add light purple background box
        doc.setFillColor(240, 235, 255); // Light purple
        doc.rect(15, boxStartY, 180, boxHeight, 'F');

        doc.setTextColor(68, 68, 68);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Calculate starting Y position for perfect vertical centering
        // Visual center of text block = (visualTop + visualBottom) / 2
        // visualTop = firstLineY - ascenderHeight
        // visualBottom = firstLineY + (N-1)*lineSpacing + descenderHeight
        // visualCenter = firstLineY + ((N-1)*lineSpacing)/2 + (descenderHeight - ascenderHeight)/2
        // To center: visualCenter = boxCenterY
        // Therefore: firstLineY = boxCenterY - ((N-1)*lineSpacing)/2 - (descenderHeight - ascenderHeight)/2
        const firstLineY =
          boxCenterY -
          ((numberOfLines - 1) * lineSpacing) / 2 -
          (descenderHeight - ascenderHeight) / 2;

        // Draw text centered vertically in the box
        previousPositions.forEach((job: any, index: number) => {
          const startDate = job.effectiveStartDate
            ? dayjs(job.effectiveStartDate).format('MMM DD,YYYY')
            : '-';

          // Calculate end date as start of next position
          const nextJob =
            sortedJobInformation[sortedJobInformation.indexOf(job) + 1];
          const endDate = nextJob?.effectiveStartDate
            ? dayjs(nextJob.effectiveStartDate).format('MMM DD,YYYY')
            : dayjs().format('MMM DD,YYYY');

          const positionText = `Previous position from ${startDate} to ${endDate} of ${job.position?.name || '-'}`;
          // Position text centered vertically in the box
          doc.text(positionText, 20, firstLineY + index * lineSpacing);
        });

        // Move Y position after the box with consistent spacing
        y = boxStartY + boxHeight + 5;
      }

      // === SALARY SECTION ===
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      // Add horizontal line before salary
      doc.setDrawColor(203, 213, 224); // Grey color
      doc.setLineWidth(0.5);
      doc.line(15, y, 195, y);
      y += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(68, 68, 68);
      const salaryInWords = numberToWords(currentSalary);
      const salaryStatement = `${title.toUpperCase()} ${fullName} was drawing a monthly gross salary of birr ${currentSalary.toLocaleString()} (${salaryInWords} Birr) per month. Income tax & pension contribution have been duly deducted and paid to the Ethiopian Ministry of Revenue.`;

      const salaryLines = doc.splitTextToSize(salaryStatement, 180);
      doc.text(salaryLines, 15, y);
      y += salaryLines.length * 6 + 8;

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
        y += resignationLines.length * 6 + 5;

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

      y += 5;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('With Best Wishes', 15, y);

      y += 10;

      // Add horizontal line before signature
      doc.setDrawColor(203, 213, 224); // Grey color
      doc.setLineWidth(0.5);
      doc.line(15, y, 195, y);

      y += 8;

      // Display signature based on employee status
      if (managerName) {
        // Active employee with manager - display manager name and "Manager" title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(54, 54, 240); // Blue color #3636F0
        doc.text(managerName, 15, y);

        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(104, 117, 136); // Grey color #687588
        doc.text(managerTitle, 15, y);
      } else {
        // Inactive employee or no manager - display only "People Manager"
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(104, 117, 136); // Grey color #687588
        doc.text(managerTitle, 15, y);
      }

      // Save PDF
      const fileName = `${fullName.replace(/\s+/g, '_')}_Work_Experience_Certificate.pdf`;
      doc.save(fileName);

      message.success('Certificate downloaded successfully!');
      setIsGenerating(false);
    } catch (error) {
      message.error('Failed to generate PDF. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <button
        onClick={generatePDF}
        aria-label="Download Work Experience Certificate"
        disabled={isGenerating}
        className="relative"
      >
        {isGenerating ? (
          <Spin size="small" />
        ) : (
          <MdDownloadForOffline className="text-primary text-2xl" />
        )}
      </button>
    </div>
  );
};

export default DownloadJobInformation;
