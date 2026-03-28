'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

type AddAction = (() => void) | null;

type ContextValue = {
  addAction: AddAction;
  setAddAction: (fn: AddAction) => void;
};

const SettingsAddButtonContext = createContext<ContextValue | null>(null);

export function SettingsAddButtonProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [addAction, setAddActionState] = useState<AddAction>(null);
  const setAddAction = useCallback((fn: AddAction) => {
    setAddActionState(fn);
  }, []);
  const value = React.useMemo(
    () => ({ addAction, setAddAction }),
    [addAction, setAddAction],
  );
  return (
    <SettingsAddButtonContext.Provider value={value}>
      {children}
    </SettingsAddButtonContext.Provider>
  );
}

export function useSettingsAddButton(): ContextValue {
  const ctx = useContext(SettingsAddButtonContext);
  if (!ctx) return { addAction: null, setAddAction: () => {} };
  return ctx;
}
