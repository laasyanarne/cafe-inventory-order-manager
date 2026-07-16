import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import "../components/Toast.css";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const timers = useRef({});

  const remove = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (message, type = "error") => {
      const id = ++nextId.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      timers.current[id] = setTimeout(() => remove(id), 4500);
    },
    [remove]
  );

  const toast = useMemo(
    () => ({
      error:   (msg) => add(String(msg), "error"),
      success: (msg) => add(String(msg), "success"),
      warning: (msg) => add(String(msg), "warning"),
    }),
    [add]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" role="log" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <span className="toast-message">{t.message}</span>
            <button
              className="toast-dismiss"
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
