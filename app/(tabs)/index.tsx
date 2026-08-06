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
import { useLiveSession } from '@/src/context/LiveSessionContext';
import { useSessions } from '@/src/context/SessionContext';
import { formatCurrency } from '@/src/lib/format';
import { formatElapsed } from '@/src/lib/liveTimer';
import {
  biggestLoss,
  biggestWin,
  currentBankroll,
  hourlyRate,
  lifetimeProfitLoss,
  totalSessions,
  winLossRecord,
} from '@/src/lib/stats';
import { colors, radius, spacing } from '@/src/theme';

/**
 * Dashboard screen
 * @returns {JSX.Element}
 * @description This screen is used to display the dashboard.
 * @example
 * <DashboardScreen />
 */
export default function DashboardScreen() {
  const { sessions, settings, isLoading, error } = useSessions();
  const {
    activeSession,
    elapsedMs,
    isLoading: liveLoading,
    startSession,
  } = useLiveSession();

  if (isLoading || liveLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const profitLoss = lifetimeProfitLoss(sessions);
  const record = winLossRecord(sessions);
  const currency = settings.currency;

  const onStartLive = async () => {
    await startSession({
      startingBankroll: currentBankroll(settings.startingBankroll, sessions),
    });
    router.push('/live');
  };

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

      {activeSession ? (
        <Pressable
          onPress={() => router.push('/live')}
          style={({ pressed }) => [
            styles.liveBanner,
            pressed && styles.pressed,
          ]}
        >
          <View>
            <Text style={styles.liveEyebrow}>SESSION IN PROGRESS</Text>
            <Text style={styles.liveTimer}>{formatElapsed(elapsedMs)}</Text>
            <Text style={styles.liveHint}>
              {activeSession.isPaused ? 'Paused — tap to continue' : 'Tap to continue'}
            </Text>
          </View>
          <Text style={styles.liveCta}>Open</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => void onStartLive()}
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.startButtonText}>Start live session</Text>
        </Pressable>
      )}

      {/* view to handle the stats grid */}
      <View style={styles.statsGrid}>
        <StatCard
          // featured to handle the featured stat card
          featured
          // label to handle the label
          label="Current bankroll"
          // value to handle the value
          value={formatCurrency(
            currentBankroll(settings.startingBankroll, sessions),
            currency,
          )}
        />
        <StatCard
          // label to handle the label
          label="Lifetime P/L"
          // tone to handle the tone
          tone={profitLoss > 0 ? 'positive' : profitLoss < 0 ? 'negative' : 'default'}
          // value to handle the value
          value={formatCurrency(profitLoss, currency, true)}
        />
        <StatCard
          // label to handle the label
          label="Hourly result"
          // tone to handle the tone
          tone={hourlyRate(sessions) >= 0 ? 'positive' : 'negative'}
          // value to handle the value
          value={`${formatCurrency(hourlyRate(sessions), currency, true)}/hr`}
        />
        <StatCard
          // label to handle the label
          label="Total sessions"
          // value to handle the value
          value={String(totalSessions(sessions))}
        />
        <StatCard
          // label to handle the label
          label="Win / loss / push"
          // value to handle the value
          value={`${record.wins} / ${record.losses} / ${record.pushes}`}
        />
        <StatCard
          // label to handle the label
          label="Biggest win"
          // tone to handle the tone
          tone="positive"
          value={formatCurrency(biggestWin(sessions), currency, true)}
        />
        <StatCard
          // label to handle the label
          label="Biggest loss"
          // tone to handle the tone
          tone="negative"
          value={formatCurrency(biggestLoss(sessions), currency, true)}
        />
      </View>

      {/* bankroll trend to handle the bankroll trend */}
      <BankrollTrend sessions={sessions} />

      {/* view to handle the section */}
      <View style={styles.section}>
        {/* view to handle the section header */}
        <View style={styles.sectionHeader}>
          {/* text to handle the section title */}
          <Text style={styles.sectionTitle}>Recent sessions</Text>
          {/* pressable to handle the pressable */}
          <Pressable onPress={() => router.push('/history')}>
            <Text style={styles.link}>View all</Text>
          </Pressable>
        </View>
        {/* if there are no sessions, show the empty state */}
        {sessions.length === 0 ? (
          // view to handle the empty state
          <View>
            {/* text to handle the empty state */}
            <Text style={styles.empty}>
              No sessions yet. Add one, or load demo data in Settings.
            </Text>
          </View>
        ) : (
          // view to handle the session list
          <View style={styles.sessionList}>
            {sessions.slice(0, 3).map((session) => (
              <SessionListItem
                // currency to handle the currency
                currency={currency}
                // key to handle the key
                key={session.id}
                // session to handle the session
                session={session}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
    );
  }

  /**
   * Styles for the dashboard screen
   * @returns {StyleSheet}
   * @description This styles are used to style the dashboard screen.
   * @example
   * <DashboardScreen />
   */
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
  startButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    minHeight: 52,
    justifyContent: 'center',
  },
  startButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
  liveBanner: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  liveEyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  liveTimer: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  liveHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  liveCta: {
    color: colors.primary,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
});
