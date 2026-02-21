'use client';

import { useCallback, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { message } from 'antd';
import useOrganizationStore from '@/store/uistate/features/organizationStructure/orgState';

const FIT_VIEW_PADDING = 0.2;
const FIT_VIEW_DELAY_MS = 400;
/** Higher ratio = sharper text and images when zoomed in (5 = extra clarity for zoomed viewing) */
const PIXEL_RATIO = 5;
const PNG_FILENAME = 'org-structure.png';
const PDF_FILENAME = 'org-structure.pdf';
const A4_LANDSCAPE = { w: 297, h: 210 }; // mm

export type UseReactFlowExportApi = {
  downloadPNG: () => Promise<void>;
  downloadPDF: () => Promise<void>;
  exportFullView: () => Promise<void>;
  loading: boolean;
};

function isSSR(): boolean {
  return typeof window === 'undefined';
}

/**
 * Reusable hook for exporting React Flow org chart as high-quality PNG and PDF.
 * Must be used inside a component that is a child of <ReactFlow> (uses useReactFlow()).
 *
 * @param wrapperRef - Ref to the div that wraps the React Flow container (used to find .react-flow__viewport).
 * @returns { downloadPNG, downloadPDF, exportFullView, loading }
 */
export function useReactFlowExport(
  wrapperRef: React.RefObject<HTMLDivElement | null>,
): UseReactFlowExportApi {
  const { fitView } = useReactFlow();
  const [loading, setLoading] = useState(false);

  const setChartDownloadLoading = useCallback((value: boolean) => {
    try {
      useOrganizationStore.getState().setChartDonwnloadLoading(value);
    } catch {
      // store not available
    }
  }, []);

  // Capture the full chart container (what the user sees), not the viewport inner node,
  // so we don't override or lose the viewport transform.
  const getCaptureElement = useCallback((): HTMLElement | null => {
    if (isSSR() || !wrapperRef?.current) return null;
    const flowRoot =
      wrapperRef.current.querySelector<HTMLElement>('.react-flow');
    return flowRoot ?? wrapperRef.current;
  }, [wrapperRef]);

  const exportFullView = useCallback(async (): Promise<void> => {
    if (isSSR()) return;
    try {
      await fitView({ padding: FIT_VIEW_PADDING, duration: 0 });
      await new Promise((resolve) => setTimeout(resolve, FIT_VIEW_DELAY_MS));
      // Wait for paint so the viewport transform is applied before capture
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
    } catch (err) {
      console.error('[useReactFlowExport] exportFullView:', err);
    }
  }, [fitView]);

  const downloadPNG = useCallback(async (): Promise<void> => {
    if (isSSR()) return;
    const el = getCaptureElement();
    if (!el) return;

    setLoading(true);
    setChartDownloadLoading(true);

    try {
      await exportFullView();

      const dataUrl = await toPng(el, {
        pixelRatio: PIXEL_RATIO,
        cacheBust: true,
        backgroundColor: '#ffffff',
        filter: (node) => {
          const n = node as HTMLElement;
          if (n.classList?.contains('hide-on-download')) return false;
          return true;
        },
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = PNG_FILENAME;
      link.style.position = 'absolute';
      link.style.left = '-9999px';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('PNG download started.');
    } catch (err) {
      console.error('[useReactFlowExport] downloadPNG:', err);
      message.error('Export failed. Please try again.');
    } finally {
      setLoading(false);
      setChartDownloadLoading(false);
    }
  }, [getCaptureElement, exportFullView, setChartDownloadLoading]);

  const downloadPDF = useCallback(async (): Promise<void> => {
    if (isSSR()) return;
    const el = getCaptureElement();
    if (!el) return;

    setLoading(true);
    setChartDownloadLoading(true);

    try {
      await exportFullView();

      const dataUrl = await toPng(el, {
        pixelRatio: PIXEL_RATIO,
        cacheBust: true,
        backgroundColor: '#ffffff',
        filter: (node) => {
          const n = node as HTMLElement;
          if (n.classList?.contains('hide-on-download')) return false;
          return true;
        },
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageW = A4_LANDSCAPE.w;
      const pageH = A4_LANDSCAPE.h;
      const margin = 10;
      const maxW = pageW - 2 * margin;
      const maxH = pageH - 2 * margin;

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const scale = Math.min(maxW / imgW, maxH / imgH, 1);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const x = (pageW - drawW) / 2;
      const y = (pageH - drawH) / 2;

      pdf.addImage(dataUrl, 'PNG', x, y, drawW, drawH);
      pdf.save(PDF_FILENAME);
      message.success('PDF download started.');
    } catch (err) {
      console.error('[useReactFlowExport] downloadPDF:', err);
      message.error('Export failed. Please try again.');
    } finally {
      setLoading(false);
      setChartDownloadLoading(false);
    }
  }, [getCaptureElement, exportFullView, setChartDownloadLoading]);

  return {
    downloadPNG,
    downloadPDF,
    exportFullView,
    loading,
  };
}
