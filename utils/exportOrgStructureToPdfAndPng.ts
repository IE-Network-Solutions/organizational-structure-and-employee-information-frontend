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
    // Find the TransformComponent wrapper that contains transforms from react-zoom-pan-pinch
    let transformComponent: HTMLElement | null = null;
    let savedTransform = '';
    let savedTransition = '';

    // Traverse up the DOM to find the transform wrapper
    // react-zoom-pan-pinch applies transforms to the TransformComponent's wrapper div
    let parent: HTMLElement | null = input.parentElement;
    while (parent && parent !== document.body) {
      // Check if this element has a transform applied (either inline style or computed)
      const computedStyle = window.getComputedStyle(parent);
      const inlineTransform = parent.style.transform;

      // If there's a transform (either inline or computed), this is likely the transform wrapper
      if (
        (inlineTransform && inlineTransform !== 'none') ||
        (computedStyle.transform && computedStyle.transform !== 'none')
      ) {
        transformComponent = parent;
        // Save the current transform state
        savedTransform = inlineTransform || '';
        savedTransition = parent.style.transition || '';
        break;
      }
      parent = parent.parentElement;
    }

    // Reset transform to scale 1 and position 0,0 for full chart capture
    if (transformComponent) {
      transformComponent.style.transform = 'translate(0px, 0px) scale(1)';
      transformComponent.style.transition = 'none';
    }

    input.style.overflow = 'visible';

    // Wait a brief moment for the transform to apply
    await new Promise((resolve) => setTimeout(resolve, 100));

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

    // Restore the original transform state
    if (transformComponent) {
      if (savedTransform) {
        transformComponent.style.transform = savedTransform;
      } else {
        transformComponent.style.transform = '';
      }
      transformComponent.style.transition = savedTransition;
    }

    input.style.overflow = '';
    setChartDonwnloadLoading(false);
  }
};
