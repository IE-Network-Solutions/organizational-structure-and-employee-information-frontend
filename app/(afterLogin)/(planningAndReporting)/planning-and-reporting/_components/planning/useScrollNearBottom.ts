import { useEffect, type RefObject } from 'react';

export function useScrollNearBottom(
  containerRef: RefObject<HTMLElement | null>,
  scrollSelector: string,
  onNearBottom: () => void,
  enabled: boolean,
  threshold = 64,
) {
  useEffect(() => {
    if (!enabled) return;
    const root = containerRef.current;
    if (!root) return;
    const scrollEl = root.querySelector(scrollSelector) as HTMLElement | null;
    if (!scrollEl) return;

    const handleScroll = () => {
      if (
        scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight <
        threshold
      ) {
        onNearBottom();
      }
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, [containerRef, scrollSelector, onNearBottom, enabled, threshold]);
}

export function useAutoFillScrollContainer(
  containerRef: RefObject<HTMLElement | null>,
  scrollSelector: string,
  onNearBottom: () => void,
  enabled: boolean,
  contentLength: number,
) {
  useEffect(() => {
    if (!enabled) return;
    const root = containerRef.current;
    if (!root) return;
    const scrollEl = root.querySelector(scrollSelector) as HTMLElement | null;
    if (!scrollEl) return;

    if (scrollEl.scrollHeight <= scrollEl.clientHeight + 1) {
      onNearBottom();
    }
  }, [containerRef, scrollSelector, onNearBottom, enabled, contentLength]);
}
