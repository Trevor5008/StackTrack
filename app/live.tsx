import { router } from 'expo-router';
import { useMemo, useState } from 'react';
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

// Live session screen component
import { RankBadge } from '@/src/components/RankBadge';
import { TableRulesForm } from '@/src/components/TableRulesForm';
import { useLiveSession } from '@/src/context/LiveSessionContext';
import { useSessions } from '@/src/context/SessionContext';
import { confirmAction } from '@/src/lib/confirm';
import { formatCurrency } from '@/src/lib/format';
import { formatElapsed } from '@/src/lib/liveTimer';
import {
  defaultTableRules,
  formatTableRulesSummary,
  parseTableRules,
  serializeTableRules,
} from '@/src/lib/tableRules';
import { rankTables } from '@/src/lib/tableRanking';
import { colors, radius, spacing } from '@/src/theme';
import { TableRules } from '@/src/types/tableRules';

// Live session screen component
export default function LiveSessionScreen() {
  const { settings } = useSessions();
  const {
    activeSession,
    tables,
    elapsedMs,
    cumulativePnL,
    isLoading,
    pause,
    resume,
    addTable,
    updateTable,
    endSession,
    discardSession,
  } = useLiveSession();

  const [ending, setEnding] = useState(false);
  const [location, setLocation] = useState('');
  const [buyIn, setBuyIn] = useState('');
  const [cashOut, setCashOut] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [rulesTableId, setRulesTableId] = useState<string | null>(null);
  const [savingRules, setSavingRules] = useState(false);

  const currency = settings.currency;

  // Calculate hours preview
  const hoursPreview = useMemo(
    () => Math.max(0.01, Math.round((elapsedMs / 3_600_000) * 100) / 100),
    [elapsedMs],
  );

  const tableRanks = useMemo(() => rankTables(tables), [tables]);

  // Render loading indicator
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // Render empty session
  if (!activeSession) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No live session</Text>
        <Text style={styles.emptyBody}>
          Start a live session from the Dashboard.
        </Text>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.link}>Back to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  // Open the end session form
  const openEndForm = () => {
    setLocation(activeSession.location || '');
    setBuyIn(String(activeSession.startingBankroll));
    setCashOut('');
    setFormError(null);
    setEnding(true);
  };

  const onSaveRules = async (rules: TableRules) => {
    if (!rulesTableId) return;
    setSavingRules(true);
    try {
      await updateTable(rulesTableId, {
        rulesJson: serializeTableRules(rules),
      });
      setRulesTableId(null);
    } finally {
      setSavingRules(false);
    }
  };

  // Discard the live session
  const onDiscard = () => {
    confirmAction(
      {
        title: 'Discard live session?',
        message: 'Timer progress and tables will be lost.',
        confirmLabel: 'Discard',
        destructive: true,
      },
      async () => {
        await discardSession();
        router.replace('/');
      },
    );
  };

  // Save the end session
  const onSaveEnd = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const parsedBuyIn = Number(buyIn);
      const parsedCashOut = Number(cashOut);
      await endSession({
        location,
        buyIn: parsedBuyIn,
        cashOut: parsedCashOut,
      });
      setEnding(false);
      router.replace('/');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not save the session.',
      );
    } finally {
      setSaving(false);
    }
  };

  // Render the live session screen
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.eyebrow}>LIVE SESSION</Text>
          <Text style={styles.timer}>{formatElapsed(elapsedMs)}</Text>
          <Text style={styles.timerHint}>
            {activeSession.isPaused ? 'Paused' : 'Running'}
          </Text>

          <View style={styles.bannerStats}>
            <View style={styles.bannerStat}>
              <Text style={styles.bannerLabel}>Starting</Text>
              <Text style={styles.bannerValue}>
                {formatCurrency(activeSession.startingBankroll, currency)}
              </Text>
            </View>
            <View style={styles.bannerStat}>
              <Text style={styles.bannerLabel}>Table P/L</Text>
              <Text
                style={[
                  styles.bannerValue,
                  {
                    color:
                      cumulativePnL >= 0 ? colors.positive : colors.negative,
                  },
                ]}
              >
                {formatCurrency(cumulativePnL, currency, true)}
              </Text>
            </View>
          </View>
        </View>

        {/* Session controls */}
        <View style={styles.controls}>
          {activeSession.isPaused ? (
            <Pressable
              onPress={() => void resume()}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Resume</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => void pause()}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Pause</Text>
            </Pressable>
          )}
          <Pressable
            onPress={openEndForm}
            style={({ pressed }) => [
              styles.endButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.endButtonText}>End session</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tables</Text>
          <Pressable
            onPress={() =>
              void addTable({ name: `Table ${tables.length + 1}` })
            }
          >
            <Text style={styles.link}>Add table</Text>
          </Pressable>
        </View>

        {/* Render empty tables */}
        {tables.length === 0 ? (
          <Text style={styles.emptyTables}>
            No tables yet. Add one to track P/L by table.
          </Text>
        ) : (
          <View style={styles.tableList}>
            {tables.map((table) => {
              const expanded = editingTableId === table.id;
              const rank = tableRanks.get(table.id);
              return (
                <View
                  key={table.id}
                  style={[
                    styles.tableCard,
                    rank?.isBest && styles.tableCardBest,
                  ]}
                >
                  <Pressable
                    onPress={() =>
                      setEditingTableId(expanded ? null : table.id)
                    }
                    style={styles.tableRow}
                  >
                    <RankBadge
                      houseEdge={rank?.houseEdge}
                      tier={rank?.tier}
                      isBest={rank?.isBest}
                    />
                    <View style={styles.tableMain}>
                      <Text style={styles.tableName}>{table.name}</Text>
                      {rank?.isBest ? (
                        <Text style={styles.bestRulesLabel}>Best rules</Text>
                      ) : null}
                      <Text
                        style={[
                          styles.tablePnL,
                          {
                            color:
                              table.netResult >= 0
                                ? colors.positive
                                : colors.negative,
                          },
                        ]}
                      >
                        {formatCurrency(table.netResult, currency, true)}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
                  </Pressable>

                  {expanded ? (
                    <View style={styles.tableExpanded}>
                      <Text style={styles.fieldLabel}>Table name</Text>
                      <TextInput
                        style={styles.input}
                        value={table.name}
                        onChangeText={(name) =>
                          void updateTable(table.id, { name })
                        }
                        placeholderTextColor={colors.textMuted}
                      />
                      <Text style={styles.fieldLabel}>Net result</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={String(table.netResult)}
                        onChangeText={(value) => {
                          const parsed = Number(value);
                          if (Number.isFinite(parsed)) {
                            void updateTable(table.id, { netResult: parsed });
                          }
                        }}
                        placeholderTextColor={colors.textMuted}
                      />
                      <Pressable
                        onPress={() => setRulesTableId(table.id)}
                        style={({ pressed }) => [
                          styles.rulesButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={styles.rulesButtonText}>
                          {(() => {
                            const parsed = parseTableRules(table.rulesJson);
                            return parsed
                              ? formatTableRulesSummary(parsed)
                              : 'Set table rules';
                          })()}
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        <Pressable onPress={onDiscard} style={styles.discardLink}>
          <Text style={styles.discardText}>Discard session</Text>
        </Pressable>
      </ScrollView>

      {/* End session modal */}
      <Modal
        visible={ending}
        animationType="slide"
        transparent
        onRequestClose={() => setEnding(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>End session</Text>
            <Text style={styles.fieldLabel}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Casino name"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.fieldLabel}>Buy-in</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={buyIn}
              onChangeText={setBuyIn}
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.fieldLabel}>Cash-out</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={cashOut}
              onChangeText={setCashOut}
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.hoursReadOnly}>
              Hours played (from timer): {hoursPreview}
            </Text>
            {formError ? <Text style={styles.error}>{formError}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setEnding(false)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => void onSaveEnd()}
                disabled={saving}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                  saving && styles.disabled,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {saving ? 'Saving…' : 'Save session'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={rulesTableId != null}
        animationType="slide"
        transparent
        onRequestClose={() => setRulesTableId(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            {rulesTableId ? (
              <TableRulesForm
                key={rulesTableId}
                initialRules={
                  parseTableRules(
                    tables.find((t) => t.id === rulesTableId)?.rulesJson,
                  ) ?? defaultTableRules()
                }
                onCancel={() => setRulesTableId(null)}
                onSave={onSaveRules}
                saving={savingRules}
              />
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// Live session screen style rules
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
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  emptyBody: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  banner: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  timer: {
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 40,
    fontWeight: '700',
  },
  timerHint: {
    color: colors.textMuted,
    fontSize: 13,
  },
  bannerStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  bannerStat: {
    flex: 1,
    gap: spacing.xs,
  },
  bannerLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  bannerValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
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
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
  endButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.negative,
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  endButtonText: {
    color: colors.negative,
    fontWeight: '700',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  emptyTables: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  tableList: {
    gap: spacing.sm,
  },
  tableCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableCardBest: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  tableRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  tableMain: {
    flex: 1,
    gap: 2,
  },
  tableName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  bestRulesLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tablePnL: {
    fontSize: 14,
    fontWeight: '600',
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 16,
  },
  tableExpanded: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.md,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  rulesButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  rulesButtonText: {
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  discardLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  discardText: {
    color: colors.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
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
    marginBottom: spacing.sm,
  },
  hoursReadOnly: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.negative,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
