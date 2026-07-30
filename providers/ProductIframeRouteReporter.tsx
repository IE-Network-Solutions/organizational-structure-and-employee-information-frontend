"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type ProductRouteMessage = {
  type: "selamnew:product-route";
  path: string;
  title?: string;
};

function buildCurrentPath() {
  if (typeof window === "undefined") return "";
  return `${window.location.pathname}${window.location.search}`;
}

function parentTargetOrigin(): string {
  // Prefer the embedding parent origin; fall back to wildcard so same-site
  // shells still receive the message when origins differ slightly.
  try {
    if (document.referrer) {
      return new URL(document.referrer).origin;
    }
  } catch {
    // ignore
  }
  return "*";
}

/**
 * When Workspace runs inside the Core iframe, report route changes to the parent
 * so Core can mirror them into `/products/{id}#/...`.
 */
export default function ProductIframeRouteReporter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSentRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;

    const send = () => {
      const path = buildCurrentPath();
      if (!path || path === lastSentRef.current) return;

      const message: ProductRouteMessage = {
        type: "selamnew:product-route",
        path,
        title: document.title || undefined,
      };

      window.parent.postMessage(message, parentTargetOrigin());
      lastSentRef.current = path;
    };

    send();

    const wrapHistory =
      (fn: History["pushState"] | History["replaceState"]) =>
      function (this: History, ...args: Parameters<History["pushState"]>) {
        const result = fn.apply(this, args);
        queueMicrotask(send);
        return result;
      };

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = wrapHistory(originalPushState);
    history.replaceState = wrapHistory(originalReplaceState);

    window.addEventListener("popstate", send);
    // Fallback: Next soft-nav can miss history patches in some cases.
    const pollId = window.setInterval(send, 500);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", send);
      window.clearInterval(pollId);
    };
  }, [pathname, searchParams]);

  return null;
}
