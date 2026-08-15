import { ActionButton } from '@/src/components/ActionButton';
import { FormSheet } from '@/src/components/FormSheet';
import { SessionTableCard } from '@/src/components/SessionTableCard';
import { TableRulesForm } from '@/src/components/TableRulesForm';
import { TextField } from '@/src/components/TextField';
import { useLiveSession } from '@/src/context/LiveSessionContext';
import { useSessions } from '@/src/context/SessionContext';
import { confirmAction } from '@/src/lib/confirm';
import { formatCurrency } from '@/src/lib/format';
import { formatElapsed, msToHoursPlayed } from '@/src/lib/liveTimer';
import { computeSessionBankroll } from '@/src/lib/sessionBudget';
import {
  estimateBasicStrategyRoR,
  formatRoR,
  isTableViable,
} from '@/src/lib/riskOfRuin';
import {
  defaultTableRules,
  parseTableRules,
  serializeTableRules,
} from '@/src/lib/tableRules';
import { rankTables } from '@/src/lib/tableRanking';
import { colors } from '@/src/theme';
import { commonStyles } from '@/src/theme/commonStyles';
import { TableRules } from '@/src/types/tableRules';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { styles } from './live.styles';

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
    deleteTable,
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
  const sessionBankroll = useMemo(
    () => computeSessionBankroll(budget, tables),
    [budget, tables],
  );
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
      sessionBankroll,
      bettingUnit: Number.isFinite(unit) && unit > 0 ? unit : null,
      rules: moneyTableRules,
    });
  }, [
    moneyModal?.kind,
    activeSession,
    sessionBankroll,
    bettingUnitInput,
    moneyTableRules,
  ]);

  if (isLoading) {
    return (
      <View style={commonStyles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!activeSession) {
    return (
      <View style={commonStyles.centered}>
        <Text style={styles.emptyTitle}>No live session</Text>
        <Text style={styles.emptyBody}>
          Start a live session from a casino screen.
        </Text>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={commonStyles.link}>Back to Dashboard</Text>
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

  const onDeleteTable = (tableId: string) => {
    const table = tables.find((item) => item.id === tableId);
    if (!table) return;

    if (!table.isPaused || table.stake > 0) {
      const title = 'Pause before deleting';
      const message = 'Pause this table before deleting it.';
      if (Platform.OS === 'web') {
        if (typeof globalThis !== 'undefined' && 'alert' in globalThis) {
          (globalThis as { alert: (text: string) => void }).alert(
            `${title}\n\n${message}`,
          );
        }
        return;
      }
      Alert.alert(title, message);
      return;
    }

    confirmAction(
      {
        title: 'Delete table?',
        message: 'This removes the table and its P/L from the live session.',
        confirmLabel: 'Delete',
        destructive: true,
      },
      async () => {
        try {
          await deleteTable(tableId);
          if (rulesTableId === tableId) setRulesTableId(null);
          setTableError(null);
        } catch (err) {
          setTableError(
            err instanceof Error ? err.message : 'Could not delete the table.',
          );
        }
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
    const targetId = tables[0]?.id;
    if (!targetId) return;
    openStakeModal(targetId);
  };

  const onBannerPause = () => {
    if (!runningTableId) return;
    openResultsModal(runningTableId);
  };

  return (
    <View style={commonStyles.screen}>
      <ScrollView
        contentContainerStyle={commonStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={commonStyles.eyebrow}>LIVE SESSION</Text>
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
            <ActionButton
              label="Resume"
              onPress={onBannerResume}
              disabled={tables.length === 0}
            />
          ) : (
            <ActionButton
              label="Pause"
              onPress={onBannerPause}
              variant="secondary"
            />
          )}
          <ActionButton
            label="End session"
            onPress={openEndConfirm}
            variant="danger"
          />
        </View>

        {liveError || tableError ? (
          <Text style={commonStyles.error}>{liveError ?? tableError}</Text>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>Tables</Text>
          <Pressable
            onPress={() =>
              void addTable({ name: `Table ${tables.length + 1}` })
            }
          >
            <Text style={commonStyles.link}>Add table</Text>
          </Pressable>
        </View>

        {tables.length === 0 ? (
          <Text style={styles.emptyTables}>
            No tables yet. Add one, then tap Play to choose a stake.
          </Text>
        ) : (
          <View style={styles.tableList}>
            {tables.map((table) => (
              <SessionTableCard
                key={table.id}
                mode="live"
                table={table}
                currency={currency}
                rank={tableRanks.get(table.id)}
                sessionBankroll={sessionBankroll}
                riskTolerance={activeSession.riskTolerance}
                onPlay={() => openStakeModal(table.id)}
                onPause={() => openResultsModal(table.id)}
                onChangeName={(name) => void updateTable(table.id, { name })}
                onOpenRules={() => setRulesTableId(table.id)}
                onDelete={() => onDeleteTable(table.id)}
              />
            ))}
          </View>
        )}

        <Pressable onPress={onDiscard} style={styles.discardLink}>
          <Text style={styles.discardText}>Discard session</Text>
        </Pressable>
      </ScrollView>

      <FormSheet
        visible={moneyModal != null}
        title={
          moneyModal?.kind === 'stake' ? 'Table stake' : 'Table results'
        }
        onClose={() => setMoneyModal(null)}
        primaryLabel={moneyModal?.kind === 'stake' ? 'Play' : 'Pause'}
        onPrimary={() => void onConfirmMoney()}
        saving={saving}
        error={formError}
        header={
          moneyTable ? (
            <Text style={styles.hoursReadOnly}>{moneyTable.name}</Text>
          ) : null
        }
      >
        {moneyModal?.kind === 'stake' ? (
          <>
            <Text style={styles.hoursReadOnly}>
              Remaining budget: {formatCurrency(remainingBudget, currency)}
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
              Stake out: {formatCurrency(moneyTable?.stake ?? 0, currency)}
            </Text>
            <TextField
              label="Ending chips"
              keyboardType="numeric"
              value={moneyAmount}
              onChangeText={setMoneyAmount}
            />
          </>
        )}
      </FormSheet>

      <FormSheet
        visible={ending}
        title="End session?"
        onClose={() => setEnding(false)}
        primaryLabel="Confirm"
        onPrimary={() => void onConfirmEnd()}
        saving={saving}
        error={formError}
      >
        <Text style={styles.hoursReadOnly}>
          Casino: {activeSession.location}
        </Text>
        <Text style={styles.hoursReadOnly}>
          Budget: {formatCurrency(budget, currency)}
        </Text>
        <Text style={styles.hoursReadOnly}>
          Cash-out (remaining): {formatCurrency(remainingBudget, currency)}
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
        <Text style={styles.hoursReadOnly}>Hours played: {hoursPreview}</Text>
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
          Table P/L total: {formatCurrency(cumulativePnL, currency, true)}
        </Text>
      </FormSheet>

      <FormSheet
        visible={rulesTableId != null}
        onClose={() => setRulesTableId(null)}
        showActions={false}
      >
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
      </FormSheet>
    </View>
  );
}
