import { Pressable, Text, View } from 'react-native';

import { SwipeableDeleteRow } from '@/src/components/SwipeableDeleteRow';
import { useLiveSession } from '@/src/context/LiveSessionContext';
import { useSessions } from '@/src/context/SessionContext';
import { confirmAction } from '@/src/lib/confirm';
import { formatCurrency, formatHours } from '@/src/lib/format';
import { colors } from '@/src/theme';

import { styles } from './CasinoCard.styles';

type CasinoCardProps = {
  casinoId: string;
  name: string;
  currency: string;
  profitLoss: number;
  sessionCount: number;
  hours: number;
  onPress: () => void;
};

export function CasinoCard({
  casinoId,
  name,
  currency,
  profitLoss,
  sessionCount,
  hours,
  onPress,
}: CasinoCardProps) {
  const { deleteCasino } = useSessions();
  const { activeSession, refresh: refreshLive } = useLiveSession();

  const onDelete = (close: () => void) => {
    const liveHere = activeSession?.casinoId === casinoId;
    const sessionPart =
      sessionCount > 0
        ? ` and its ${sessionCount} session${sessionCount === 1 ? '' : 's'}`
        : '';
    const livePart = liveHere
      ? ' Any in-progress live session at this casino will be discarded.'
      : '';

    confirmAction(
      {
        title: 'Delete casino?',
        message: `This permanently removes ${name}${sessionPart}.${livePart}`,
        confirmLabel: 'Delete',
        destructive: true,
      },
      async () => {
        close();
        await deleteCasino(casinoId);
        if (liveHere) {
          await refreshLive();
        }
      },
    );
  };

  const card = (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
      <Text
        style={[
          styles.pnl,
          {
            color:
              profitLoss > 0
                ? colors.positive
                : profitLoss < 0
                  ? colors.negative
                  : colors.text,
          },
        ]}
      >
        {formatCurrency(profitLoss, currency, true)}
      </Text>
      <Text style={styles.meta}>
        {sessionCount} session{sessionCount === 1 ? '' : 's'} ·{' '}
        {formatHours(hours)}
      </Text>
    </Pressable>
  );

  return (
    <SwipeableDeleteRow
      accessibilityLabel="Delete casino"
      onDelete={onDelete}
    >
      {card}
    </SwipeableDeleteRow>
  );
}
