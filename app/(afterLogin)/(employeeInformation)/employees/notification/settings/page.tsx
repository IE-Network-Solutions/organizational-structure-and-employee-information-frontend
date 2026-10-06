'use client';

import React, { useEffect, useMemo } from 'react';
import { Spin, Switch } from 'antd';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetNotifications } from '@/store/server/features/notification/queries';
import type { NotificationType } from '@/store/server/features/notification/interface';
import {
  buildEnabledMapForPreset,
  buildHybridPreferenceList,
  groupPreferencesByCategory,
  type DeliveryPreset,
  type NotificationPreferenceItem,
} from '@/store/server/features/notification/preferenceCatalog';
import {
  useNotificationPreferencesStore,
  hydrateNotificationPreferencesStore,
} from '@/store/uistate/features/notification/preferences';

const ACCENT = '#2563EB';

const PRESETS: Array<{
  id: DeliveryPreset;
  title: string;
  description: string;
}> = [
  {
    id: 'basic',
    title: 'Basic',
    description: 'All types shown, with essential notifications on.',
  },
  {
    id: 'custom',
    title: 'Custom',
    description: 'Customize which notification types are on.',
  },
  {
    id: 'all',
    title: 'All',
    description: 'Every notification toggle on.',
  },
];

function PreferenceRow({
  item,
  checked,
  onChange,
}: {
  item: NotificationPreferenceItem;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-b-0"
      id={`notification-pref-row-${item.id}`}
      data-cy={`notification-pref-row-${item.id}`}
    >
      <div
        className="min-w-0 pr-2"
        data-cy={`notification-pref-row-copy-${item.id}`}
      >
        <div
          className="text-sm text-gray-900 font-medium leading-snug"
          data-cy={`notification-pref-row-label-${item.id}`}
        >
          {item.label}
        </div>
        {item.description ? (
          <div
            className="text-xs text-gray-400 mt-0.5 leading-snug"
            data-cy={`notification-pref-row-description-${item.id}`}
          >
            {item.description}
          </div>
        ) : null}
        {item.fromHistory ? (
          <div
            className="text-[11px] text-gray-400 mt-0.5"
            data-cy={`notification-pref-row-history-${item.id}`}
          >
            Seen in your notification history
          </div>
        ) : null}
      </div>
      <Switch
        checked={checked}
        disabled={item.required}
        onChange={onChange}
        id={`notification-pref-switch-${item.id}`}
        data-cy={`notification-pref-switch-${item.id}`}
        style={checked ? { backgroundColor: ACCENT } : undefined}
      />
    </div>
  );
}

