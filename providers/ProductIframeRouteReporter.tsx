"use client";

import { useEffect, useRef } from "react";

type ProductRouteMessage = {
  type: "selamnew:product-route";
  path: string;
  title?: string;
};

function buildCurrentPath() {
  if (typeof window === "undefined") return "";
  return `${window.location.pathname}${window.location.search}`;
}

/**
 * When Workspace runs inside the Core iframe, report route changes to the parent
 * so Core can mirror them into `/products/{id}#/workspace/...`.
 */
export default function ProductIframeRouteReporter() {
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

      window.parent.postMessage(message, window.location.origin);
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

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", send);
    };
  }, []);

  return null;
}
