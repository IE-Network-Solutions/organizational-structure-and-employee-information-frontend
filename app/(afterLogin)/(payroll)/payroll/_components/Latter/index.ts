export const useGenerateBankLetter = () => {
  const generateBankLetter = (amount: number, dynamicData: any) => {
    const bankLetterContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
          <head><title>Bank Letter</title></head>
          <body>
            <p style="text-align: right;">P.O.Box 122321 Addis Ababa Ethiopia</p>
            <p style="text-align: right;">info@ienetworksolutions.com</p>
            <p style="text-align: right;">www.ienetworksolutions.com</p>
            <br/>
            <p>Date: ${dynamicData.date}</p>
            <p>Ref: ${dynamicData.reference}</p>
            <br/>
            <p>To: - ${dynamicData.bankName}</p>
            <p>${dynamicData.branch}</p>
            <p>Addis Ababa</p>
            <br/>
            <p><b>Subject:</b> ${dynamicData.month} Salary Transfer Request</p>
            <br/>
            <p>
              We hereby authorize your branch to transfer ETB ${amount} (${dynamicData.amountWords}) for the month of ${dynamicData.month} 
              for employee salary net payment listed in the attached table from our account to the respective account mentioned with the listed branch 
              of ${dynamicData.bankName}.
            </p>
            <p>
              Please deduct the transfer service charges from IE Network Solutions PLC account ${dynamicData.accountNumber} maintained at ${dynamicData.branch}.
            </p>
            <br/>
            <p>Sincerely</p>
            <br/><br/><br/>
            <p>IE Network Solutions PLC</p>
            <p>
              T: +251(0) 115 570544   |   M: +251(0) 911 511275 / +251(0) 911 210654 / +251(0) 930 105789   |   F: +251(0) 115 57 05 4
            </p>
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
