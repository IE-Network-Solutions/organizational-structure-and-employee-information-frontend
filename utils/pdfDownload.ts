import jsPDF from "jspdf";

// Interface defining styles for title and paragraphs
interface Style {
    titlefontSize: number;
    titlecolor: string;
    paragraphfontSize: number;
    paragraphcolor: string;
}

// Interface for the table structure
interface Table {
    title: string;
    paragraph: string;
    header: string[];
    rows: Array<Array<string | number>>;
    colWidths: number[];
    style: Style;
}

// Interface for the opening section of the document
interface Opening {
    header: {
        companyName: string;
        address: string;
        phoneNumber: string;
        companyEmail: string;
    };
    pageTitle: string;
    pageParagraph: string;
    style: Style;
}

// Function to generate and download the PDF report
export const handlePDFDownload = (
    opening: Opening,
    tables: Table[],
    downloadFileName: string
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const bottomMargin = 30;
    const lineHeight = 10;
    let y = margin;
    let pageNumber = 1;

    // Function to add page number to the footer
    const addPageNumber = () => {
        doc.saveGraphicsState();
        doc.setFontSize(10);
        doc.setTextColor('#000000');
        doc.text(`Page ${pageNumber}`, pageWidth - margin - 20, pageHeight - margin - 5);
        doc.restoreGraphicsState();
    };

    // Function to add a new page if needed based on required height
    const addNewPageIfNeeded = (requiredHeight: number) => {
        if (y + requiredHeight > pageHeight) {
            addPageNumber();
            pageNumber++;
            doc.addPage();
            y = margin;
        }
    };

    // Function to draw a paragraph with proper line breaks
    const drawParagraph = (text: string) => {
        const paragraphLines = doc.splitTextToSize(text, pageWidth - margin * 2);

        paragraphLines.forEach((line: any) => {
            addNewPageIfNeeded(bottomMargin);
            doc.text(line, margin, y);
            y += lineHeight;
        });

        y += lineHeight;
    };

    // Function to draw a table with headers and rows
    const drawTable = (header: string[], rows: Array<Array<string | number>>, colWidths: number[]) => {
        addNewPageIfNeeded(bottomMargin);
        const rowHeight = 10;
        const tableStartX = margin;
        const tableEndX = pageWidth - margin;

        // Draw Table Header
        doc.setFontSize(10);
        doc.setTextColor('#ffffff');
        doc.setFillColor('#4da6ff');
        doc.rect(tableStartX, y, tableEndX - tableStartX, rowHeight, 'F');

        let currentX = tableStartX;
        header.forEach((headerItem, index) => {
            doc.text(headerItem, currentX + 2, y + 7);
            currentX += colWidths[index];
        });
        y += rowHeight;

        // Draw Table Rows
        doc.setTextColor('#444444');
        rows.forEach((row: Array<string | number>) => {
            const rowData = header.reduce((acc, headerValue, index) => {
                acc[headerValue] = row[index];
                return acc;
            }, {} as Record<string, string | number>);

            addNewPageIfNeeded(bottomMargin);

            currentX = tableStartX;
            header.forEach((headerItem, colIndex) => {
                let cellText = rowData[headerItem];

                // Handle truncation for string cells
                if (typeof cellText === 'string') {
                    if (cellText.length > 25) {
                        cellText = cellText.substring(0, 25) + '...';
                    }
                } else {
                    cellText = `${cellText}`;
                }

                // Wrap cell text to fit within column width
                const cellTextWrapped = doc.splitTextToSize(cellText as string, colWidths[colIndex] - 4);

                // Draw cell text, handling multiple lines if needed
                cellTextWrapped.forEach((line: any, lineIndex: number) => {
                    doc.text(line, currentX + 2, y + 7 + (lineIndex * 10));
                });

                currentX += colWidths[colIndex];
            });

            // Draw Row Border
            doc.setDrawColor(200);
            doc.line(tableStartX, y, tableEndX, y);
            doc.line(tableStartX, y + rowHeight, tableEndX, y + rowHeight);

            y += rowHeight;
        });

        y += lineHeight + 10;
    };

    // Function to draw the opening section (header and paragraph)
    const drawOpening = () => {
        const { header, pageTitle, pageParagraph } = opening;

        // Header
        doc.setFontSize(16);
        doc.setTextColor('#4da6ff');
        const companyNameWidth = doc.getTextWidth(header.companyName);
        doc.text(header.companyName, pageWidth - margin - companyNameWidth, y);
        y += lineHeight;

        doc.setFontSize(12);
        const addressWidth = doc.getTextWidth(header.address);
        doc.text(header.address, pageWidth - margin - addressWidth, y);
        y += lineHeight;

        const phoneNumberWidth = doc.getTextWidth(header.phoneNumber);
        doc.text(header.phoneNumber, pageWidth - margin - phoneNumberWidth, y);
        y += lineHeight;

        const companyEmailWidth = doc.getTextWidth(header.companyEmail);
        doc.text(header.companyEmail, pageWidth - margin - companyEmailWidth, y);
        y += lineHeight;

        // Draw a line separating the header from the title
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += lineHeight + 5;

        // Title
        doc.setFontSize(opening.style.titlefontSize);
        doc.setTextColor(opening.style.titlecolor);
        const titleWidth = doc.getTextWidth(pageTitle);
        const titleX = (pageWidth - titleWidth) / 2;
        doc.text(pageTitle, titleX, y);
        y += lineHeight + 5;

        // Opening Paragraph
        doc.setFontSize(opening.style.paragraphfontSize);
        doc.setTextColor(opening.style.paragraphcolor);
        drawParagraph(pageParagraph);
    };

    // Add Opening Header
    drawOpening();

    // Iterate through all tables and add them to the PDF
    tables.forEach((table, index) => {
        addNewPageIfNeeded(bottomMargin);
        const { title, paragraph, header, rows, colWidths } = table;

        // Add Section Title
        doc.setFontSize(table.style.titlefontSize);
        doc.setTextColor(table.style.titlecolor);
        doc.text(`${title}`, margin, y);
        y += lineHeight;

        // Add Paragraph
        doc.setFontSize(table.style.paragraphfontSize);
        doc.setTextColor(table.style.paragraphcolor);
        if (paragraph) {
            drawParagraph(paragraph);
        }

        // Draw Table
        drawTable(header, rows, colWidths);

        if (index < tables.length - 1) {
            addNewPageIfNeeded(bottomMargin);
        }
    });

    // Footer with page number
    addPageNumber();

    // Save the PDF to the specified file
    doc.save(downloadFileName);
};