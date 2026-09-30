'use client';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

export interface AppBannerTab {
  key: string;
  label: ReactNode;
  /** Plain-text name, used in the "More" menu. */
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

// Must match the `gap` on `.app-banner-tabs-list`.
const TAB_GAP = 2;

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

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
 * it reads as the top of the content below it. Tabs that do not fit move into
 * a "More" menu; the active tab always keeps its place in the row.
 */
export const AppBannerTabs: React.FC<AppBannerTabsProps> = ({
  tabs,
  activeKey,
  ariaLabel,
  idPrefix,
  extra,
  className = '',
}) => {
  const router = useRouter();
  const listRef = useRef<HTMLElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef(new Map<string, HTMLElement>());
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);

  // Overflowed tabs stay rendered (hidden, out of flow) so they can be measured.
  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const available = list.clientWidth;
    const widths = tabs.map(
      (tab) => tabRefs.current.get(tab.key)?.offsetWidth ?? 0,
    );
    const fullWidth = widths.reduce(
      (sum, width) => sum + width + TAB_GAP,
      -TAB_GAP,
    );

    let nextHiddenKeys: string[] = [];
    if (fullWidth > available) {
      const shownKeys = new Set<string>();
      let used = moreRef.current?.offsetWidth ?? 0;
      const activeIndex = tabs.findIndex((tab) => tab.key === activeKey);
      if (activeIndex >= 0) {
        shownKeys.add(tabs[activeIndex].key);
        used += widths[activeIndex] + TAB_GAP;
      }
      for (let index = 0; index < tabs.length; index += 1) {
        if (index === activeIndex) continue;
        if (used + widths[index] + TAB_GAP > available) break;
        shownKeys.add(tabs[index].key);
        used += widths[index] + TAB_GAP;
      }
      nextHiddenKeys = tabs
        .filter((tab) => !shownKeys.has(tab.key))
        .map((tab) => tab.key);
    }

    setHiddenKeys((current) =>
      current.join('|') === nextHiddenKeys.join('|') ? current : nextHiddenKeys,
    );
  }, [tabs, activeKey]);

  useIsomorphicLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    // Tabs are observed too: their widths change once the web font loads.
    const observer = new ResizeObserver(() => measure());
    if (listRef.current) observer.observe(listRef.current);
    if (moreRef.current) observer.observe(moreRef.current);
    tabRefs.current.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [measure]);

  const hiddenTabs = tabs.filter((tab) => hiddenKeys.includes(tab.key));

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
          const tabClassName = `app-banner-tab${
            hiddenKeys.includes(tab.key) ? ' is-overflowed' : ''
          }`;
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
                className={tabClassName}
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
              className={tabClassName}
              data-cy={tabId}
              id={tabId}
            >
              {tab.label}
            </Link>
          );
        })}

        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          disabled={!hiddenTabs.length}
          menu={{
            items: hiddenTabs.map((tab) => ({
              key: tab.key,
              label: tab.title,
              disabled: tab.disabled,
            })),
            onClick: ({ key }) => {
              const tab = tabs.find((item) => item.key === key);
              if (tab) router.push(tab.href);
            },
          }}
        >
          <button
            ref={moreRef}
            type="button"
            className={`app-banner-tab app-banner-tabs-more${
              hiddenTabs.length ? '' : ' is-overflowed'
            }`}
            data-cy={`${idPrefix}-more`}
            id={`${idPrefix}-more`}
          >
            More
            <DownOutlined className="app-banner-tabs-more-icon" />
          </button>
        </Dropdown>
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
