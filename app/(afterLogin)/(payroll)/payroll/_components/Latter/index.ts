import { IE_LOGO_BASE64 } from '@/public/image/bankLetterImages';
import { useGetTenant } from '@/store/server/features/employees/authentication/queries';
import { useGetActiveMonth } from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';

// Get image as data URI for jsPDF (needs full data URI format)
const getImageAsDataUri = async (
  url: string,
): Promise<{ data: string; format: string }> => {
  try {
    if (!url) {
      return { data: IE_LOGO_BASE64, format: 'PNG' };
    }

    // If it's already base64 data URI, return it
    if (url.startsWith('data:image/')) {
      const format = url.includes('png')
        ? 'PNG'
        : url.includes('jpeg') || url.includes('jpg')
          ? 'JPEG'
          : 'PNG';
      return { data: url, format };
    }

    // If it's a URL, fetch and convert to base64
    const response = await fetch(url);
    if (!response.ok) {
      return { data: IE_LOGO_BASE64, format: 'PNG' };
    }

    const blob = await response.blob();
    const format = blob.type.includes('png')
      ? 'PNG'
      : blob.type.includes('jpeg') || blob.type.includes('jpg')
        ? 'JPEG'
        : 'PNG';

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ data: reader.result as string, format });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return { data: IE_LOGO_BASE64, format: 'PNG' };
  }
};

export const useGenerateBankLetter = () => {
  const { data: tenant } = useGetTenant();
  const { data: activeMonth } = useGetActiveMonth();

  const generateBankLetter = async (amount: number | string) => {
    // Ensure amount is a valid number (in case string is passed)
    const numericAmount =
      typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;

    try {
      if (!tenant) {
        throw new Error(
          'Tenant data is not available. Please ensure you are logged in.',
        );
      }

      if (!activeMonth) {
        throw new Error(
          'Active month data is not available. Please select an active payroll period.',
        );
      }

      if (!activeMonth.startDate) {
        throw new Error('Active month start date is missing.');
      }

      if (!tenant.companyName) {
        throw new Error('Company name is missing from tenant data.');
      }

      const currentDate = dayjs().format('MMMM DD, YYYY');
      const currentMonth = dayjs(activeMonth.startDate).format('MMMM');
      const refNumber = `${tenant.companyName.toUpperCase().slice(0, 2)}/FIN/${dayjs().format('DDMMYY')}/001`;

      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let y = 15;

      // Get the logo data
      const logoUrl = tenant.logo || '';

      const imageResult = await getImageAsDataUri(logoUrl);

      // Load image to get dimensions for aspect ratio
      let logoLoaded = false;
      let logoHeight = 0;
      if (imageResult?.data) {
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Image loading timeout'));
            }, 10000);

            img.onload = () => {
              clearTimeout(timeout);
              resolve(null);
            };
            img.onerror = (error) => {
              clearTimeout(timeout);
              reject(error);
            };
            img.src = imageResult.data;
          });

          const maxWidth = 15;
          const aspectRatio = img.width / img.height;
          const logoWidth = maxWidth;
          logoHeight = logoWidth / aspectRatio;

          doc.addImage(
            imageResult.data,
            imageResult.format,
            15,
            y,
            logoWidth,
            logoHeight,
          );
          logoLoaded = true;
        } catch (error) {
          logoLoaded = false;
        }
      }

      // Date and Reference Number (top right)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`Date: ${currentDate}`, pageWidth - 15, y, {
        align: 'right',
      });
      doc.text(`Ref: ${refNumber}`, pageWidth - 15, y + 6, {
        align: 'right',
      });

      // Adjust Y position for "To:" section
      if (logoLoaded) {
        y = Math.max(y + logoHeight + 8, 30);
      } else {
        y = 30;
      }

      // "To:" section
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('To: Enat Bank', 15, y);
      y += 6;

      // Branch address
      doc.text(`Mexico Derartu Tulu branch`, 15, y);
      y += 10;

      // Subject line (centered, blue)
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(54, 54, 240);
      const subjectText = `Subject: ${currentMonth} Salary Transfer Request`;
      const subjectWidth = doc.getTextWidth(subjectText);
      const subjectX = (pageWidth - subjectWidth) / 2;
      doc.text(subjectText, subjectX, y);
      y += 10;

      // Body paragraphs
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(68, 68, 68);

      // First paragraph
      const paragraph1 = `We hereby authorize your branch to transfer ETB ${numericAmount?.toLocaleString()} for the month of ${currentMonth} for employee salary net payment listed in the attached table from our account to the respective account mentioned with the listed branch of Enat Bank.`;

      const textWidth = 180;
      const lines1 = doc.splitTextToSize(paragraph1, textWidth);
      doc.text(lines1, 15, y);
      y += lines1.length * 6;

      // Second paragraph
      const paragraph2 = `Please deduct the transfer service charges from ${tenant.companyName} account 0061101660052002 maintained at Mexico Derartu Tulu branch.`;
      const lines2 = doc.splitTextToSize(paragraph2, textWidth);
      doc.text(lines2, 15, y);
      y += lines2.length * 6 + 8;

      // Sincerely
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Sincerely', 15, y);
      y += 10;

      // Signature line
      doc.setDrawColor(203, 213, 224);
      doc.setLineWidth(0.5);
      doc.line(15, y, pageWidth - 15, y);
      y += 10;

      // Name field
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const nameLabel = 'Name';
      const nameTextY = y - 2;
      doc.text(nameLabel, 15, nameTextY);

      const nameLineStartX = 15;
      const nameLineEndX = nameLineStartX + 100;
      const nameLineY = y;

      doc.setDrawColor(203, 213, 224);
      doc.setLineWidth(0.5);
      doc.line(nameLineStartX, nameLineY, nameLineEndX, nameLineY);
      y += 8;

      // Email field
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const emailLabel = 'Email';
      const emailTextY = y - 2;
      doc.text(emailLabel, 15, emailTextY);

      const emailLineStartX = 15;
      const emailLineEndX = emailLineStartX + 100;
      const emailLineY = y;

      doc.setDrawColor(203, 213, 224);
      doc.setLineWidth(0.5);
      doc.line(emailLineStartX, emailLineY, emailLineEndX, emailLineY);

      // Save the PDF
      const sanitizedCompanyName = tenant.companyName
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();
      doc.save(`${sanitizedCompanyName}_bank_letter.pdf`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to generate bank letter: ${errorMessage}`);
    }
  };

  return { generateBankLetter };
};
