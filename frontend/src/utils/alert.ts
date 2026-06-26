import { useAlertStore } from '../store/alert-store';

/**
 * Cross-platform helper to display simple notifications.
 */
export const showAlert = (title: string, message: string, onPressOk?: () => void) => {
  useAlertStore.getState().showAlert({
    title,
    message,
    onConfirm: onPressOk,
  });
};

/**
 * Cross-platform helper to ask for user confirmations (OK / Cancel).
 */
export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  useAlertStore.getState().showConfirm({
    title,
    message,
    onConfirm,
    onCancel,
  });
};
