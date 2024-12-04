import useOrganizationStore from '@/store/uistate/features/organizationStructure/orgState';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDFOrJPEG = async (
  chartRef: React.RefObject<HTMLDivElement>,
  isPdf: boolean = false,
) => {
  const { setChartDonwnloadLoading } = useOrganizationStore.getState();
  setChartDonwnloadLoading(true);

  const input = chartRef.current;

  if (input) {
    input.style.overflow = 'visible';
    const canvas = await html2canvas(input, {
      scale: 1,
      useCORS: true,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      width: input.scrollWidth + 100,
      height: input.scrollHeight + 100,
      ignoreElements: (element) =>
        element.classList.contains('hide-on-download'),
    });

    const imgData = canvas.toDataURL('image/png');

    if (isPdf) {
      // Export as PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Organization_chart_${Date.now()}.pdf`);
    } else {
      // Export as JPEG
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Organization_chart_${Date.now()}.jpeg`;
      link.click();
    }

    input.style.overflow = '';
    setChartDonwnloadLoading(false);
  }
};
