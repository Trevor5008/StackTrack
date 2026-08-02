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

/**
 * Add session screen
 * @returns {JSX.Element}
 * @description This screen is used to add a new session to the database.
 * @example
 * <AddSessionScreen />
 */
export default function AddSessionScreen() {
  const { addSession, sessions, settings } = useSessions();
  const [formVersion, setFormVersion] = useState(0);

  return (
    // keyboard avoiding view to handle the keyboard on mobile devices
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      {/* scroll view to handle the scrollable content */}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* view to handle the content */}
        <View>
          {/* heading */}
          <Text style={styles.heading}>Log a blackjack session</Text>
          <Text style={styles.subtitle}>
            Net result is calculated automatically from cash-out minus buy-in.
          </Text>
        </View>
        {/* session form to handle the form submission */}
        <SessionForm
          // currency
          currency={settings.currency}
          // key to handle the form version
          key={formVersion}
          // on submit to handle the form submission
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

/**
 * Styles for the add session screen
 * @returns {StyleSheet}
 * @description This styles are used to style the add session screen.
 * @example
 * <AddSessionScreen />
 */
const styles = StyleSheet.create({
  // screen to handle the screen style
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  // content to handle the content style
  content: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  // heading to handle the heading style
  heading: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  // subtitle to handle the subtitle style
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
