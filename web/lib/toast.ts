import { toast, type ToastOptions } from "react-toastify";

const baseOptions: ToastOptions = {
  autoClose: 2000,
};

export function notifySuccess(message: string, options?: ToastOptions) {
  return toast.success(message, { ...baseOptions, ...options });
}

export function notifyInfo(message: string, options?: ToastOptions) {
  return toast.info(message, { ...baseOptions, ...options });
}

export function notifyError(message: string, options?: ToastOptions) {
  return toast.error(message, { ...baseOptions, ...options });
}
