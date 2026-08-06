import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

type RankBadgeProps = {
  rank?: number | null;
};

/**
 * Placeholder ordinal badge until rules → house-edge ranking lands.
 * TODO: color-code from computed house-edge ordinal after rules modal.
 */
export function RankBadge({ rank = null }: RankBadgeProps) {
  const label =
    typeof rank === 'number' && Number.isFinite(rank) ? `#${rank}` : '—';

  return (
    <View style={styles.badge} accessibilityLabel={`Rank ${label}`}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

// Ranking badge style rules
const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 28,
    minWidth: 36,
    paddingHorizontal: spacing.sm,
  },
  text: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
});
