import { HeaderBackButton } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RankBadge } from '@/src/components/RankBadge';
import { SessionForm } from '@/src/components/SessionForm';
import { useSessions } from '@/src/context/SessionContext';
import { confirmAction } from '@/src/lib/confirm';
import { formatCurrency, formatDate, formatHours, formatTableCardTitle } from '@/src/lib/format';
import { formatElapsed } from '@/src/lib/liveTimer';
import { formatHouseEdge } from '@/src/lib/houseEdge';
import { estimateBasicStrategyRoR, formatRoR } from '@/src/lib/riskOfRuin';
import { formatTableRulesSummary, parseTableRules } from '@/src/lib/tableRules';
import { rankTables } from '@/src/lib/tableRanking';
import { loadSessionTables } from '@/src/storage/liveSessionStore';
import { SessionTable } from '@/src/types/liveSession';
import { colors, radius, spacing } from '@/src/theme';

/**
 * Session detail screen
 * @returns {JSX.Element}
 * @description This screen is used to view a session detail.
 * @example
 * <SessionDetailScreen />
 */
export default function SessionDetailScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id: string }>();
  const sessionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { sessions, settings, isLoading, updateSession, deleteSession } =
    useSessions();
  const [editing, setEditing] = useState(false);
  const [tables, setTables] = useState<SessionTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const session = sessions.find((item) => item.id === sessionId);
  const tableRanks = useMemo(() => rankTables(tables), [tables]);

  // Keep header back reliable (native default can go inert on this stack screen).
  useLayoutEffect(() => {
    navigation.setOptions({
      title: editing ? 'Edit session' : 'Session details',
      gestureEnabled: true,
      headerLeft: (props: object) => (
        <HeaderBackButton
          {...props}
          onPress={() => {
            Keyboard.dismiss();
            if (editing) {
              setEditing(false);
              return;
            }
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace('/history');
          }}
        />
      ),
    });
  }, [editing, navigation]);

  // Load the session tables
  useEffect(() => {
    if (!sessionId) {
      setTables([]);
      setTablesLoading(false);
      return;
    }
    setTablesLoading(true);
    loadSessionTables(sessionId)
      .then(setTables)
      .catch(() => setTables([]))
      .finally(() => setTablesLoading(false));
  }, [sessionId]);

  // Render loading indicator
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // Render not found
  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Session not found</Text>
        <Pressable onPress={() => router.replace('/history')}>
          <Text style={styles.link}>Return to history</Text>
        </Pressable>
      </View>
    );
  }

  // Confirm delete session
  const confirmDelete = () => {
    confirmAction(
      {
        title: 'Delete session?',
        message: 'This permanently removes the session from local storage.',
        confirmLabel: 'Delete',
        destructive: true,
      },
      async () => {
        await deleteSession(session.id);
        router.replace('/history');
      },
    );
  };

  // Render edit session
  if (editing) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.screen}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.editHeader}>
            <Text style={styles.heading}>Edit session</Text>
            <Pressable onPress={() => setEditing(false)}>
              <Text style={styles.link}>Cancel</Text>
            </Pressable>
          </View>
          <SessionForm
            currency={settings.currency}
            initialValues={session}
            onSubmit={async (input) => {
              await updateSession(session.id, input);
              setEditing(false);
            }}
            startingBankroll={session.startingBankroll}
            submitLabel="Update session"
          />
          <SessionTablesList
            cashOut={session.cashOut}
            currency={settings.currency}
            loading={tablesLoading}
            ranks={tableRanks}
            tables={tables}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return ( 
    // keyboard avoiding view to handle the keyboard on mobile devices
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.location}>{session.location}</Text>
        <Text style={styles.date}>{formatDate(session.date)}</Text>
        <Text
          style={[
            styles.netResult,
            {
              color:
                session.netResult >= 0 ? colors.positive : colors.negative,
            },
          ]}
        >
          {/* net result */}
          {formatCurrency(session.netResult, settings.currency, true)}
        </Text>
        <Text style={styles.netLabel}>net result</Text>
      </View>

  {/* session details */}
      <View style={styles.card}>
        <DetailRow
          label="Bankroll before session"
          value={formatCurrency(
            session.startingBankroll,
            settings.currency,
          )}
        />
        <DetailRow
          label="Buy-in"
          value={formatCurrency(session.buyIn, settings.currency)}
        />
        <DetailRow
          label="Cash-out"
          value={formatCurrency(session.cashOut, settings.currency)}
        />
        <DetailRow
          label="Hours played"
          value={formatHours(session.hoursPlayed)}
        />
        <DetailRow label="Notes" value={session.notes || 'No notes'} />
      </View>

      <SessionTablesList
        cashOut={session.cashOut}
        currency={settings.currency}
        loading={tablesLoading}
        ranks={tableRanks}
        tables={tables}
      />

      {/* session metadata */}
      <View style={styles.metadata}>
        <Text style={styles.metadataText}>ID: {session.id}</Text>
        <Text style={styles.metadataText}>
          Created: {new Date(session.createdAt).toLocaleString()}
        </Text>
        <Text style={styles.metadataText}>
          Updated: {new Date(session.updatedAt).toLocaleString()}
        </Text>
      </View>

      {/* session actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => setEditing(true)}
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.editButtonText}>Edit session</Text>
        </Pressable>
        <Pressable
          onPress={confirmDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.deleteButtonText}>Delete session</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

/**
 * Detail row component
 * @param {Object} props - The component props.
 * @param {string} props.label - The label of the detail row.
 * @param {string} props.value - The value of the detail row.
 * @returns {JSX.Element}
 */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function SessionTablesList({
  currency,
  loading,
  ranks,
  tables,
  cashOut,
}: {
  currency: string;
  loading: boolean;
  ranks: ReturnType<typeof rankTables>;
  tables: SessionTable[];
  cashOut: number;
}) {
  return (
    <View style={styles.tablesSection}>
      <Text style={styles.sectionTitle}>Tables</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : tables.length === 0 ? (
        <Text style={styles.emptyTables}>
          No per-table breakdown for this session.
        </Text>
      ) : (
        <View style={styles.tableList}>
          {tables.map((table) => {
            const rules = parseTableRules(table.rulesJson);
            const rank = ranks.get(table.id);
            return (
              <View
                key={table.id}
                style={[
                  styles.tableRow,
                  rank?.isBest && styles.tableRowBest,
                ]}
              >
                <RankBadge
                  houseEdge={rank?.houseEdge}
                  tier={rank?.tier}
                  isBest={rank?.isBest}
                />
                <View style={styles.tableMain}>
                  {(() => {
                    const { title, subtitle } = formatTableCardTitle(
                      rules,
                      currency,
                      table.name,
                    );
                    return (
                      <>
                        <Text style={styles.tableName}>{title}</Text>
                        {subtitle ? (
                          <Text style={styles.tableSubtitle}>{subtitle}</Text>
                        ) : null}
                      </>
                    );
                  })()}
                  {rank?.isBest ? (
                    <Text style={styles.bestRulesLabel}>Best rules</Text>
                  ) : null}
                  {table.elapsedMs > 0 ? (
                    <Text style={styles.tableElapsed}>
                      {formatElapsed(table.elapsedMs)}
                    </Text>
                  ) : null}
                  {(() => {
                    const ror = estimateBasicStrategyRoR({
                      remainingBudget: cashOut,
                      bettingUnit: table.bettingUnit,
                      rules,
                    });
                    if (!ror) {
                      return (
                        <Text style={styles.tableElapsed}>RoR unknown</Text>
                      );
                    }
                    return (
                      <Text style={styles.tableElapsed}>
                        Unit{' '}
                        {formatCurrency(table.bettingUnit ?? 0, currency)} · RoR{' '}
                        {formatRoR(ror.rorPct)}
                      </Text>
                    );
                  })()}
                  <Text style={styles.tableRules}>
                    {rules
                      ? `${formatTableRulesSummary(rules)}${
                          rank?.houseEdge != null
                            ? ` · ${formatHouseEdge(rank.houseEdge)} HE`
                            : ''
                        }`
                      : 'No rules set'}
                  </Text>
                </View>
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
            );
          })}
        </View>
      )}
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
  },
  notFoundTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  editHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  location: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  date: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  netResult: {
    fontSize: 42,
    fontWeight: '800',
    marginTop: spacing.lg,
  },
  netLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  detailRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
  },
  tablesSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  emptyTables: {
    color: colors.textMuted,
  },
  tableList: {
    gap: spacing.sm,
  },
  tableRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  tableRowBest: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  tableMain: {
    flex: 1,
  },
  tableName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  tableSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  tableElapsed: {
    color: colors.textMuted,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  bestRulesLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  tableRules: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  tablePnL: {
    fontSize: 15,
    fontWeight: '700',
  },
  metadata: {
    gap: spacing.xs,
  },
  metadataText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  actions: {
    gap: spacing.sm,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    minHeight: 50,
    justifyContent: 'center',
  },
  editButtonText: {
    color: colors.background,
    fontWeight: '800',
  },
  deleteButton: {
    alignItems: 'center',
    borderColor: colors.negative,
    borderRadius: radius.sm,
    borderWidth: 1,
    minHeight: 50,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: colors.negative,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
