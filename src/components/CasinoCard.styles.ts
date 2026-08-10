import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/src/theme';

export const styles = StyleSheet.create({
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
