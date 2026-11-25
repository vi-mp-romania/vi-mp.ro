/** React context that hands the one Api instance (built in main.tsx) to the components. */
import { createContext, useContext, type ReactNode } from 'react';
import type { Api } from './endpoints';

const ApiContext = createContext<Api | null>(null);

/** Props of ApiProvider. */
interface Props {
  api: Api; // the instance built once at startup
  children: ReactNode;
}

/** Makes `api` available to every component below it. */
export function ApiProvider({ api, children }: Props) {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

/** The Api of the nearest ApiProvider; throws when used outside one (a wiring mistake). */
export function useApi(): Api {
  const api = useContext(ApiContext);
  if (!api) throw new Error('useApi must be used inside ApiProvider');
  return api;
}
