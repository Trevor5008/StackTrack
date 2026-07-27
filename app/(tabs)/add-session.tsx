import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SessionForm } from '@/src/components/SessionForm';
import { useSessions } from '@/src/context/SessionContext';
import { currentBankroll } from '@/src/lib/stats';
import { colors, spacing } from '@/src/theme';

export default function AddSessionScreen() {
  const { addSession, sessions, settings } = useSessions();
  const [formVersion, setFormVersion] = useState(0);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.heading}>Log a blackjack session</Text>
          <Text style={styles.subtitle}>
            Net result is calculated automatically from cash-out minus buy-in.
          </Text>
        </View>
        <SessionForm
          currency={settings.currency}
          key={formVersion}
          onSubmit={async (input) => {
            await addSession(input);
            setFormVersion((version) => version + 1);
            router.replace('/history');
          }}
          startingBankroll={currentBankroll(
            settings.startingBankroll,
            sessions,
          )}
          submitLabel="Save session"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  heading: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
