'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// A minimal, Basecamp-like top loader that appears when navigation takes a moment.
// Delays showing to avoid flicker on fast transitions, and ensures a smooth hide.
export default function RouteTopLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const timerRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const navigatingRef = useRef(false);
    const waitingForIdleRef = useRef(false);

    // Patch history methods to emit navigation start, capture link clicks and back/forward.
    useEffect(() => {
        const NAV_EVENT = '__route_loader_start';

        const dispatchStart = () => {
            // Avoid retrigger if already navigating
            if (navigatingRef.current) return;
            navigatingRef.current = true;

            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (timerRef.current) window.clearTimeout(timerRef.current);

            // Delay before showing to avoid flash on instant transitions
            timerRef.current = window.setTimeout(() => {
                setVisible(true);
                setProgress(0);

                const start = performance.now();
                const animate = (now: number) => {
                    const elapsedMs = now - start;
                    const eased = 0.85 - 0.85 * Math.exp(-elapsedMs / 600);
                    setProgress((prev) => Math.max(prev, eased));
                    rafRef.current = requestAnimationFrame(animate);
                };
                rafRef.current = requestAnimationFrame(animate);
            }, 120);
        };

        // Monkey-patch history methods
        const originalPush = history.pushState.bind(history) as (
            data: any,
            unused: string,
            url?: string | URL | null,
        ) => void;
        const originalReplace = history.replaceState.bind(history) as (
            data: any,
            unused: string,
            url?: string | URL | null,
        ) => void;
        if (!(window as any).__routeLoaderPatched) {
            (window as any).__routeLoaderPatched = true;
            history.pushState = ((
                data: any,
                unused: string,
                url?: string | URL | null,
            ) => {
                originalPush(data, unused, url);
                window.dispatchEvent(new Event(NAV_EVENT));
            }) as History['pushState'];
            history.replaceState = ((
                data: any,
                unused: string,
                url?: string | URL | null,
            ) => {
                originalReplace(data, unused, url);
                window.dispatchEvent(new Event(NAV_EVENT));
            }) as History['replaceState'];
        }

        const onNavStart = () => dispatchStart();
        const onPopState = () => dispatchStart();
        const onDocumentClick = (e: MouseEvent) => {
            if (e.defaultPrevented) return;
            if (e.button !== 0) return; // left click only
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const target = e.target as HTMLElement | null;
            if (!target) return;
            const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
            if (!anchor) return;
            const url = new URL(anchor.href, window.location.href);
            const isSameOrigin = url.origin === window.location.origin;
            const isNewTab = anchor.target && anchor.target !== '_self';
            if (!isSameOrigin || isNewTab) return;
            // Ignore hash-only changes
            if (
                url.pathname === window.location.pathname &&
                url.search === window.location.search &&
                url.hash !== window.location.hash
            )
                return;
            // Likely SPA navigation via next/link
            dispatchStart();
        };

        window.addEventListener(NAV_EVENT, onNavStart);
        window.addEventListener('popstate', onPopState);
        document.addEventListener('click', onDocumentClick, { capture: true });

        return () => {
            window.removeEventListener(NAV_EVENT, onNavStart);
            window.removeEventListener('popstate', onPopState);
            document.removeEventListener('click', onDocumentClick, {
                capture: true,
            } as any);
        };
    }, []);

    // Track global network busy/idle events from axios client
    useEffect(() => {
        const onBusy = (e: Event) => {
            const detail = (e as CustomEvent).detail as
                | { pending?: number }
                | undefined;
            const pending =
                detail?.pending ??
                (typeof window !== 'undefined'
                    ? (window as any).__pendingNetworkRequests || 0
                    : 0);
            setPendingCount(pending);
        };
        const onIdle = () => {
            setPendingCount(0);
            if (waitingForIdleRef.current) {
                // Finish now that network is idle
                waitingForIdleRef.current = false;
                setProgress(1);
                const done = window.setTimeout(() => {
                    setVisible(false);
                    setProgress(0);
                }, 250);
                return () => window.clearTimeout(done);
            }
        };

        if (typeof window !== 'undefined') {
            // Initialize current count on mount
            setPendingCount((window as any).__pendingNetworkRequests || 0);
            window.addEventListener('__network_busy', onBusy as EventListener);
            window.addEventListener('__network_idle', onIdle as EventListener);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('__network_busy', onBusy as EventListener);
                window.removeEventListener('__network_idle', onIdle as EventListener);
            }
        };
    }, []);

    // When the route has committed (pathname/search changes), complete and hide the bar,
    // but wait until there are no pending network requests.
    useEffect(() => {
        if (!navigatingRef.current) return;
        navigatingRef.current = false;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (timerRef.current) window.clearTimeout(timerRef.current);
        if (pendingCount > 0) {
            // Defer finishing until idle event
            waitingForIdleRef.current = true;
            return;
        }
        setProgress(1);
        const done = window.setTimeout(() => {
            setVisible(false);
            setProgress(0);
        }, 250);
        return () => window.clearTimeout(done);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams?.toString()]);

    return (
        <div
            aria-hidden
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: visible ? 2 : 0,
                background: 'transparent',
                zIndex: 99998,
                pointerEvents: 'none',
                transition: 'height 150ms ease',
            }}
        >
            <div
                className="animate-pulse"
                style={{
                    width: `${Math.round(progress * 100)}%`,
                    height: 2,
                    background:
                        'linear-gradient(90deg, #3636f0 0%, #3636f0 50%, #3636f0 100%)',
                    boxShadow: '0 0 8px #3636f0',
                    transition: 'width 150ms ease',
                }}
            />
        </div>
    );
}
