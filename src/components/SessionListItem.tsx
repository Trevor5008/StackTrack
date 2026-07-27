import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCurrency, formatDate, formatHours } from '@/src/lib/format';
import { colors, radius, spacing } from '@/src/theme';
import { Session } from '@/src/types/session';

type SessionListItemProps = {
  session: Session;
  currency: string;
};

export function SessionListItem({
  session,
  currency,
}: SessionListItemProps) {
  const isWin = session.netResult >= 0;

  return (
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
});
