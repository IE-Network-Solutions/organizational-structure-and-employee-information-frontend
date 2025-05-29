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
  BorderStyle,
  ImageRun,
  Header,
  Footer,
  PageNumber,
} from 'docx';
import { saveAs } from 'file-saver';

const getBase64FromUrl = async (): Promise<string> => {
  try {
    return IE_LOGO_BASE64;
  } catch (error) {
    return '';
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
      logoBase64 = await getBase64FromUrl();
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
                  children: [
                    new ImageRun({
                      data: logoBase64,
                      type: 'png',
                      transformation: {
                        width: 100,
                        height: 100,
                      },
                    }),
                  ],
                  alignment: AlignmentType.LEFT,
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
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `T: ${tenant.phoneNumber} | M: ${tenant.contactPersonPhoneNumber} | F: ${tenant.phoneNumber}`,
                      size: 20,
                      font: 'Times New Roman',
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  border: {
                    top: {
                      color: '1E40AF',
                      space: 8,
                      style: BorderStyle.SINGLE,
                      size: 16,
                    },
                  },
                  shading: {
                    fill: '0EA5E9',
                    type: 'clear',
                  },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Page `,
                      font: 'Times New Roman',
                    }),
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      font: 'Times New Roman',
                    }),
                    new TextRun({
                      text: ` of `,
                      font: 'Times New Roman',
                    }),
                    new TextRun({
                      children: [PageNumber.TOTAL_PAGES],
                      font: 'Times New Roman',
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
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
