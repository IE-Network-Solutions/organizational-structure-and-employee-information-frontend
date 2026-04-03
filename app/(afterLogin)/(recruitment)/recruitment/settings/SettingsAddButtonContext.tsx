'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

type AddAction = (() => void) | null;

type ContextValue = {
  addAction: AddAction;
  addLabel: string | null;
  setAddAction: (fn: AddAction) => void;
  setAddLabel: (label: string | null) => void;
};

const SettingsAddButtonContext = createContext<ContextValue | null>(null);

export function SettingsAddButtonProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [addAction, setAddActionState] = useState<AddAction>(null);
  const [addLabel, setAddLabelState] = useState<string | null>(null);
  const setAddAction = useCallback((fn: AddAction) => {
    setAddActionState(fn);
  }, []);
  const setAddLabel = useCallback((label: string | null) => {
    setAddLabelState(label);
  }, []);
  const value = React.useMemo(
    () => ({ addAction, addLabel, setAddAction, setAddLabel }),
    [addAction, addLabel, setAddAction, setAddLabel],
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
      setAddAction: () => {},
      setAddLabel: () => {},
    };
  return ctx;
}
