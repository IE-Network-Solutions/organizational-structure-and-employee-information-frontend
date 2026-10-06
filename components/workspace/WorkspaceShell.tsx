'use client';
import React, { ReactNode, useMemo, useState } from 'react';
import BasicInfo from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/_components/basicInfo';
import { AppBanner, AppBannerTab, AppBannerTabs } from './AppBanner';
import { BannerActionsProvider } from './BannerActions';

export interface WorkspaceSection {
  title: ReactNode;
  tabs: AppBannerTab[];
  activeKey?: string;
  tabsLabel: string;
  /** Prefix for the tabs' id / data-cy hooks. */
  tabsIdPrefix: string;
  /** The section's own action beside the tabs (e.g. Home's Edit). */
  extra?: ReactNode;
  /**
   * Gap between the banner and the page. Module pages used to get it from
   * their own header, which the banner replaces; Home's pages have their own.
   */
  spaceBelowBanner?: boolean;
  /**
   * Desktop: the frame fills the viewport under the 74px top header so the
   * banner, tabs and profile panel stay put and only the page scrolls.
   */
  fixedFrame?: boolean;
  /**
   * Show the person's details (contact, employment) down the left, with the
   * avatar hanging over them. Only My Profile has it; other pages get the
   * full width and a compact banner.
   */
  profilePanel?: boolean;
}

interface WorkspaceShellProps {
  /** Home or the current module; null on pages that belong to neither. */
  section: WorkspaceSection | null;
  /** Whose profile heads the page; without one the banner shows the title. */
  employeeId?: string;
  children: ReactNode;
}

/**
 * The frame every section shares — Home and each module alike: a profile
 * banner carrying the section's tabs and the page's actions, and the page
 * below it (beside the profile details on My Profile). Only the tabs, actions
 * and page change between sections.
 *
 * Pages outside any section get the full width. The page keeps the same
 * position in the tree either way, so it is not remounted (losing its state)
 * when the section resolves after the menu data loads.
 */
const WorkspaceShell: React.FC<WorkspaceShellProps> = ({
  section,
  employeeId,
  children,
}) => {
  const [actionsSlot, setActionsSlot] = useState<HTMLDivElement | null>(null);
  const bannerActions = useMemo(
    () => ({ inBanner: Boolean(section), slot: actionsSlot }),
    [section, actionsSlot],
  );
  const hasProfile = Boolean(section?.profilePanel && employeeId);
  const fixedFrame = Boolean(section?.fixedFrame);

  return (
    <BannerActionsProvider value={bannerActions}>
      <div
        className={
          section
            ? `min-h-screen ${
                fixedFrame
                  ? 'lg:flex lg:h-[calc(100dvh-74px)] lg:min-h-0 lg:flex-col'
                  : ''
              }`
            : undefined
        }
        data-cy="workspace-shell"
        id="workspace-shell"
      >
        {section ? (
          <AppBanner
            dataCy="workspace-banner"
            className={`mt-2 ${fixedFrame ? 'lg:shrink-0' : ''}`}
          >
            {employeeId ? (
              <BasicInfo
                id={employeeId}
                variant="personalHero"
                compact={!hasProfile}
                data-cy="workspace-profile-hero"
              />
            ) : (
              <div
                className="relative px-5 py-8 sm:px-8 lg:min-h-[180px] lg:px-10"
                data-cy="workspace-hero-fallback"
                id="workspace-hero-fallback"
              >
                <h2
                  className="m-0 text-[30px] font-semibold leading-tight text-white sm:text-[34px]"
                  data-cy="workspace-hero-fallback-title"
                  id="workspace-hero-fallback-title"
                >
                  {section.title}
                </h2>
              </div>
            )}

            <div
              className={
                hasProfile ? 'grid lg:grid-cols-[300px_minmax(0,1fr)]' : ''
              }
              data-cy="workspace-tabs-container"
              id="workspace-tabs-container"
            >
              {/* Keeps the tabs clear of the avatar, which hangs over this row. */}
              {hasProfile ? (
                <div
                  className="hidden lg:block"
                  data-cy="workspace-tabs-rail"
                />
              ) : null}
              <AppBannerTabs
                tabs={section.tabs}
                activeKey={section.activeKey}
                ariaLabel={section.tabsLabel}
                idPrefix={section.tabsIdPrefix}
                extra={
                  <>
                    {section.extra}
                    {/* Pages' header actions portal in here (BannerActions). */}
                    <div
                      ref={setActionsSlot}
                      className="app-banner-actions"
                      data-cy="workspace-banner-actions"
                      id="workspace-banner-actions"
                    />
                  </>
                }
              />
            </div>
          </AppBanner>
        ) : null}

        <div
          className={
            section
              ? `grid min-h-[540px] ${
                  hasProfile ? 'lg:grid-cols-[300px_minmax(0,1fr)]' : ''
                } ${
                  fixedFrame
                    ? 'lg:min-h-0 lg:flex-1 lg:grid-rows-[minmax(0,1fr)]'
                    : ''
                }`
              : undefined
          }
          data-cy="workspace-body"
          id="workspace-body"
        >
          {/* Below lg the columns stack; the details would push every page's
              content below the fold, and the banner already names the person. */}
          {hasProfile && employeeId ? (
            <div
              className="hidden lg:block lg:min-h-0"
              data-cy="workspace-profile-panel"
              id="workspace-profile-panel"
            >
              <BasicInfo
                id={employeeId}
                variant="personalSidebar"
                data-cy="workspace-profile-sidebar"
              />
            </div>
          ) : null}
          <div
            className={
              section
                ? `min-w-0 bg-white ${fixedFrame ? 'lg:overflow-y-auto' : ''}`
                : 'min-w-0'
            }
            data-cy="workspace-content"
            id="workspace-content"
          >
            <div
              className={
                section
                  ? `px-4 pb-8 sm:px-6 lg:px-8 ${section.spaceBelowBanner ? 'pt-4' : ''}`
                  : undefined
              }
              data-cy="workspace-content-wrapper"
              id="workspace-content-wrapper"
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </BannerActionsProvider>
  );
};

export default WorkspaceShell;
