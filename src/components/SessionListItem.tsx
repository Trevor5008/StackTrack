import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { useSessions } from '@/src/context/SessionContext';
import { confirmAction } from '@/src/lib/confirm';
import { formatCurrency, formatDate, formatHours } from '@/src/lib/format';
import { colors, radius, spacing } from '@/src/theme';
import { Session } from '@/src/types/session';

type SessionListItemProps = {
  session: Session;
  currency: string;
  /** When false, swipe-to-delete is disabled (default true). */
  enableSwipeDelete?: boolean;
};

export function SessionListItem({
  session,
  currency,
  enableSwipeDelete = true,
}: SessionListItemProps) {
  const { deleteSession } = useSessions();
  const swipeableRef = useRef<Swipeable>(null);
  const isWin = session.netResult >= 0;

  const onDeletePress = () => {
    confirmAction(
      {
        title: 'Delete session?',
        message: 'This permanently removes the session from local storage.',
        confirmLabel: 'Delete',
        destructive: true,
      },
      async () => {
        swipeableRef.current?.close();
        await deleteSession(session.id);
      },
    );
  };

  const card = (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: '/session/[id]', params: { id: session.id } })
      }
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.details}>
        <Text style={styles.location}>{session.location}</Text>
        <Text style={styles.meta}>
          {formatDate(session.date)} · {formatHours(session.hoursPlayed)}
        </Text>
      </View>
      <View style={styles.result}>
        <Text
          style={[
            styles.amount,
            { color: isWin ? colors.positive : colors.negative },
          ]}
        >
          {formatCurrency(session.netResult, currency, true)}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );

  if (!enableSwipeDelete) {
    return card;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      overshootRight={false}
      renderRightActions={() => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete session"
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
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    padding: spacing.md,
  },
  pressed: {
    backgroundColor: colors.surfaceElevated,
    opacity: 0.85,
  },
  details: {
    flex: 1,
    marginRight: spacing.md,
  },
  location: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  result: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  amount: {
    fontSize: 17,
    fontWeight: '700',
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 25,
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
