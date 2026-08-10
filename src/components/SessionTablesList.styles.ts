import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  list: {
    gap: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});
