'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MoreHorizontal, X, ChevronLeft } from 'lucide-react';

// ─── Types (mirror groupedMenuItems shape) ──────────────────────────────────

interface SubItem {
  key: string | number | bigint;
  label: React.ReactNode;
}

interface NavItem {
  key: string | number | bigint;
  icon?: React.ReactNode;
  label: React.ReactNode;
  /** Populated when the treeItem is a non-navigable parent (e.g. 'feedback-menu') */
  children?: SubItem[];
}

interface NavGroup {
  type: string;
  key: string;
  label: string;
  linkKey: string;
  children: NavItem[];
}

interface MobileBottomNavProps {
  groups: NavGroup[];
  colorPrimary: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Is the current pathname inside this group?
 * Checks both direct item keys and sub-item keys (mirrors NavMenuItem active logic).
 */
function groupIsActive(group: NavGroup, pathname: string): boolean {
  return group.children.some((item) => {
    if (item.children && item.children.length > 0) {
      return item.children.some((sub) => {
        const k = String(sub.key);
        return pathname === k || pathname.startsWith(k + '/');
      });
    }
    const k = String(item.key);
    return pathname === k || pathname.startsWith(k + '/');
  });
}

// ─── Sheet content ───────────────────────────────────────────────────────────

function GroupSheet({
  group,
  pathname,
  colorPrimary,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  colorPrimary: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <>
      {group.children.map((item) => {
        const itemKey = String(item.key);

        if (item.children && item.children.length > 0) {
          // Parent node — render as section label + navigable children
          return (
            <div key={itemKey} className="mb-4">
              {/* Section label */}
              <div className="flex items-center gap-2 px-3 py-1 mb-1">
                <span className="text-[20px] leading-none flex items-center justify-center w-5 h-5 flex-shrink-0 text-[#9ca3af]">
                  {item.icon}
                </span>
                <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
              {/* Navigable children */}
              {item.children.map((sub) => {
                const subKey = String(sub.key);
                const active =
                  pathname === subKey || pathname.startsWith(subKey + '/');
                return (
                  <button
                    key={subKey}
                    type="button"
                    onClick={() => onNavigate(subKey)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium transition-colors text-left"
                    style={{
                      backgroundColor: active
                        ? `${colorPrimary}18`
                        : undefined,
                      color: active ? colorPrimary : '#111827',
                    }}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          );
        }

        // Leaf node — directly navigable
        const active =
          pathname === itemKey || pathname.startsWith(itemKey + '/');
        return (
          <button
            key={itemKey}
            type="button"
            onClick={() => onNavigate(itemKey)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium transition-colors text-left mb-1"
            style={{
              backgroundColor: active ? `${colorPrimary}18` : undefined,
              color: active ? colorPrimary : '#111827',
            }}
          >
            <span className="text-[20px] leading-none flex items-center justify-center w-5 h-5 flex-shrink-0">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Sheet =
  | { type: 'closed' }
  | { type: 'group'; group: NavGroup }
  | { type: 'all' };

export function MobileBottomNav({ groups, colorPrimary }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sheet, setSheet] = useState<Sheet>({ type: 'closed' });

  if (!groups.length) return null;

  const tabs = groups.slice(0, 4);

  function navigateTo(path: string) {
    router.push(path);
    setSheet({ type: 'closed' });
  }

  function onTabPress(group: NavGroup) {
    // Count how many real navigable destinations this group has
    const destinations: string[] = [];
    group.children.forEach((item) => {
      if (item.children && item.children.length > 0) {
        item.children.forEach((sub) => destinations.push(String(sub.key)));
      } else {
        destinations.push(String(item.key));
      }
    });

    if (destinations.length === 1) {
      navigateTo(destinations[0]);
    } else {
      setSheet({ type: 'group', group });
    }
  }

  const moreActive =
    groups.slice(4).some((g) => groupIsActive(g, pathname));

  const isOpen = sheet.type !== 'closed';

  return (
    <>
      {/* ── Tab bar ── */}
      <nav
        data-cy="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E2E8F0] bg-white flex items-stretch"
        style={{ height: 'calc(60px + env(safe-area-inset-bottom,0px))' }}
        aria-label="Primary navigation"
      >
        {tabs.map((group) => {
          const active = groupIsActive(group, pathname);
          const firstIcon = group.children[0]?.icon;
          return (
            <button
              key={group.key}
              type="button"
              onClick={() => onTabPress(group)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 pb-1 text-[10px] font-medium transition-colors min-w-0"
              style={{ color: active ? colorPrimary : '#6b7280' }}
            >
              <span className="text-[22px] leading-none flex items-center justify-center w-6 h-6">
                {firstIcon}
              </span>
              <span className="truncate max-w-full px-0.5">{group.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setSheet({ type: 'all' })}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 pb-1 text-[10px] font-medium transition-colors min-w-0"
          style={{ color: moreActive ? colorPrimary : '#6b7280' }}
        >
          <MoreHorizontal className="w-[22px] h-[22px]" />
          <span>More</span>
        </button>
      </nav>

      {/* ── Bottom sheet ── */}
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSheet({ type: 'closed' })}
          />

          {/* Panel */}
          <div className="relative bg-white rounded-t-2xl max-h-[80vh] flex flex-col shadow-xl">
            {/* Handle */}
            <div className="flex-shrink-0 pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-[#e5e7eb]" />
            </div>

            {/* Header */}
            <div className="flex items-center gap-1 px-4 py-2 flex-shrink-0 border-b border-[#f3f4f6]">
              {sheet.type === 'group' && (
                <button
                  type="button"
                  onClick={() => setSheet({ type: 'all' })}
                  className="p-1.5 -ml-1 rounded-lg hover:bg-[#f3f4f6] transition-colors"
                >
                  <ChevronLeft size={18} className="text-[#6b7280]" />
                </button>
              )}
              <span className="flex-1 text-[15px] font-semibold text-[#111827]">
                {sheet.type === 'group' ? sheet.group.label : 'Navigation'}
              </span>
              <button
                type="button"
                onClick={() => setSheet({ type: 'closed' })}
                className="p-1.5 rounded-lg hover:bg-[#f3f4f6] transition-colors"
              >
                <X size={18} className="text-[#6b7280]" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-3 py-3 pb-8">
              {sheet.type === 'group' ? (
                <GroupSheet
                  group={sheet.group}
                  pathname={pathname}
                  colorPrimary={colorPrimary}
                  onNavigate={navigateTo}
                />
              ) : (
                // All groups
                groups.map((group) => (
                  <div key={group.key} className="mb-2">
                    <div className="px-3 py-2 text-[11px] font-semibold text-[#6b7280] uppercase tracking-widest">
                      {group.label}
                    </div>
                    <GroupSheet
                      group={group}
                      pathname={pathname}
                      colorPrimary={colorPrimary}
                      onNavigate={navigateTo}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
