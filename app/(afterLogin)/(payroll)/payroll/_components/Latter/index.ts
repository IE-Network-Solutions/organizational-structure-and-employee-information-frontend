import { IE_LOGO_BASE64 } from '@/public/image/bankLetterImages';
import { useGetTenant } from '@/store/server/features/employees/authentication/queries';
import { useGetActiveMonth } from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  ImageRun,
  Header,
  Footer,
} from 'docx';
import { saveAs } from 'file-saver';

const getBase64FromUrl = async (url: string): Promise<string> => {
  try {
    if (!url) {
      return IE_LOGO_BASE64;
    }
    // If it's already base64 data, return it
    if (url.startsWith('data:image/')) {
      return url.split(',')[1]; // Return just the base64 part without the data URI prefix
    }

    // If it's a URL, fetch and convert to base64
    const response = await fetch(url);
    if (!response.ok) {
      return IE_LOGO_BASE64.split(',')[1]; // Return fallback without data URI prefix
    }

    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Return just the base64 part
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return IE_LOGO_BASE64.split(',')[1]; // Return fallback without data URI prefix
  }
};

export const useGenerateBankLetter = () => {
  const { data: tenant } = useGetTenant();
  const { data: activeMonth } = useGetActiveMonth();

  const generateBankLetter = async (amount: number) => {
    if (!tenant || !activeMonth) {
      throw new Error('Tenant data not available');
    }

    const currentDate = dayjs().format('MMMM DD, YYYY');
    const currentMonth = dayjs(activeMonth.startDate).format('MMMM');

    // Get the logo data
    let logoBase64 = '';
    if (tenant.logo) {
      logoBase64 = await getBase64FromUrl(tenant.logo);
    } else {
      logoBase64 = IE_LOGO_BASE64.split(',')[1]; // Use fallback if no logo
    }

    // Create document
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: 'Times New Roman',
            },
          },
        },
      },
      sections: [
        {
          properties: {},
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: logoBase64
                    ? [
                        new ImageRun({
                          data: Buffer.from(logoBase64, 'base64'),
                          transformation: {
                            width: 120,
                            height: 120,
                          },
                          type: 'png',
                        }),
                      ]
                    : [],
                  alignment: AlignmentType.LEFT,
                  spacing: {
                    after: 200,
                  },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: tenant.companyName,
                      bold: true,
                      size: 24,
                      font: 'Times New Roman',
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${tenant.address || `${tenant.region}, ${tenant.country}`}`,
                      size: 20,
                      font: 'Times New Roman',
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: tenant.companyEmail,
                      size: 20,
                      font: 'Times New Roman',
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: tenant.domainUrl,
                      size: 20,
                      font: 'Times New Roman',
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                // Blue bar
                new Paragraph({
                  children: [],
                  alignment: AlignmentType.CENTER,
                  shading: {
                    fill: '#46b8ec', // blue color
                    type: 'clear',
                  },
                  spacing: { after: 200 },
                }),
                // Company name centered and bold
                new Paragraph({
                  children: [
                    new TextRun({
                      text: tenant.companyName,
                      bold: true,
                      size: 28,
                      font: 'Times New Roman',
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 200 },
                }),
                // Contact info row
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'T:',
                      bold: true,
                      color: '3498DB',
                      size: 24,
                      font: 'Times New Roman',
                    }),
                    new TextRun({
                      text: ` ${tenant.phoneNumber}  `,
                      size: 24,
                      font: 'Times New Roman',
                    }),
                    new TextRun({
                      text: '|',
                      color: '6EC6F7',
                      size: 24,
                      font: 'Times New Roman',
                    }),
                    new TextRun({
                      text: '  M:',
                      bold: true,
                      color: '3498DB',
                      size: 24,
                      font: 'Times New Roman',
                    }),
                    new TextRun({
                      text: ` ${tenant.contactPersonPhoneNumber} / ${tenant.contactPersonAltPhoneNumber || ''} / ${tenant.contactPersonAltPhoneNumber2 || ''}  `,
                      size: 24,
                      font: 'Times New Roman',
                    }),
                    new TextRun({
                      text: '|',
                      color: '6EC6F7',
                      size: 24,
                      font: 'Times New Roman',
                    }),
                    new TextRun({
                      text: '  F:',
                      bold: true,
                      color: '3498DB',
                      size: 24,
                      font: 'Times New Roman',
                    }),
                    new TextRun({
                      text: ` ${tenant.faxNumber || tenant.phoneNumber}`,
                      size: 24,
                      font: 'Times New Roman',
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 200 },
                }),
              ],
            }),
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Date: ${currentDate}`,
                  size: 24,
                  font: 'Times New Roman',
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Ref: ${tenant.companyName.toUpperCase().slice(0, 2)}/FIN/${dayjs().format('DDMMYY')}/001`,
                  size: 24,
                  font: 'Times New Roman',
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'To: - Enat Bank',
                  size: 24,
                  font: 'Times New Roman',
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Mexico Derartu Tulu branch\n${tenant.region}, ${tenant.country}`,
                  size: 24,
                  font: 'Times New Roman',
                }),
              ],
              spacing: {
                after: 600,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Subject: ${currentMonth} Salary Transfer Request`,
                  bold: true,
                  underline: {},
                  size: 24,
                  font: 'Times New Roman',
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `We hereby authorize your branch to transfer ETB ${amount.toFixed(2)} for the month of ${currentMonth} for employee salary net payment listed in the attached table from our account to the respective account mentioned with the listed branch of Enat Bank.`,
                  size: 24,
                  font: 'Times New Roman',
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Please deduct the transfer service charges from ${tenant.companyName} account 0061101660052002 maintained at Mexico Derartu Tulu branch.`,
                  size: 24,
                  font: 'Times New Roman',
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Sincerely',
                  size: 24,
                  font: 'Times New Roman',
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: tenant.companyName,
                  bold: true,
                  size: 24,
                  font: 'Times New Roman',
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: tenant.contactPersonName,
                  size: 24,
                  font: 'Times New Roman',
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: tenant.contactPersonEmail,
                  size: 24,
                  font: 'Times New Roman',
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
          ],
        },
      ],
    });

    // Generate and save the document
    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    saveAs(blob, `${tenant.companyName}_Bank_Letter.docx`);
  };

  return { generateBankLetter };
};
