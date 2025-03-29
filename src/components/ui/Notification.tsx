// @ts-ignore
import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  show: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  show,
  onClose,
  autoClose = true,
  duration = 3000,
}) => {
  useEffect(() => {
    // @ts-ignore
    let timer: ReturnType<typeof setTimeout>;
    if (show && autoClose) {
      timer = setTimeout(() => {
        onClose();
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show, autoClose, duration, onClose]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md flex items-center justify-between max-w-md
        ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white opacity-75 hover:opacity-100"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default Notification; 