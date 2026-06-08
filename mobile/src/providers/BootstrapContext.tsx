import React, { createContext, useContext } from 'react';

interface BootstrapContextValue {
  isReady: boolean;
  onReady: () => void;
}

const BootstrapContext = createContext<BootstrapContextValue | null>(null);

export function BootstrapProvider({
  isReady,
  onReady,
  children,
}: {
  isReady: boolean;
  onReady: () => void;
  children: React.ReactNode;
}) {
  return (
    <BootstrapContext.Provider value={{ isReady, onReady }}>
      {children}
    </BootstrapContext.Provider>
  );
}

export function useBootstrap(): BootstrapContextValue {
  const context = useContext(BootstrapContext);
  if (!context) {
    throw new Error('useBootstrap must be used within BootstrapProvider');
  }
  return context;
}
