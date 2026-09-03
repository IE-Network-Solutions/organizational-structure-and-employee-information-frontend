'use client';

import React, { useMemo } from 'react';
import { Switch, message } from 'antd';
import {
  PREFERENCE_CATEGORY_ORDER,
  useNotificationPreferencesStore,
  type NotificationPreferenceType,
  type NotificationDeliveryPreset,
} from '@/store/uistate/features/notification/preferences';

function PreferenceRow({
  label,
  description,
  checked,
  disabled,
  onChange,
  id,
}: {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5" data-cy={id}>
      <div className="min-w-0 flex-1" data-cy={`${id}-label-wrap`}>
        <div
          className="text-sm font-medium text-gray-800"
          data-cy={`${id}-label`}
        >
          {label}
        </div>
        {description ? (
          <p
            className="text-xs text-gray-500 mt-0.5"
            data-cy={`${id}-description`}
          >
            {description}
          </p>
        ) : null}
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={label}
        size="small"
      />
    </div>
  );
}

const PRESET_OPTIONS: {
  value: NotificationDeliveryPreset;
  label: string;
  description: string;
}[] = [
  {
    value: 'basic',
    label: 'Basic',
    description: 'Essential only — security and action-required',
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Your mix of toggles below',
  },
  {
    value: 'all',
    label: 'All',
    description: 'Every notification type on',
  },
];

export function NotificationPreferencesForm() {
  const channels = useNotificationPreferencesStore((s) => s.channels);
  const types = useNotificationPreferencesStore((s) => s.types);
  const preset = useNotificationPreferencesStore((s) => s.preset);
  const setChannel = useNotificationPreferencesStore((s) => s.setChannel);
  const setTypeEnabled = useNotificationPreferencesStore(
    (s) => s.setTypeEnabled,
  );
  const setPreset = useNotificationPreferencesStore((s) => s.setPreset);

  const grouped = useMemo(() => {
    const map = new Map<string, NotificationPreferenceType[]>();
    for (const cat of PREFERENCE_CATEGORY_ORDER) map.set(cat, []);
    for (const t of types) {
      const list = map.get(t.category) ?? map.get('Other')!;
      list.push(t);
    }
    return PREFERENCE_CATEGORY_ORDER.map((cat) => ({
      category: cat,
      items: map.get(cat) ?? [],
    })).filter((g) => g.items.length > 0);
  }, [types]);

  const handleChannel = (
    channel: 'inApp' | 'push',
    enabled: boolean,
    label: string,
  ) => {
    setChannel(channel, enabled);
    message.success(enabled ? `${label} turned on` : `${label} turned off`);
  };

  const handleType = (type: NotificationPreferenceType, enabled: boolean) => {
    if (type.locked) return;
    setTypeEnabled(type.key, enabled);
    message.success(
      enabled ? `“${type.label}” turned on` : `“${type.label}” turned off`,
    );
  };

  const handlePreset = (next: NotificationDeliveryPreset) => {
    setPreset(next);
    message.success(
      next === 'basic'
        ? 'Basic: only essential notifications on'
        : next === 'all'
          ? 'All notification types turned on'
          : 'Custom: adjust individual toggles below',
    );
  };

  return (
    <div className="space-y-5" data-cy="notification-preferences-form">
      <section
        data-cy="notification-preferences-preset"
        className="rounded-lg border border-gray-100 bg-white p-4"
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3"
          data-cy="notification-preferences-preset-header"
        >
          <div data-cy="notification-preferences-preset-copy">
            <h3
              className="text-sm font-semibold text-gray-700"
              data-cy="notification-preferences-preset-title"
            >
              Delivery preset
            </h3>
            <p
              className="text-xs text-gray-500 mt-0.5"
              data-cy="notification-preferences-preset-subtitle"
            >
              Quickly switch between essential-only and all notifications.
            </p>
          </div>
        </div>
        <div
          className="flex flex-wrap gap-2"
          data-cy="notification-preferences-preset-options"
        >
          {PRESET_OPTIONS.map((opt) => {
            const selected = preset === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                title={opt.description}
                data-cy={`notification-pref-preset-${opt.value}`}
                onClick={() => handlePreset(opt.value)}
                className={`rounded-lg border px-3 py-2 text-left min-w-[7.5rem] transition-colors ${
                  selected
                    ? 'border-[#1E40AF] bg-blue-50 text-[#1E40AF]'
                    : 'border-gray-200 text-gray-700 hover:border-[#1E40AF]/40'
                }`}
              >
                <div
                  className="text-sm font-medium"
                  data-cy={`notification-pref-preset-${opt.value}-label`}
                >
                  {opt.label}
                </div>
                <div
                  className="text-[11px] mt-0.5 opacity-80 leading-snug"
                  data-cy={`notification-pref-preset-${opt.value}-description`}
                >
                  {opt.description}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        data-cy="notification-preferences-grid"
      >
        <section
          data-cy="notification-preferences-channels"
          className="rounded-lg border border-gray-100 bg-white p-3"
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1"
            data-cy="notification-preferences-channels-title"
          >
            Channels
          </h3>
          <div
            className="divide-y divide-gray-100"
            data-cy="notification-preferences-channels-list"
          >
            <PreferenceRow
              id="notification-pref-channel-in-app"
              label="In-app"
              description="Show notifications in the bell inbox"
              checked={channels.inApp}
              onChange={(v) =>
                handleChannel('inApp', v, 'In-app notifications')
              }
            />
            <PreferenceRow
              id="notification-pref-channel-push"
              label="Browser push"
              description="Prototype toggle — does not change browser permission"
              checked={channels.push}
              onChange={(v) => handleChannel('push', v, 'Browser push')}
            />
          </div>
        </section>

        {grouped.map(({ category, items }) => {
          const catSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            <section
              key={category}
              data-cy={`notification-preferences-category-${catSlug}`}
              className="rounded-lg border border-gray-100 bg-white p-3"
            >
              <h3
                className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1"
                data-cy={`notification-preferences-category-${catSlug}-title`}
              >
                {category}
              </h3>
              <div
                className="divide-y divide-gray-100"
                data-cy={`notification-preferences-category-${catSlug}-list`}
              >
                {items.map((type) => (
                  <PreferenceRow
                    key={type.key}
                    id={`notification-pref-type-${type.key}`}
                    label={type.label}
                    description={
                      type.locked
                        ? 'Required — cannot be turned off'
                        : undefined
                    }
                    checked={type.enabled}
                    disabled={type.locked}
                    onChange={(v) => handleType(type, v)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
