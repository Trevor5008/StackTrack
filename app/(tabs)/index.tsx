import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BankrollTrend } from '@/src/components/BankrollTrend';
import { SessionListItem } from '@/src/components/SessionListItem';
import { StatCard } from '@/src/components/StatCard';
import { useSessions } from '@/src/context/SessionContext';
import { formatCurrency, formatHours } from '@/src/lib/format';
import {
  biggestLoss,
  biggestWin,
  currentBankroll,
  hourlyRate,
  lifetimeProfitLoss,
  totalHours,
  totalSessions,
  winLossRecord,
} from '@/src/lib/stats';
import { colors, spacing } from '@/src/theme';

export default function DashboardScreen() {
  const { sessions, settings, isLoading, error } = useSessions();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const profitLoss = lifetimeProfitLoss(sessions);
  const record = winLossRecord(sessions);
  const currency = settings.currency;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.screen}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={styles.eyebrow}>STACKTRACK</Text>
        <Text style={styles.heading}>Your bankroll at a glance</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.statsGrid}>
        <StatCard
          featured
          label="Current bankroll"
          value={formatCurrency(
            currentBankroll(settings.startingBankroll, sessions),
            currency,
          )}
        />
        <StatCard
          label="Lifetime P/L"
          tone={profitLoss > 0 ? 'positive' : profitLoss < 0 ? 'negative' : 'default'}
          value={formatCurrency(profitLoss, currency, true)}
        />
        <StatCard
          label="Hourly result"
          tone={hourlyRate(sessions) >= 0 ? 'positive' : 'negative'}
          value={`${formatCurrency(hourlyRate(sessions), currency, true)}/hr`}
        />
        <StatCard
          label="Total sessions"
          value={String(totalSessions(sessions))}
        />
        <StatCard
          label="Hours played"
          value={formatHours(totalHours(sessions))}
        />
        <StatCard
          label="Win / loss / push"
          value={`${record.wins} / ${record.losses} / ${record.pushes}`}
        />
        <StatCard
          label="Biggest win"
          tone="positive"
          value={formatCurrency(biggestWin(sessions), currency, true)}
        />
        <StatCard
          label="Biggest loss"
          tone="negative"
          value={formatCurrency(biggestLoss(sessions), currency, true)}
        />
      </View>

      <BankrollTrend sessions={sessions} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent sessions</Text>
          <Pressable onPress={() => router.push('/history')}>
            <Text style={styles.link}>View all</Text>
          </Pressable>
        </View>
        {sessions.length === 0 ? (
          <Text style={styles.empty}>No sessions yet. Add your first one.</Text>
        ) : (
          <View style={styles.sessionList}>
            {sessions.slice(0, 3).map((session) => (
              <SessionListItem
                currency={currency}
                key={session.id}
                session={session}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
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
    fontSize: 26,
    fontWeight: '800',
  },
  error: {
    color: colors.negative,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  section: {
    gap: spacing.md,
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
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  sessionList: {
    gap: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
});
