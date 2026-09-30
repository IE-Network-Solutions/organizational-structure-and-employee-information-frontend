'use client';
import React, { createContext, ReactNode, useContext } from 'react';
import { createPortal } from 'react-dom';

interface BannerActionsContextValue {
  /** True inside the workspace frame, whose banner hosts the page's actions. */
  inBanner: boolean;
  /** Where the actions render: the right end of the banner's tab row. */
  slot: HTMLElement | null;
}

const BannerActionsContext = createContext<BannerActionsContextValue>({
  inBanner: false,
  slot: null,
});

export const BannerActionsProvider = BannerActionsContext.Provider;

/**
 * Whether this page sits under the workspace banner. Page headers use it to
 * drop their own title, breadcrumb and divider: the banner and its tabs
 * already say where the user is.
 */
export const useInBanner = () => useContext(BannerActionsContext).inBanner;

/**
 * Puts a page's header actions (Add, Export, …) in the banner, beside the
 * section tabs. Outside the workspace frame there is no banner, so they render
 * where they are.
 */
export const BannerActions: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { inBanner, slot } = useContext(BannerActionsContext);
  if (!inBanner) return <>{children}</>;
  // The slot mounts with the banner; render nothing until it exists.
  return slot ? createPortal(children, slot) : null;
};
