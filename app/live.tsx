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
  View,
} from 'react-native';

import { RankBadge } from '@/src/components/RankBadge';
import { TableRulesForm } from '@/src/components/TableRulesForm';
import { TextField } from '@/src/components/TextField';
import { useLiveSession } from '@/src/context/LiveSessionContext';
import { useSessions } from '@/src/context/SessionContext';
import { confirmAction } from '@/src/lib/confirm';
import { formatCurrency, formatTableCardTitle } from '@/src/lib/format';
import {
  computeElapsedMs,
  formatElapsed,
  msToHoursPlayed,
} from '@/src/lib/liveTimer';
import {
  estimateBasicStrategyRoR,
  formatRoR,
  isTableViable,
} from '@/src/lib/riskOfRuin';
import {
  defaultTableRules,
  formatTableRulesSummary,
  parseTableRules,
  serializeTableRules,
} from '@/src/lib/tableRules';
import { rankTables } from '@/src/lib/tableRanking';
import { colors, radius, spacing } from '@/src/theme';
import { TableRules } from '@/src/types/tableRules';

type MoneyModal =
  | { kind: 'stake'; tableId: string }
  | { kind: 'results'; tableId: string }
  | null;

export default function LiveSessionScreen() {
  const { settings } = useSessions();
  const {
    activeSession,
    tables,
    elapsedMs,
    cumulativePnL,
    remainingBudget,
    runningTableId,
    isLoading,
    error: liveError,
    playTable,
    pauseTable,
    addTable,
    updateTable,
    endSession,
    discardSession,
  } = useLiveSession();

  const [ending, setEnding] = useState(false);
  const [moneyModal, setMoneyModal] = useState<MoneyModal>(null);
  const [moneyAmount, setMoneyAmount] = useState('');
  const [bettingUnitInput, setBettingUnitInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [rulesTableId, setRulesTableId] = useState<string | null>(null);
  const [savingRules, setSavingRules] = useState(false);

  const currency = settings.currency;

  const hoursPreview = useMemo(
    () => Math.max(0.01, msToHoursPlayed(elapsedMs)),
    [elapsedMs],
  );

  const tableRanks = useMemo(() => rankTables(tables), [tables]);
  const runningTable = tables.find((table) => table.id === runningTableId);
  const allPaused = !runningTableId;
  const budget = activeSession?.buyIn ?? 0;
  const sessionNet = remainingBudget - budget;
  const moneyTable = moneyModal
    ? tables.find((table) => table.id === moneyModal.tableId)
    : null;
  const moneyTableRules = moneyTable
    ? parseTableRules(moneyTable.rulesJson)
    : null;

  const playRoRPreview = useMemo(() => {
    if (moneyModal?.kind !== 'stake' || !activeSession) return null;
    const unit = Number(bettingUnitInput);
    return estimateBasicStrategyRoR({
      remainingBudget,
      bettingUnit: Number.isFinite(unit) && unit > 0 ? unit : null,
      rules: moneyTableRules,
    });
  }, [
    moneyModal?.kind,
    activeSession,
    remainingBudget,
    bettingUnitInput,
    moneyTableRules,
  ]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!activeSession) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No live session</Text>
        <Text style={styles.emptyBody}>
          Start a live session from a casino screen.
        </Text>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.link}>Back to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  const openStakeModal = (tableId: string) => {
    const table = tables.find((item) => item.id === tableId);
    const rules = parseTableRules(table?.rulesJson ?? null);
    if (!rules) {
      setTableError('Set table rules before playing.');
      return;
    }
    setTableError(null);
    setFormError(null);
    setMoneyAmount(remainingBudget > 0 ? String(remainingBudget) : '');
    setBettingUnitInput(
      table?.bettingUnit != null
        ? String(table.bettingUnit)
        : String(rules.minimumBet),
    );
    setMoneyModal({ kind: 'stake', tableId });
  };

  const openResultsModal = (tableId: string) => {
    const table = tables.find((item) => item.id === tableId);
    setTableError(null);
    setFormError(null);
    setMoneyAmount(table && table.stake > 0 ? String(table.stake) : '');
    setMoneyModal({ kind: 'results', tableId });
  };

  const openEndConfirm = () => {
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

  const onConfirmMoney = async () => {
    if (!moneyModal) return;
    setSaving(true);
    setFormError(null);
    try {
      const amount = Number(moneyAmount);
      if (moneyModal.kind === 'stake') {
        await playTable(moneyModal.tableId, amount, Number(bettingUnitInput));
      } else {
        await pauseTable(moneyModal.tableId, amount);
      }
      setMoneyModal(null);
      setMoneyAmount('');
      setBettingUnitInput('');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not update the table.',
      );
    } finally {
      setSaving(false);
    }
  };

  const onConfirmEnd = async () => {
    setSaving(true);
    setFormError(null);
    const casinoId = activeSession.casinoId;
    try {
      await endSession();
      setEnding(false);
      if (casinoId) {
        router.replace({ pathname: '/casino/[id]', params: { id: casinoId } });
      } else {
        router.replace('/');
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not save the session.',
      );
    } finally {
      setSaving(false);
    }
  };

  const onBannerResume = () => {
    const targetId =
      tables.find((table) => table.id === editingTableId)?.id ??
      tables[0]?.id;
    if (!targetId) return;
    openStakeModal(targetId);
  };

  const onBannerPause = () => {
    if (!runningTableId) return;
    openResultsModal(runningTableId);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.eyebrow}>LIVE SESSION</Text>
          <Text style={styles.casinoName}>{activeSession.location}</Text>
          <Text style={styles.timer}>{formatElapsed(elapsedMs)}</Text>
          <Text style={styles.timerHint}>
            {runningTable
              ? `Playing · ${runningTable.name}`
              : tables.length === 0
                ? 'Add a table and tap Play to stake chips'
                : 'All tables paused'}
          </Text>

          <View style={styles.bannerStats}>
            <View style={styles.bannerStat}>
              <Text style={styles.bannerLabel}>Bankroll</Text>
              <Text style={styles.bannerValue}>
                {formatCurrency(activeSession.startingBankroll, currency)}
              </Text>
            </View>
            <View style={styles.bannerStat}>
              <Text style={styles.bannerLabel}>Budget</Text>
              <Text style={styles.bannerValue}>
                {formatCurrency(budget, currency)}
              </Text>
            </View>
          </View>
          <View style={styles.bannerStats}>
            <View style={styles.bannerStat}>
              <Text style={styles.bannerLabel}>Remaining</Text>
              <Text style={styles.bannerValue}>
                {formatCurrency(remainingBudget, currency)}
              </Text>
            </View>
            <View style={styles.bannerStat}>
              <Text style={styles.bannerLabel}>Risk cap</Text>
              <Text style={styles.bannerValue}>
                {activeSession.riskTolerance}%
              </Text>
            </View>
          </View>
          <View style={styles.bannerStats}>
            <View style={styles.bannerStat}>
              <Text style={styles.bannerLabel}>Session P/L</Text>
              <Text
                style={[
                  styles.bannerValue,
                  {
                    color:
                      sessionNet >= 0 ? colors.positive : colors.negative,
                  },
                ]}
              >
                {formatCurrency(sessionNet, currency, true)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          {allPaused ? (
            <Pressable
              onPress={onBannerResume}
              disabled={tables.length === 0}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
                tables.length === 0 && styles.disabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>Resume</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onBannerPause}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Pause</Text>
            </Pressable>
          )}
          <Pressable
            onPress={openEndConfirm}
            style={({ pressed }) => [
              styles.endButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.endButtonText}>End session</Text>
          </Pressable>
        </View>

        {liveError || tableError ? (
          <Text style={styles.error}>{liveError ?? tableError}</Text>
        ) : null}

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

        {tables.length === 0 ? (
          <Text style={styles.emptyTables}>
            No tables yet. Add one, then tap Play to choose a stake.
          </Text>
        ) : (
          <View style={styles.tableList}>
            {tables.map((table) => {
              const expanded = editingTableId === table.id;
              const rank = tableRanks.get(table.id);
              const tableElapsed = computeElapsedMs({
                accumulatedMs: table.accumulatedMs,
                isPaused: table.isPaused,
                segmentStartedAt: table.segmentStartedAt,
              });
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
                      {(() => {
                        const rules = parseTableRules(table.rulesJson);
                        const { title, subtitle } = formatTableCardTitle(
                          rules,
                          currency,
                          table.name,
                        );
                        return (
                          <>
                            <Text style={styles.tableName}>{title}</Text>
                            {subtitle ? (
                              <Text style={styles.tableSubtitle}>
                                {subtitle}
                              </Text>
                            ) : null}
                          </>
                        );
                      })()}
                      {rank?.isBest ? (
                        <Text style={styles.bestRulesLabel}>Best rules</Text>
                      ) : null}
                      <Text style={styles.tableTimer}>
                        {formatElapsed(tableElapsed)}
                        {table.isPaused ? ' · Paused' : ' · Playing'}
                        {!table.isPaused && table.stake > 0
                          ? ` · Stake ${formatCurrency(table.stake, currency)}`
                          : ''}
                      </Text>
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
                      {(() => {
                        const rules = parseTableRules(table.rulesJson);
                        const ror = estimateBasicStrategyRoR({
                          remainingBudget,
                          bettingUnit: table.bettingUnit,
                          rules,
                        });
                        if (!ror) {
                          return (
                            <Text style={styles.rorUnknown}>RoR unknown</Text>
                          );
                        }
                        const viable = isTableViable(
                          ror.rorPct,
                          activeSession.riskTolerance,
                        );
                        return (
                          <Text
                            style={[
                              styles.rorLine,
                              {
                                color: viable
                                  ? colors.positive
                                  : colors.negative,
                              },
                            ]}
                          >
                            RoR {formatRoR(ror.rorPct)}
                            {viable ? ' · Viable' : ' · Not viable'}
                          </Text>
                        );
                      })()}
                    </View>
                    <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
                  </Pressable>

                  <View style={styles.tableTimerActions}>
                    {table.isPaused ? (
                      <Pressable
                        onPress={() => openStakeModal(table.id)}
                        style={({ pressed }) => [
                          styles.tablePlayButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={styles.tablePlayButtonText}>Play</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => openResultsModal(table.id)}
                        style={({ pressed }) => [
                          styles.tablePauseButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={styles.tablePauseButtonText}>Pause</Text>
                      </Pressable>
                    )}
                  </View>

                  {expanded ? (
                    <View style={styles.tableExpanded}>
                      <TextField
                        label="Table name"
                        value={table.name}
                        onChangeText={(name) =>
                          void updateTable(table.id, { name })
                        }
                      />
                      <Text style={styles.hoursReadOnly}>
                        Table P/L:{' '}
                        {formatCurrency(table.netResult, currency, true)}
                      </Text>
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

      <Modal
        visible={moneyModal != null}
        animationType="slide"
        transparent
        onRequestClose={() => setMoneyModal(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {moneyModal?.kind === 'stake' ? 'Table stake' : 'Table results'}
            </Text>
            {moneyTable ? (
              <Text style={styles.hoursReadOnly}>{moneyTable.name}</Text>
            ) : null}
            {moneyModal?.kind === 'stake' ? (
              <>
                <Text style={styles.hoursReadOnly}>
                  Remaining budget:{' '}
                  {formatCurrency(remainingBudget, currency)}
                </Text>
                <Text style={styles.hoursReadOnly}>
                  Table min:{' '}
                  {formatCurrency(moneyTableRules?.minimumBet ?? 0, currency)}
                </Text>
                <TextField
                  label="Betting unit"
                  keyboardType="numeric"
                  value={bettingUnitInput}
                  onChangeText={setBettingUnitInput}
                />
                <TextField
                  label="Stake"
                  keyboardType="numeric"
                  value={moneyAmount}
                  onChangeText={setMoneyAmount}
                />
                {playRoRPreview ? (
                  <Text
                    style={[
                      styles.hoursReadOnly,
                      {
                        color: isTableViable(
                          playRoRPreview.rorPct,
                          activeSession.riskTolerance,
                        )
                          ? colors.positive
                          : colors.negative,
                      },
                    ]}
                  >
                    Est. RoR {formatRoR(playRoRPreview.rorPct)} (cap{' '}
                    {activeSession.riskTolerance}%)
                    {!isTableViable(
                      playRoRPreview.rorPct,
                      activeSession.riskTolerance,
                    )
                      ? ' — above your risk cap'
                      : ''}
                  </Text>
                ) : (
                  <Text style={styles.hoursReadOnly}>
                    RoR unknown until unit is set
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.hoursReadOnly}>
                  Stake out:{' '}
                  {formatCurrency(moneyTable?.stake ?? 0, currency)}
                </Text>
                <TextField
                  label="Ending chips"
                  keyboardType="numeric"
                  value={moneyAmount}
                  onChangeText={setMoneyAmount}
                />
              </>
            )}
            {formError ? <Text style={styles.error}>{formError}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setMoneyModal(null)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => void onConfirmMoney()}
                disabled={saving}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                  saving && styles.disabled,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {saving
                    ? 'Saving…'
                    : moneyModal?.kind === 'stake'
                      ? 'Play'
                      : 'Pause'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
            <Text style={styles.modalTitle}>End session?</Text>
            <Text style={styles.hoursReadOnly}>
              Casino: {activeSession.location}
            </Text>
            <Text style={styles.hoursReadOnly}>
              Budget: {formatCurrency(budget, currency)}
            </Text>
            <Text style={styles.hoursReadOnly}>
              Cash-out (remaining):{' '}
              {formatCurrency(remainingBudget, currency)}
            </Text>
            <Text
              style={[
                styles.hoursReadOnly,
                {
                  color: sessionNet >= 0 ? colors.positive : colors.negative,
                },
              ]}
            >
              Net: {formatCurrency(sessionNet, currency, true)}
            </Text>
            <Text style={styles.hoursReadOnly}>
              Hours played: {hoursPreview}
            </Text>
            {tables.length > 0 ? (
              <View style={styles.confirmTables}>
                {tables.map((table) => (
                  <Text key={table.id} style={styles.hoursReadOnly}>
                    {table.name}:{' '}
                    {formatCurrency(table.netResult, currency, true)}
                  </Text>
                ))}
              </View>
            ) : null}
            <Text style={styles.hoursReadOnly}>
              Table P/L total:{' '}
              {formatCurrency(cumulativePnL, currency, true)}
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
                onPress={() => void onConfirmEnd()}
                disabled={saving}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                  saving && styles.disabled,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {saving ? 'Saving…' : 'Confirm'}
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
  casinoName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  timer: {
    color: colors.text,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
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
  tableSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
  },
  tableTimer: {
    color: colors.textMuted,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  tableTimerActions: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
    paddingTop: spacing.sm,
  },
  tablePlayButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    minHeight: 40,
    justifyContent: 'center',
  },
  tablePlayButtonText: {
    color: colors.background,
    fontWeight: '800',
  },
  tablePauseButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  tablePauseButtonText: {
    color: colors.text,
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
  rorUnknown: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  rorLine: {
    fontSize: 12,
    fontWeight: '700',
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
  confirmTables: {
    gap: 2,
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
