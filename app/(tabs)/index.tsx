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

import { CasinoCard } from '@/src/components/CasinoCard';
import { useLiveSession } from '@/src/context/LiveSessionContext';
import { useSessions } from '@/src/context/SessionContext';
import { formatCurrency } from '@/src/lib/format';
import { formatElapsed } from '@/src/lib/liveTimer';
import {
  currentBankroll,
  lifetimeProfitLoss,
  sessionsForCasino,
  totalHours,
  totalSessions,
} from '@/src/lib/stats';
import { colors, radius, spacing } from '@/src/theme';

export default function DashboardScreen() {
  const { sessions, casinos, settings, isLoading, error, addCasino } =
    useSessions();
  const {
    activeSession,
    elapsedMs,
    isLoading: liveLoading,
  } = useLiveSession();

  const [adding, setAdding] = useState(false);
  const [casinoName, setCasinoName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const currency = settings.currency;
  const globalBankroll = currentBankroll(settings.startingBankroll, sessions);
  const globalPnL = lifetimeProfitLoss(sessions);

  const casinoStats = useMemo(
    () =>
      casinos.map((casino) => {
        const scoped = sessionsForCasino(sessions, casino.id);
        return {
          casino,
          profitLoss: lifetimeProfitLoss(scoped),
          sessionCount: totalSessions(scoped),
          hours: totalHours(scoped),
        };
      }),
    [casinos, sessions],
  );

  if (isLoading || liveLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const onAddCasino = async () => {
    const trimmed = casinoName.trim();
    if (!trimmed) {
      setFormError('Enter a casino name.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const casino = await addCasino(trimmed);
      setCasinoName('');
      setAdding(false);
      // Push after modal begins closing so the stack transition isn't blocked.
      requestAnimationFrame(() => {
        router.push({ pathname: '/casino/[id]', params: { id: casino.id } });
      });
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not add casino.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.eyebrow}>STACKTRACK</Text>
          <Text style={styles.heading}>Your casinos</Text>
          <Text style={styles.subheading}>
            Bankroll {formatCurrency(globalBankroll, currency)} · Lifetime{' '}
            {formatCurrency(globalPnL, currency, true)}
          </Text>
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
                {activeSession.location}
                {activeSession.isPaused ? ' · Paused' : ''} — tap to continue
              </Text>
            </View>
            <Text style={styles.liveCta}>Open</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => {
            setFormError(null);
            setCasinoName('');
            setAdding(true);
          }}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.addButtonText}>Add casino</Text>
        </Pressable>

        {casinoStats.length === 0 ? (
          <Text style={styles.empty}>
            Add a casino to start tracking live sessions by location.
          </Text>
        ) : (
          <View style={styles.list}>
            {casinoStats.map(({ casino, profitLoss, sessionCount, hours }) => (
              <CasinoCard
                key={casino.id}
                name={casino.name}
                currency={currency}
                profitLoss={profitLoss}
                sessionCount={sessionCount}
                hours={hours}
                onPress={() =>
                  router.push({
                    pathname: '/casino/[id]',
                    params: { id: casino.id },
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={adding}
        animationType="slide"
        transparent
        onRequestClose={() => {
          if (!saving) setAdding(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <Pressable
            style={styles.modalDismiss}
            disabled={saving}
            onPress={() => setAdding(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add casino</Text>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={casinoName}
              onChangeText={(value) => {
                setCasinoName(value);
                if (formError) setFormError(null);
              }}
              placeholder="Casino name"
              placeholderTextColor={colors.textMuted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => void onAddCasino()}
            />
            {formError ? <Text style={styles.error}>{formError}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setAdding(false)}
                disabled={saving}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => void onAddCasino()}
                disabled={saving}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                  saving && styles.disabled,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {saving ? 'Saving…' : 'Save'}
                </Text>
              </Pressable>
            </View>
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
  subheading: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.negative,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 52,
  },
  addButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
  list: {
    gap: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    paddingVertical: spacing.lg,
    textAlign: 'center',
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
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
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
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
