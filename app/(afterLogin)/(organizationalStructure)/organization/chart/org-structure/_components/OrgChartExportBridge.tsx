'use client';

import React, { useEffect, useRef } from 'react';
import { useChartRef, useChartExportActionsRef } from '../../layout';
import { useReactFlowExport } from '@/hooks/export';

/**
 * Must be rendered inside <ReactFlow> so that useReactFlow() is available.
 * Registers downloadPNG / downloadPDF with the layout so the Download dropdown can trigger them.
 */
export function OrgChartExportBridge() {
  const chartRef = useChartRef();
  const exportActionsRef = useChartExportActionsRef();
  const api = useReactFlowExport(chartRef);
  const apiRef = useRef(api);

  apiRef.current = api;

  useEffect(() => {
    exportActionsRef.current = {
      downloadPNG: () => apiRef.current.downloadPNG(),
      downloadPDF: () => apiRef.current.downloadPDF(),
      exportFullView: () => apiRef.current.exportFullView(),
      loading: apiRef.current.loading,
    };
    return () => {
      exportActionsRef.current = null;
    };
  }, [exportActionsRef]);

  // Keep loading in sync for consumers that read the ref
  useEffect(() => {
    if (exportActionsRef.current) {
      exportActionsRef.current.loading = api.loading;
    }
  }, [api.loading, exportActionsRef]);

  return null;
}
