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
// Import the ScrollView component from react-native-gesture-handler
import { ScrollView } from 'react-native-gesture-handler';

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

// Define the form sheet component
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
        {/* Dismiss when tapping the dimmed backdrop */}
        {dismissOnBackdrop ? (
          <Pressable
            style={styles.backdropDismiss}
            disabled={saving}
            onPress={onClose}
          />
        ) : null}
        {/* Card container */}
        <View style={styles.card}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {header}
          {/* Scrollable content */}
          <ScrollView keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {/* Error message */}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {/* Actions */}
          {showActions ? (
            <View style={styles.actions}>
              {/* Secondary action */}
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
