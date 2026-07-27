import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

type StatCardProps = {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'negative';
  featured?: boolean;
};

export function StatCard({
  label,
  value,
  tone = 'default',
  featured = false,
}: StatCardProps) {
  const valueColor =
    tone === 'positive'
      ? colors.positive
      : tone === 'negative'
        ? colors.negative
        : featured
          ? colors.primary
          : colors.text;

  return (
    <View style={[styles.card, featured && styles.featured]}>
      <Text style={styles.label}>{label}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[styles.value, featured && styles.featuredValue, { color: valueColor }]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 145,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  featured: {
    minWidth: '100%',
    paddingVertical: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '700',
  },
  featuredValue: {
    fontSize: 38,
  },
});
