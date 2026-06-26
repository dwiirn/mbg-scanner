import { create } from 'zustand';

interface AlertOptions {
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
}

interface ConfirmOptions extends AlertOptions {
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type: 'alert' | 'confirm';
  confirmText: string;
  cancelText: string;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
  showAlert: (options: AlertOptions) => void;
  showConfirm: (options: ConfirmOptions) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  title: '',
  message: '',
  type: 'alert',
  confirmText: 'OK',
  cancelText: 'Batal',
  onConfirm: null,
  onCancel: null,
  showAlert: (options) =>
    set({
      visible: true,
      title: options.title,
      message: options.message,
      type: 'alert',
      confirmText: options.confirmText || 'OK',
      cancelText: 'Batal',
      onConfirm: options.onConfirm || null,
      onCancel: null,
    }),
  showConfirm: (options) =>
    set({
      visible: true,
      title: options.title,
      message: options.message,
      type: 'confirm',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Batal',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel || null,
    }),
  hideAlert: () =>
    set({
      visible: false,
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
    }),
}));
