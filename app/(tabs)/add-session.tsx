import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { SessionForm } from '@/src/components/SessionForm';
import { useSessions } from '@/src/context/SessionContext';
import { currentBankroll } from '@/src/lib/stats';

import { styles } from './add-session.styles';

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
