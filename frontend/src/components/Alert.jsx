import { useState } from 'react';

export default function Alert({ message, type = 'error', onClose }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
      )}
    </div>
  );
}

export function useAlert() {
  const [alert, setAlert] = useState({ message: '', type: 'error' });

  const showAlert = (message, type = 'error') => setAlert({ message, type });
  const clearAlert = () => setAlert({ message: '', type: 'error' });

  return { alert, showAlert, clearAlert };
}