const NotificationSettingsPage = () => {
  const userId = useAuthenticationStore((s) => s.userId) ?? '';
  const hasHydrated = useNotificationPreferencesStore((s) => s.hasHydrated);
  const byUserId = useNotificationPreferencesStore((s) => s.byUserId);
  const applyPreset = useNotificationPreferencesStore((s) => s.applyPreset);
  const setEnabled = useNotificationPreferencesStore((s) => s.setEnabled);
  const setEnabledMap = useNotificationPreferencesStore((s) => s.setEnabledMap);
  const ensureDefaults = useNotificationPreferencesStore(
    (s) => s.ensureDefaults,
  );

  useEffect(() => {
    hydrateNotificationPreferencesStore();
  }, []);

  const userPrefs = byUserId[userId];
  const preset = userPrefs?.preset ?? 'all';
  const enabledById = userPrefs?.enabledById ?? {};

  const { data, isLoading } = useGetNotifications(
    userId,
    { page: 1, limit: 200 },
    !!userId,
  );

  const historyItems = useMemo((): NotificationType[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data as NotificationType[];
    const list = (data as { data?: NotificationType[] }).data;
    return Array.isArray(list) ? list : [];
  }, [data]);

  const preferences = useMemo(
    () => buildHybridPreferenceList(historyItems),
    [historyItems],
  );

  useEffect(() => {
    if (!userId || !hasHydrated) return;
    ensureDefaults(
      userId,
      preferences.map((item) => item.id),
    );
  }, [userId, hasHydrated, preferences, ensureDefaults]);

  const grouped = useMemo(
    () => groupPreferencesByCategory(preferences),
    [preferences],
  );

  const handlePresetClick = (next: DeliveryPreset) => {
    if (!userId) return;
    if (next !== 'custom') {
      setEnabledMap(
        userId,
        buildEnabledMapForPreset(preferences, next, enabledById),
      );
    }
    applyPreset(userId, next);
  };

  const handleToggle = (id: string, next: boolean) => {
    if (!userId) return;
    setEnabled(userId, id, next);
  };

  return (
    <div
      className="h-auto w-full p-4 md:p-6"
      id="notification-settings-page"
      data-cy="notification-settings-page"
    >
      <CustomBreadcrumb
        title="Notification Settings"
        subtitle="Notification / Notification Settings"
        href="/employees/notification"
        data-cy="notification-settings-breadcrumb"
      />

      <section
        className="mt-6"
        id="notification-delivery-preset"
        data-cy="notification-delivery-preset"
      >
        <div
          className="flex flex-wrap items-end justify-between gap-2"
          data-cy="notification-delivery-preset-header"
        >
          <div data-cy="notification-delivery-preset-copy">
            <h2
              className="text-base font-semibold text-gray-900 m-0"
              data-cy="notification-delivery-preset-title"
            >
              Delivery preset
            </h2>
            <p
              className="text-sm text-gray-500 mt-1 mb-0"
              data-cy="notification-delivery-preset-subtitle"
            >
              Quickly switch between essential-only and all notifications.
            </p>
          </div>
          {hasHydrated ? (
            <p
              className="text-xs text-gray-400 m-0"
              id="notification-preferences-persist-hint"
              data-cy="notification-preferences-persist-hint"
            >
              Changes save automatically and sync across devices.
            </p>
          ) : null}
        </div>

        <fieldset
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 border-0 p-0"
          data-cy="notification-delivery-preset-grid"
        >
          <legend
            className="sr-only"
            data-cy="notification-delivery-preset-legend"
          >
            Notification delivery preset
          </legend>
          {PRESETS.map((item) => {
            const selected = preset === item.id;
            return (
              <label
                key={item.id}
                className={`relative flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors focus-within:ring-2 focus-within:ring-[#2563EB]/30 ${
                  selected
                    ? 'border-[#2563EB] bg-[#EFF6FF] shadow-[0_0_0_2px_rgba(37,99,235,0.16)]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                data-cy={`notification-preset-${item.id}`}
              >
                <input
                  type="radio"
                  name="notification-delivery-preset"
                  id={`notification-preset-${item.id}`}
                  value={item.id}
                  checked={selected}
                  onChange={() => handlePresetClick(item.id)}
                  className="sr-only"
                  data-cy={`notification-preset-radio-${item.id}`}
                />
                <div
                  className="min-w-0"
                  data-cy={`notification-preset-copy-${item.id}`}
                >
                  <div
                    className={`text-sm font-semibold ${
                      selected ? 'text-[#1D4ED8]' : 'text-gray-900'
                    }`}
                    data-cy={`notification-preset-title-${item.id}`}
                  >
                    {item.title}
                  </div>
                  <div
                    className={`mt-1 text-xs leading-snug ${
                      selected ? 'text-[#1D4ED8]' : 'text-gray-500'
                    }`}
                    data-cy={`notification-preset-description-${item.id}`}
                  >
                    {item.description}
                  </div>
                </div>
                <span
                  aria-hidden="true"
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    selected
                      ? 'border-[#CBD5E1] bg-[#E2E8F0] text-[#64748B]'
                      : 'border-transparent'
                  }`}
                  data-cy={`notification-preset-check-${item.id}`}
                >
                  {selected ? (
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="h-3 w-3"
                      data-cy={`notification-preset-check-icon-${item.id}`}
                    >
                      <path
                        d="m3.5 8 3 3 6-6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        data-cy={`notification-preset-checkmark-${item.id}`}
                      />
                    </svg>
                  ) : null}
                </span>
              </label>
            );
          })}
        </fieldset>
      </section>

      <section
        className="mt-8"
        id={`notification-settings-${preset}`}
        data-cy={`notification-settings-${preset}`}
      >
        {!hasHydrated || isLoading ? (
          <div
            className="flex justify-center py-16"
            data-cy="notification-settings-loading"
          >
            <Spin size="large" />
          </div>
        ) : grouped.length === 0 ? (
          <div
            className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center"
            id="notification-settings-empty"
            data-cy="notification-settings-empty"
          >
            <p
              className="text-sm text-gray-600 m-0"
              data-cy="notification-settings-empty-copy"
            >
              No notification types available for this preset.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-8"
            data-cy="notification-settings-grid"
          >
            {grouped.map((group) => (
              <div
                key={group.category}
                id={`notification-pref-category-${group.category}`}
                data-cy={`notification-pref-category-${group.category}`}
              >
                <h3
                  className="text-xs font-semibold tracking-wide text-gray-400 uppercase m-0 mb-1"
                  data-cy={`notification-pref-category-title-${group.category}`}
                >
                  {group.label}
                </h3>
                <div
                  data-cy={`notification-pref-category-list-${group.category}`}
                >
                  {group.items.map((item) => (
                    <PreferenceRow
                      key={item.id}
                      item={item}
                      checked={enabledById[item.id] ?? true}
                      onChange={(next) => handleToggle(item.id, next)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default NotificationSettingsPage;
