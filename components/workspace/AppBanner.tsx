'use client';
import React, { ReactNode, useEffect, useRef } from 'react';
import Link from 'next/link';

export interface AppBannerTab {
  key: string;
  label: ReactNode;
  /** Plain-text name of the tab. */
  title: string;
  href: string;
  disabled?: boolean;
}

/** Plain text of a label node such as `<span data-cy="…">Settings</span>`. */
export const getNodeText = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (React.isValidElement<{ children?: ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }
  return '';
};

/** Route keys contain slashes; keep generated ids and data-cy hooks plain. */
const toIdSegment = (key: string) =>
  key.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');

interface AppBannerProps {
  children: ReactNode;
  dataCy: string;
  className?: string;
}

/**
 * The rounded primary band that heads every page. Home's personal hero and each
 * module's section tabs both sit in it, so the shell reads as one surface.
 */
export const AppBanner: React.FC<AppBannerProps> = ({
  children,
  dataCy,
  className = '',
}) => (
  <section className={`app-banner ${className}`} data-cy={dataCy} id={dataCy}>
    {children}
  </section>
);

interface AppBannerTabsProps {
  tabs: AppBannerTab[];
  activeKey?: string;
  ariaLabel: string;
  /** Prefix for id / data-cy hooks: `home-tabs` → `home-tabs-tab-leave`. */
  idPrefix: string;
  extra?: ReactNode;
  className?: string;
}

/**
 * Tabs along the banner's bottom edge. The active tab takes the page colour so
 * it reads as the top of the content below it. Tabs that do not fit scroll
 * sideways, and the active one is kept in view.
 */
export const AppBannerTabs: React.FC<AppBannerTabsProps> = ({
  tabs,
  activeKey,
  ariaLabel,
  idPrefix,
  extra,
  className = '',
}) => {
  const listRef = useRef<HTMLElement>(null);
  const tabRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    const list = listRef.current;
    const tab = activeKey ? tabRefs.current.get(activeKey) : undefined;
    if (!list || !tab) return;
    // The list is the tabs' offset parent, so offsets are within its scroll.
    if (tab.offsetLeft < list.scrollLeft) {
      list.scrollLeft = tab.offsetLeft;
    } else if (
      tab.offsetLeft + tab.offsetWidth >
      list.scrollLeft + list.clientWidth
    ) {
      list.scrollLeft = tab.offsetLeft + tab.offsetWidth - list.clientWidth;
    }
  }, [activeKey, tabs]);

  return (
    <div
      className={`app-banner-tabs ${className}`}
      data-cy={idPrefix}
      id={idPrefix}
    >
      <nav
        ref={listRef}
        aria-label={ariaLabel}
        className="app-banner-tabs-list"
        data-cy={`${idPrefix}-list`}
        id={`${idPrefix}-list`}
      >
        {tabs.map((tab) => {
          const tabId = `${idPrefix}-tab-${toIdSegment(tab.key)}`;
          const setTabRef = (element: HTMLElement | null) => {
            if (element) tabRefs.current.set(tab.key, element);
            else tabRefs.current.delete(tab.key);
          };

          if (tab.disabled) {
            return (
              <span
                key={tab.key}
                ref={setTabRef}
                aria-disabled="true"
                className="app-banner-tab"
                data-cy={tabId}
                id={tabId}
              >
                {tab.label}
              </span>
            );
          }

          return (
            <Link
              key={tab.key}
              ref={setTabRef}
              href={tab.href}
              prefetch={false}
              aria-current={tab.key === activeKey ? 'page' : undefined}
              className="app-banner-tab"
              data-cy={tabId}
              id={tabId}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {extra ? (
        <div
          className="app-banner-tabs-extra"
          data-cy={`${idPrefix}-extra-content`}
          id={`${idPrefix}-extra-content`}
        >
          {extra}
        </div>
      ) : null}
    </div>
  );
};
