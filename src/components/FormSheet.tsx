import { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

import { ActionButton } from '@/src/components/ActionButton';

import { styles } from './FormSheet.styles';

type FormSheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  saving?: boolean;
  savingLabel?: string;
  /** Dismiss when tapping the dimmed backdrop (default false). */
  dismissOnBackdrop?: boolean;
  /** Extra content under the title (e.g. hints). */
  header?: ReactNode;
  error?: string | null;
  secondaryLabel?: string;
  /** When false, only the sheet chrome is rendered (for forms with their own actions). */
  showActions?: boolean;
}>;

export function FormSheet({
  visible,
  onClose,
  title,
  primaryLabel = 'Save',
  onPrimary,
  saving = false,
  savingLabel = 'Saving…',
  dismissOnBackdrop = false,
  header,
  error,
  secondaryLabel = 'Cancel',
  showActions = true,
  children,
}: FormSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        {dismissOnBackdrop ? (
          <Pressable
            style={styles.backdropDismiss}
            disabled={saving}
            onPress={onClose}
          />
        ) : null}
        <View style={styles.card}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {header}
          {children}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {showActions ? (
            <View style={styles.actions}>
              <ActionButton
                label={secondaryLabel}
                onPress={onClose}
                variant="secondary"
                disabled={saving}
              />
              <ActionButton
                label={saving ? savingLabel : primaryLabel}
                onPress={() => onPrimary?.()}
                disabled={saving}
              />
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
