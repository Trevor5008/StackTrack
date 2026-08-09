import { router, useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SessionListItem } from '@/src/components/SessionListItem';
import { StatCard } from '@/src/components/StatCard';
import { TextField } from '@/src/components/TextField';
import { useLiveSession } from '@/src/context/LiveSessionContext';
import { useSessions } from '@/src/context/SessionContext';
import { formatCurrency, formatHours } from '@/src/lib/format';
import {
  DEFAULT_RISK_TOLERANCE,
  RISK_TOLERANCE_PRESETS,
} from '@/src/lib/riskOfRuin';
import {
  currentBankroll,
  hourlyRate,
  lifetimeProfitLoss,
  sessionsForCasino,
  totalHours,
  totalSessions,
  winLossRecord,
} from '@/src/lib/stats';
import { getCasino } from '@/src/storage/casinoStore';
import { Casino } from '@/src/types/casino';
import { colors, radius, spacing } from '@/src/theme';

export default function CasinoScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id: string }>();
  const casinoId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { sessions, casinos, settings, isLoading, renameCasino } =
    useSessions();
  const {
    activeSession,
    isLoading: liveLoading,
    startSession,
    refresh: refreshLive,
  } = useLiveSession();
  const [fetchedCasino, setFetchedCasino] = useState<Casino | null>(null);
  const [lookupDone, setLookupDone] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [starting, setStarting] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [riskTolerance, setRiskTolerance] = useState<number>(5);
  const [startError, setStartError] = useState<string | null>(null);
  const [savingStart, setSavingStart] = useState(false);

  const casinoFromContext = casinos.find((item) => item.id === casinoId);
  const casino = casinoFromContext ?? fetchedCasino;

  useLayoutEffect(() => {
    navigation.setOptions({ title: casino?.name ?? 'Casino' });
  }, [navigation, casino?.name]);

  useEffect(() => {
    if (!casinoId || casinoFromContext) {
      setFetchedCasino(null);
      setLookupDone(true);
      return;
    }
    let cancelled = false;
    setLookupDone(false);
    getCasino(casinoId)
      .then((row) => {
        if (!cancelled) setFetchedCasino(row);
      })
      .catch(() => {
        if (!cancelled) setFetchedCasino(null);
      })
      .finally(() => {
        if (!cancelled) setLookupDone(true);
      });
    return () => {
      cancelled = true;
    };
  }, [casinoId, casinoFromContext]);

  const casinoSessions = useMemo(
    () => (casinoId ? sessionsForCasino(sessions, casinoId) : []),
    [sessions, casinoId],
  );

  const bankroll = useMemo(
    () => currentBankroll(settings.startingBankroll, sessions),
    [settings.startingBankroll, sessions],
  );

  if (isLoading || liveLoading || (!casino && !lookupDone)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!casino) {
    return (
      <View style={styles.centered}>
        <Text style={styles.missing}>Casino not found</Text>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.link}>Back to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  const currency = settings.currency;
  const profitLoss = lifetimeProfitLoss(casinoSessions);
  const record = winLossRecord(casinoSessions);
  const liveHere = activeSession?.casinoId === casino.id;

  const beginRename = () => {
    setDraftName(casino.name);
    setRenameError(null);
    setEditingName(true);
  };

  const cancelRename = () => {
    setEditingName(false);
    setDraftName('');
    setRenameError(null);
  };

  const saveRename = async () => {
    if (renaming) return;
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === casino.name) {
      cancelRename();
      return;
    }

    setRenaming(true);
    setRenameError(null);
    try {
      await renameCasino(casino.id, trimmed);
      setFetchedCasino((current) =>
        current && current.id === casino.id
          ? { ...current, name: trimmed }
          : current,
      );
      await refreshLive();
      setEditingName(false);
      setDraftName('');
    } catch (err) {
      setRenameError(
        err instanceof Error ? err.message : 'Could not rename casino.',
      );
    } finally {
      setRenaming(false);
    }
  };

  const openStartModal = () => {
    if (activeSession) {
      router.push('/live');
      return;
    }
    setBudgetInput(bankroll > 0 ? String(bankroll) : '');
    setRiskTolerance(DEFAULT_RISK_TOLERANCE);
    setStartError(null);
    setStarting(true);
  };

  const onConfirmStart = async () => {
    setSavingStart(true);
    setStartError(null);
    try {
      await startSession({
        casinoId: casino.id,
        startingBankroll: bankroll,
        budget: Number(budgetInput),
        riskTolerance,
      });
      setStarting(false);
      router.push('/live');
    } catch (err) {
      setStartError(
        err instanceof Error ? err.message : 'Could not start the session.',
      );
    } finally {
      setSavingStart(false);
    }
  };

  return (
    <>
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.screen}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={styles.eyebrow}>CASINO</Text>
        {editingName ? (
          <View style={styles.renameBlock}>
            <TextInput
              autoFocus
              value={draftName}
              onChangeText={(value) => {
                setDraftName(value);
                if (renameError) setRenameError(null);
              }}
              onSubmitEditing={() => void saveRename()}
              onBlur={() => {
                if (!renaming) void saveRename();
              }}
              returnKeyType="done"
              editable={!renaming}
              style={styles.headingInput}
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Casino name"
            />
            {renameError ? (
              <Text style={styles.renameError}>{renameError}</Text>
            ) : (
              <Text style={styles.renameHint}>
                Press done to save · clear to cancel
              </Text>
            )}
          </View>
        ) : (
          <Pressable
            onLongPress={beginRename}
            delayLongPress={350}
            accessibilityRole="button"
            accessibilityHint="Long press to rename"
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.heading}>{casino.name}</Text>
          </Pressable>
        )}
      </View>

      {activeSession ? (
        <Pressable
          onPress={() => router.push('/live')}
          style={({ pressed }) => [
            styles.liveBanner,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.liveEyebrow}>
            {liveHere ? 'SESSION IN PROGRESS HERE' : 'SESSION IN PROGRESS'}
          </Text>
          <Text style={styles.liveHint}>
            {liveHere
              ? 'Tap to continue this casino’s live session'
              : `Active at ${activeSession.location} — tap to open`}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={openStartModal}
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.startButtonText}>Start live session</Text>
        </Pressable>
      )}

      <View style={styles.statsGrid}>
        <StatCard
          featured
          label="Casino P/L"
          tone={
            profitLoss > 0 ? 'positive' : profitLoss < 0 ? 'negative' : 'default'
          }
          value={formatCurrency(profitLoss, currency, true)}
        />
        <StatCard
          label="Sessions"
          value={String(totalSessions(casinoSessions))}
        />
        <StatCard
          label="Hours"
          value={formatHours(totalHours(casinoSessions))}
        />
        <StatCard
          label="Hourly"
          tone={hourlyRate(casinoSessions) >= 0 ? 'positive' : 'negative'}
          value={`${formatCurrency(hourlyRate(casinoSessions), currency, true)}/hr`}
        />
        <StatCard
          label="Win / loss / push"
          value={`${record.wins} / ${record.losses} / ${record.pushes}`}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent at this casino</Text>
        {casinoSessions.length === 0 ? (
          <Text style={styles.empty}>
            No sessions yet. Start a live session to begin tracking here.
          </Text>
        ) : (
          <View style={styles.list}>
            {casinoSessions.slice(0, 5).map((session) => (
              <SessionListItem
                currency={currency}
                key={session.id}
                session={session}
                showCasinoName={false}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>

    <Modal
      visible={starting}
      animationType="slide"
      transparent
      onRequestClose={() => setStarting(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Start session</Text>
          <Text style={styles.modalHint}>
            Available bankroll: {formatCurrency(bankroll, currency)}
          </Text>
          <TextField
            label="Session budget"
            keyboardType="numeric"
            value={budgetInput}
            onChangeText={setBudgetInput}
          />
          <Text style={styles.modalHint}>Risk tolerance (max RoR)</Text>
          <View style={styles.toleranceRow}>
            {RISK_TOLERANCE_PRESETS.map((preset) => {
              const selected = riskTolerance === preset;
              return (
                <Pressable
                  key={preset}
                  onPress={() => setRiskTolerance(preset)}
                  style={[
                    styles.toleranceChip,
                    selected && styles.toleranceChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.toleranceChipText,
                      selected && styles.toleranceChipTextSelected,
                    ]}
                  >
                    {preset}%
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {startError ? (
            <Text style={styles.startError}>{startError}</Text>
          ) : null}
          <View style={styles.modalActions}>
            <Pressable
              onPress={() => setStarting(false)}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => void onConfirmStart()}
              disabled={savingStart}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
                savingStart && styles.disabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {savingStart ? 'Starting…' : 'Start'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
    </>
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
  centered: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  missing: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  renameBlock: {
    gap: spacing.xs,
  },
  headingInput: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  renameHint: {
    color: colors.textMuted,
    fontSize: 12,
  },
  renameError: {
    color: colors.negative,
    fontSize: 12,
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 52,
  },
  startButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
  liveBanner: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  liveEyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  liveHint: {
    color: colors.textMuted,
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  list: {
    gap: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  modalHint: {
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  toleranceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  toleranceChip: {
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    minWidth: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  toleranceChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toleranceChipText: {
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  toleranceChipTextSelected: {
    color: colors.background,
  },
  startError: {
    color: colors.negative,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButtonText: {
    color: colors.background,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
