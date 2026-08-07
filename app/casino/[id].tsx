import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SessionListItem } from '@/src/components/SessionListItem';
import { StatCard } from '@/src/components/StatCard';
import { useLiveSession } from '@/src/context/LiveSessionContext';
import { useSessions } from '@/src/context/SessionContext';
import { formatCurrency, formatHours } from '@/src/lib/format';
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
  const params = useLocalSearchParams<{ id: string }>();
  const casinoId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { sessions, casinos, settings, isLoading } = useSessions();
  const {
    activeSession,
    isLoading: liveLoading,
    startSession,
  } = useLiveSession();
  const [fetchedCasino, setFetchedCasino] = useState<Casino | null>(null);
  const [lookupDone, setLookupDone] = useState(false);

  const casinoFromContext = casinos.find((item) => item.id === casinoId);
  const casino = casinoFromContext ?? fetchedCasino;

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

  const onStartLive = async () => {
    if (activeSession && !liveHere) {
      router.push('/live');
      return;
    }
    if (!activeSession) {
      await startSession({
        casinoId: casino.id,
        startingBankroll: currentBankroll(
          settings.startingBankroll,
          sessions,
        ),
      });
    }
    router.push('/live');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.screen}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={styles.eyebrow}>CASINO</Text>
        <Text style={styles.heading}>{casino.name}</Text>
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
          onPress={() => void onStartLive()}
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
});
