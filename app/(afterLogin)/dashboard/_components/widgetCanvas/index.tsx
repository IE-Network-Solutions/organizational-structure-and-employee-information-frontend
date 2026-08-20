'use client';

import dynamic from 'next/dynamic';
import { DashboardPlanContext } from './registry';
import WidgetCatalog from './WidgetCatalog';
import type { DashboardPlanView } from './types';

const GridCanvas = dynamic(() => import('./GridCanvas'), { ssr: false });

interface WidgetCanvasProps {
  plan: DashboardPlanView;
}

const WidgetCanvas = ({ plan }: WidgetCanvasProps) => {
  return (
    <DashboardPlanContext.Provider value={plan}>
      <div data-cy="dashboard-widget-canvas">
        <GridCanvas plan={plan} />
        <WidgetCatalog plan={plan} />
      </div>
    </DashboardPlanContext.Provider>
  );
};

export default WidgetCanvas;
