import { createContext, useCallback, useContext, useRef, useState } from "react";
import "./ConfirmDialog.css";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback(({ title, message, confirmLabel = "Confirm", variant = "danger" }) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({ title, message, confirmLabel, variant });
    });
  }, []);

  const handleConfirm = () => {
    resolveRef.current?.(true);
    setDialog(null);
  };

  const handleCancel = () => {
    resolveRef.current?.(false);
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <div
          className="cdlg-overlay"
          onClick={handleCancel}
          role="presentation"
        >
          <div
            className="cdlg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cdlg-title"
          >
            <h3 className="cdlg-title" id="cdlg-title">
              {dialog.title}
            </h3>
            {dialog.message && (
              <p className="cdlg-body">{dialog.message}</p>
            )}
            <div className="cdlg-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className={`btn btn-sm cdlg-btn--${dialog.variant}`}
                onClick={handleConfirm}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
