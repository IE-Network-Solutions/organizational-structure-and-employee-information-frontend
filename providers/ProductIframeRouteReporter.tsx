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

export default function ProductIframeRouteReporter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSentRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;

    const path = buildCurrentPath();
    if (!path || path === lastSentRef.current) return;

    const message: ProductRouteMessage = {
      type: "selamnew:product-route",
      path,
      title: document.title || undefined,
    };

    window.parent.postMessage(message, window.location.origin);
    lastSentRef.current = path;
  }, [pathname, searchParams]);

  return null;
}