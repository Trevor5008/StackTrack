import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCurrency, formatHours } from '@/src/lib/format';
import { colors, radius, spacing } from '@/src/theme';

type CasinoCardProps = {
  name: string;
  currency: string;
  profitLoss: number;
  sessionCount: number;
  hours: number;
  onPress: () => void;
};

export function CasinoCard({
  name,
  currency,
  profitLoss,
  sessionCount,
  hours,
  onPress,
}: CasinoCardProps) {
  return (
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
});
