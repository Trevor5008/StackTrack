import { Text, View } from 'react-native';

import { colors } from '@/src/theme';

import { styles } from './StatCard.styles';

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
