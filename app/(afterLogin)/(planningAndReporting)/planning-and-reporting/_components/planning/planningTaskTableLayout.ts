import { useEffect, useState, type RefObject } from 'react';

/** Hide horizontal scrollbars; allow vertical scroll inside Ant table body. */
export const PLANNING_TASK_TABLE_CLASS =
  'planning-tasks-table w-full min-w-0 overflow-hidden [&_.ant-table-wrapper]:!min-w-0 [&_.ant-table]:!min-w-0 [&_.ant-table-container]:!min-w-0 [&_.ant-table-content]:!overflow-x-hidden [&_.ant-table-body]:!overflow-x-hidden [&_.ant-table-content]:[-ms-overflow-style:none] [&_.ant-table-content]:[scrollbar-width:none] [&_.ant-table-body]:[-ms-overflow-style:none] [&_.ant-table-body]:[scrollbar-width:none] [&_.ant-table-content::-webkit-scrollbar]:hidden [&_.ant-table-body::-webkit-scrollbar]:hidden';

/** Max body height for task tables embedded in plan cards (grouped view). */
export const PLAN_CARD_TASK_TABLE_MAX_BODY_PX = 320;

export function planCardTaskTableScrollY(rowCount: number): number | undefined {
  if (rowCount <= 6) return undefined;
  return PLAN_CARD_TASK_TABLE_MAX_BODY_PX;
}

export function usePlanningTaskTableScrollY(
  containerRef: RefObject<HTMLElement | null>,
  headerOffset = 56,
  minBody = 160,
): number | undefined {
  const [scrollY, setScrollY] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setScrollY(Math.max(el.clientHeight - headerOffset, minBody));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [containerRef, headerOffset, minBody]);

  return scrollY;
}
