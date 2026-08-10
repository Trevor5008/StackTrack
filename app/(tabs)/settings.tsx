import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { TextField } from '@/src/components/TextField';
import { useSessions } from '@/src/context/SessionContext';
import { confirmAction } from '@/src/lib/confirm';

import { styles } from './settings.styles';

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
        <TextField
          label="Starting bankroll"
          value={startingBankroll}
          onChangeText={setStartingBankroll}
          keyboardType="decimal-pad"
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
