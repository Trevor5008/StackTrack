import { MaterialIcons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { useLiveSession } from '@/src/context/LiveSessionContext';
import { useSessions } from '@/src/context/SessionContext';
import { confirmAction } from '@/src/lib/confirm';
import { formatCurrency, formatHours } from '@/src/lib/format';
import { colors, radius, spacing } from '@/src/theme';

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
  const swipeableRef = useRef<Swipeable>(null);

  const onDeletePress = () => {
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
        swipeableRef.current?.close();
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
    <Swipeable
      ref={swipeableRef}
      friction={2}
      overshootRight={false}
      renderRightActions={() => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete casino"
          onPress={onDeletePress}
          style={({ pressed }) => [
            styles.deleteAction,
            pressed && styles.deletePressed,
          ]}
        >
          <MaterialIcons name="delete-outline" size={26} color={colors.white} />
        </Pressable>
      )}
    >
      {card}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  top: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    color: colors.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    marginRight: spacing.sm,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 24,
  },
  pnl: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  deleteAction: {
    alignItems: 'center',
    backgroundColor: colors.negative,
    borderRadius: radius.md,
    justifyContent: 'center',
    marginLeft: spacing.sm,
    minWidth: 72,
    paddingHorizontal: spacing.md,
  },
  deletePressed: {
    opacity: 0.85,
  },
});
