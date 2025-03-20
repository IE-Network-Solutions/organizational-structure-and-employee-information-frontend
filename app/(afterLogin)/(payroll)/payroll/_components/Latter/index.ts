import { IE_LOGO_BASE64 } from '@/public/image/bankLetterImages';
import dayjs from 'dayjs';

export const useGenerateBankLetter = () => {
  const generateBankLetter = (amount: number) => {
    const currentDate = dayjs().format('MMMM DD, YYYY');
    const currentMonth = dayjs().format('MMMM');

    const bankLetterContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head><title>Bank Letter</title></head>
        <body style="position: relative; padding-bottom: 200px;"> <!-- Add padding for bottom image -->
          <!-- Header Section with Image and Text Side by Side -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <img src="${IE_LOGO_BASE64}" alt="IE Network Solutions Logo" style="width: 100px; height: 100px;" />
            <div style="text-align: right;">
              <p>P.O.Box 122321 Addis Ababa Ethiopia</p>
              <p>info@ienetworksolutions.com</p>
              <p>www.ienetworksolutions.com</p>
            </div>
          </div>
          <br/>
          <p>Date: ${currentDate}</p>
          <p>Ref: IE/FIN/250116/001</p>
          <br/>
          <p>To: - Enat Bank </p>
          <p>Mexico Derartu Tulu branch<br/>
            Addis Ababa</p>
          <br/>
          <p><b>Subject:</b> ${currentMonth} Salary Transfer Request</p>
          <br/>
          <p>
            We hereby authorize your branch to transfer ETB ${amount.toFixed(2)} for the month of ${currentMonth}  
            for employee salary net payment listed in the attached table from our account to the respective account mentioned with the listed branch 
            of Enat Bank.
          </p>
          <p>
            Please deduct the transfer service charges from IE Network Solutions PLC account 0061101660052002 maintained at Mexico Derartu Tulu branch.
          </p>
          <br/>
          <p>Sincerely</p>
          <br/><br/><br/>
          <p>IE Network Solutions PLC</p>
          <p>
            T: +251(0) 115 570544   |   M: +251(0) 911 511275 / +251(0) 911 210654 / +251(0) 930 105789   |   F: +251(0) 115 57 05 4
          </p>
          <br/>
        </body>
      </html>
    `;

    const blob = new Blob([bankLetterContent], {
      type: 'application/msword',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Bank_Letter.doc';
    link.click();
  };

  return { generateBankLetter };
};
