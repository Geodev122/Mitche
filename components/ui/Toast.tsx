import * as React from 'react';

type ToastType = 'success' | 'error' | 'info';
type ToastItem = { id: string; message: string; type: ToastType; action?: { label: string; cb: () => void } };

const ToastContext = React.createContext<{
  show: (message: string, type?: ToastType, action?: { label: string; cb: () => void }) => void;
} | undefined>(undefined);

const variantClasses: Record<ToastType, string> = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-slate-800'
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const show = (message: string, type: ToastType = 'info', action?: { label: string; cb: () => void }) => {
    const id = `toast_${Date.now()}_${Math.round(Math.random() * 1000)}`;
    setToasts((prev: any[]) => [...prev, { id, message, type, action }]);
    // Auto-dismiss respecting reduced motion/user expectation
    const timeout = 4000;
    setTimeout(() => {
      setToasts((prev: any[]) => prev.filter((t: any) => t.id !== id));
    }, timeout);
  };

  const dismiss = (id: string) => setToasts((prev: any[]) => prev.filter((t: any) => t.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {/* Live region for accessibility */}
      <div aria-live="polite" aria-atomic="false" className="sr-only" />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
        {toasts.map((t: any) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={`flex items-start gap-3 p-3 rounded shadow-lg text-white ${variantClasses[t.type as ToastType]} ring-1 ring-black/5`}>
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : t.type === 'error' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12A9 9 0 1112 3a9 9 0 019 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M13 16h-1v-4h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{t.message}</div>
              {t.action && (
                <button onClick={() => { t.action!.cb(); }} className="mt-1 text-xs underline opacity-90">
                  {t.action.label}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-2">
              <button aria-label="Dismiss" onClick={() => dismiss(t.id)} className="p-1 rounded bg-white/10 hover:bg-white/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

export default ToastProvider;
