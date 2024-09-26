import { toast, ToastPosition } from 'react-toastify';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default';

interface ToastOptions {
  message: string;
  type?: ToastType;
  position?: ToastPosition;
  autoClose?: number;
}

export const showToast = ({
  message,
  type = 'success',
  position = 'top-right',
  autoClose = 3000,
}: ToastOptions): void => {
  const toastOptions = {
    position,
    autoClose,
  };

  switch (type) {
    case 'success':
      toast.success(message, toastOptions);
      break;
    case 'error':
      toast.error(message, toastOptions);
      break;
    case 'info':
      toast.info(message, toastOptions);
      break;
    case 'warning':
      toast.warn(message, toastOptions);
      break;
    default:
      toast(message, toastOptions);
  }
};
