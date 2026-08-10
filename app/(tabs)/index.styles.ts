import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
  eyebrowGap: {
    marginBottom: spacing.xs,
  },
  heading: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  subheading: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 52,
  },
  addButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
  list: {
    gap: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
});
