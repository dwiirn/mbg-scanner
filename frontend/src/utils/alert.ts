import { Alert, Platform } from 'react-native';

/**
 * Cross-platform helper to display simple notifications.
 */
export const showAlert = (title: string, message: string, onPressOk?: () => void) => {
  if (Platform.OS === 'web') {
    // Web browser alert fallback
    alert(`${title}\n\n${message}`);
    if (onPressOk) {
      onPressOk();
    }
  } else {
    // Native mobile alert
    Alert.alert(title, message, onPressOk ? [{ text: 'OK', onPress: onPressOk }] : undefined);
  }
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
  if (Platform.OS === 'web') {
    // Web browser confirm fallback
    const result = confirm(`${title}\n\n${message}`);
    if (result) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  } else {
    // Native mobile alert with choice buttons
    Alert.alert(title, message, [
      { text: 'Batal', style: 'cancel', onPress: onCancel },
      { text: 'OK', onPress: onConfirm },
    ]);
  }
};
