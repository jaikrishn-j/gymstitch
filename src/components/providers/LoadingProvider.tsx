import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Spinner } from "@heroui/react";

type LoadingContextValue = {
  isLoading: boolean;
  show: (message?: string) => void;
  hide: () => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const show = useCallback((m?: string) => {
    setMessage(m);
    setIsLoading(true);
  }, []);

  const hide = useCallback(() => setIsLoading(false), []);

  const value = useMemo<LoadingContextValue>(
    () => ({ isLoading, show, hide }),
    [isLoading, show, hide],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading ? (
        <div className="loading-overlay">
          <div className="loading-card">
            <Spinner size="lg" />
            {message ? <div className="loading-msg">{message}</div> : null}
          </div>
        </div>
      ) : null}
    </LoadingContext.Provider>
  );
}
