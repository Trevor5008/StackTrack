import { StyleSheet, Text, View } from 'react-native';

import { FavorabilityTier, formatHouseEdge } from '@/src/lib/houseEdge';
import { colors, radius, spacing } from '@/src/theme';

type RankBadgeProps = {
  houseEdge?: number | null;
  tier?: FavorabilityTier | null;
  isBest?: boolean;
};

function tierColor(tier: FavorabilityTier | null | undefined): string {
  switch (tier) {
    case 'favorable':
      return colors.positive;
    case 'average':
      return colors.primary;
    case 'unfavorable':
      return colors.negative;
    default:
      return colors.border;
  }
}

/**
 * Absolute favorability from approximate house edge.
 * isBest = unique lowest HE in the session (framed ring).
 */
export function RankBadge({
  houseEdge = null,
  tier = null,
  isBest = false,
}: RankBadgeProps) {
  const hasRank = houseEdge != null && tier != null;
  const accent = tierColor(tier);
  const label = hasRank ? formatHouseEdge(houseEdge) : '—';

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.badge,
          hasRank && { borderColor: accent },
          isBest && styles.badgeBest,
          isBest && { borderColor: colors.primary },
        ]}
        accessibilityLabel={
          hasRank
            ? `House edge ${label}${isBest ? ', best rules' : ''}`
            : 'No rules rank'
        }
      >
        <Text style={[styles.text, hasRank && { color: accent }]}>
          {label}
        </Text>
      </View>
      {isBest ? <Text style={styles.bestCaption}>Best</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 2,
    minWidth: 52,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 28,
    minWidth: 48,
    paddingHorizontal: spacing.sm,
  },
  badgeBest: {
    borderWidth: 2,
  },
  text: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  bestCaption: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
