import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useSessions } from '@/src/context/SessionContext';
import { colors, radius, spacing } from '@/src/theme';

const currencies = ['USD', 'CAD', 'EUR', 'GBP'];

export default function SettingsScreen() {
  const { settings, updateSettings } = useSessions();
  const [startingBankroll, setStartingBankroll] = useState(
    String(settings.startingBankroll),
  );
  const [currency, setCurrency] = useState(settings.currency);
  const [message, setMessage] = useState<string | null>(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);

  useEffect(() => {
    setStartingBankroll(String(settings.startingBankroll));
    setCurrency(settings.currency);
  }, [settings]);

  const handleSave = async () => {
    const bankroll = Number(startingBankroll);
    if (!Number.isFinite(bankroll) || bankroll < 0) {
      setMessage('Enter a valid non-negative bankroll.');
      setSaveSucceeded(false);
      return;
    }

    try {
      await updateSettings({ startingBankroll: bankroll, currency });
      setMessage('Settings saved.');
      setSaveSucceeded(true);
    } catch {
      setMessage('Settings could not be saved.');
      setSaveSucceeded(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      style={styles.screen}
    >
      <View>
        <Text style={styles.heading}>Settings</Text>
        <Text style={styles.subtitle}>
          Configure the baseline used for your bankroll stats.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Starting bankroll</Text>
        <TextInput
          accessibilityLabel="Starting bankroll"
          keyboardType="decimal-pad"
          onChangeText={setStartingBankroll}
          selectionColor={colors.primary}
          style={styles.input}
          value={startingBankroll}
        />

        <Text style={styles.label}>Default currency</Text>
        <View style={styles.currencyRow}>
          {currencies.map((option) => (
            <Pressable
              key={option}
              onPress={() => setCurrency(option)}
              style={[
                styles.currencyButton,
                option === currency && styles.currencyButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.currencyText,
                  option === currency && styles.currencyTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        {message ? (
          <Text
            style={[
              styles.message,
              saveSucceeded ? styles.successMessage : styles.errorMessage,
            ]}
          >
            {message}
          </Text>
        ) : null}

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
          ]}
        >
          <Text style={styles.saveButtonText}>Save settings</Text>
        </Pressable>
      </View>

      <View style={styles.futureCard}>
        <Text style={styles.futureLabel}>COMING LATER</Text>
        <Text style={styles.futureTitle}>Blackjack training & simulation</Text>
        <Text style={styles.futureText}>
          Strategy drills and card-counting simulations will live in a separate
          feature area, without changing your tracker data.
        </Text>
        {/* TODO: Add links to simulation and training modules in a future release. */}
      </View>
    </ScrollView>
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
    paddingBottom: spacing.xl,
  },
  heading: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  currencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  currencyButton: {
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  currencyButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  currencyText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  currencyTextActive: {
    color: colors.background,
  },
  message: {
    fontSize: 13,
  },
  successMessage: {
    color: colors.positive,
  },
  errorMessage: {
    color: colors.negative,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    minHeight: 50,
    justifyContent: 'center',
  },
  saveButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
  futureCard: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: spacing.lg,
  },
  futureLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  futureTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  futureText: {
    color: colors.textMuted,
    lineHeight: 21,
  },
});
