'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

type AddAction = (() => void) | null;

type ContextValue = {
  addAction: AddAction;
  addLabel: string | null;
  /** When true the layout only shows the mobile add button, not the desktop one */
  mobileOnly: boolean;
  setAddAction: (fn: AddAction) => void;
  setAddLabel: (label: string | null) => void;
  setMobileOnly: (value: boolean) => void;
};

const SettingsAddButtonContext = createContext<ContextValue | null>(null);

export function SettingsAddButtonProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [addAction, setAddActionState] = useState<AddAction>(null);
  const [addLabel, setAddLabelState] = useState<string | null>(null);
  const [mobileOnly, setMobileOnlyState] = useState(false);
  const setAddAction = useCallback((fn: AddAction) => {
    setAddActionState(fn);
  }, []);
  const setAddLabel = useCallback((label: string | null) => {
    setAddLabelState(label);
  }, []);
  const setMobileOnly = useCallback((value: boolean) => {
    setMobileOnlyState(value);
  }, []);
  const value = React.useMemo(
    () => ({
      addAction,
      addLabel,
      mobileOnly,
      setAddAction,
      setAddLabel,
      setMobileOnly,
    }),
    [addAction, addLabel, mobileOnly, setAddAction, setAddLabel, setMobileOnly],
  );
  return (
    <SettingsAddButtonContext.Provider value={value}>
      {children}
    </SettingsAddButtonContext.Provider>
  );
}

export function useSettingsAddButton(): ContextValue {
  const ctx = useContext(SettingsAddButtonContext);
  if (!ctx)
    return {
      addAction: null,
      addLabel: null,
      mobileOnly: false,
      setAddAction: () => {},
      setAddLabel: () => {},
      setMobileOnly: () => {},
    };
  return ctx;
}
