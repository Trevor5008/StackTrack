import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
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
  title: {
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
