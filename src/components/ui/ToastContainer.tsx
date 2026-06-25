import React from 'react';
import { Toast } from '../../hooks/useToast';

const ICONS: Record<string, string> = {
  success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️',
};

interface Props { toasts: Toast[]; }

const ToastContainer: React.FC<Props> = ({ toasts }) => {
  if (toasts.length === 0) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} role="alert" aria-live="polite">
          <span>{ICONS[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
