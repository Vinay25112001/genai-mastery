import { useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const show = useCallback((message: string, type: ToastType = 'info', duration = 3500) => {
    const id = ++counter.current;
    setToasts(prev => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const success = useCallback((msg: string) => show(msg, 'success'), [show]);
  const error   = useCallback((msg: string) => show(msg, 'error', 5000), [show]);
  const info    = useCallback((msg: string) => show(msg, 'info'), [show]);
  const warning = useCallback((msg: string) => show(msg, 'warning', 4500), [show]);

  return { toasts, show, success, error, info, warning };
};
