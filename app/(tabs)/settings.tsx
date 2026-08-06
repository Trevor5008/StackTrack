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
import { confirmAction } from '@/src/lib/confirm';
import { colors, radius, spacing } from '@/src/theme';

const currencies = ['USD', 'CAD', 'EUR', 'GBP'];

export default function SettingsScreen() {
  const {
    sessions,
    settings,
    updateSettings,
    seedDemoData,
    clearSessions,
    clearAllData,
  } = useSessions();
  const [startingBankroll, setStartingBankroll] = useState(
    String(settings.startingBankroll),
  );
  const [currency, setCurrency] = useState(settings.currency);
  const [message, setMessage] = useState<string | null>(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [dataMessage, setDataMessage] = useState<string | null>(null);

  // Handles the loading of the settings
  useEffect(() => {
    // set starting bankroll to handle the starting bankroll
    setStartingBankroll(String(settings.startingBankroll));
    // set currency to handle the currency
    setCurrency(settings.currency);
  }, [settings]);

  /**
   * Handles the saving of the settings
   * @returns {Promise<void>}
   * @description This function is used to save the settings.
   * @example
   * <SettingsScreen />
   */
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

  const handleLoadDemo = () => {
    const load = async () => {
      try {
        await seedDemoData();
        setDataMessage('Demo sessions loaded.');
      } catch {
        setDataMessage(null);
        setMessage('Demo data could not be loaded.');
        setSaveSucceeded(false);
      }
    };

    if (sessions.length === 0) {
      void load();
      return;
    }

    confirmAction(
      {
        title: 'Replace existing sessions?',
        message:
          'Loading demo data will replace your current session history on this device.',
        confirmLabel: 'Replace',
        destructive: true,
      },
      load,
    );
  };

  const handleClearSessions = () => {
    confirmAction(
      {
        title: 'Clear all sessions?',
        message: 'This removes every saved session from local storage.',
        confirmLabel: 'Clear',
        destructive: true,
      },
      async () => {
        try {
          await clearSessions();
          setDataMessage('All sessions cleared.');
        } catch {
          setDataMessage(null);
          setMessage('Sessions could not be cleared.');
          setSaveSucceeded(false);
        }
      },
    );
  };

  const handleClearAll = () => {
    confirmAction(
      {
        title: 'Reset all local data?',
        message:
          'This clears sessions and restores default settings on this device.',
        confirmLabel: 'Reset',
        destructive: true,
      },
      async () => {
        try {
          await clearAllData();
          setDataMessage('Local data reset to defaults.');
        } catch {
          setDataMessage(null);
          setMessage('Local data could not be reset.');
          setSaveSucceeded(false);
        }
      },
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      style={styles.screen}
    >
      {/* view to handle the view */}
      <View>
        {/* text to handle the heading */}
        <Text style={styles.heading}>Settings</Text>
        {/* text to handle the subtitle */}
        <Text style={styles.subtitle}>
          Configure the baseline used for your bankroll stats.
        </Text>
      </View>

      {/* view to handle the card */}
      <View style={styles.card}>
        {/* text to handle the label */}
        <Text style={styles.label}>Starting bankroll</Text>
        {/* text input to handle the text input */}
        <TextInput
          // accessibility label to handle the accessibility label
          accessibilityLabel="Starting bankroll"
          keyboardType="decimal-pad"
          // on change text to handle the on change text
          onChangeText={setStartingBankroll}
          // selection color to handle the selection color
          selectionColor={colors.primary}
          style={styles.input}
          // value to handle the value
          value={startingBankroll}
        />

        {/* text to handle the label */}
        <Text style={styles.label}>Default currency</Text>
        {/* view to handle the currency row */}
        <View style={styles.currencyRow}>
          {currencies.map((option) => (
            <Pressable
              // key to handle the key
              key={option}
              // on press to handle the on press
              onPress={() => setCurrency(option)}
              // style to handle the style
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

        {/* if there is a message, show the message */}
        {message ? (
          // if there is a message, show the message
          <View>
            {/* text to handle the message */}
            <Text style={[styles.message, saveSucceeded ? styles.successMessage : styles.errorMessage]}>
              {message}
            </Text>
          </View>
        ) : null}

        {/* pressable to handle the pressable */}
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

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Local data</Text>
        <Text style={styles.dataHelp}>
          Demo sessions are optional. Your tracker starts empty until you add a
          session or load demo data.
        </Text>

        {dataMessage ? (
          <Text style={styles.successMessage}>{dataMessage}</Text>
        ) : null}

        <Pressable
          onPress={handleLoadDemo}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Load demo data</Text>
        </Pressable>

        <Pressable
          onPress={handleClearSessions}
          style={({ pressed }) => [
            styles.dangerButton,
            pressed && styles.dangerButtonPressed,
          ]}
        >
          <Text style={styles.dangerButtonText}>Clear all sessions</Text>
        </Pressable>

        <Pressable
          onPress={handleClearAll}
          style={({ pressed }) => [
            styles.dangerButton,
            pressed && styles.dangerButtonPressed,
          ]}
        >
          <Text style={styles.dangerButtonText}>Reset all local data</Text>
        </Pressable>
      </View>

      <View style={styles.futureCard}>
        {/* text to handle the future label */}
        <Text style={styles.futureLabel}>COMING LATER</Text>
        {/* text to handle the future title */}
        <Text style={styles.futureTitle}>Blackjack training & simulation</Text>
        {/* text to handle the future text */}
        <Text style={styles.futureText}>
          Strategy drills and card-counting simulations will live in a separate
          feature area, without changing your tracker data.
        </Text>
      </View>
    </ScrollView>
  );
}

/**
 * Styles for the settings screen
 * @returns {StyleSheet}
 * @description This styles are used to style the settings screen.
 * @example
 * <SettingsScreen />
 */
const styles = StyleSheet.create({
  // screen to handle the screen style
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  // content to handle the content style
  content: {
    // gap to handle the gap
    gap: spacing.lg,
    padding: spacing.md,
    // padding bottom to handle the padding bottom
    paddingBottom: spacing.xl,
  },
  // heading to handle the heading style
  heading: {
    // color to handle the color
    color: colors.text,
    // font size to handle the font size
    fontSize: 25,
    // font weight to handle the font weight
    fontWeight: '800',
  },
  // subtitle to handle the subtitle style
  subtitle: {
    // color to handle the color
    color: colors.textMuted,
    fontSize: 14,
    // line height to handle the line height
    lineHeight: 20,
    // margin top to handle the margin top
    marginTop: spacing.xs,
  },
  // card to handle the card style
  card: {
    // background color to handle the background color
    backgroundColor: colors.surface,
    // border color to handle the border color
    borderColor: colors.border,
    // border radius to handle the border radius
    borderRadius: radius.md,
    // border width to handle the border width
    borderWidth: 1,
    // gap to handle the gap
    gap: spacing.md,
    // padding to handle the padding
    padding: spacing.md,
  },
  // label to handle the label style
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  dataHelp: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonPressed: {
    opacity: 0.8,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  dangerButton: {
    alignItems: 'center',
    borderColor: colors.negative,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  dangerButtonPressed: {
    opacity: 0.8,
  },
  dangerButtonText: {
    color: colors.negative,
    fontSize: 15,
    fontWeight: '700',
  },
  // input to handle the input style
  input: {
    // background color to handle the background color
    backgroundColor: colors.input,
    // border color to handle the border color
    borderColor: colors.border,
    // border radius to handle the border radius
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  // currency row to handle the currency row style
  currencyRow: {
    // flex direction to handle the flex direction
    flexDirection: 'row',
    // flex wrap to handle the flex wrap
    flexWrap: 'wrap',
    // gap to handle the gap
    gap: spacing.sm,
  },
  currencyButton: {
    // border color to handle the border color
    borderColor: colors.border,
    // border radius to handle the border radius
    borderRadius: radius.sm,
    // border width to handle the border width
    borderWidth: 1,
    // padding horizontal to handle the padding horizontal
    paddingHorizontal: spacing.md,
    // padding vertical to handle the padding vertical
    paddingVertical: spacing.sm,
  },
  currencyButtonActive: {
    // background color to handle the background color
    backgroundColor: colors.primary,
    // border color to handle the border color
    borderColor: colors.primary,
  },
  currencyText: {
    // color to handle the color
    color: colors.textMuted,
    // font weight to handle the font weight
    fontWeight: '700',
  },
  // currency text active to handle the currency text active style
  currencyTextActive: {
    // color to handle the color
    color: colors.background,
  },
  message: {
    // font size to handle the font size
    fontSize: 13,
  },
  successMessage: {
    // color to handle the color
    color: colors.positive,
  },
  errorMessage: {
    // color to handle the color
    color: colors.negative,
  },
  saveButton: {
    // align items to handle the align items
    alignItems: 'center',
    // background color to handle the background color
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
