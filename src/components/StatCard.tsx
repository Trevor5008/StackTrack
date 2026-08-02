import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

/**
 * Stat card props
 * @returns {StatCardProps}
 * @description This props are used to pass the stat card props.
 * @example
 * <StatCard label="Label" value="Value" tone="default" featured={false} />
 */
type StatCardProps = {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'negative';
  featured?: boolean;
};

/**
 * Stat card
 * @returns {JSX.Element}
 * @description This component is used to display the stat card.
 * @example
 * <StatCard label="Label" value="Value" tone="default" featured={false} />
 */
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

  // returns View with style formatting
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

/**
 * Styles for the stat card component
 * @returns {StyleSheet}
 * @description This styles are used to style the stat card component.
 * @example
 * <StatCard label="Label" value="Value" tone="default" featured={false} />
 */
const styles = StyleSheet.create({
  // card to handle the card style
  card: {
    flex: 1,
    minWidth: 145,
    // background color to handle the background color
    backgroundColor: colors.surface,
    // border color to handle the border color
    borderColor: colors.border,
    // border radius to handle the border radius
    borderRadius: radius.md,
    // border width to handle the border width
    borderWidth: 1,
    padding: spacing.md,
  },
  featured: {
    // min width to handle the min width
    minWidth: '100%',
    // padding vertical to handle the padding vertical
    paddingVertical: spacing.lg,
  },
  label: {
    // color to handle the color
    color: colors.textMuted,
    // font size to handle the font size
    fontSize: 12,
    // font weight to handle the font weight
    fontWeight: '600',
    // letter spacing to handle the letter spacing
    letterSpacing: 0.8,
    // margin bottom to handle the margin bottom
    marginBottom: spacing.sm,
    // text transform to handle the text transform
    textTransform: 'uppercase',
  },
  value: {
    // color to handle the color
    color: colors.text,
    // font size to handle the font size
    fontSize: 23,
    fontWeight: '700',
  },
  featuredValue: {
    // font size to handle the font size
    fontSize: 38,
  },
});
