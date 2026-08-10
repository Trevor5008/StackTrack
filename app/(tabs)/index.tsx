import { ActiveSessionBanner } from '@/src/components/ActiveSessionBanner';
import { CasinoCard } from '@/src/components/CasinoCard';
import { FormSheet } from '@/src/components/FormSheet';
import { TextField } from '@/src/components/TextField';
import { useLiveSession } from '@/src/context/LiveSessionContext';
import { useSessions } from '@/src/context/SessionContext';
import { formatCurrency } from '@/src/lib/format';
import {
  currentBankroll,
  lifetimeProfitLoss,
  sessionsForCasino,
  totalHours,
  totalSessions,
} from '@/src/lib/stats';
import { colors } from '@/src/theme';
import { commonStyles } from '@/src/theme/commonStyles';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { styles } from './index.styles';

export default function DashboardScreen() {
  const { sessions, casinos, settings, isLoading, error, addCasino } =
    useSessions();
  const {
    activeSession,
    elapsedMs,
    runningTableId,
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
      <View style={commonStyles.centered}>
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
    <View style={commonStyles.screen}>
      <ScrollView
        contentContainerStyle={commonStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={[commonStyles.eyebrow, styles.eyebrowGap]}>STACKTRACK</Text>
          <Text style={styles.heading}>Your casinos</Text>
          <Text style={styles.subheading}>
            Bankroll {formatCurrency(globalBankroll, currency)} · Lifetime{' '}
            {formatCurrency(globalPnL, currency, true)}
          </Text>
        </View>

        {error ? <Text style={commonStyles.error}>{error}</Text> : null}

        {activeSession ? (
          <ActiveSessionBanner
            location={activeSession.location}
            elapsedMs={elapsedMs}
            paused={!runningTableId}
          />
        ) : null}

        <Pressable
          onPress={() => {
            setFormError(null);
            setCasinoName('');
            setAdding(true);
          }}
          style={({ pressed }) => [
            styles.addButton,
            pressed && commonStyles.pressed,
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
                casinoId={casino.id}
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

      <FormSheet
        visible={adding}
        title="Add casino"
        onClose={() => {
          if (!saving) setAdding(false);
        }}
        primaryLabel="Save"
        onPrimary={() => void onAddCasino()}
        saving={saving}
        dismissOnBackdrop
        error={formError}
      >
        <TextField
          label="Name"
          value={casinoName}
          onChangeText={(value) => {
            setCasinoName(value);
            if (formError) setFormError(null);
          }}
          placeholder="Casino name"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => void onAddCasino()}
        />
      </FormSheet>
    </View>
  );
}
