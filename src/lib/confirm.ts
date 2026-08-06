import { Alert, Platform } from 'react-native';

// Type for the confirm options
type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

/**
 * Cross-platform confirm. Multi-button Alert.alert is unreliable on web,
 * so web uses window.confirm instead.
 */
export function confirmAction(
  options: ConfirmOptions,
  onConfirm: () => void | Promise<void>,
): void {
  const {
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    destructive = false,
  } = options;

  if (Platform.OS === 'web') {
    const ok =
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as { confirm?: (text: string) => boolean }).confirm ===
        'function' &&
      (globalThis as { confirm: (text: string) => boolean }).confirm(
        `${title}\n\n${message}`,
      );
    if (ok) {
      void onConfirm();
    }
    return;
  }

  // Show the alert details
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    {
      text: confirmLabel,
      style: destructive ? 'destructive' : 'default',
      onPress: () => {
        void onConfirm();
      },
    },
  ]);
}
